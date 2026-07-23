import { m } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { projects } from "../../data/projects";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { CircularCarousel } from "../ui/CircularCarousel";
import { SectionHeader } from "../ui/SectionHeader";

type ProjectItem = typeof projects[number];

function ProjectCard({ project, active }: { project: ProjectItem; active: boolean }) {
  return (
    <div className="project-carousel-card h-full p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
        <span>{project.index} / work</span>
        <span className="text-accent">{active ? "selected" : project.status}</span>
      </div>
      <h3 className="mt-5 whitespace-pre-line text-2xl font-medium leading-[0.86] tracking-[-0.06em] text-bone sm:text-3xl">{project.title}</h3>
      <div className="mt-4 flex border-t border-white/[0.08] pt-3">
        {project.metrics.map((metric, index) => (
          <div key={metric.label} className={`min-w-0 flex-1 ${index ? "border-l border-white/[0.08] pl-3" : "pr-3"}`}>
            <p className="text-lg font-medium tracking-[-0.05em] text-accent">{metric.value}</p>
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-600">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[8px] uppercase tracking-[0.09em] text-zinc-400">
        {project.stack.map((item) => <span key={item}>/{item}</span>)}
      </div>
    </div>
  );
}

function ProjectDetail({ project }: { project: ProjectItem }) {
  return (
    <m.article
      key={project.title}
      data-project-detail
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      className="project-detail mt-8 border-y border-white/[0.09] py-7 sm:py-9 lg:flex lg:min-h-[29rem] lg:flex-col"
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Selected project / {project.index}</p>
          <h3 className="mt-3 whitespace-pre-line text-4xl font-medium leading-[0.85] tracking-[-0.065em] text-bone sm:text-5xl">{project.title}</h3>
          <p className="mt-5 text-base leading-relaxed text-zinc-300 sm:min-h-[4.5rem]">{project.description}</p>
        </div>
        <div className="grid gap-6 text-sm leading-relaxed sm:grid-cols-2">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">Role</p>
            <p className="mt-2 text-zinc-200">{project.role}</p>
            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">Contribution</p>
            <p className="mt-2 text-zinc-400">{project.contribution}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">Outcome</p>
            <p className="mt-2 text-zinc-300">{project.outcome}</p>
            <p className="mt-5 border-l border-accent/50 pl-3 font-mono text-[10px] leading-relaxed text-accent/80">{project.proof}</p>
          </div>
        </div>
      </div>
      <div className="mt-7 grid gap-5 border-t border-white/[0.08] pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end lg:mt-auto">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">Technology</p>
          <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] tracking-[0.08em] text-zinc-200">
            {project.stack.map((item) => <span key={item} className="border border-accent/30 bg-accent/[0.06] px-2 py-1">{item}</span>)}
          </div>
        </div>
        {project.link && <a href={project.link} target="_blank" rel="noreferrer" data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 border border-white/[0.14] px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-soft transition-colors hover:border-accent hover:bg-accent/[0.08] hover:text-white">Open on GitHub <ArrowUpRight className="h-3.5 w-3.5" /></a>}
      </div>
    </m.article>
  );
}

export function Projects() {
  const { prefersReducedMotion, level } = useMotionProfile();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex];

  return (
    <section id="projects" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader index="03 / SELECTED WORK" title="Proof, not just presentation." />
      <div className="mt-7 border border-white/[0.1] bg-surface/80">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">
          <span>Browse / selected work</span>
          <span className="text-accent">Select a card</span>
        </div>
        <CircularCarousel
          items={projects}
          ariaLabel="Selected projects"
          getItemLabel={(project) => `${project.title.replace("\n", " ")} project`}
          renderCard={(project, _index, active) => <ProjectCard project={project} active={active} />}
          reducedMotion={prefersReducedMotion || level === "static"}
          autoRotateSpeed={5}
          dragSensitivity={0.34}
          momentumStrength={1.15}
          pauseDuration={3000}
          pauseOnHover={false}
          previousControlLabel="Show previous project"
          nextControlLabel="Show next project"
          onActiveIndexChange={setActiveIndex}
          className="project-carousel"
        />
      </div>
      <ProjectDetail project={activeProject} />
    </section>
  );
}
