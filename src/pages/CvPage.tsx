import { m, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, Minus, Plus, Power } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Link } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { AppShell } from "../components/layout/AppShell";
import { SystemModeOverlay } from "../components/layout/SystemModeOverlay";
import { SystemHUD } from "../components/motion/SystemHUD";
import { profile } from "../data/profile";
import { cvMetadata } from "../data/site";
import { useMotionProfile } from "../hooks/useMotionProfile";
import { useSystemMode } from "../hooks/useSystemMode";
import { ease } from "../lib/motion";
import { PageMeta } from "../lib/seo";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const exploreLinks = [
  { label: "Selected projects", href: "/#projects", detail: "Work and outcomes", icon: ArrowUpRight },
  { label: "GitHub", href: "https://github.com/viganogabriele", detail: "Repositories and experiments", icon: ArrowUpRight, external: true },
  { label: "LinkedIn", href: profile.linkedIn, detail: "Professional profile", icon: ArrowUpRight, external: true },
];

function CvDocumentViewer() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [failed, setFailed] = useState(false);
  const pageWidth = Math.round(Math.min(Math.max(viewportWidth - 32, 280), 860) * zoom);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateWidth = () => setViewportWidth(viewport.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-hidden border border-white/[0.11] bg-surface/80 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500 sm:px-5">
        <span className="inline-flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-accent" /> Vigano_Gabriele_CV.pdf</span>
        <span>Integrated PDF viewer</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-background/45 px-3 py-2 sm:px-4" aria-label="PDF viewer controls">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPageNumber((current) => Math.max(1, current - 1))} disabled={pageNumber <= 1} data-cursor="hover" className="inline-flex h-10 w-10 items-center justify-center border border-white/[0.1] text-zinc-300 transition-colors hover:border-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-35" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
          <span className="min-w-20 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400" aria-live="polite">Page {pageNumber} {pageCount ? `of ${pageCount}` : ""}</span>
          <button type="button" onClick={() => setPageNumber((current) => Math.min(pageCount, current + 1))} disabled={!pageCount || pageNumber >= pageCount} data-cursor="hover" className="inline-flex h-10 w-10 items-center justify-center border border-white/[0.1] text-zinc-300 transition-colors hover:border-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-35" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setZoom((current) => Math.max(0.8, Number((current - 0.1).toFixed(1))))} disabled={zoom <= 0.8} data-cursor="hover" className="inline-flex h-10 w-10 items-center justify-center border border-white/[0.1] text-zinc-300 transition-colors hover:border-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-35" aria-label="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
          <span className="min-w-12 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((current) => Math.min(1.4, Number((current + 0.1).toFixed(1))))} disabled={zoom >= 1.4} data-cursor="hover" className="inline-flex h-10 w-10 items-center justify-center border border-white/[0.1] text-zinc-300 transition-colors hover:border-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-35" aria-label="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div ref={viewportRef} className="h-[68svh] min-h-[34rem] overflow-auto bg-[#151a2b] p-4 sm:h-[min(78svh,62rem)] sm:p-6">
        {failed ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center px-6 text-center"><FileText className="h-6 w-6 text-accent" /><p className="mt-4 text-sm text-zinc-300">The document could not load in this viewer.</p><a href={profile.cvPath} target="_blank" rel="noreferrer" className="mt-4 text-sm text-accent underline underline-offset-4">Open with your browser’s PDF viewer</a></div>
        ) : (
          <div className="flex min-h-full min-w-fit items-start justify-center">
            <Document file={profile.cvPath} onLoadSuccess={({ numPages }) => { setPageCount(numPages); setPageNumber(1); setFailed(false); }} onLoadError={() => setFailed(true)} loading={<span className="mt-12 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Loading document…</span>}>
              {viewportWidth > 0 && <Page pageNumber={pageNumber} width={pageWidth} renderAnnotationLayer={false} renderTextLayer={false} loading={<span className="mt-12 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Rendering page…</span>} />}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}

export function CvPage() {
  const reduced = useReducedMotion();
  const { level } = useMotionProfile();
  const { active: systemActive, transitionId: systemTransitionId, toggle: toggleSystem, webkitSafeMode, laserEnabled } = useSystemMode();
  const entrance = reduced || level === "static" ? false : { opacity: 0, y: 16 };

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
          <button type="button" onClick={toggleSystem} data-cursor="hover" className={`inline-flex h-11 min-w-[4.25rem] items-center justify-center gap-2 border px-2.5 font-mono text-[9px] uppercase tracking-[0.13em] transition-colors ${systemActive ? "border-accent/60 text-accent" : "border-white/[0.1] text-zinc-300"}`} aria-pressed={systemActive} aria-label="Toggle system mode" aria-keyshortcuts="Shift+S">
            <Power className="h-3 w-3" /> SYS
          </button>
        </div>
      </header>

      <main id="main-content" className="relative mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pt-36 lg:px-10 lg:pt-40">
        <m.section initial={entrance} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.6, ease: ease.cinematic }} aria-labelledby="cv-title">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Document / CV</p>
          <div className="mt-4 flex flex-col gap-6 border-b border-white/[0.09] pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 id="cv-title" className="text-5xl font-medium leading-[0.88] tracking-[-0.07em] text-bone sm:text-7xl">Curriculum<br />Vitae.</h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">A focused overview of Gabriele Viganò’s work across product, operations, and technical systems.</p>
            </div>
            <div className="flex flex-wrap gap-3" aria-label="CV actions">
              <a href={profile.cvPath} download="Vigano_Gabriele_CV.pdf" data-cursor="hover" className="inline-flex min-h-12 items-center gap-2 bg-bone px-5 text-sm font-semibold text-[#080b16] transition-colors hover:bg-blue-soft"><Download className="h-4 w-4" /> Download CV</a>
              <a href={profile.cvPath} target="_blank" rel="noreferrer" data-cursor="hover" className="inline-flex min-h-12 items-center gap-2 border border-white/[0.14] px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:border-accent hover:text-white"><ExternalLink className="h-3.5 w-3.5" /> Open in new tab</a>
            </div>
          </div>
        </m.section>

        <m.section initial={entrance} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.1, ease: ease.cinematic }} className="mt-7" aria-label="CV document viewer">
          <CvDocumentViewer />
        </m.section>

        <section className="mt-14 border-t border-white/[0.09] pt-7 sm:mt-20 sm:pt-9" aria-labelledby="explore-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Continue / context</p>
              <h2 id="explore-title" className="mt-3 text-3xl font-medium tracking-[-0.055em] text-bone sm:text-4xl">Explore further.</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-500">A little more context behind the document: selected work, public repositories, and the professional profile.</p>
          </div>
          <div className="mt-7 grid gap-px border border-white/[0.09] bg-white/[0.09] md:grid-cols-3">
            {exploreLinks.map(({ label, href, detail, icon: Icon, external }) => (
              <a key={label} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} data-cursor="hover" className="group flex min-h-32 flex-col justify-between bg-background px-5 pb-5 pt-3 transition-colors hover:bg-surface">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">{detail}</span>
                <span className="flex w-full items-center justify-between gap-3 text-lg font-medium text-bone">{label}<Icon className="h-4 w-4 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
              </a>
            ))}
          </div>
        </section>
        <Footer onNavigate={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })} />
      </main>
    </AppShell>
  );
}
