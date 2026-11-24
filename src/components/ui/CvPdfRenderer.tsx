import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { profile } from "../../data/profile";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// `new URL("pdfjs-dist/...", import.meta.url)` does no module resolution: a bare
// specifier is just concatenated onto the importing file's URL, so in the built
// site it resolved to /assets/pdfjs-dist/build/pdf.worker.min.mjs and 404'd. pdf.js
// then fell back to its fake worker and the viewer rendered nothing but its own
// error state. `?url` makes Vite resolve the package and emit a hashed asset.
// pdfjs-dist is pinned to the exact version react-pdf depends on, so the worker
// can never drift from the API that drives it.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function CvPdfRenderer({ width, onAspect, onError }: { width: number; onAspect: (aspect: number) => void; onError: () => void }) {
  return (
    <Document file={profile.cvPath} externalLinkTarget="_blank" onLoadSuccess={async (document) => { const page = await document.getPage(1); const viewport = page.getViewport({ scale: 1 }); onAspect(viewport.width / viewport.height); }} onLoadError={onError} loading={<span className="mt-12 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500" role="status">Loading document…</span>}>
      {width > 0 && <Page pageNumber={1} width={width} renderAnnotationLayer renderTextLayer loading={<span className="mt-12 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500" role="status">Rendering page…</span>} />}
    </Document>
  );
}
