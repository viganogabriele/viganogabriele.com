import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { profile } from "../data/profile";

// The source PDF keeps its human-readable public path. Vite injects a digest of
// its bytes at build time, so replacing that file automatically creates a new
// cache key without an editor having to remember to bump a version by hand.
export const cvUrl = `${profile.cvPath}?v=${import.meta.env.VITE_CV_VERSION}`;
export { pdfWorkerUrl };
