import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useRef } from "react";
import { HomePage } from "./pages/HomePage";
import { NotePage } from "./pages/NotePage";
import { NotFoundPage } from "./pages/NotFoundPage";

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
  return <BrowserRouter><RouteScroll /><Routes><Route path="/" element={<HomePage />} /><Route path="/index.html" element={<HomePage />} /><Route path="/viganogabriele.com" element={<HomePage />} /><Route path="/viganogabriele.com/" element={<HomePage />} /><Route path="/viganogabriele.com/index.html" element={<HomePage />} /><Route path="/notes/:slug" element={<NotePage />} /><Route path="*" element={<NotFoundPage />} /></Routes><Analytics /></BrowserRouter>;
}
