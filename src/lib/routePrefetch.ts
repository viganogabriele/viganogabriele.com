import { profile } from "../data/profile";
import { cvUrl, pdfWorkerUrl } from "./cvAssets";
import { HOME_PATHS } from "./routes";

export const loadNotePage = () => import("../pages/NotePage");
export const loadCvPage = () => import("../pages/CvPage");
export const loadNotFoundPage = () => import("../pages/NotFoundPage");

const prefetchedPaths = new Set<string>();

async function warmResource(url: string) {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Could not prefetch ${url}`);
}

export function prefetchRoute(pathname: string) {
  if (HOME_PATHS.has(pathname) || pathname === profile.cvPath) return;
  if (prefetchedPaths.has(pathname)) return;
  prefetchedPaths.add(pathname);
  const retryAfterFailure = () => { prefetchedPaths.delete(pathname); };

  if (pathname === "/cv" || pathname === "/cv/") {
    // Start the three independent legs together. Dynamic import and the HTTP
    // cache each deduplicate by URL, so navigation consumes these exact bytes
    // instead of issuing a second route, worker, or document download.
    void Promise.all([
      loadCvPage(),
      warmResource(pdfWorkerUrl),
      warmResource(cvUrl),
    ]).catch(retryAfterFailure);
    return;
  }
  if (pathname.startsWith("/notes/")) {
    void loadNotePage().catch(retryAfterFailure);
    return;
  }
  void loadNotFoundPage().catch(retryAfterFailure);
}
