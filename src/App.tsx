import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import { NotePage } from "./pages/NotePage";
import { NotFoundPage } from "./pages/NotFoundPage";

function RouteScroll() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);
  return null;
}

export default function App() {
  return <BrowserRouter><RouteScroll /><Routes><Route path="/" element={<HomePage />} /><Route path="/index.html" element={<HomePage />} /><Route path="/viganogabriele.com" element={<HomePage />} /><Route path="/viganogabriele.com/" element={<HomePage />} /><Route path="/viganogabriele.com/index.html" element={<HomePage />} /><Route path="/notes/:slug" element={<NotePage />} /><Route path="*" element={<NotFoundPage />} /></Routes><Analytics /></BrowserRouter>;
}
