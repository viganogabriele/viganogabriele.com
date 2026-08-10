import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { notes } from "../src/data/notes";
import { cvMetadata, homeMetadata, notFoundMetadata, noteJsonLd, noteMetadata, pageUrl, site, websitePersonJsonLd, type PageMetadata } from "../src/data/site";

const managedTagPattern = /<title>[\s\S]*?<\/title>\s*|<link\s+rel="canonical"[^>]*>\s*|<meta\s+(?:name|property)="(?:description|robots|twitter:[^"]+|og:[^"]+|article:[^"]+)"[^>]*>\s*|<script\s+type="application\/ld\+json"\s+data-jsonld="[^"]+">[\s\S]*?<\/script>\s*/g;

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
  const home = withMetadata(index, homeMetadata, { id: "website-person", data: websitePersonJsonLd });
  await writeFile(indexPath, home);
  await writeFile(resolve(outDir, "cv.html"), withMetadata(index, cvMetadata));
  await writeFile(resolve(outDir, "404.html"), withMetadata(index, notFoundMetadata));

  await Promise.all(notes.map(async (note) => {
    const directory = resolve(outDir, "notes");
    await mkdir(directory, { recursive: true });
    await writeFile(
      resolve(directory, `${note.slug}.html`),
      withMetadata(index, noteMetadata(note), { id: `note-${note.slug}`, data: noteJsonLd(note) }),
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
