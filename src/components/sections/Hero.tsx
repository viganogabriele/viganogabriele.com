import { m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, FileText, Mail } from "lucide-react";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { profile } from "../../data/profile";
import { heroCopy } from "../../data/sections";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { cn } from "../../lib/cn";
import { ease } from "../../lib/motion";
import { BorderGlow } from "../motion/BorderGlow";
import { Magnetic } from "../motion/Magnetic";
import { SpecularEdge } from "../motion/SpecularEdge";
import { AdaptiveHeroObject } from "../ui/AdaptiveHeroObject";

const ParticleText = lazy(() => import("../motion/ParticleText").then((module) => ({ default: module.ParticleText })));

export function Hero({ systemActive, onToggleSystem }: { systemActive: boolean; onToggleSystem: () => void }) {
  const reduced = useReducedMotion();
  const { level, isCompact, prefersReducedMotion } = useMotionProfile();
  // Every desktop, not just the top motion tier: `full` also demands four cores
  // and 4GB, which quietly dropped the wordmark on ordinary laptops. Touch and
  // phone widths keep the crisp type, and so does reduced motion.
  const particleWordmark = !isCompact && !prefersReducedMotion;
  const ctaButton = (
    <a
      href={`mailto:${profile.email}`}
      data-cursor="hover"
      className="group relative inline-flex min-h-11 items-center gap-3 overflow-hidden bg-bone px-5 text-sm font-semibold text-[#080b16] transition-colors hover:bg-blue-soft"
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <Mail className="relative h-4 w-4" />
      <span className="relative">Get in touch</span>
      <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
  const cta = <SpecularEdge>{ctaButton}</SpecularEdge>;
  return (
    <section id="top" className="hero-grid hero-viewport relative flex items-center overflow-hidden border-b border-white/[0.07] pb-8 pt-24 sm:pt-28 lg:pt-32">
      <div className="hero-scanlines absolute inset-0 opacity-80" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-7 px-5 pb-12 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-10 lg:px-10">
        <div className="relative z-10">
          <m.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6, ease: ease.cinematic }}
            className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.18em] text-accent/75"
          >
            <m.span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" animate={reduced || level !== "full" ? undefined : { opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.6, repeat: Infinity }} />
            {profile.location}
          </m.p>
          <m.h1
            aria-label="GABRIELE VIGANÒ"
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23, duration: 0.9, ease: ease.cinematic }}
            className={cn("hero-wordmark relative mt-4 max-w-4xl font-medium leading-[0.8] tracking-[-0.09em] text-bone", particleWordmark && "hero-wordmark--particles")}
          >
            <span className="hero-wordmark-line block"><span data-particle-line="GABRIELE">GABRIELE</span></span>
            {/* The grave is drawn by .hero-wordmark-o-grave, so the canvas is
                handed the real Ò to sample instead of the split-up markup. */}
            <span className="hero-wordmark-line hero-wordmark-line-accent block pl-[0.06em] text-zinc-300" aria-hidden="true"><span data-particle-line="VIGANÒ">VIGAN<span className="hero-wordmark-o-grave">O</span></span></span>
            {particleWordmark && <Suspense fallback={null}><ParticleText /></Suspense>}
          </m.h1>

          <m.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: ease.softSettle }}
            className="mt-7"
          >
            <p className="max-w-xl text-xl font-medium leading-snug tracking-[-0.02em] text-zinc-300 sm:text-2xl">{heroCopy.summary}</p>

            {/* A recruiter-friendly profile snapshot, kept inside the cinematic hero. */}
            <m.dl
              initial={reduced ? false : "hidden"}
              animate={reduced ? undefined : "show"}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } },
              }}
              aria-label="Professional profile"
              className="hero-stat-grid mt-5 grid max-w-xl grid-cols-1 border-y border-white/[0.09] font-mono tracking-[0.03em] text-zinc-500 sm:grid-cols-2"
            >
              {[
                { label: "Current role", value: profile.currentRole },
                { label: "Studying", value: profile.education },
              ].map((s) => (
                <m.div
                  key={s.label}
                  initial={reduced ? false : undefined}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="hero-stat-cell flex min-w-0 flex-col justify-between border-b border-white/[0.07] py-4 last:border-b-0 sm:border-b-0 sm:px-4 sm:first:pl-0 sm:[&:not(:last-child)]:border-r"
                >
                  <dt className="text-[9px] uppercase tracking-[0.13em] leading-[1.35]">{s.label}</dt>
                  <dd className="mt-2 text-xs font-normal leading-snug tracking-[0.01em] text-zinc-200">{s.value}</dd>
                </m.div>
              ))}
            </m.dl>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {reduced || level === "static" ? cta : <Magnetic>{cta}</Magnetic>}
              <Link to="/cv" data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 border border-white/[0.12] px-5 text-sm text-zinc-300 transition-colors hover:border-blue/50 hover:text-white"><FileText className="h-4 w-4" /> View CV</Link>
            </div>
          </m.div>
        </div>

        <m.div
          initial={reduced ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.34, duration: 1, ease: ease.cinematic }}
          className="hero-visual-frame relative mx-auto hidden w-full max-w-[34rem] sm:block sm:aspect-[5/6] sm:min-h-[22rem] lg:aspect-[4/5] lg:min-h-[34rem]"
        >
          <BorderGlow className="h-full w-full" borderRadius={0} backgroundColor="#080b16" glowRadius={30} fillOpacity={0.28}>
            <div className="relative h-full w-full overflow-hidden">
              <AdaptiveHeroObject systemActive={systemActive} onToggleSystem={onToggleSystem} />
            </div>
          </BorderGlow>
          <span className="section-anchor-label absolute bottom-[-3rem] right-0 font-mono text-[9px] uppercase tracking-[0.17em] text-accent/75">
            Portrait / profile
          </span>
        </m.div>
      </div>

    </section>
  );
}
