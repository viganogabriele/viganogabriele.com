import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Route, Routes, useLocation, useNavigationType, type Location } from "react-router-dom";
import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";
import { HomePage } from "./pages/HomePage";
import { useMotionProfile } from "./hooks/useMotionProfile";
import { findScrollAnchor, getRegisteredNoteReturn, getScrollSnapshot, readNoteNavigationState, takeQueuedNoteReturn, type ScrollSnapshot } from "./lib/navigationState";
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

  // Gates the hero wordmark's CSS reveal (see index.css) so it plays after
  // the preloader is gone instead of finishing underneath it, unseen.
  useEffect(() => {
    if (!loading) document.documentElement.setAttribute("data-hero-reveal", "true");
  }, [loading]);

  return <AnimatePresence>{loading && <Preloader progress={progress} reducedMotion={prefersReducedMotion} />}</AnimatePresence>;
}

// Fake-ramp progress for subsequent SPA navigations — there's no real asset
// list to track here (unlike the first load), so this exists purely to keep
// the same calibration visual instead of a static/frozen bar.
function useRouteTransitionProgress(active: boolean, reducedMotion: boolean) {
  const [rampProgress, setRampProgress] = useState(0);
  const animate = active && !reducedMotion;

  useEffect(() => {
    if (!animate) return;
    let frame = 0;
    let amount = 0;
    const tick = () => {
      amount = Math.min(92, amount + (92 - amount) * 0.12 + 1.5);
      setRampProgress(amount);
      if (amount < 91.5) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  if (reducedMotion) return active ? 60 : 100;
  if (!active) return 100;
  return rampProgress;
}

// Reuses the same Preloader that covers the first load, so clicking into a
// note or the CV page (and returning) reads as one consistent instrument
// rather than a branded intro followed by plain "Loading route…" text.
function RouteTransitionCover({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const progress = useRouteTransitionProgress(active, reducedMotion);
  return <AnimatePresence>{active && <Preloader progress={progress} reducedMotion={reducedMotion} />}</AnimatePresence>;
}

function RouteScrollManager() {
  const location = useLocation();
  const { prefersReducedMotion } = useMotionProfile();
  const [showInitialPreloader] = useState(() => HOME_PATHS.has(location.pathname));
  const [positions, setPositions] = useState(() => new Map<string, ScrollSnapshot>());
  const [transitioning, setTransitioning] = useState(false);
  const [previousKey, setPreviousKey] = useState(location.key);
  const previousLocation = useRef<Location>(location);
  // Derive the cover synchronously from the incoming location as well as the
  // settled transition state. Effects run after React has committed the next
  // route; deriving it here ensures the first commit already contains the
  // opaque cover, so there is never a one-frame content flash on mobile.
  const routeChanged = previousKey !== location.key;

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
      setPreviousKey(location.key);
      setTransitioning(true);
    }
  }, [location]);

  const onSettled = useCallback(() => setTransitioning(false), []);

  return <>
    <AnimatedRoutes positions={positions} onSettled={onSettled} />
    <InitialHomePreloader enabled={showInitialPreloader} />
    <RouteTransitionCover active={routeChanged || transitioning} reducedMotion={prefersReducedMotion} />
  </>;
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

function RouteScrollCommit({ location, navigationType, positions, onSettled }: { location: Location; navigationType: ReturnType<typeof useNavigationType>; positions: Map<string, ScrollSnapshot>; onSettled: () => void }) {
  useLayoutEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let settleTimer = 0;
    let cancelled = false;
    let interacted = false;
    const markInteracted = () => { interacted = true; };
    const interactionEvents: Array<keyof WindowEventMap> = ["wheel", "touchstart", "pointerdown", "keydown"];
    interactionEvents.forEach((event) => window.addEventListener(event, markInteracted, { passive: true }));

    const restore = (correctAnchor = false) => {
      if (cancelled || interacted) return;
      const noteReturn = readNoteNavigationState(location.state)?.noteReturn.snapshot;
      const queuedReturn = location.pathname === "/" ? takeQueuedNoteReturn() : null;
      const snapshot = queuedReturn ?? noteReturn ?? getRegisteredNoteReturn(location.key) ?? positions.get(location.key);
      if (!snapshot && location.hash) {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start", behavior: "auto" });
        return;
      }
      if (!snapshot) {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      const anchor = correctAnchor && snapshot.anchor ? findScrollAnchor(snapshot.anchor.id) : null;
      const top = anchor ? window.scrollY + anchor.getBoundingClientRect().top - snapshot.anchor!.offset : snapshot.y;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      if (!correctAnchor && snapshot.anchor) {
        const snapshotAnchor = snapshot.anchor;
        settleTimer = window.setTimeout(() => {
          if (cancelled || interacted) return;
          const settledAnchor = findScrollAnchor(snapshotAnchor.id);
          if (!settledAnchor) return;
          const top = window.scrollY + settledAnchor.getBoundingClientRect().top - snapshotAnchor.offset;
          window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
        }, 60);
      }
    };

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        restore();
        onSettled();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.clearTimeout(settleTimer);
      interactionEvents.forEach((event) => window.removeEventListener(event, markInteracted));
    };
  }, [location, navigationType, positions, onSettled]);

  return null;
}

function AnimatedRoutes({ positions, onSettled }: { positions: Map<string, ScrollSnapshot>; onSettled: () => void }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { prefersReducedMotion } = useMotionProfile();
  return <RouteErrorBoundary resetKey={location.key}><AnimatePresence mode="wait" initial={false}><m.div className="relative" key={location.key} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}><Suspense fallback={<span className="sr-only" role="status">Loading…</span>}><RouteScrollCommit location={location} navigationType={navigationType} positions={positions} onSettled={onSettled} /><Routes location={location}><Route path="/" element={<HomePage />} /><Route path="/index.html" element={<HomePage />} /><Route path="/viganogabriele.com" element={<HomePage />} /><Route path="/viganogabriele.com/" element={<HomePage />} /><Route path="/viganogabriele.com/index.html" element={<HomePage />} /><Route path="/cv" element={<CvPage />} /><Route path="/cv/" element={<CvPage />} /><Route path="/notes/:slug" element={<NotePage />} /><Route path="*" element={<NotFoundPage />} /></Routes></Suspense></m.div></AnimatePresence></RouteErrorBoundary>;
}
