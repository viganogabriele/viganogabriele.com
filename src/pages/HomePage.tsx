import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useEffect } from "react";
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
import { Preloader } from "../components/layout/Preloader";
import { SystemModeOverlay } from "../components/layout/SystemModeOverlay";
import { ScrollBar } from "../components/motion/ScrollBar";
import { SystemHUD } from "../components/motion/SystemHUD";
import { usePreloader } from "../hooks/usePreloader";
import { useSystemMode } from "../hooks/useSystemMode";
import { JsonLd, PageMeta, SITE_URL } from "../lib/seo";

export function HomePage() {
  const reduced = useReducedMotion();
  const { loading, progress } = usePreloader(reduced);
  const { active: systemActive, transitionId: systemTransitionId, toggle: toggleSystem } = useSystemMode();

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [loading]);

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
      <PageMeta
        title="Gabriele Viganò"
        description="Computer Engineering student building products, teams, events, and resilient systems for a 45,000+ student community."
        path="/"
      />
      <JsonLd
        id="website-person"
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", name: "Gabriele Viganò", url: SITE_URL, description: "Portfolio focused on product, operations, and technical systems.", inLanguage: "en" },
            { "@type": "Person", name: "Gabriele Viganò", url: SITE_URL, image: `${SITE_URL}/og-cover-landing.png`, jobTitle: "Computer Engineering Student", alumniOf: { "@type": "CollegeOrUniversity", name: "Politecnico di Milano" }, sameAs: ["https://github.com/viganogabriele", "https://linkedin.com/in/viganogabriele"] },
          ],
        }}
      />
      <ScrollBar />
      <Navbar onNavigate={scrollToSection} systemActive={systemActive} onToggleSystem={toggleSystem} />
      <SystemModeOverlay active={systemActive} transitionId={systemTransitionId} />
      <SystemHUD active={systemActive} />
      <main id="main-content">
        <Hero onNavigate={scrollToSection} systemActive={systemActive} onToggleSystem={toggleSystem} />
        <About />
        <Expertise />
        <Projects />
        <TechStack />
        <Journey />
        <Notes />
        <Certifications />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Footer onNavigate={scrollToSection} />
        </div>
      </main>
      <AnimatePresence>
        {loading && <Preloader progress={progress} reducedMotion={reduced} />}
      </AnimatePresence>
    </AppShell>
  );
}
