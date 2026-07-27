import { m, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { projects } from "../../data/projects";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ease } from "../../lib/motion";
import { SectionHeader } from "../ui/SectionHeader";

function ProjectRow({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { level } = useMotionProfile();
  const staticMotion = level === "static";

  return (
    <m.article
      ref={ref as never}
      initial={staticMotion ? false : { opacity: 0, y: 24 }}
      animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, delay: index * 0.06, ease: ease.cinematic }}
      className="grid gap-7 border-t border-white/[0.09] py-10 first:border-t-0 first:pt-0 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:py-14"
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-500">
          {project.index} · {project.eyebrow}
        </p>
        <h3 className="mt-4 whitespace-pre-line text-4xl font-medium leading-[0.88] tracking-[-0.06em] text-bone sm:text-5xl">
          {project.title}
        </h3>
        <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">{project.description}</p>
        <div className="mt-7 flex gap-8">
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <p className="text-2xl font-medium tracking-[-0.045em] text-bone">{metric.value}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.11em] text-zinc-500">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between">
        <dl className="grid gap-6 text-sm leading-relaxed sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Role</dt>
            <dd className="mt-2 text-zinc-200">{project.role}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Contribution</dt>
            <dd className="mt-2 text-zinc-300">{project.contribution}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Outcome</dt>
            <dd className="mt-2 max-w-2xl text-zinc-300">{project.outcome} {project.proof}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-white/[0.07] pt-5">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] text-zinc-400" aria-label={`${project.title.replace("\n", " ")} technology`}>
            {project.stack.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {project.link && (
            <a href={project.link} target="_blank" rel="noreferrer" data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-bone transition-colors hover:text-accent">
              View project <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </m.article>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader
        index="02 / SELECTED WORK"
        title="Selected work."
        subtitle="Products and systems shaped through design, implementation, operations, and iteration."
      />
      <div>
        {projects.map((project, index) => <ProjectRow key={project.title} project={project} index={index} />)}
      </div>
    </section>
  );
}
