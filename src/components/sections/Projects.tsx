import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { projects } from "../../data/projects";
import { ease } from "../../lib/motion";
import { ArtifactSVG } from "../ui/ArtifactSVG";
import { SectionHeader } from "../ui/SectionHeader";

function ProjectSlide({ project }: { project: typeof projects[number] }) {
  return (
    <m.article
      data-accent={project.accent}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.36, ease: ease.cinematic }}
      className="project-carousel-slide grid overflow-hidden border border-white/[0.1] bg-surface/55 lg:grid-cols-[0.85fr_1.15fr]"
    >
      <div className="relative flex min-h-56 items-center justify-center overflow-hidden border-b border-white/[0.08] p-8 text-accent/65 lg:min-h-full lg:border-b-0 lg:border-r lg:p-12">
        <ArtifactSVG type={project.artifact} className="w-full max-w-sm" />
        <span className="absolute bottom-5 left-5 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">{project.index} / selected work</span>
      </div>

      <div className="flex min-w-0 flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
          <span>{project.eyebrow}</span>
          <span className="text-blue-soft">{project.status}</span>
        </div>
        <h3 className="mt-7 whitespace-pre-line text-[clamp(3rem,8vw,6rem)] font-medium leading-[0.84] tracking-[-0.075em] text-bone">{project.title}</h3>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300">{project.description}</p>

        <dl className="mt-7 grid grid-cols-2 border-y border-white/[0.08]">
          {project.metrics.map((metric, index) => (
            <div key={metric.label} className={`py-4 ${index > 0 ? "border-l border-white/[0.08] pl-4" : "pr-4"}`}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-600">{metric.label}</dt>
              <dd className="mt-2 text-2xl font-medium tracking-[-0.05em] text-accent">{metric.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 grid gap-5 text-sm leading-relaxed md:grid-cols-2">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">Role</p>
            <p className="mt-2 text-zinc-200">{project.role}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">Outcome</p>
            <p className="mt-2 text-zinc-300">{project.outcome}</p>
          </div>
        </div>

        <details className="mt-6 border-t border-white/[0.08] pt-4 text-sm leading-relaxed text-zinc-400">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.13em] text-accent marker:text-accent">Contribution & proof</summary>
          <p className="mt-4">{project.contribution}</p>
          <p className="mt-3 border-l border-accent/50 pl-3 font-mono text-[10px] leading-relaxed text-accent/80">{project.proof}</p>
        </details>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t border-white/[0.08] pt-5">
          <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
            {project.stack.map((item) => <span key={item}>/{item}</span>)}
          </div>
          {project.link && (
            <a href={project.link} target="_blank" rel="noreferrer" data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-soft transition-colors hover:text-white">
              Inspect <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </m.article>
  );
}

export function Projects() {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex];
  const select = (index: number) => setActiveIndex((index + projects.length) % projects.length);

  return (
    <section id="projects" className="relative mt-36 lg:mt-48">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeader index="03 / SELECTED WORK" title="Proof, not just presentation." subtitle="Browse the work quickly, then open the detail only when it is useful." />
        <div className="mt-10" role="region" aria-roledescription="carousel" aria-label="Selected projects">
          <div className="mb-4 flex flex-col gap-4 border-y border-white/[0.08] py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-1 overflow-x-auto" role="tablist" aria-label="Choose a project">
              {projects.map((project, index) => (
                <button
                  key={project.title}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === index}
                  aria-controls="active-project"
                  onClick={() => select(index)}
                  className={`min-h-11 shrink-0 px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${activeIndex === index ? "text-accent" : "text-zinc-500 hover:text-zinc-200"}`}
                >
                  {project.index} / {project.title.replace("\n", " ")}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => select(activeIndex - 1)} data-cursor="hover" className="inline-flex h-11 w-11 items-center justify-center border border-white/[0.1] text-zinc-300 transition-colors hover:border-accent/60 hover:text-accent" aria-label="Show previous project"><ChevronLeft className="h-4 w-4" /></button>
              <span className="min-w-12 text-center font-mono text-[9px] tracking-[0.15em] text-zinc-500" aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
              <button type="button" onClick={() => select(activeIndex + 1)} data-cursor="hover" className="inline-flex h-11 w-11 items-center justify-center border border-white/[0.1] text-zinc-300 transition-colors hover:border-accent/60 hover:text-accent" aria-label="Show next project"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div id="active-project" role="tabpanel">
            <AnimatePresence mode="wait" initial={!reduced}>
              <ProjectSlide key={activeProject.title} project={activeProject} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
