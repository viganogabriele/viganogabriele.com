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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateActive = () => {
      const probe = window.innerHeight * 0.42;
      const available = Array.from(sectionRef.current?.querySelectorAll<HTMLElement>("[data-index]") ?? []);
      if (!available.length) return;
      let nextIndex = 0;
      let nearest = Number.POSITIVE_INFINITY;
      for (const row of available) {
        const rect = row.getBoundingClientRect();
        const index = Number(row.dataset.index);
        const distance = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (distance < nearest) { nearest = distance; nextIndex = index; }
      }
      setActiveIndex((current) => current === nextIndex ? current : nextIndex);
    };
    const resizeObserver = new ResizeObserver(updateActive);
    const visibilityObserver = new IntersectionObserver(updateActive, { threshold: 0 });
    const rows = Array.from(sectionRef.current?.querySelectorAll<HTMLElement>("[data-index]") ?? []);
    rows.forEach((row) => {
      if (!row) return;
      resizeObserver.observe(row);
      visibilityObserver.observe(row);
    });
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });
    window.addEventListener("hashchange", updateActive);
    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("hashchange", updateActive);
    };
  }, []);

  return <section ref={sectionRef} id="expertise" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10"><div className="lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-16"><div className="lg:sticky lg:top-28 lg:h-fit"><SectionHeader index="02 / CAPABILITIES" title="What I bring to the table." subtitle="A practice across product, quality, people, operations, and practical AI workflows." /><p data-sys-reveal className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">02.{String(activeIndex + 1).padStart(2, "0")} / active capability trace</p></div><div className="expertise-rail relative">{activities.map((activity, index) => { const Icon = activity.icon; return <m.article data-index={index} data-active={activeIndex === index} key={activity.title} initial={staticMotion ? false : { opacity: 0, y: 20 }} whileInView={staticMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12% 0px" }} transition={{ duration: dur.reveal, delay: index * 0.05, ease: ease.cinematic }} className={`expertise-item group grid gap-5 py-8 md:grid-cols-[auto_1fr_11rem] md:gap-7 md:py-10 ${activeIndex === index ? "is-focused" : ""}`}><span aria-hidden className="expertise-dot absolute" /><div className="flex gap-3"><span className="font-mono text-[10px] text-zinc-600">{activity.index}</span><Icon className="h-4 w-4 text-accent/75" /></div><div><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{activity.role}</p><h3 className="mt-2 text-2xl tracking-[-0.05em] text-bone md:text-3xl">{activity.title}</h3><p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">{activity.description}</p><div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-600">{activity.tags.map((tag) => <span key={tag}>/{tag}</span>)}</div></div><ArtifactSVG type={activity.artifact} className="h-24 w-full self-center text-accent/45 transition-colors duration-500 group-hover:text-accent/90 md:h-28" /></m.article>; })}</div></div></section>;
}
