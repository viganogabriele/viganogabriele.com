/**
 * `dist` served the way Vercel serves it: the real headers, redirects and
 * clean URLs out of vercel.json.
 *
 * verify-csp.mjs proves the policy in vercel.json matches the bytes the build
 * emitted, and it runs inside `npm run build`, which is also the deploy's build
 * command — so a stale hash cannot ship. What it cannot prove is that the site
 * still works under that policy, because the e2e suite runs against `vite
 * preview`, which sends none of these headers. Nothing in CI ever loaded a page
 * under the production CSP: adding a font origin, a CDN or a library that
 * reaches for eval() would break production while every check stayed green.
 * This is the missing half — a browser, the built files, the shipped headers.
 *
 * Deliberately small, and not a Vercel emulator. `source` patterns are used as
 * plain regular expressions, which the handful in vercel.json already are; a
 * `.` in a literal path therefore matches any character, which no test cares
 * about. If the config ever grows a path-to-regexp construct (`:param`, `*`),
 * this needs to grow with it.
 */
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const distDir = resolve(root, "dist");
const port = Number(process.env.SERVE_DIST_PORT ?? 4273);
const config = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));

const contentTypes = new Map(Object.entries({
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
}));

const compile = (source) => new RegExp(`^${source}$`);
const rules = (config.headers ?? []).map((entry) => ({ pattern: compile(entry.source), headers: entry.headers ?? [] }));
const redirects = (config.redirects ?? []).map((entry) => ({ pattern: compile(entry.source), ...entry }));

async function fileFor(pathname) {
  // normalize() before join(): without it, "/../vercel.json" would escape dist.
  const requested = join(distDir, normalize(pathname));
  if (!requested.startsWith(distDir)) return null;
  const candidates = pathname.endsWith("/")
    ? [join(requested, "index.html")]
    : [requested, `${requested}.html`, join(requested, "index.html")];
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Next candidate; a missing file is the ordinary case here.
    }
  }
  return null;
}

const server = createServer((request, response) => {
  void (async () => {
    const { pathname } = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
    const redirect = redirects.find((entry) => entry.pattern.test(pathname));
    if (redirect) {
      response.statusCode = redirect.permanent === false ? 307 : 308;
      response.setHeader("Location", redirect.destination);
      response.end();
      return;
    }

    for (const rule of rules) {
      if (!rule.pattern.test(pathname)) continue;
      for (const header of rule.headers) response.setHeader(header.key, header.value);
    }

    // cleanUrls makes /cv and /notes/<slug> resolve to their built .html, and
    // anything genuinely missing gets 404.html with a 404 — the same shape the
    // preview server's own middleware gives the suite today.
    const file = await fileFor(pathname);
    const target = file ?? (await fileFor("/404.html"));
    if (!target) {
      // Playwright's readiness probe hits `/` before the build that produces
      // dist has finished, which is the intended sequencing (see the webServer
      // note in playwright.config.ts). Answering rather than dying on a missing
      // file is what makes that safe.
      response.statusCode = 404;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end("dist has not been built yet.\n");
      return;
    }
    response.statusCode = file ? 200 : 404;
    response.setHeader("Content-Type", contentTypes.get(extname(target)) ?? "application/octet-stream");
    const stream = createReadStream(target);
    stream.on("error", () => { response.statusCode = 500; response.end(); });
    stream.pipe(response);
  })().catch((error) => {
    response.statusCode = 500;
    response.end(String(error));
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving dist with vercel.json headers on http://127.0.0.1:${port}`);
});
