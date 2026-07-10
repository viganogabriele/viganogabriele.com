import { motion, useReducedMotion } from "framer-motion";
import { timelineItems } from "../../data/timeline";
import { ease } from "../../lib/motion";
import { SectionHeader } from "../ui/SectionHeader";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";

export function Journey() {
  const reduced = useReducedMotion();
  const { isTouch, hasNoHover, isTelegramWebView, isCompact } = useFeatureDetect();
  const staticMotion = Boolean(reduced || isTouch || hasNoHover || isTelegramWebView || isCompact);
  return <section id="journey" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10"><SectionHeader index="05 / SYSTEM TRACE" title="A path with branches." subtitle="A few live threads: what I’m learning, leading, and building next." /><div className="relative ml-2 border-l border-white/[0.1] pl-8 md:ml-[15%] md:pl-12">{timelineItems.map((item, index) => { const Icon = item.icon; return <motion.article key={item.title} initial={staticMotion ? false : { opacity: 0, x: -14 }} whileInView={staticMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.55, delay: index * 0.07, ease: ease.softSettle }} className="relative pb-12 last:pb-0"><span className={`absolute -left-[2.34rem] top-1 h-4 w-4 rounded-full border ${item.current ? "border-amber-200 bg-amber-200/20 shadow-[0_0_0_5px_rgba(245,184,73,0.08)]" : "border-zinc-600 bg-[#050608]"}`}>{item.current && <span className="absolute inset-1 animate-ping rounded-full bg-amber-200/50 motion-reduce:animate-none" />}</span><div className="grid gap-3 md:grid-cols-[9rem_1fr]"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{item.year}</p><div><div className="flex items-center gap-3"><Icon className="h-4 w-4 text-cyan-100/70" /><h3 className="text-2xl tracking-[-0.045em] text-zinc-100">{item.title}</h3></div><p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-cyan-100/60">{item.subtitle}</p><p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{item.description}</p></div></div></motion.article>; })}</div></section>;
}
