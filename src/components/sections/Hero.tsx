import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Magnetic } from "../motion/Magnetic";
import { TextScramble } from "../motion/TextScramble";
import { AdaptiveHeroObject } from "../ui/AdaptiveHeroObject";
import { ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function Hero({ onNavigate, systemActive }: { onNavigate: (target: string) => void; systemActive: boolean }) {
  const reduced = useReducedMotion();
  const { level } = useMotionProfile();
  const scrollMotion = !reduced && level === "full";
  const { scrollY } = useScroll();
  const portraitOpacity = useTransform(scrollY, [0, 420], [1, 0.3]);
  const portraitScale = useTransform(scrollY, [0, 420], [1, 0.85]);
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
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent/75"
          >
            <m.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
              animate={reduced || level !== "full" ? undefined : { opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            Computer Engineering Student · Milan
            <span data-sys-reveal className="ml-2 text-accent/80" style={{ ["--sys-op" as never]: 0.9 }}>
              45.4642 N · 9.1900 E
            </span>
          </m.p>

          <m.h1
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23, duration: 0.9, ease: ease.cinematic }}
            ref={wordmarkRef}
            style={{ fontVariationSettings: `'wght' ${weight}` }}
            className="hero-wordmark mt-5 max-w-4xl font-medium leading-[0.76] tracking-[-0.09em] text-bone"
          >
            <span className="hero-wordmark-line block"><span>GABRIELE</span></span>
            <span className="hero-wordmark-line block pl-[0.06em] text-zinc-300"><span>VIGANÒ</span></span>
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

            {/* stat row with stagger */}
            <m.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } },
              }}
              className="mt-7 grid max-w-xl grid-cols-3 border-y border-white/[0.09] py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500"
            >
              {[
                { label: "Volunteers recruited", value: "30+" },
                { label: "Event attendees", value: "1,000+" },
                { label: "Students served", value: "45K+" },
              ].map((s) => (
                <m.span
                  key={s.label}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  {s.label}
                  <br />
                  <b className="mt-1 block font-normal text-phosphor">{s.value}</b>
                </m.span>
              ))}
            </m.div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#projects"
                  onClick={go}
                  data-cursor="hover"
                  className="group relative inline-flex items-center gap-3 overflow-hidden bg-bone px-5 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-ember-bright"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ember/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">See the work</span>
                  <ArrowDownRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
              <a href="https://linkedin.com/in/viganogabriele" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-white/[0.12] px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-ember/40 hover:text-white">LinkedIn <ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </m.div>
        </div>

        <m.div
          initial={reduced ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.34, duration: 1, ease: ease.cinematic }}
          style={
            !scrollMotion
              ? undefined
              : {
                  opacity: portraitOpacity,
                  scale: portraitScale,
                }
          }
          className="relative min-h-[clamp(19rem,88vw,22rem)] pt-1 sm:min-h-[22rem] lg:min-h-[34rem] lg:pt-0"
        >
          <AdaptiveHeroObject systemActive={systemActive} />
          <span className="section-anchor-label absolute bottom-[-3rem] right-0 font-mono text-[9px] uppercase tracking-[0.17em] text-accent/75">
            HERO / X-00 Y-00
          </span>
        </m.div>
      </div>

      <a
        href="#about"
        onClick={(event) => { event.preventDefault(); onNavigate("#about"); }}
        data-cursor="hover"
        className="absolute bottom-3 left-5 flex min-h-11 items-center gap-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-white sm:bottom-6 sm:left-8 lg:left-10"
      >
        Scroll to inspect <ArrowUpRight className="h-3 w-3 rotate-90" />
      </a>
    </section>
  );
}
