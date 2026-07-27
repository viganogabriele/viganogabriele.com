import { m, useInView } from "framer-motion";
import { useRef } from "react";
import { CountUp } from "../motion/CountUp";
import { ScrollReveal } from "../motion/ScrollReveal";
import { SectionHeader } from "../ui/SectionHeader";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ease } from "../../lib/motion";

export function About() {
  const { level } = useMotionProfile();
  const disableMotion = level === "static";
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });

  return (
    <section id="about" className="relative mx-auto mt-28 max-w-7xl px-5 sm:px-8 lg:px-10">
      <SectionHeader index="01 / ABOUT" title="About." />
      <ScrollReveal>
        <div className="grid gap-10 border-t border-white/[0.09] pt-7 md:grid-cols-[1.2fr_0.8fr] md:gap-16">
          <p className="max-w-2xl text-xl leading-[1.45] tracking-[-0.025em] text-zinc-300 md:text-2xl">
            I’m Gabriele, a Computer Engineering student in Milan. At PoliNetwork I work across product, operations, and leadership for a community of more than 45,000 students.
          </p>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Currently exploring</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
              Practical AI, coding agents, and self-hosted automation—used on real workflows and judged by whether the result is reliable.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className="mt-14">
        <div ref={statsRef} className="proof-grid grid grid-cols-2 border-y border-white/[0.09] lg:grid-cols-4">
          {[
            { value: "30+", label: "people recruited through a structured process" },
            { value: "5", label: "teams built toward autonomous delivery" },
            { value: "1,000+", label: "people brought together at one event" },
            { value: "Education", label: "Computer Engineering student at Politecnico di Milano", link: "https://www.polimi.it/en" },
          ].map((item, index) => (
            <m.div
              key={item.label}
              initial={disableMotion ? false : { opacity: 0, y: 16 }}
              animate={disableMotion ? undefined : statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ delay: index * 0.06, duration: 0.5, ease: ease.cinematic }}
              className="proof-stat flex min-h-36 flex-col border-b border-white/[0.07] px-4 py-6 odd:border-r [&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:[&:not(:last-child)]:border-r"
            >
              <p className="text-3xl font-medium leading-none tracking-[-0.06em] text-accent sm:text-4xl"><CountUp value={item.value} trigger={statsInView} delay={index * 0.06} /></p>
              {item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer" data-cursor="hover" className="mt-auto inline-flex min-h-11 items-end py-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-accent/80 hover:text-accent">{item.label}</a>
              ) : (
                <p className="mt-auto font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">{item.label}</p>
              )}
            </m.div>
          ))}
        </div>
      </ScrollReveal>

    </section>
  );
}
