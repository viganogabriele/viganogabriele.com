export const HOME_PATHS = new Set([
  "/",
  "/index.html",
  "/viganogabriele.com",
  "/viganogabriele.com/",
  "/viganogabriele.com/index.html",
]);

/**
 * The one hostname that is the live site.
 *
 * Lives here rather than being derived from `site.url` in src/data/site.ts so
 * that App.tsx — which is in the entry chunk — does not have to pull every
 * page's metadata and JSON-LD builders in with it just to read one string.
 * If `site.url` ever moves, this moves with it; the sitemap test asserts the
 * canonical origin, so a mismatch is not silent for long.
 */
export const PRODUCTION_HOST = "www.viganogabriele.com";
