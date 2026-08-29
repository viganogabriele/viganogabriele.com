import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AnimatePresence, m, useIsPresent } from "framer-motion";
import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { BrowserRouter, Route, Routes, useLocation, type Location } from "react-router-dom";
import { Preloader } from "./components/layout/Preloader";
import { RouteReadyContext } from "./hooks/useRouteReady";
import { useMotionProfile } from "./hooks/useMotionProfile";
import { findScrollAnchor, getRegisteredNoteReturn, getScrollSnapshot, layoutTop, readNoteNavigationState, takeQueuedNoteReturn, type ScrollSnapshot } from "./lib/navigationState";
import { loadCvPage, loadNotFoundPage, loadNotePage, prefetchRoute } from "./lib/routePrefetch";
import { HOME_PATHS } from "./lib/routes";
import { HomePage } from "./pages/HomePage";

const NotePage = lazy(() => loadNotePage().then((module) => ({ default: module.NotePage })));
const CvPage = lazy(() => loadCvPage().then((module) => ({ default: module.CvPage })));
const NotFoundPage = lazy(() => loadNotFoundPage().then((module) => ({ default: module.NotFoundPage })));
// Readiness improves the handoff, but a stalled resource must never turn it
// into an infinite loading screen or a permanent scroll-correction loop.
const FONT_READY_TIMEOUT_MS = 3_000;
const SCROLL_SETTLE_TIMEOUT_MS = 5_000;

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
  const { prefersReducedMotion, level } = useMotionProfile();
  const positions = useRef(new Map<string, ScrollSnapshot>());
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const routeReady = readyKey === location.key;
  const routeSettled = settledKey === location.key;
  const loading = !routeReady || !routeSettled;
  // Kept mounted a little past `loading` going false so Preloader can finish
  // its own bar-to-100%-then-fade animation instead of being yanked away.
  // Adjusted during render (React's documented pattern for state derived from
  // a prop change) rather than in an effect, to avoid an extra commit.
  const [previousLoading, setPreviousLoading] = useState(loading);
  const [preloaderVisible, setPreloaderVisible] = useState(loading);
  if (loading !== previousLoading) {
    setPreviousLoading(loading);
    if (loading) setPreloaderVisible(true);
  }
  const hidePreloader = useCallback(() => setPreloaderVisible(false), []);
  useRoutePrefetching();

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  // Captured live, not on the way out: by the time a location-change effect
  // could run, the new route has already committed (React runs one commit for
  // the whole tree), so `getScrollSnapshot()` would read the page being
  // navigated TO, not the one being left — silently mis-recording the
  // fallback position for any route pair without its own explicit nav state
  // (e.g. Home<->CV). Keeping the ref current for every route as it's dwelt on
  // sidesteps the ordering problem entirely and needs no departure-time hook.
  // Notes are skipped: they're a fixed overlay with their own scroll
  // container, so `window.scrollY` there is meaningless and restoration for
  // `/notes/*` is skipped outright below.
  //
  // Deliberately no capture at effect setup, only listeners: RouteScrollCommit
  // hasn't run its own restore yet at that point (it's gated on `ready`, which
  // starts false on every mount), so an immediate capture here would freeze in
  // whatever pre-restore scrollY happens to be — 0, or a leftover value from
  // the previous route's layout — and permanently clobber a snapshot from an
  // earlier, genuine visit to this same key before the restore ever got to
  // read it. The restore's own `scrollTo` calls fire real `scroll` events, so
  // the correct settled position gets captured that way instead, and a route
  // with nothing to restore (a fresh hash-scroll or a plain top scroll) simply
  // records that outcome once it actually happens.
  //
  // Also deliberately synchronous, not rAF-coalesced: a coalesced write is
  // only pending, not committed, until the next frame, and this effect's own
  // cleanup — which runs the instant the reader navigates away, same as any
  // other effect teardown — has no page left to read a fresh value from by
  // then (see the note above). Cancelling that pending frame on the way out,
  // which a naive `cancelAnimationFrame` in the cleanup would do, silently
  // dropped the very last scroll position for anyone who scrolled and then
  // immediately followed a link, which is the ordinary case, not an edge one.
  //
  // The pathname guard inside `capture` covers a narrower but sharper version
  // of the same race: React applies the DOM mutation for a navigation (the
  // old route's content unmounting, the new route's mounting) before it runs
  // any effect cleanup. If the new route is shorter, the browser clamps
  // `window.scrollY` right then — synchronously, mid-mutation — and that
  // clamp fires a real `scroll` event. This listener is still attached at
  // that point (its cleanup hasn't run yet) and would otherwise capture that
  // post-clamp, pre-cleanup value under the OLD route's key, overwriting the
  // correct one an instant before it's cleaned up. `history.pushState` (and a
  // back/forward `popstate`) updates `window.location` synchronously before
  // that mutation ever happens, so comparing against the pathname captured at
  // effect setup reliably tells a stale, post-navigation event apart from a
  // genuine one from this route's own dwell time.
  //
  // `pointerdown` gets the same capture for a different reason: WebKit can
  // defer the `scroll` event's actual dispatch by a frame or more after
  // `scrollY` itself has already updated (Safari has form on coalescing
  // scroll-driven work this way). A press-then-click that lands within that
  // window fires the navigation before `scroll` ever caught up, so `capture`
  // also runs on the pointer going down — always before a click's resulting
  // navigation, and cheap enough to run on every press since it is just a
  // handful of reads, not a re-render.
  //
  // Gated on `routeReady`, not attached from the first render of a route: on
  // a mobile browser, mounting a shorter page than the one just left clamps
  // `window.scrollY` down to fit — synchronously, mid-mutation, well before
  // React has even decided this route is ready — and that clamp fires a real
  // `scroll` event too. Attaching immediately meant this route's OWN listener
  // (not the old route's, already covered above) caught that transient,
  // pre-restore value and recorded it as if the reader had actually scrolled
  // there, so a brand new route landed on whatever its momentarily-short
  // layout happened to clamp to instead of the top. `RouteScrollCommit`'s own
  // restore effect fires in the same commit `routeReady` flips true, and as a
  // layout effect it always runs before this (a plain effect) does — so by
  // the time this attaches, that route's one-time restore decision has
  // already been made from whatever was captured during an earlier, settled
  // visit, and cannot still be looking at a stale value from before this
  // mount existed.
  useEffect(() => {
    if (location.pathname.startsWith("/notes/") || !routeReady) return;
    const key = location.key;
    const pathname = location.pathname;
    const capture = () => {
      if (window.location.pathname !== pathname) return;
      positions.current.set(key, getScrollSnapshot());
    };
    window.addEventListener("scroll", capture, { passive: true });
    window.addEventListener("resize", capture);
    window.addEventListener("pointerdown", capture, { passive: true });
    return () => {
      window.removeEventListener("scroll", capture);
      window.removeEventListener("resize", capture);
      window.removeEventListener("pointerdown", capture);
    };
  }, [location.key, location.pathname, routeReady]);

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
    let settled = false;
    const ready = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      setReadyKey(key);
    };
    const timeout = window.setTimeout(ready, FONT_READY_TIMEOUT_MS);
    void fonts.then(ready, ready);
  }, []);
  const onSettled = useCallback((key: string) => setSettledKey(key), []);
  const onRouteError = useCallback((key: string) => {
    setReadyKey(key);
    setSettledKey(key);
  }, []);

  return (
    <RouteReadyContext.Provider value={markReady}>
      <RenderedRoutes positions={positions} ready={routeReady} reduceRouteMotion={prefersReducedMotion || level === "static"} onSettled={onSettled} onRouteError={onRouteError} />
      {preloaderVisible && <Preloader reducedMotion={prefersReducedMotion} active={loading} onHidden={hidePreloader} />}
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
    return <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-bone"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-soft">ERR / RENDER FAULT</p><h1 className="mt-4 text-5xl tracking-[-0.06em]">Signal interrupted.</h1><button type="button" onClick={() => window.location.reload()} className="mt-7 min-h-11 bg-bone px-5 text-sm font-semibold text-background">Reload the instrument</button></div></main>;
  }
}

function RouteScrollCommit({ location, positions, ready, onSettled }: { location: Location; positions: RefObject<Map<string, ScrollSnapshot>>; ready: boolean; onSettled: (key: string) => void }) {
  // A forward navigation to a route with nothing to restore has to land at the
  // top, and it has to do so before the reader sees anything else. React
  // applies the DOM swap for the new route first, and every route here is
  // shorter than Home, so the browser clamps window.scrollY down to the new
  // maximum in that same mutation. The restore below does correct it, but it is
  // gated on `ready` — which waits on fonts and on the lazy route chunk — so
  // until then the reader sat at the clamped position, i.e. the bottom of the
  // CV page. Running in a layout effect from the same commit as the swap means
  // that clamp is never painted.
  //
  // Deliberately narrow: anything that has a position to restore (a note
  // return, a history entry with a snapshot, an explicit hash) is left wholly
  // to the effect below, and home paths are skipped so this can never race
  // takeQueuedNoteReturn, which consumes the value it reads.
  useLayoutEffect(() => {
    if (location.pathname.startsWith("/notes/") || HOME_PATHS.has(location.pathname)) return;
    if (location.hash) return;
    if (readNoteNavigationState(location.state) || getRegisteredNoteReturn(location.key)) return;
    if (positions.current.get(location.key)) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location, positions]);

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
    const snapshot = queuedReturn ?? noteReturn ?? getRegisteredNoteReturn(location.key) ?? positions.current.get(location.key);
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
    const startedAt = performance.now();
    const settle = () => {
      if (cancelled) return;
      const height = document.documentElement.scrollHeight;
      const anchor = snapshot.anchor ? findScrollAnchor(snapshot.anchor.id) : null;
      // Measured from layout boxes, not getBoundingClientRect: the reveal
      // animations are transforms, and comparing a rect captured after one
      // finished against a rect measured while another was still pending put the
      // restore up to 16px out. See layoutTop in lib/navigationState.
      const anchorDocumentTop = anchor ? layoutTop(anchor) : null;
      const target = anchorDocumentTop !== null ? anchorDocumentTop - snapshot.anchor!.offset : snapshot.y;
      const canReach = height - window.innerHeight + 1 >= target;
      if (canReach) window.scrollTo({ top: Math.max(0, target), behavior: "auto" });
      // Reuses anchorDocumentTop rather than walking offsetParent a second time:
      // layoutTop is scroll-independent, so subtracting the post-scroll scrollY
      // gives the same viewport offset for one forced reflow instead of two.
      const exact = anchorDocumentTop !== null
        ? Math.abs(anchorDocumentTop - window.scrollY - snapshot.anchor!.offset) <= 1
        : Math.abs(window.scrollY - snapshot.y) <= 1;
      const anchorAnimating = anchor ? hasRunningAncestorAnimation(anchor) : false;
      const anchorStable = anchorDocumentTop === null || (previousAnchorTop !== null && Math.abs(anchorDocumentTop - previousAnchorTop) <= 0.1);
      stableFrames = canReach && exact && height === previousHeight && anchorStable && !anchorAnimating ? stableFrames + 1 : 0;
      previousHeight = height;
      previousAnchorTop = anchorDocumentTop;
      if (stableFrames >= 2 || performance.now() - startedAt >= SCROLL_SETTLE_TIMEOUT_MS) {
        onSettled(location.key);
        return;
      }
      frame = requestAnimationFrame(settle);
    };
    frame = requestAnimationFrame(settle);

    // Hand control to the reader the moment they touch the page. Until now the
    // loop re-scrolled to its target every frame with no way out, so a scroll
    // made while a restore was still converging got yanked back. `scroll` is not
    // in this list on purpose: the loop's own scrollTo fires it, so listening for
    // it would abort the restore instantly. Settle on abort too, otherwise the
    // route stays flagged as loading and the preloader never lifts.
    const takeOver = () => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(frame);
      onSettled(location.key);
    };
    const takeOverEvents = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    for (const event of takeOverEvents) window.addEventListener(event, takeOver, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      for (const event of takeOverEvents) window.removeEventListener(event, takeOver);
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

function RouteTransition({ children, reducedMotion }: { children: ReactNode; reducedMotion: boolean }) {
  const present = useIsPresent();
  return (
    <m.div
      data-route-transition
      aria-hidden={!present || undefined}
      inert={!present || undefined}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: "none", position: "absolute", inset: 0, width: "100%" }}
      transition={{ duration: reducedMotion ? 0 : present ? 0.22 : 0.12, ease: present ? [0.23, 1, 0.32, 1] : [0.7, 0, 0.84, 0] }}
    >
      {children}
    </m.div>
  );
}

function RenderedRoutes({ positions, ready, reduceRouteMotion, onSettled, onRouteError }: { positions: RefObject<Map<string, ScrollSnapshot>>; ready: boolean; reduceRouteMotion: boolean; onSettled: (key: string) => void; onRouteError: (key: string) => void }) {
  const location = useLocation();
  const homeRoute = HOME_PATHS.has(location.pathname);
  return (
    <RouteErrorBoundary resetKey={location.key} onError={() => onRouteError(location.key)}>
      <div data-route-content className="relative" aria-hidden={!ready || undefined} inert={!ready || undefined}>
        <RouteScrollCommit location={location} positions={positions} ready={ready} onSettled={onSettled} />
        <AnimatePresence initial={false} mode="sync">
          <RouteTransition key={location.key} reducedMotion={reduceRouteMotion}>
            {homeRoute && <div className="route-home"><HomePage /></div>}
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
          </RouteTransition>
        </AnimatePresence>
      </div>
    </RouteErrorBoundary>
  );
}
