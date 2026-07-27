import { toolGroups } from "../../data/techStack";
import { ScrollReveal } from "../motion/ScrollReveal";
import { SectionHeader } from "../ui/SectionHeader";

export function TechStack() {
  return (
    <section id="stack" className="relative mx-auto mt-32 max-w-7xl px-5 sm:px-8 lg:mt-40 lg:px-10">
      <SectionHeader
        index="06 / TOOLS"
        title="Tools & practice."
        subtitle="The technologies and working methods I use regularly."
      />
      <ScrollReveal>
        <div className="grid border-y border-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
          {toolGroups.map((group, index) => (
            <article key={group.label} className="border-b border-white/[0.07] py-7 sm:px-6 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:[&:not(:last-child)]:border-r lg:first:pl-0 lg:last:pr-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">0{index + 1}</p>
              <h3 className="mt-3 text-xl tracking-[-0.035em] text-bone">{group.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{group.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300" aria-label={group.label}>
                {group.tools.map((tool) => <li key={tool}>{tool}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
