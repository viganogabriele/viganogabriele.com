import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { notes, type NoteItem } from "../src/data/notes.ts";
import { cvMetadata, homeMetadata, notFoundMetadata, noteJsonLd, noteMetadata, pageUrl, site, websitePersonJsonLd, type PageMetadata } from "../src/data/site.ts";

const managedTagPattern = /<title>[\s\S]*?<\/title>\s*|<link\s+rel="canonical"[^>]*>\s*|<meta\s+(?:name|property)="(?:description|robots|twitter:[^"]+|og:[^"]+|article:[^"]+)"[^>]*>\s*|<script\s+type="application\/ld\+json"\s+data-jsonld="[^"]+">[\s\S]*?<\/script>\s*/g;

// The hero portrait is HomePage-only; the raw shell preloads it (see index.html)
// so the home route gets it at high priority pre-hydration. Every other route
// shell is built from that same string, so without this it would also
// high-priority-fetch a photo it never paints, competing with that page's
// actual LCP resource. Stripped here, then re-added for the home shell alone.
const heroPreloadPattern = /<link\s+rel="preload"\s+as="image"[^>]*>\s*/;

const rootPattern = /<div id="root"><\/div>/;

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function meta(attribute: "name" | "property", name: string, content: string) {
  return `<meta ${attribute}="${name}" content="${escapeHtml(content)}">`;
}

function jsonLd(id: string, data: Record<string, unknown>) {
  return `<script type="application/ld+json" data-jsonld="${id}">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
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

/**
 * The note itself, in the shell, for anything that reads HTML without running it.
 *
 * The metadata above is what makes a link unfurl; it is not what makes a page
 * findable or answerable. The notes are the only long-form prose on the site and
 * every word of it lived inside the JS bundle: Googlebot renders and sees it,
 * Bingbot is inconsistent, and the crawlers behind AI answers largely do not
 * execute JS at all — they got four metadata-only shells.
 *
 * `hidden`, and inside #root, on purpose. createRoot() replaces the contents of
 * its container on mount, so this lives only in the window before React boots —
 * the reader is shown the real route, never this. Painting it in that window
 * instead would put the prose on screen for a beat and then cover it with the
 * preloader that gates the lazy note chunk, which is a worse handoff than the
 * one PR #23 tuned. Nothing here is shown to a crawler and withheld from a
 * reader: a JS-running client renders the same text through NotePage, and sees
 * no hidden element at all once it has.
 *
 * Unstyled for the same reason it is hidden — it is never painted, so classes
 * would be bytes on every note shell that can only ever go stale against the
 * component they were copied from. Structure and reading order carry the
 * meaning a parser needs.
 */
function noteBody(note: NoteItem) {
  const tags = note.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
  const paragraphs = note.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  return [
    `<div hidden data-prerendered="note-${note.slug}"><main><article>`,
    `<h1>${escapeHtml(note.title)}</h1>`,
    `<p>${escapeHtml(note.date)} / ${escapeHtml(note.readingTime)}</p>`,
    `<ul aria-label="Topics">${tags}</ul>`,
    paragraphs,
    '</article><p><a href="/">Back to home</a></p></main></div>',
  ].join("");
}

function withBody(shell: string, body: string) {
  // Fail the build rather than silently shipping metadata-only note shells if
  // the emitted root element ever stops matching.
  if (!rootPattern.test(shell)) throw new Error("static-pages: root element not found in the built shell; update rootPattern.");
  return shell.replace(rootPattern, `<div id="root">${body}</div>`);
}

function withMetadata(shell: string, metadata: PageMetadata, structuredData?: { id: string; data: Record<string, unknown> }) {
  const head = headFor(metadata, structuredData);
  return shell.replace(managedTagPattern, "").replace("</head>", `    ${head}\n  </head>`);
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

async function generateStaticPages(outDir: string) {
  const indexPath = resolve(outDir, "index.html");
  const index = await readFile(indexPath, "utf8");
  // Fail the build rather than silently shipping the preload everywhere if
  // the emitted tag ever stops matching (attribute order, a second image
  // preload, a Vite change to how it rewrites the asset URL).
  if (!heroPreloadPattern.test(index)) throw new Error("static-pages: hero image preload not found in the built shell; update heroPreloadPattern.");
  const otherShell = index.replace(heroPreloadPattern, "");
  const home = withMetadata(index, homeMetadata, { id: "website-person", data: websitePersonJsonLd });
  await writeFile(indexPath, home);
  await writeFile(resolve(outDir, "cv.html"), withMetadata(otherShell, cvMetadata));
  await writeFile(resolve(outDir, "404.html"), withMetadata(otherShell, notFoundMetadata));

  await Promise.all(notes.map(async (note) => {
    const directory = resolve(outDir, "notes");
    await mkdir(directory, { recursive: true });
    await writeFile(
      resolve(directory, `${note.slug}.html`),
      withBody(withMetadata(otherShell, noteMetadata(note), { id: `note-${note.slug}`, data: noteJsonLd(note) }), noteBody(note)),
    );
  }));
  await writeFile(resolve(outDir, "sitemap.xml"), sitemap());
}

/** Emits crawlable route shells while retaining the React SPA at runtime. */
export function staticPages(): Plugin {
  return {
    name: "static-pages",
    async closeBundle() {
      await generateStaticPages(resolve(process.cwd(), "dist"));
    },
    configurePreviewServer(server) {
      return () => {
        const routeStaticPage = (request: IncomingMessage, response: ServerResponse, next: (error?: unknown) => void) => {
          const pathname = new URL(request.url ?? "/", "http://preview.local").pathname;
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
