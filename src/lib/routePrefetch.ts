import { profile } from "../data/profile";

export const loadNotePage = () => import("../pages/NotePage");
export const loadCvPage = () => import("../pages/CvPage");
export const loadNotFoundPage = () => import("../pages/NotFoundPage");

const prefetchedPaths = new Set<string>();

export function prefetchRoute(pathname: string) {
  if (prefetchedPaths.has(pathname)) return;
  prefetchedPaths.add(pathname);
  const retryAfterFailure = () => { prefetchedPaths.delete(pathname); };

  if (pathname === "/cv" || pathname === "/cv/") {
    void loadCvPage().catch(retryAfterFailure);
    void fetch(profile.cvPath, { cache: "force-cache" }).catch(retryAfterFailure);
    return;
  }
  if (pathname.startsWith("/notes/")) {
    void loadNotePage().catch(retryAfterFailure);
    return;
  }
  if (pathname !== "/" && pathname !== "/index.html") void loadNotFoundPage().catch(retryAfterFailure);
}
