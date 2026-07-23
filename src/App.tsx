import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Route, Routes, useLocation, useNavigationType, type Location } from "react-router-dom";
import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";
import { HomePage } from "./pages/HomePage";
import { useMotionProfile } from "./hooks/useMotionProfile";
import { findScrollAnchor, getRegisteredNoteReturn, getScrollSnapshot, type ScrollSnapshot } from "./lib/navigationState";
import { usePreloader } from "./hooks/usePreloader";
import { Preloader } from "./components/layout/Preloader";

const NotePage = lazy(() => import("./pages/NotePage").then((module) => ({ default: module.NotePage })));
const CvPage = lazy(() => import("./pages/CvPage").then((module) => ({ default: module.CvPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const HOME_PATHS = new Set(["/", "/index.html", "/viganogabriele.com", "/viganogabriele.com/", "/viganogabriele.com/index.html"]);

function InitialHomePreloader({ enabled }: { enabled: boolean }) {
  const { prefersReducedMotion } = useMotionProfile();
  const { loading, progress } = usePreloader(enabled, prefersReducedMotion);

  useEffect(() => {
    if (!loading) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [loading]);

  return <AnimatePresence>{loading && <Preloader progress={progress} reducedMotion={prefersReducedMotion} />}</AnimatePresence>;
}

function RouteScrollManager() {
  const location = useLocation();
  const [showInitialPreloader] = useState(() => HOME_PATHS.has(location.pathname));
  const [positions, setPositions] = useState(() => new Map<string, ScrollSnapshot>());
  const previousLocation = useRef<Location>(location);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    const previous = previousLocation.current;
    if (previous.key !== location.key) {
      const snapshot = getScrollSnapshot();
      setPositions((current) => {
        const next = new Map(current);
        next.set(previous.key, snapshot);
        return next;
      });
      previousLocation.current = location;
    }
  }, [location]);

  return <><AnimatedRoutes positions={positions} /><InitialHomePreloader enabled={showInitialPreloader} /></>;
}

export default function App() {
  const analyticsEnabled = !["localhost", "127.0.0.1"].includes(window.location.hostname);
  return <BrowserRouter><RouteScrollManager />{analyticsEnabled && <Analytics />}{analyticsEnabled && <SpeedInsights />}</BrowserRouter>;
}

class RouteErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* route-level recovery UI is intentional */ }
  componentDidUpdate(previousProps: Readonly<{ children: ReactNode; resetKey: string }>) {
    if (this.state.failed && previousProps.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-bone"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-soft">ERR / RENDER FAULT</p><h1 className="mt-4 text-5xl tracking-[-0.06em]">Signal interrupted.</h1><button type="button" onClick={() => window.location.reload()} className="mt-7 min-h-11 bg-bone px-5 text-sm font-semibold text-[#080b16]">Reload the instrument</button></div></main>;
  }
}

function RouteLoadingFallback() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background" role="status" aria-live="polite"><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Loading route…</span></div>;
}

function RouteScrollCommit({ location, navigationType, positions }: { location: Location; navigationType: ReturnType<typeof useNavigationType>; positions: Map<string, ScrollSnapshot> }) {
  useLayoutEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let correctionFrame = 0;
    let cancelled = false;
    let interacted = false;
    const markInteracted = () => { interacted = true; };
    const interactionEvents: Array<keyof WindowEventMap> = ["wheel", "touchstart", "pointerdown", "keydown"];
    interactionEvents.forEach((event) => window.addEventListener(event, markInteracted, { passive: true }));

    const restore = (correctAnchor = false) => {
      if (cancelled || interacted) return;
      if (location.hash) {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start", behavior: "auto" });
        return;
      }
      if (navigationType !== "POP") {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      const snapshot = getRegisteredNoteReturn(location.key) ?? positions.get(location.key);
      if (!snapshot) {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      const anchor = correctAnchor && snapshot.anchor ? findScrollAnchor(snapshot.anchor.id) : null;
      const top = anchor ? window.scrollY + anchor.getBoundingClientRect().top - snapshot.anchor!.offset : snapshot.y;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    };

    const fontsAreStillLoading = document.fonts?.status === "loading";

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        restore();
        if (fontsAreStillLoading) {
          void document.fonts?.ready?.then(() => {
            correctionFrame = requestAnimationFrame(() => restore(true));
          });
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      cancelAnimationFrame(correctionFrame);
      interactionEvents.forEach((event) => window.removeEventListener(event, markInteracted));
    };
  }, [location, navigationType, positions]);

  return null;
}

function AnimatedRoutes({ positions }: { positions: Map<string, ScrollSnapshot> }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { prefersReducedMotion } = useMotionProfile();
  return <RouteErrorBoundary resetKey={location.key}><AnimatePresence mode="wait" initial={false}><m.div className="relative" key={location.key} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}><RouteScrollCommit location={location} navigationType={navigationType} positions={positions} /><Suspense fallback={<RouteLoadingFallback />}><Routes location={location}><Route path="/" element={<HomePage />} /><Route path="/index.html" element={<HomePage />} /><Route path="/viganogabriele.com" element={<HomePage />} /><Route path="/viganogabriele.com/" element={<HomePage />} /><Route path="/viganogabriele.com/index.html" element={<HomePage />} /><Route path="/cv" element={<CvPage />} /><Route path="/cv/" element={<CvPage />} /><Route path="/notes/:slug" element={<NotePage />} /><Route path="*" element={<NotFoundPage />} /></Routes></Suspense></m.div></AnimatePresence></RouteErrorBoundary>;
}
