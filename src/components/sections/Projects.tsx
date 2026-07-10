import { projects } from "../../data/projects";
import { ProjectPanel } from "../ui/ProjectPanel";
import { SectionHeader } from "../ui/SectionHeader";

export function Projects() {
  return <section id="projects" className="relative mt-36 lg:mt-48"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeader index="03 / SELECTED WORK" title="Proof, not just presentation." subtitle="Each project is a system, a role, and a result—not a decorative card." /></div><div className="mx-auto max-w-7xl"><div className="project-panel">{projects.map((project, index) => <ProjectPanel key={project.title} project={project} reverse={index % 2 === 1} />)}</div></div></section>;
}
