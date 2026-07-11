import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Magnetic } from "../motion/Magnetic";
import { TextScramble } from "../motion/TextScramble";
import { FaceHero3D } from "../ui/FaceHero3D";
import { ease } from "../../lib/motion";

export function Hero({ onNavigate }: { onNavigate: (target: string) => void }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const wordmarkScale = useTransform(scrollY, [0, 420], [1, 0.86]);
  const wordmarkY = useTransform(scrollY, [0, 420], [0, -44]);
  const portraitOpacity = useTransform(scrollY, [0, 420], [1, 0.28]);
  const portraitScale = useTransform(scrollY, [0, 420], [1, 0.82]);
  const portraitRotateY = useTransform(scrollY, [0, 420], [0, -14]);
  const portraitY = useTransform(scrollY, [0, 420], [0, 40]);
  const go = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate("#projects");
  };
  return (
    <section id="top" className="hero-grid relative flex min-h-[100svh] items-center overflow-hidden border-b border-white/[0.07] pt-28">
      <div className="hero-scanlines absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-cyan-100/20 to-transparent" />

      {/* SYS reveal — top-right build info */}
      <span data-sys-reveal className="pointer-events-none absolute right-6 top-24 hidden font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-400/80 md:block">
        BUILD 2.0.42 · SHA a1b2c3d · UP 128d
      </span>

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:px-10">
        <motion.div
          style={reduced ? undefined : { scale: wordmarkScale, y: wordmarkY }}
          className="relative z-10"
        >
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6, ease: ease.cinematic }}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/75"
          >
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-300"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            Computer Engineering Student · Milan
            <span data-sys-reveal className="ml-2 text-fuchsia-300/70" style={{ ["--sys-op" as never]: 0.9 }}>
              45.4642 N · 9.1900 E
            </span>
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23, duration: 0.9, ease: ease.cinematic }}
            className="mt-5 max-w-4xl text-[17vw] font-medium leading-[0.76] tracking-[-0.09em] text-[#f2f3f5] sm:text-[13vw] lg:text-[7.65rem] xl:text-[9.25rem]"
          >
            <span className="block">GABRIELE</span>
            <span className="block pl-[0.06em] text-zinc-300">VIGANÒ</span>
          </motion.h1>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: ease.softSettle }}
            className="mt-10"
          >
            <p className="flex items-center text-3xl font-medium tracking-[-0.05em] text-cyan-100 sm:text-4xl lg:text-5xl">
              <TextScramble text="I build cool things." />
              <motion.span
                className="ml-2 inline-block h-8 w-1 bg-cyan-300"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </p>

            {/* stat row with stagger */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } },
              }}
              className="mt-7 grid max-w-xl grid-cols-3 border-y border-white/[0.09] py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500"
            >
              {[
                { label: "Role", value: "Product / UX", color: "text-zinc-300", reveal: "senior · 4Y" },
                { label: "Status", value: "Building", color: "text-amber-200", reveal: "3 projects" },
                { label: "Stack", value: "Web / Systems", color: "text-zinc-300", reveal: "12 tools" },
              ].map((s) => (
                <motion.span
                  key={s.label}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  {s.label}
                  <br />
                  <b className={`mt-1 block font-normal ${s.color}`}>{s.value}</b>
                  <span data-sys-reveal className="mt-1 block text-cyan-400/80">{s.reveal}</span>
                </motion.span>
              ))}
            </motion.div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#projects"
                  onClick={go}
                  data-cursor="hover"
                  className="group relative inline-flex items-center gap-3 overflow-hidden bg-[#f2f3f5] px-5 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-100"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">See the work</span>
                  <ArrowDownRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.34, duration: 1, ease: ease.cinematic }}
          style={
            reduced
              ? undefined
              : {
                  opacity: portraitOpacity,
                  scale: portraitScale,
                  rotateY: portraitRotateY,
                  y: portraitY,
                }
          }
          className="relative pt-4 [transform-style:preserve-3d] [perspective:1200px] lg:pt-0"
        >
          <FaceHero3D />
          <span className="section-anchor-label absolute bottom-[-3rem] right-0 font-mono text-[9px] uppercase tracking-[0.17em] text-cyan-100/75">
            HERO / X-00 Y-00
          </span>
          <span data-sys-reveal className="pointer-events-none absolute -bottom-3 left-0 font-mono text-[9px] uppercase tracking-[0.17em] text-fuchsia-300/80">
            LAT.WGS84 · TX-42ms
          </span>
        </motion.div>
      </div>

      <a
        href="#about"
        onClick={(event) => { event.preventDefault(); onNavigate("#about"); }}
        data-cursor="hover"
        className="absolute bottom-6 left-5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-white sm:left-8 lg:left-10"
      >
        Scroll to inspect <ArrowUpRight className="h-3 w-3 rotate-90" />
      </a>
    </section>
  );
}
