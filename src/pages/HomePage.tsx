import { useReducedMotion } from "framer-motion";
import { memo, useCallback } from "react";
import { About } from "../components/sections/About";
import { Certifications } from "../components/sections/Certifications";
import { Expertise } from "../components/sections/Expertise";
import { Hero } from "../components/sections/Hero";
import { Journey } from "../components/sections/Journey";
import { Notes } from "../components/sections/Notes";
import { Projects } from "../components/sections/Projects";
import { TechStack } from "../components/sections/TechStack";
import { AppShell } from "../components/layout/AppShell";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { SystemModeOverlay } from "../components/layout/SystemModeOverlay";
import { ScrollBar } from "../components/motion/ScrollBar";
import { SystemHUD } from "../components/motion/SystemHUD";
import { useSystemMode } from "../hooks/useSystemMode";
import { homeMetadata, websitePersonJsonLd } from "../data/site";
import { JsonLd, PageMeta } from "../lib/seo";
import { useRouteReadyAfterImage } from "../hooks/useRouteReady";

export const HomePage = memo(function HomePage() {
  const reduced = useReducedMotion();
  const { active: systemActive, transitionId: systemTransitionId, toggle: toggleSystem, webkitSafeMode, laserEnabled } = useSystemMode();
  const portraitVisible = window.matchMedia("(min-width: 640px)").matches;
  useRouteReadyAfterImage("[data-hero-portrait]", portraitVisible);

  const scrollToSection = useCallback((target: string) => {
    const selector = target === "body" ? "body" : target;
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) return;
    if (selector === "body") {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const y = element.getBoundingClientRect().top + window.scrollY - 92;
    window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  return (
    <AppShell>
      <PageMeta metadata={homeMetadata} />
      <JsonLd id="website-person" data={websitePersonJsonLd} />
      <ScrollBar />
      <Navbar onNavigate={scrollToSection} />
      <SystemModeOverlay active={systemActive} transitionId={systemTransitionId} safeMode={webkitSafeMode} laserEnabled={laserEnabled} />
      <SystemHUD active={systemActive} />
      <main id="main-content">
        <Hero systemActive={systemActive} onToggleSystem={toggleSystem} />
        <About />
        <Projects />
        <Expertise />
        <Journey />
        <Notes />
        <TechStack />
        <Certifications />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Footer />
        </div>
      </main>
    </AppShell>
  );
});
