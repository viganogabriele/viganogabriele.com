import { m, useReducedMotion } from "framer-motion";
import { toolGroups } from "../../data/techStack";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ScrollReveal } from "../motion/ScrollReveal";
import { SectionHeader } from "../ui/SectionHeader";

export function TechStack() {
  const { level } = useMotionProfile();
  const reduced = useReducedMotion();
  const disableMotion = Boolean(reduced || level === "static");

  return (
    <section id="stack" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader
        index="04 / TOOLKIT"
        title="The workshop bench."
        subtitle="Tools I use to build interfaces, run systems, collaborate clearly, and explore practical AI workflows."
      />
      <ScrollReveal>
        <div className="tool-workbench border border-white/[0.1] bg-surface/80">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">
            <span>Bench / toolkit</span>
            <span className="text-accent">Practical systems</span>
          </div>
          <div className="grid divide-y divide-white/[0.08] md:grid-cols-2 md:divide-x md:divide-y-0">
            {toolGroups.map((group, groupIndex) => (
              <m.section
                key={group.label}
                initial={disableMotion ? false : { opacity: 0, y: 12 }}
                whileInView={disableMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.42, delay: groupIndex * 0.06 }}
                className="tool-group p-5 sm:p-6"
              >
                <m.p
                  className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent"
                  initial={disableMotion ? false : { opacity: 0, x: -10 }}
                  whileInView={disableMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: groupIndex * 0.06 + 0.12 }}
                >
                  {group.label}
                </m.p>
                <m.p
                  className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400"
                  initial={disableMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={disableMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: groupIndex * 0.06 + 0.18 }}
                >
                  {group.description}
                </m.p>
                <m.ul
                  className="mt-5 grid gap-2"
                  aria-label={group.label}
                  initial={disableMotion ? false : "hidden"}
                  whileInView={disableMotion ? undefined : "show"}
                  viewport={{ once: true, margin: "-40px" }}
                  variants={disableMotion ? undefined : {
                    hidden: {},
                    show: { transition: { staggerChildren: 0.045, delayChildren: groupIndex * 0.06 + 0.22 } },
                  }}
                >
                  {group.tools.map((tool) => (
                    <m.li
                      key={tool}
                      className="tool-row flex min-h-10 items-center border-l border-accent/45 bg-white/[0.025] px-3 font-mono text-[10px] tracking-[0.08em] text-zinc-200"
                      variants={disableMotion ? undefined : {
                        hidden: { opacity: 0, x: -10 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                      }}
                    >
                      {tool}
                    </m.li>
                  ))}
                </m.ul>
              </m.section>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
