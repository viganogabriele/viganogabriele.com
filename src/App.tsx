import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigationType, type Location } from "react-router-dom";
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
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

function RouteScrollCommit({ location, navigationType, positions, ready, onSettled }: { location: Location; navigationType: ReturnType<typeof useNavigationType>; positions: Map<string, ScrollSnapshot>; ready: boolean; onSettled: (key: string) => void }) {
  useLayoutEffect(() => {
    if (!ready) return;
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
          const correctedTop = window.scrollY + settledAnchor.getBoundingClientRect().top - snapshotAnchor.offset;
          window.scrollTo({ top: Math.max(0, correctedTop), behavior: "auto" });
        }, 60);
      }
    };

    restore();
    onSettled(location.key);

    return () => {
      cancelled = true;
      window.clearTimeout(settleTimer);
      interactionEvents.forEach((event) => window.removeEventListener(event, markInteracted));
    };
  }, [location, navigationType, positions, ready, onSettled]);

  return null;
}

function RenderedRoutes({ positions, ready, onSettled, onRouteError }: { positions: Map<string, ScrollSnapshot>; ready: boolean; onSettled: (key: string) => void; onRouteError: (key: string) => void }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  return (
    <RouteErrorBoundary resetKey={location.key} onError={() => onRouteError(location.key)}>
      <div data-route-content className="relative" aria-hidden={!ready || undefined} inert={!ready || undefined}>
        <Suspense fallback={<span className="sr-only" role="status">Loading…</span>}>
          <RouteScrollCommit location={location} navigationType={navigationType} positions={positions} ready={ready} onSettled={onSettled} />
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/index.html" element={<HomePage />} />
            <Route path="/viganogabriele.com" element={<HomePage />} />
            <Route path="/viganogabriele.com/" element={<HomePage />} />
            <Route path="/viganogabriele.com/index.html" element={<HomePage />} />
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
