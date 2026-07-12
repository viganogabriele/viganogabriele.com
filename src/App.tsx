import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef } from "react";
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

function AnimatedRoutes() {
  const location = useLocation();
  const { prefersReducedMotion } = useMotionProfile();
  return <AnimatePresence mode="wait" initial={false}><m.div className="relative" key={location.pathname} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}><Suspense fallback={<div className="min-h-screen bg-[#050608]" />}><Routes location={location}><Route path="/" element={<HomePage />} /><Route path="/index.html" element={<HomePage />} /><Route path="/viganogabriele.com" element={<HomePage />} /><Route path="/viganogabriele.com/" element={<HomePage />} /><Route path="/viganogabriele.com/index.html" element={<HomePage />} /><Route path="/notes/:slug" element={<NotePage />} /><Route path="*" element={<NotFoundPage />} /></Routes></Suspense></m.div></AnimatePresence>;
}
