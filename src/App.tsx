import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation, type Location } from "react-router-dom";
import { Preloader } from "./components/layout/Preloader";
import { RouteReadyContext } from "./hooks/useRouteReady";
import { useMotionProfile } from "./hooks/useMotionProfile";
import { findScrollAnchor, getRegisteredNoteReturn, getScrollSnapshot, readNoteNavigationState, takeQueuedNoteReturn, type ScrollSnapshot } from "./lib/navigationState";
import { loadCvPage, loadNotFoundPage, loadNotePage, prefetchRoute } from "./lib/routePrefetch";
import { HomePage } from "./pages/HomePage";

const NotePage = lazy(() => loadNotePage().then((module) => ({ default: module.NotePage })));
const CvPage = lazy(() => loadCvPage().then((module) => ({ default: module.CvPage })));
const NotFoundPage = lazy(() => loadNotFoundPage().then((module) => ({ default: module.NotFoundPage })));
const HOME_PATHS = new Set(["/", "/index.html", "/viganogabriele.com", "/viganogabriele.com/", "/viganogabriele.com/index.html"]);

function useRoutePrefetching() {
  useEffect(() => {
    const prefetch = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.origin !== window.location.origin) return;
      prefetchRoute(anchor.pathname);
    };
    document.addEventListener("pointerover", prefetch, { passive: true });
    document.addEventListener("focusin", prefetch);
    return () => {
      document.removeEventListener("pointerover", prefetch);
      document.removeEventListener("focusin", prefetch);
    };
  }, []);
}

function RouteScrollManager() {
  const location = useLocation();
  const { prefersReducedMotion } = useMotionProfile();
  const [positions, setPositions] = useState(() => new Map<string, ScrollSnapshot>());
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const previousLocation = useRef<Location>(location);
  const routeReady = readyKey === location.key;
  const routeSettled = settledKey === location.key;
  const loading = !routeReady || !routeSettled;
  useRoutePrefetching();

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    const previous = previousLocation.current;
    if (previous.key === location.key) return;
    const snapshot = getScrollSnapshot();
    setPositions((current) => {
      const next = new Map(current);
      next.set(previous.key, snapshot);
      return next;
    });
    previousLocation.current = location;
  }, [location]);

  useLayoutEffect(() => {
    if (HOME_PATHS.has(location.pathname) && routeReady) {
      document.documentElement.setAttribute("data-hero-reveal", "true");
    }
  }, [location.pathname, routeReady]);

  useEffect(() => {
    if (!loading) return;
    const preventScroll = (event: Event) => event.preventDefault();
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [loading]);

  const markReady = useCallback((key: string) => {
    const fonts = document.fonts?.ready ?? Promise.resolve();
    void fonts.then(() => setReadyKey(key), () => setReadyKey(key));
  }, []);
  const onSettled = useCallback((key: string) => setSettledKey(key), []);
  const onRouteError = useCallback((key: string) => {
    setReadyKey(key);
    setSettledKey(key);
  }, []);

  return (
    <RouteReadyContext.Provider value={markReady}>
      <RenderedRoutes positions={positions} ready={routeReady} onSettled={onSettled} onRouteError={onRouteError} />
      {loading && <Preloader reducedMotion={prefersReducedMotion} />}
    </RouteReadyContext.Provider>
  );
}

export default function App() {
  const analyticsEnabled = !["localhost", "127.0.0.1"].includes(window.location.hostname);
  return <BrowserRouter><RouteScrollManager />{analyticsEnabled && <Analytics />}{analyticsEnabled && <SpeedInsights />}</BrowserRouter>;
}

class RouteErrorBoundary extends Component<{ children: ReactNode; resetKey: string; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  componentDidUpdate(previousProps: Readonly<{ children: ReactNode; resetKey: string; onError: () => void }>) {
    if (this.state.failed && previousProps.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-bone"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-soft">ERR / RENDER FAULT</p><h1 className="mt-4 text-5xl tracking-[-0.06em]">Signal interrupted.</h1><button type="button" onClick={() => window.location.reload()} className="mt-7 min-h-11 bg-bone px-5 text-sm font-semibold text-[#080b16]">Reload the instrument</button></div></main>;
  }
}

function RouteScrollCommit({ location, positions, ready, onSettled }: { location: Location; positions: Map<string, ScrollSnapshot>; ready: boolean; onSettled: (key: string) => void }) {
  useLayoutEffect(() => {
    if (!ready) return;
    if (location.pathname.startsWith("/notes/")) {
      onSettled(location.key);
      return;
    }
    let frame = 0;
    let cancelled = false;
    const noteReturn = readNoteNavigationState(location.state)?.noteReturn.snapshot;
    const queuedReturn = location.pathname === "/" ? takeQueuedNoteReturn() : null;
    const snapshot = queuedReturn ?? noteReturn ?? getRegisteredNoteReturn(location.key) ?? positions.get(location.key);
    if (!snapshot && location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start", behavior: "auto" });
      onSettled(location.key);
      return;
    }
    if (!snapshot) {
      window.scrollTo({ top: 0, behavior: "auto" });
      onSettled(location.key);
      return;
    }

    let stableFrames = 0;
    let previousHeight = 0;
    let previousAnchorTop: number | null = null;
    const settle = () => {
      if (cancelled) return;
      const height = document.documentElement.scrollHeight;
      const anchor = snapshot.anchor ? findScrollAnchor(snapshot.anchor.id) : null;
      const anchorDocumentTop = anchor ? window.scrollY + anchor.getBoundingClientRect().top : null;
      const target = anchor
        ? window.scrollY + anchor.getBoundingClientRect().top - snapshot.anchor!.offset
        : snapshot.y;
      const canReach = height - window.innerHeight + 1 >= target;
      if (canReach) window.scrollTo({ top: Math.max(0, target), behavior: "auto" });
      const exact = anchor
        ? Math.abs(anchor.getBoundingClientRect().top - snapshot.anchor!.offset) <= 1
        : Math.abs(window.scrollY - snapshot.y) <= 1;
      const anchorAnimating = anchor ? hasRunningAncestorAnimation(anchor) : false;
      const anchorStable = anchorDocumentTop === null || (previousAnchorTop !== null && Math.abs(anchorDocumentTop - previousAnchorTop) <= 0.1);
      stableFrames = canReach && exact && height === previousHeight && anchorStable && !anchorAnimating ? stableFrames + 1 : 0;
      previousHeight = height;
      previousAnchorTop = anchorDocumentTop;
      if (stableFrames >= 2) {
        onSettled(location.key);
        return;
      }
      frame = requestAnimationFrame(settle);
    };
    frame = requestAnimationFrame(settle);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [location, positions, ready, onSettled]);

  return null;
}

function hasRunningAncestorAnimation(element: HTMLElement) {
  let current: HTMLElement | null = element;
  while (current) {
    if (current.getAnimations().some((animation) => animation.playState === "running")) return true;
    if (current.classList.contains("route-home")) return false;
    current = current.parentElement;
  }
  return false;
}

function RenderedRoutes({ positions, ready, onSettled, onRouteError }: { positions: Map<string, ScrollSnapshot>; ready: boolean; onSettled: (key: string) => void; onRouteError: (key: string) => void }) {
  const location = useLocation();
  const [homeMounted, setHomeMounted] = useState(false);
  const homeRoute = HOME_PATHS.has(location.pathname);
  const noteRoute = location.pathname.startsWith("/notes/");
  const showHome = homeRoute || (homeMounted && noteRoute);
  const markHomeMounted = useCallback((node: HTMLDivElement | null) => {
    if (node) setHomeMounted(true);
  }, []);
  return (
    <RouteErrorBoundary resetKey={location.key} onError={() => onRouteError(location.key)}>
      <div data-route-content className="relative" aria-hidden={!ready || undefined} inert={!ready || undefined}>
        <RouteScrollCommit location={location} positions={positions} ready={ready} onSettled={onSettled} />
        {showHome && <div ref={markHomeMounted} className="route-home" aria-hidden={!homeRoute || undefined} inert={!homeRoute || undefined}><HomePage routeActive={homeRoute} /></div>}
        <Suspense fallback={<span className="sr-only" role="status">Loading…</span>}>
          <Routes location={location}>
            <Route path="/" element={null} />
            <Route path="/index.html" element={null} />
            <Route path="/viganogabriele.com" element={null} />
            <Route path="/viganogabriele.com/" element={null} />
            <Route path="/viganogabriele.com/index.html" element={null} />
            <Route path="/cv" element={<CvPage />} />
            <Route path="/cv/" element={<CvPage />} />
            <Route path="/notes/:slug" element={<NotePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </RouteErrorBoundary>
  );
}
