import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { activities } from "../src/data/activities.ts";
import { certifications } from "../src/data/certifications.ts";
import { legacySlugRedirects, notes, type NoteItem } from "../src/data/notes.ts";
import { profile } from "../src/data/profile.ts";
import { projects } from "../src/data/projects.ts";
import { aboutSection, certificationsSection, expertiseSection, footerCopy, heroCopy, journeySection, notesSection, projectsSection, techStackSection } from "../src/data/sections.ts";
import { cvMetadata, homeMetadata, notFoundMetadata, noteJsonLd, noteMetadata, pageUrl, site, websitePersonJsonLd, type PageMetadata } from "../src/data/site.ts";
import { toolGroups } from "../src/data/techStack.ts";
import { timelineItems } from "../src/data/timeline.ts";

const managedTagPattern = /<title>[\s\S]*?<\/title>\s*|<link\s+rel="canonical"[^>]*>\s*|<meta\s+(?:name|property)="(?:description|robots|twitter:[^"]+|og:[^"]+|article:[^"]+)"[^>]*>\s*|<script\s+type="application\/ld\+json"\s+data-jsonld="[^"]+">[\s\S]*?<\/script>\s*/g;

// The hero portrait is HomePage-only; the raw shell preloads it (see index.html)
// so the home route gets it at high priority pre-hydration. Every other route
// shell is built from that same string, so without this it would also
// high-priority-fetch a photo it never paints, competing with that page's
// actual LCP resource. Stripped here, then re-added for the home shell alone.
const heroPreloadPattern = /<link\s+rel="preload"\s+as="image"[^>]*>\s*/;

interface BuildManifestChunk {
  file: string;
  css?: string[];
}

type BuildManifest = Record<string, BuildManifestChunk>;

interface StaticPagesOptions {
  cvVersion: string;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function meta(attribute: "name" | "property", name: string, content: string) {
  return `<meta ${attribute}="${name}" content="${escapeHtml(content)}">`;
}

function jsonLd(id: string, data: Record<string, unknown>) {
  return `<script type="application/ld+json" data-jsonld="${id}">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

function lines(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function staticContent(shell: string, content: string) {
  const root = '<div id="root"></div>';
  if (!shell.includes(root)) throw new Error("static-pages: empty root marker not found; update staticContent.");
  return shell.replace(root, `<div id="root">${content}</div>`);
}

function staticSection(id: string, eyebrow: string, title: string, content: string) {
  return `<section id="${id}"><p class="static-route__eyebrow">${escapeHtml(eyebrow)}</p><h2>${lines(title)}</h2>${content}</section>`;
}

/**
 * Semantic no-JavaScript output for the content React progressively enhances.
 * All editorial text comes from the same data modules as the interactive page;
 * this is visible fallback content, not a hidden keyword-only duplicate.
 */
function homeStaticContent() {
  const profileFacts = `<dl><div><dt>Current role</dt><dd>${escapeHtml(profile.currentRole)}</dd></div><div><dt>Studying</dt><dd>${escapeHtml(profile.education)}</dd></div></dl>`;
  const about = [
    `<p>${escapeHtml(aboutSection.body)}</p>`,
    `<p><strong>${escapeHtml(aboutSection.curiosity.label)}:</strong> ${escapeHtml(aboutSection.curiosity.text)}</p>`,
    `<ul>${aboutSection.stats.map((stat) => `<li>${stat.link ? `<a href="${escapeHtml(stat.link)}">${escapeHtml(stat.value)} — ${escapeHtml(stat.label)}</a>` : `${escapeHtml(stat.value)} — ${escapeHtml(stat.label)}`}</li>`).join("")}</ul>`,
    `<ul>${aboutSection.principles.map((principle) => `<li>${escapeHtml(principle)}</li>`).join("")}</ul>`,
  ].join("");
  const expertise = `<div class="static-route__grid">${activities.map((activity) => `<article><p class="static-route__eyebrow">${escapeHtml(activity.index)} / ${escapeHtml(activity.role)}</p><h3>${escapeHtml(activity.title)}</h3><p>${escapeHtml(activity.description)}</p><p>${activity.tags.map(escapeHtml).join(" · ")}</p></article>`).join("")}</div>`;
  const work = `<div class="static-route__grid">${projects.map((project) => `<article><p class="static-route__eyebrow">${escapeHtml(project.index)} / ${escapeHtml(project.eyebrow)}</p><h3>${lines(project.title)}</h3><p>${escapeHtml(project.description)}</p><p><strong>${escapeHtml(project.role)}</strong></p><p>${escapeHtml(project.contribution)}</p><p>${escapeHtml(project.outcome)}</p>${project.link ? `<a href="${escapeHtml(project.link)}">View project</a>` : ""}</article>`).join("")}</div>`;
  const stack = `<div class="static-route__grid">${toolGroups.map((group) => `<article><h3>${escapeHtml(group.label)}</h3><p>${escapeHtml(group.description)}</p><ul>${group.tools.map((tool) => `<li>${escapeHtml(tool)}</li>`).join("")}</ul></article>`).join("")}</div>`;
  const journey = `<ol>${timelineItems.map((item) => `<li><p class="static-route__eyebrow">${escapeHtml(item.year)}</p><h3>${escapeHtml(item.title)}</h3><p><strong>${escapeHtml(item.subtitle)}</strong></p><p>${escapeHtml(item.description)}</p></li>`).join("")}</ol>`;
  const fieldNotes = `<div class="static-route__grid">${notes.map((note) => `<article><p class="static-route__eyebrow">${escapeHtml(note.date)} / ${escapeHtml(note.readingTime)}</p><h3><a href="/notes/${escapeHtml(note.slug)}">${escapeHtml(note.title)}</a></h3><p>${escapeHtml(note.preview)}</p><p>${note.tags.map(escapeHtml).join(" · ")}</p></article>`).join("")}</div>`;
  const credentials = `<ul>${certifications.map((certification) => `<li><a href="${escapeHtml(certification.link)}">${escapeHtml(certification.title)} — ${escapeHtml(certification.issuer)}, ${escapeHtml(certification.year)}</a></li>`).join("")}</ul>`;

  return `<main data-static-route="home" id="main-content" class="static-route"><header><p class="static-route__eyebrow">${escapeHtml(profile.location)}</p><h1>GABRIELE VIGANÒ</h1><p class="static-route__lead">${escapeHtml(heroCopy.summary)}</p>${profileFacts}<p><a href="mailto:${escapeHtml(profile.email)}">Get in touch</a> · <a href="/cv">View CV</a></p></header>${staticSection("about", aboutSection.header.index, aboutSection.header.title, about)}${staticSection("expertise", expertiseSection.index, expertiseSection.title, expertise)}${staticSection("projects", projectsSection.index, projectsSection.title, work)}${staticSection("stack", techStackSection.index, techStackSection.title, stack)}${staticSection("journey", journeySection.index, journeySection.title, journey)}${staticSection("notes", notesSection.index, notesSection.title, fieldNotes)}${staticSection("certifications", certificationsSection.index, certificationsSection.title, credentials)}<footer><h2>${escapeHtml(footerCopy.heading)}</h2><p><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a> · <a href="${escapeHtml(profile.github)}">GitHub</a> · <a href="${escapeHtml(profile.linkedIn)}">LinkedIn</a></p></footer></main>`;
}

function noteStaticContent(note: NoteItem) {
  return `<main data-static-route="note" id="main-content" class="static-route static-route--note"><p><a href="/">Back to home</a></p><article><p class="static-route__eyebrow">${escapeHtml(note.date)} / ${escapeHtml(note.readingTime)}</p><p>${note.tags.map(escapeHtml).join(" · ")}</p><h1>${escapeHtml(note.title)}</h1>${note.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</article><footer><h2>${escapeHtml(footerCopy.heading)}</h2><p><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a></p></footer></main>`;
}

function headFor(metadata: PageMetadata, structuredData?: { id: string; data: Record<string, unknown> }) {
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    meta("name", "description", metadata.description),
    meta("name", "robots", metadata.robots),
  ];

  if (metadata.canonical) {
    const url = pageUrl(metadata.path);
    tags.push(`<link rel="canonical" href="${url}">`);
    tags.push(
      meta("property", "og:title", metadata.title),
      meta("property", "og:description", metadata.description),
      meta("property", "og:type", metadata.type),
      meta("property", "og:url", url),
      meta("property", "og:site_name", site.name),
      meta("property", "og:locale", site.locale),
    );

    if (metadata.image) {
      const imageUrl = pageUrl(metadata.image.path);
      tags.push(
        meta("property", "og:image", imageUrl),
        meta("property", "og:image:width", String(metadata.image.width)),
        meta("property", "og:image:height", String(metadata.image.height)),
        meta("property", "og:image:type", metadata.image.type),
        meta("property", "og:image:alt", metadata.image.alt),
        meta("name", "twitter:card", "summary_large_image"),
        meta("name", "twitter:title", metadata.title),
        meta("name", "twitter:description", metadata.description),
        meta("name", "twitter:image", imageUrl),
        meta("name", "twitter:image:alt", metadata.image.alt),
      );
    }
  }

  if (metadata.publishedTime) tags.push(meta("property", "article:published_time", metadata.publishedTime));
  if (metadata.modifiedTime) tags.push(meta("property", "article:modified_time", metadata.modifiedTime));
  if (structuredData) tags.push(jsonLd(structuredData.id, structuredData.data));
  return tags.join("\n    ");
}

function withMetadata(shell: string, metadata: PageMetadata, structuredData?: { id: string; data: Record<string, unknown> }, resourceHints = "") {
  const head = [resourceHints, headFor(metadata, structuredData)].filter(Boolean).join("\n    ");
  return shell.replace(managedTagPattern, "").replace("</head>", `    ${head}\n  </head>`);
}

function cvResourceHints(manifest: BuildManifest, cvVersion: string) {
  const cvChunk = manifest["src/pages/CvPage.tsx"];
  const worker = manifest["node_modules/pdfjs-dist/build/pdf.worker.min.mjs"];
  if (!cvChunk || !worker) throw new Error("static-pages: CV route or PDF worker missing from the Vite manifest.");

  return [
    `<link rel="modulepreload" crossorigin href="/${cvChunk.file}">`,
    ...(cvChunk.css ?? []).map((file) => `<link rel="preload" as="style" href="/${file}">`),
    `<link rel="preload" as="fetch" type="text/javascript" crossorigin href="/${worker.file}">`,
    `<link rel="preload" as="fetch" type="application/pdf" crossorigin href="${profile.cvPath}?v=${cvVersion}">`,
  ].join("\n    ");
}

/**
 * `lastmod` for the two pages with no editorial date of their own.
 *
 * It was a hand-written constant, which is a date nobody remembers to change —
 * it read 2026-07-13 after a month of deploys, telling every crawl the home
 * page had not moved. The build clock overcorrects the other way: a rollback,
 * an environment change or a redeploy of identical code would each claim a
 * change that never happened, and a lastmod that is always today is one
 * crawlers learn to disregard. The commit the deploy was built from moves only
 * when the content does. Notes keep their own datePublished.
 */
function contentDate() {
  try {
    const committed = execFileSync("git", ["log", "-1", "--format=%cs"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(committed)) return committed;
  } catch {
    // No git history in the build environment; fall through to the clock.
  }
  return new Date().toISOString().slice(0, 10);
}

function sitemap() {
  const built = contentDate();
  const urls = [
    { path: "/", lastmod: built, changefreq: "weekly", priority: "1.0" },
    { path: "/cv", lastmod: built, changefreq: "monthly", priority: "0.8" },
    ...notes.map((note) => ({ path: `/notes/${note.slug}`, lastmod: note.datePublished, changefreq: "monthly", priority: "0.7" })),
  ];
  const entries = urls.map((entry) => [
    "  <url>",
    `    <loc>${pageUrl(entry.path)}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    "  </url>",
  ].join("\n")).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function atomFeed() {
  const updated = notes.reduce((latest, note) => note.datePublished > latest ? note.datePublished : latest, "1970-01-01");
  const entries = notes.map((note) => {
    const url = pageUrl(`/notes/${note.slug}`);
    return `<entry><title>${escapeHtml(note.title)}</title><link href="${url}"/><id>${url}</id><published>${note.datePublished}T00:00:00Z</published><updated>${note.datePublished}T00:00:00Z</updated><summary>${escapeHtml(note.preview)}</summary></entry>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeHtml(site.name)} · Field Notes</title><subtitle>${escapeHtml(site.description)}</subtitle><link href="${pageUrl("/feed.xml")}" rel="self" type="application/atom+xml"/><link href="${pageUrl("/")}"/><id>${pageUrl("/")}#field-notes</id><updated>${updated}T00:00:00Z</updated><author><name>${escapeHtml(site.name)}</name></author>${entries}</feed>\n`;
}

async function validateLegacyRedirects() {
  const config = JSON.parse(await readFile(resolve(process.cwd(), "vercel.json"), "utf8")) as { redirects?: Array<{ source?: string; destination?: string; permanent?: boolean }> };
  for (const [legacy, canonical] of Object.entries(legacySlugRedirects)) {
    const source = `/notes/${legacy}`;
    const destination = `/notes/${canonical}`;
    const valid = config.redirects?.some((redirect) => redirect.source === source && redirect.destination === destination && redirect.permanent === true);
    if (!valid) throw new Error(`static-pages: vercel.json is missing the permanent redirect ${source} -> ${destination}.`);
  }
}

async function generateStaticPages(outDir: string, options: StaticPagesOptions) {
  await validateLegacyRedirects();
  const indexPath = resolve(outDir, "index.html");
  const [index, manifestSource] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(resolve(outDir, ".vite", "manifest.json"), "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource) as BuildManifest;
  // Fail the build rather than silently shipping the preload everywhere if
  // the emitted tag ever stops matching (attribute order, a second image
  // preload, a Vite change to how it rewrites the asset URL).
  if (!heroPreloadPattern.test(index)) throw new Error("static-pages: hero image preload not found in the built shell; update heroPreloadPattern.");
  const otherShell = index.replace(heroPreloadPattern, "");
  const home = withMetadata(staticContent(index, homeStaticContent()), homeMetadata, { id: "website-person", data: websitePersonJsonLd });
  await writeFile(indexPath, home);
  await writeFile(resolve(outDir, "cv.html"), withMetadata(otherShell, cvMetadata, undefined, cvResourceHints(manifest, options.cvVersion)));
  await writeFile(resolve(outDir, "404.html"), withMetadata(otherShell, notFoundMetadata));

  await Promise.all(notes.map(async (note) => {
    const directory = resolve(outDir, "notes");
    await mkdir(directory, { recursive: true });
    await writeFile(
      resolve(directory, `${note.slug}.html`),
      withMetadata(staticContent(otherShell, noteStaticContent(note)), noteMetadata(note), { id: `note-${note.slug}`, data: noteJsonLd(note) }),
    );
  }));
  await writeFile(resolve(outDir, "sitemap.xml"), sitemap());
  await writeFile(resolve(outDir, "feed.xml"), atomFeed());
}

/** Emits crawlable route shells while retaining the React SPA at runtime. */
export function staticPages(options: StaticPagesOptions): Plugin {
  return {
    name: "static-pages",
    async closeBundle() {
      await generateStaticPages(resolve(process.cwd(), "dist"), options);
    },
    configurePreviewServer(server) {
      return () => {
        const routeStaticPage = (request: IncomingMessage, response: ServerResponse, next: (error?: unknown) => void) => {
          const pathname = new URL(request.url ?? "/", "http://preview.local").pathname;
          const legacyMatch = pathname.match(/^\/notes\/([^/]+)\/?$/);
          const legacyDestination = legacyMatch ? legacySlugRedirects[legacyMatch[1]] : undefined;
          if (legacyDestination) {
            response.statusCode = 308;
            response.setHeader("Location", `/notes/${legacyDestination}`);
            response.end();
            return;
          }
          if (pathname === "/cv" || pathname === "/cv/") {
            request.url = "/cv.html";
          } else if (pathname.startsWith("/notes/") && !pathname.endsWith(".html")) {
            request.url = `${pathname}.html`;
          } else if (!pathname.includes(".") && pathname !== "/") {
            void readFile(resolve(process.cwd(), "dist", "404.html"))
              .then((page) => {
                response.statusCode = 404;
                response.setHeader("Content-Type", "text/html; charset=utf-8");
                response.end(page);
              })
              .catch(next);
            return;
          }
          next();
        };
        server.middlewares.stack.unshift({ route: "", handle: routeStaticPage });
      };
    },
  };
}
