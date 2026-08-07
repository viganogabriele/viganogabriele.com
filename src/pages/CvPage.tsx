import { m, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Download, ExternalLink, FileText, Maximize2, Minus, Plus, Power } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Link } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { AppShell } from "../components/layout/AppShell";
import { SystemModeOverlay } from "../components/layout/SystemModeOverlay";
import { SystemHUD } from "../components/motion/SystemHUD";
import { profile } from "../data/profile";
import { cvMetadata } from "../data/site";
import { cvPageCopy } from "../data/sections";
import { useMotionProfile } from "../hooks/useMotionProfile";
import { useSystemMode } from "../hooks/useSystemMode";
import { ease } from "../lib/motion";
import { PageMeta } from "../lib/seo";
import { useRouteReady } from "../hooks/useRouteReady";

// `new URL("pdfjs-dist/...", import.meta.url)` does no module resolution: a bare
// specifier is just concatenated onto the importing file's URL, so in the built
// site it resolved to /assets/pdfjs-dist/build/pdf.worker.min.mjs and 404'd. pdf.js
// then fell back to its fake worker and the viewer rendered nothing but its own
// error state. `?url` makes Vite resolve the package and emit a hashed asset.
// pdfjs-dist is pinned to the exact version react-pdf depends on, so the worker
// can never drift from the API that drives it.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * A name for one of the PDF's own link annotations.
 *
 * pdf.js draws them as bare <a href> boxes positioned over the canvas: the
 * visible text belongs to the rendered page, so the anchors themselves are
 * empty. A screen reader met eight links in a row with nothing to announce.
 * The href is the only thing that describes them, so say what it points at.
 */
function describeAnnotation(href: string) {
  try {
    const url = new URL(href);
    if (url.protocol === "mailto:") return `Email ${url.pathname}`;
    if (url.protocol === "tel:") return `Call ${url.pathname}`;
    const path = url.pathname.replace(/\/$/, "");
    return `Open ${url.host}${path} in a new tab`;
  } catch {
    return "Open link from the CV";
  }
}

function CvDocumentViewer({ onReady }: { onReady: () => void }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasReady = useRef(false);
  const annotationsReady = useRef(false);
  const [zoom, setZoom] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [pageAspect, setPageAspect] = useState(0);
  const [failed, setFailed] = useState(false);
  const horizontalInset = viewportWidth >= 640 ? 32 : 16;
  const verticalInset = viewportWidth >= 640 ? 32 : 16;
  const widthToFit = Math.max(viewportWidth - horizontalInset, 280);
  const heightToFit = Math.max(viewportHeight - verticalInset, 280);
  const fittedWidth = viewportWidth < 640 || !pageAspect ? widthToFit : Math.min(widthToFit, heightToFit * pageAspect);
  const pageWidth = Math.round(fittedWidth * zoom);
  const clampZoom = (value: number) => Math.min(2.5, Math.max(0.75, Number(value.toFixed(2))));
  const reportReady = () => {
    if (canvasReady.current && annotationsReady.current) onReady();
  };
  const reportRenderFailure = () => {
    canvasReady.current = true;
    annotationsReady.current = true;
    onReady();
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateSize = () => { setViewportWidth(viewport.clientWidth); setViewportHeight(viewport.clientHeight); };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  // Name the PDF's link annotations as pdf.js inserts them. This watches the
  // DOM rather than hanging off onRenderAnnotationLayerSuccess, which fires
  // before the anchors are in the tree — and it keeps working across the
  // re-render a zoom or a resize triggers. Only childList is observed, so
  // writing the attribute cannot re-enter the callback.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const nameAnnotations = () => {
      for (const link of viewport.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        if (link.getAttribute("aria-hidden") === "true") continue;
        if (link.textContent?.trim() || link.getAttribute("aria-label")) continue;
        link.setAttribute("aria-label", describeAnnotation(link.href));
      }
    };
    nameAnnotations();
    const observer = new MutationObserver(nameAnnotations);
    observer.observe(viewport, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
      <div ref={viewerRef} className="overflow-hidden border border-white/[0.11] bg-surface/80 shadow-2xl shadow-black/20 fullscreen:h-[100dvh] fullscreen:w-[100dvw] fullscreen:border-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500 sm:px-5">
        <span className="inline-flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-accent" /> Vigano_Gabriele_CV.pdf</span>
        <span className="hidden sm:inline">Integrated PDF viewer</span><a href={profile.cvPath} className="text-accent transition-colors hover:text-white sm:hidden">Tap to view full screen</a>
      </div>
      <div className="hidden items-center justify-end gap-2 border-b border-white/[0.08] bg-background/45 px-4 py-2 sm:flex" aria-label="PDF viewer controls">
        <div className="inline-flex items-center rounded-full border border-white/[0.1] bg-surface/60 p-1">
          <button type="button" onClick={() => setZoom((current) => clampZoom(current - 0.25))} disabled={zoom <= 0.75} data-cursor="hover" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
          <span className="min-w-12 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((current) => clampZoom(current + 0.25))} disabled={zoom >= 2.5} data-cursor="hover" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
        </div>
        <button type="button" onClick={() => { void viewerRef.current?.requestFullscreen?.(); }} data-cursor="hover" className="inline-flex h-10 items-center gap-2 border border-white/[0.1] px-3 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-300 transition-colors hover:border-accent hover:text-white" aria-label="View CV full screen"><Maximize2 className="h-3.5 w-3.5" /> Full screen</button>
      </div>
      <div
        ref={viewportRef}
        className="relative h-auto overflow-hidden bg-[#151a2b] p-2 sm:h-[min(84svh,72rem)] sm:min-h-[44rem] sm:overflow-auto sm:p-4 fullscreen:h-[calc(100dvh-3.75rem)] fullscreen:max-h-none"
      >
        {failed ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center px-6 text-center"><FileText className="h-6 w-6 text-accent" /><p className="mt-4 text-sm text-zinc-300">The document could not load in this viewer.</p><a href={profile.cvPath} target="_blank" rel="noreferrer" className="mt-4 text-sm text-accent underline underline-offset-4">Open with your browser’s PDF viewer</a></div>
        ) : (
          <div className="flex min-w-fit items-start justify-center sm:min-h-full">
            <Document file={profile.cvPath} onLoadSuccess={async (document) => { const page = await document.getPage(1); const viewport = page.getViewport({ scale: 1 }); setPageAspect(viewport.width / viewport.height); setFailed(false); }} onLoadError={() => { setFailed(true); onReady(); }} loading={<span className="mt-12 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Loading document…</span>}>
              {viewportWidth > 0 && <Page pageNumber={1} width={pageWidth} renderAnnotationLayer renderTextLayer={false} onRenderSuccess={() => { canvasReady.current = true; reportReady(); }} onRenderError={reportRenderFailure} onRenderAnnotationLayerSuccess={() => { annotationsReady.current = true; reportReady(); }} onRenderAnnotationLayerError={reportRenderFailure} loading={<span className="mt-12 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Rendering page…</span>} />}
            </Document>
          </div>
        )}
        {!failed && <a href={profile.cvPath} className="absolute inset-0 z-10 sm:hidden" tabIndex={-1} aria-hidden="true" />}
      </div>
    </div>
  );
}

export function CvPage() {
  const reduced = useReducedMotion();
  const { level } = useMotionProfile();
  const { active: systemActive, transitionId: systemTransitionId, toggle: toggleSystem, webkitSafeMode, laserEnabled } = useSystemMode();
  const [downloading, setDownloading] = useState(false);
  const [documentReady, setDocumentReady] = useState(false);
  const entrance = reduced || level === "static" ? false : { opacity: 0, y: 16 };
  const markDocumentReady = useCallback(() => setDocumentReady(true), []);
  useRouteReady(documentReady);

  const downloadCv = async () => {
    setDownloading(true);
    try {
      const response = await fetch(profile.cvPath);
      if (!response.ok) throw new Error("CV download failed");
      const blob = await response.blob();
      const file = new File([blob], "Vigano_Gabriele_CV.pdf", { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Gabriele Viganò CV" });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "Vigano_Gabriele_CV.pdf";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch {
      window.location.assign(profile.cvPath);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell>
      <PageMeta metadata={cvMetadata} />
      <SystemModeOverlay active={systemActive} transitionId={systemTransitionId} safeMode={webkitSafeMode} laserEnabled={laserEnabled} />
      <SystemHUD active={systemActive} />
      <header className="safe-nav fixed left-1/2 top-3 z-[60] w-[calc(100%-1.25rem)] max-w-6xl -translate-x-1/2 sm:top-6 sm:w-[calc(100%-2rem)]">
        <div className="flex items-center justify-between gap-3 border border-white/[0.09] bg-background/80 px-2 py-1.5 backdrop-blur-xl sm:px-4 sm:py-2">
          <Link to="/" data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <button type="button" onClick={toggleSystem} data-cursor="hover" data-sys-toggle className={`inline-flex h-11 min-w-[4.25rem] items-center justify-center gap-2 border px-2.5 font-mono text-[9px] uppercase tracking-[0.13em] transition-colors ${systemActive ? "border-accent/60 text-accent" : "border-white/[0.1] text-zinc-300"}`} aria-pressed={systemActive} aria-label="Toggle system mode" aria-keyshortcuts="Shift+S">
            <Power className="h-3 w-3" /> SYS
          </button>
        </div>
      </header>

      <main id="main-content" className="relative mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pt-36 lg:px-10 lg:pt-40">
        <m.section initial={entrance} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.6, ease: ease.cinematic }} aria-labelledby="cv-title">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{cvPageCopy.eyebrow}</p>
          <div className="mt-4 flex flex-col gap-6 border-b border-white/[0.09] pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 id="cv-title" className="text-5xl font-medium leading-[0.88] tracking-[-0.07em] whitespace-pre-line text-bone sm:text-7xl">{cvPageCopy.title}</h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">{cvPageCopy.summary}</p>
            </div>
            <div className="flex flex-wrap gap-3" aria-label="CV actions">
              <button type="button" onClick={() => void downloadCv()} disabled={downloading} data-cursor="hover" className="inline-flex min-h-12 items-center gap-2 bg-bone px-5 text-sm font-semibold text-[#080b16] transition-colors hover:bg-blue-soft disabled:cursor-wait disabled:opacity-70"><Download className="h-4 w-4" /> {downloading ? "Preparing…" : "Download CV"}</button>
              <a href={profile.cvPath} target="_blank" rel="noreferrer" data-cursor="hover" className="inline-flex min-h-12 items-center gap-2 border border-white/[0.14] px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:border-accent hover:text-white"><ExternalLink className="h-3.5 w-3.5" /> Open in new tab</a>
            </div>
          </div>
        </m.section>

        <m.section initial={entrance} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.1, ease: ease.cinematic }} className="mt-7" aria-label="CV document viewer">
          <CvDocumentViewer onReady={markDocumentReady} />
        </m.section>

        {systemActive && <m.aside initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.35, ease: ease.cinematic }} className="mt-8 border border-accent/30 bg-accent/[0.05] px-5 py-4 sm:mt-10 sm:flex sm:items-center sm:justify-between sm:gap-6" aria-label="System mode discovery">
          <div><p className="font-mono text-[9px] uppercase tracking-[0.17em] text-accent">{cvPageCopy.systemAside.eyebrow}</p><p className="mt-2 text-sm text-zinc-300">{cvPageCopy.systemAside.text}</p></div>
          <Link to="/#projects" data-cursor="hover" className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:text-accent sm:mt-0">{cvPageCopy.systemAside.link} <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </m.aside>}

        <Footer context="cv" />
      </main>
    </AppShell>
  );
}
