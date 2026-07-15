import { ArrowUpRight } from "lucide-react";
import { m, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Project } from "../../data/projects";
import { ArtifactSVG } from "./ArtifactSVG";
import { ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";

const CONTENT_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function ProjectPanel({ project, reverse }: { project: Project; reverse: boolean }) {
  const { level, canUsePointerEffects } = useMotionProfile();
  const staticMotion = level === "static";
  const panelRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"],
  });
  const artifactY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const artifactRotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);
  const artifactScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.05, 0.95]);
  const inView = useInView(panelRef, { once: true, margin: "-90px" });

  return (
    <m.article
      ref={panelRef}
      initial={staticMotion ? false : { opacity: 0, y: 36 }}
      animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.8, ease: ease.cinematic }}
      data-accent={project.accent}
      onPointerMove={(event) => {
        if (!canUsePointerEffects || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--px", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--py", `${event.clientY - rect.top}px`);
        event.currentTarget.style.setProperty("--glow", "1");
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--glow", "0");
      }}
      className="project-panel group relative grid overflow-hidden border-x border-white/[0.06] px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-14"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 project-panel-grid" />
      <div className="absolute left-0 top-0 h-px w-0 bg-accent transition-all duration-700 group-hover:w-full" />

      <m.div
        style={staticMotion || !canUsePointerEffects ? undefined : { y: artifactY, rotate: artifactRotate, scale: artifactScale }}
        className={`relative flex min-h-[12rem] items-center justify-center overflow-hidden border-b border-white/[0.08] py-4 text-accent/55 lg:min-h-full lg:border-b-0 ${reverse ? "lg:order-2 lg:border-l lg:pl-10" : "lg:border-r lg:pr-10"}`}
      >
        <ArtifactSVG
          type={project.artifact}
          className="w-full max-w-sm transition-all duration-700 group-hover:scale-105 group-hover:text-accent/90"
        />
      </m.div>

      <div className={`flex flex-col justify-between gap-10 pt-7 lg:pt-0 ${reverse ? "lg:order-1" : ""}`}>
        <div className="relative z-10">
          <m.div
            className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:tracking-[0.16em]"
            initial={staticMotion ? false : { opacity: 0, y: 12 }}
            animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.05, ease: CONTENT_EASE }}
          >
            <span className="flex min-w-0 items-center gap-2">
              {project.index} / {project.eyebrow}
            </span>
            <span className="flex shrink-0 items-center gap-2 text-blue-soft">
              {project.status}
            </span>
          </m.div>
          <m.h3
            className="mt-8 whitespace-pre-line text-5xl font-medium leading-[0.82] tracking-[-0.075em] text-bone sm:text-6xl lg:text-8xl"
            initial={staticMotion ? false : { opacity: 0, y: 12 }}
            animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.14, ease: CONTENT_EASE }}
          >
            {project.title}
          </m.h3>
          <m.p
            className="mt-7 max-w-xl text-base leading-relaxed text-zinc-400"
            initial={staticMotion ? false : { opacity: 0, y: 12 }}
            animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.23, ease: CONTENT_EASE }}
          >
            {project.description}
          </m.p>
          <m.div
            className="mt-7 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-5"
            initial={staticMotion ? false : { opacity: 0, y: 12 }}
            animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.32, ease: CONTENT_EASE }}
          >
            {project.metrics.map((metric) => (
              <div key={metric.label}>
                <p className="text-2xl font-medium tracking-[-0.05em] text-accent">{metric.value}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-600">MEASURED / {metric.label}</p>
              </div>
            ))}
          </m.div>
          <p data-sys-reveal className="mt-4 font-mono text-[9px] uppercase tracking-[0.13em] text-accent">SYS / {project.buildMeta}</p>
        </div>
        <m.div
          className="relative z-10 grid gap-6 border-t border-white/[0.09] pt-6 text-sm md:grid-cols-2"
          initial={staticMotion ? false : { opacity: 0, y: 10 }}
          animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.15, ease: ease.softSettle }}
        >
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">Role</p>
            <p className="mt-2 leading-relaxed text-zinc-300">{project.role}</p>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">Contribution</p>
            <p className="mt-2 leading-relaxed text-zinc-400">{project.contribution}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">Outcome</p>
            <p className="mt-2 leading-relaxed text-zinc-300">{project.outcome}</p>
            <p className="mt-5 border-l border-accent/50 pl-3 font-mono text-[10px] leading-relaxed text-accent/80">
              {project.proof}
            </p>
          </div>
        </m.div>
        <m.div
          className="relative z-10 flex flex-wrap items-center justify-between gap-5 border-t border-white/[0.09] pt-5"
          initial={staticMotion ? false : { opacity: 0, y: 8 }}
          animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.4, delay: 0.22, ease: ease.softSettle }}
        >
          <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
            {project.stack.map((item) => <span key={item}>/{item}</span>)}
          </div>
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="inline-flex min-h-11 items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-soft transition-colors hover:text-white"
            >
              Inspect <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">Awaiting signal</span>
          )}
        </m.div>
      </div>
    </m.article>
  );
}
