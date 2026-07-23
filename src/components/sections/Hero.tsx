import { m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, FileText, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { profile } from "../../data/profile";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ease } from "../../lib/motion";
import { Magnetic } from "../motion/Magnetic";
import { TextScramble } from "../motion/TextScramble";
import { AdaptiveHeroObject } from "../ui/AdaptiveHeroObject";

export function Hero({ systemActive, onToggleSystem }: { systemActive: boolean; onToggleSystem: () => void }) {
  const reduced = useReducedMotion();
  const { level } = useMotionProfile();
  const scrollMotion = !reduced && level === "full";
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const [weight, setWeight] = useState(520);
  useEffect(() => {
    if (reduced || !scrollMotion) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (!wordmarkRef.current) return;
      const rect = wordmarkRef.current.getBoundingClientRect();
      const next = Math.round(300 + Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * 400);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWeight(next));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(frame); };
  }, [reduced, scrollMotion]);
  return (
    <section id="top" className="hero-grid relative flex min-h-[100svh] items-center overflow-hidden border-b border-white/[0.07] pb-10 pt-24 sm:pt-28 lg:pt-36">
      <div className="hero-scanlines absolute inset-0 opacity-80" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-7 px-5 pb-12 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-10 lg:px-10">
        <div className="relative z-10">
          <m.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6, ease: ease.cinematic }}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent/75"
          >
            <m.span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" animate={reduced || level !== "full" ? undefined : { opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.6, repeat: Infinity }} />
            Milan, Italy
          </m.p>
          <m.h1
            aria-label="GABRIELE VIGANÒ"
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23, duration: 0.9, ease: ease.cinematic }}
            ref={wordmarkRef}
            style={{ fontVariationSettings: `'wght' ${weight}` }}
            className="hero-wordmark mt-4 max-w-4xl font-medium leading-[0.8] tracking-[-0.09em] text-bone"
          >
            <span className="hero-wordmark-line block"><span>GABRIELE</span></span>
            <span className="hero-wordmark-line hero-wordmark-line-accent block pl-[0.06em] text-zinc-300" aria-hidden="true"><span>VIGAN<span className="hero-wordmark-o-grave">O</span></span></span>
          </m.h1>

          <m.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: ease.softSettle }}
            className="mt-10"
          >
            <p className="flex max-w-3xl items-start text-[clamp(1.45rem,5.5vw,2.5rem)] font-medium leading-[1.02] tracking-[-0.05em] text-bone">
              <TextScramble text="Ambitious about building products, teams and systems that hold up." />
              <m.span
                className="ml-2 inline-block h-8 w-1 bg-accent"
                animate={reduced || level !== "full" ? undefined : { opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </p>

            {/* A recruiter-friendly profile snapshot, kept inside the cinematic hero. */}
            <m.dl
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } },
              }}
              aria-label="Professional profile"
              className="hero-stat-grid mt-7 grid max-w-xl grid-cols-1 border-y border-white/[0.09] font-mono uppercase tracking-[0.13em] text-zinc-500 sm:grid-cols-2"
            >
              {[
                { label: "Current role", value: profile.currentRole },
                { label: "Studying", value: profile.education },
              ].map((s) => (
                <m.div
                  key={s.label}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="hero-stat-cell flex min-w-0 flex-col justify-between border-b border-white/[0.07] py-4 last:border-b-0 sm:border-b-0 sm:px-4 sm:first:pl-0 sm:[&:not(:last-child)]:border-r"
                >
                  <dt className="text-[9px] leading-[1.35]">{s.label}</dt>
                  <dd className="mt-2 text-xs font-normal leading-snug tracking-[0.01em] text-zinc-200">{s.value}</dd>
                </m.div>
              ))}
            </m.dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  data-cursor="hover"
                  className="group relative inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full bg-bone px-5 text-sm font-semibold text-[#080b16] transition-colors hover:bg-blue-soft"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Mail className="relative h-4 w-4" />
                  <span className="relative">Get in touch</span>
                  <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>
              <a href={profile.cvPath} download data-cursor="hover" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/[0.12] px-5 text-sm text-zinc-300 transition-colors hover:border-blue/50 hover:text-white"><FileText className="h-4 w-4" /> Download CV</a>
            </div>
          </m.div>
        </div>

        <m.div
          initial={reduced ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.34, duration: 1, ease: ease.cinematic }}
          className="hero-visual-frame relative mx-auto hidden w-full max-w-[34rem] aspect-[4/5] min-h-[19rem] overflow-hidden sm:aspect-[5/6] sm:min-h-[22rem] lg:block lg:aspect-[4/5] lg:min-h-[34rem]"
        >
          <AdaptiveHeroObject systemActive={systemActive} onToggleSystem={onToggleSystem} />
          <span className="section-anchor-label absolute bottom-[-3rem] right-0 font-mono text-[9px] uppercase tracking-[0.17em] text-accent/75">
            Portrait / profile
          </span>
        </m.div>
      </div>

    </section>
  );
}
