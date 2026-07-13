import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { m } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo-dark-small.webp";
import { AppShell } from "../components/layout/AppShell";
import { useMotionProfile } from "../hooks/useMotionProfile";
import { ease } from "../lib/motion";
import { PageMeta } from "../lib/seo";
import { notFoundMetadata } from "../data/site";

export function NotFoundPage() {
  const { level, prefersReducedMotion, isCompact } = useMotionProfile();
  const { pathname } = useLocation();
  const motion = !prefersReducedMotion && level !== "static" && !isCompact;

  return (
    <AppShell>
      <PageMeta metadata={notFoundMetadata} />
      <main id="main-content" className="not-found-main relative mx-auto flex w-full min-w-0 max-w-7xl flex-col overflow-x-clip px-5 py-5 sm:px-8 sm:py-7 lg:px-10">
        <header className="not-found-header relative z-10 flex min-w-0 items-center justify-between gap-4 border-b border-white/[0.09] pb-4 sm:pb-5">
          <Link to="/" data-cursor="hover" className="flex min-h-11 min-w-0 items-center gap-3" aria-label="Return to home">
            <img src={logo} alt="" width="160" height="134" className="h-5 w-auto invert" />
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">Gabriele Viganò</span>
          </Link>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Error / 404</span>
        </header>

        <section className="not-found-section relative flex min-w-0 flex-1 items-center py-16 sm:py-20" aria-labelledby="not-found-title">
          <div className="hero-grid absolute inset-x-0 top-0 h-full opacity-60 [mask-image:linear-gradient(90deg,transparent,black_18%,black_82%,transparent)]" aria-hidden />
          <div className="absolute left-[8%] top-[18%] h-px w-[84%] bg-gradient-to-r from-transparent via-accent/45 to-transparent" aria-hidden />
          <div
            aria-hidden
            className="not-found-code pointer-events-none absolute right-[2%] top-1/2 -translate-y-1/2 select-none font-mono font-bold leading-none tracking-[-0.13em] text-white/[0.035]"
          >
            404
          </div>

          <m.div
            className="not-found-content relative z-10 min-w-0 max-w-3xl"
            initial={motion ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: ease.cinematic }}
          >
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_14px_var(--accent)]" />
              Signal lost / route unavailable
            </div>
            <h1 id="not-found-title" className="mt-6 text-[clamp(4.5rem,15vw,10rem)] font-medium leading-[0.8] tracking-[-0.085em] text-bone">Not here.</h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              This coordinate does not point to a published page. Let’s get you back to the work.
            </p>

            <div className="not-found-actions mt-9 flex min-w-0 flex-wrap gap-3">
              <Link to="/" data-cursor="hover" className="group inline-flex min-h-12 items-center gap-3 bg-bone px-5 text-sm font-semibold text-[#080b16] transition-colors hover:bg-accent-soft">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Return to the index
              </Link>
              <a href="mailto:info@viganogabriele.com" data-cursor="hover" className="group inline-flex min-h-12 items-center gap-3 border border-white/[0.14] px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:border-accent/60 hover:text-accent-soft">
                Report a broken link
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>

            <div className="not-found-coordinate mt-14 min-w-0 max-w-2xl border-y border-white/[0.08] py-4 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <span>Requested coordinate</span>
              <code className="mt-2 block min-w-0 max-w-full truncate text-zinc-300 sm:mt-0 sm:max-w-[58%] sm:text-right" title={pathname}>{pathname}</code>
            </div>
          </m.div>
        </section>

        <footer className="not-found-footer relative z-10 flex min-w-0 flex-wrap justify-between gap-3 border-t border-white/[0.09] pt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600 sm:pt-5">
          <span>Gabriele Viganò · Milan, IT</span>
          <span>Route recovery / ready</span>
        </footer>
      </main>
    </AppShell>
  );
}
