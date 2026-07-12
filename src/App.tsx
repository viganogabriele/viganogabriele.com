import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { Component, lazy, Suspense, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";
import { HomePage } from "./pages/HomePage";
import { useMotionProfile } from "./hooks/useMotionProfile";

const NotePage = lazy(() => import("./pages/NotePage").then((module) => ({ default: module.NotePage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

function RouteScroll() {
  const location = useLocation();
  const navType = useNavigationType();
  const positions = useRef<Map<string, number>>(new Map());
  const prevPath = useRef<string>(location.pathname);

  useEffect(() => {
    // Save the position of the path we're LEAVING
    positions.current.set(prevPath.current, window.scrollY);
    prevPath.current = location.pathname;

    if (location.hash) return; // let anchor scrolling handle hash
    if (navType === "POP") {
      const y = positions.current.get(location.pathname) ?? 0;
      window.scrollTo({ top: y, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.hash, navType]);

  return null;
}

export default function App() {
  const analyticsEnabled = !["localhost", "127.0.0.1"].includes(window.location.hostname);
  return <BrowserRouter><RouteScroll /><AnimatedRoutes />{analyticsEnabled && <Analytics />}{analyticsEnabled && <SpeedInsights />}</BrowserRouter>;
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* route-level recovery UI is intentional */ }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-bone"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember-bright">ERR / RENDER FAULT</p><h1 className="mt-4 text-5xl tracking-[-0.06em]">Signal interrupted.</h1><button type="button" onClick={() => window.location.reload()} className="mt-7 min-h-11 bg-bone px-5 text-sm font-semibold text-black">Reload the instrument</button></div></main>;
  }
}

function AnimatedRoutes() {
  const location = useLocation();
  const { prefersReducedMotion } = useMotionProfile();
  return <RouteErrorBoundary><AnimatePresence mode="wait" initial={false}><m.div className="relative" key={location.pathname} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}><Suspense fallback={<div className="min-h-[100dvh] bg-background" />}><Routes location={location}><Route path="/" element={<HomePage />} /><Route path="/index.html" element={<HomePage />} /><Route path="/viganogabriele.com" element={<HomePage />} /><Route path="/viganogabriele.com/" element={<HomePage />} /><Route path="/viganogabriele.com/index.html" element={<HomePage />} /><Route path="/notes/:slug" element={<NotePage />} /><Route path="*" element={<NotFoundPage />} /></Routes></Suspense></m.div></AnimatePresence></RouteErrorBoundary>;
}
