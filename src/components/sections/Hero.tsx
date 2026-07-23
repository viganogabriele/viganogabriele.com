import { m, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { profile } from "../../data/profile";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ease } from "../../lib/motion";
import { Magnetic } from "../motion/Magnetic";
import { TextScramble } from "../motion/TextScramble";
import { AdaptiveHeroObject } from "../ui/AdaptiveHeroObject";

export function Hero({ onNavigate, systemActive, onToggleSystem }: { onNavigate: (target: string) => void; systemActive: boolean; onToggleSystem: () => void }) {
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
  const go = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate("#projects");
  };
  return (
    <section id="top" className="hero-grid relative flex min-h-[100svh] items-center overflow-hidden border-b border-white/[0.07] pb-10 pt-24 sm:pt-28">
      <div className="hero-scanlines absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-7 px-5 pb-12 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-10 lg:px-10">
        <div className="relative z-10">
          <m.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6, ease: ease.cinematic }}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent/75"
          >
            {/* Dot + label grouped so the dot always aligns with its own text line. */}
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <m.span
                className="inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent"
                animate={reduced || level !== "full" ? undefined : { opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <span>Computer Engineering student · Milan</span>
            </span>
            {/* Coordinate wraps to its own line on narrow screens without affecting the dot. */}
            <span data-sys-reveal className="text-accent/80" style={{ ["--sys-op" as never]: 0.9 }}>
              45.4642 N · 9.1900 E
            </span>
          </m.p>

          <m.h1
            aria-label="GABRIELE VIGANÒ"
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23, duration: 0.9, ease: ease.cinematic }}
            ref={wordmarkRef}
            style={{ fontVariationSettings: `'wght' ${weight}` }}
            className="hero-wordmark mt-5 max-w-4xl font-medium leading-[0.76] tracking-[-0.09em] text-bone"
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
            <p className="flex max-w-3xl items-start text-[clamp(1.55rem,7vw,3rem)] font-medium leading-[0.98] tracking-[-0.05em] text-bone">
              <TextScramble text="I build products, teams and systems that hold up." />
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
              className="hero-stat-grid mt-7 grid max-w-2xl grid-cols-1 border-y border-white/[0.09] font-mono uppercase tracking-[0.13em] text-zinc-500 sm:grid-cols-3"
            >
              {[
                { label: "Current role", value: profile.currentRole },
                { label: "Education", value: profile.education },
                { label: "Based in", value: profile.location },
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
                  className="group relative inline-flex items-center gap-3 overflow-hidden bg-bone px-5 py-3.5 text-sm font-semibold text-[#080b16] transition-colors hover:bg-blue-soft"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Mail className="relative h-4 w-4" />
                  <span className="relative">Get in touch</span>
                  <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>
              <a href="#projects" onClick={go} data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 border border-white/[0.12] px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-blue/50 hover:text-white">See selected work <ArrowDownRight className="h-4 w-4" /></a>
              <a href={profile.linkedIn} target="_blank" rel="noreferrer" data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 px-2 py-3 text-sm text-zinc-400 transition-colors hover:text-white">LinkedIn <ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </m.div>
        </div>

        <m.div
          initial={reduced ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.34, duration: 1, ease: ease.cinematic }}
          className="hero-visual-frame relative mx-auto w-full max-w-[34rem] aspect-[4/5] min-h-[19rem] overflow-hidden sm:aspect-[5/6] sm:min-h-[22rem] lg:aspect-[4/5] lg:min-h-[34rem]"
        >
          <AdaptiveHeroObject systemActive={systemActive} onToggleSystem={onToggleSystem} />
          <span className="section-anchor-label absolute bottom-[-3rem] right-0 font-mono text-[9px] uppercase tracking-[0.17em] text-accent/75">
            HERO / X-00 Y-00
          </span>
        </m.div>
      </div>

      <m.a
        href="#about"
        onClick={(event) => { event.preventDefault(); onNavigate("#about"); }}
        data-cursor="hover"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease: ease.softSettle }}
        className="absolute bottom-3 left-5 flex min-h-11 items-center gap-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-white sm:bottom-6 sm:left-8 lg:left-10"
      >
        Scroll to inspect <ArrowUpRight className="h-3 w-3 rotate-90" />
      </m.a>
    </section>
  );
}
