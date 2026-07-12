import { m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { activities } from "../../data/activities";
import { dur, ease } from "../../lib/motion";
import { ArtifactSVG } from "../ui/ArtifactSVG";
import { SectionHeader } from "../ui/SectionHeader";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function Expertise() {
  const { level } = useMotionProfile();
  const staticMotion = level === "static";
  const [activeIndex, setActiveIndex] = useState(0);
  const rows = useRef<Array<HTMLElement | null>>([]);
  useEffect(() => {
    if (staticMotion) return;
    const observer = new IntersectionObserver((entries) => {
      const candidate = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const index = Number((candidate?.target as HTMLElement | undefined)?.dataset.index);
      if (Number.isFinite(index)) setActiveIndex(index);
    }, { rootMargin: "-42% 0px -42%", threshold: [0.01, 0.5, 1] });
    rows.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, [staticMotion]);
  return <section id="expertise" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10"><div className="lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-16"><div className="lg:sticky lg:top-28 lg:h-fit"><SectionHeader index="02 / CAPABILITIES" title="What I bring to the table." subtitle="A practice across product, quality, people, and operations." /><p data-sys-reveal className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">02.{activeIndex + 1} / active capability trace</p></div><div className="expertise-row">{activities.map((activity, index) => { const Icon = activity.icon; return <m.article ref={(node) => { rows.current[index] = node; }} data-index={index} key={activity.title} initial={staticMotion ? false : { opacity: 0, y: 20 }} whileInView={staticMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-45% 0px -45%" }} transition={{ duration: dur.reveal, delay: index * 0.05, ease: ease.cinematic }} className={`expertise-item group grid gap-5 py-8 md:grid-cols-[auto_1fr_11rem] md:gap-7 md:py-10 ${activeIndex === index ? "is-focused" : ""}`}><div className="flex gap-3"><span className="font-mono text-[10px] text-zinc-600">{activity.index}</span><Icon className="h-4 w-4 text-accent/75" /></div><div><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{activity.role}</p><h3 className="mt-2 text-2xl tracking-[-0.05em] text-bone md:text-3xl">{activity.title}</h3><p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">{activity.description}</p><div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-600">{activity.tags.map((tag) => <span key={tag}>/{tag}</span>)}</div></div><ArtifactSVG type={activity.artifact} className="h-24 w-full self-center text-accent/45 transition-colors duration-500 group-hover:text-accent/90 md:h-28" /></m.article>; })}</div></div></section>;
}
