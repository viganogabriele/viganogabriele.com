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
  const principlesRef = useRef<HTMLDivElement>(null);
  const principlesInView = useInView(principlesRef, { once: true, margin: "-60px" });

  const lines = [
    "A rebuild that grows while it rebuilds never ships.",
    "The safest service is the one that isn’t listening.",
    "Verifying the output is the job.",
  ];

  return (
    <section id="about" className="relative mx-auto mt-28 max-w-7xl px-5 sm:px-8 lg:px-10">
      <SectionHeader index="01 / ABOUT" title={"Product, QA,\nand the books."} />
      <ScrollReveal>
        <div className="grid gap-12 border-l border-white/[0.1] pl-5 md:grid-cols-[1.2fr_0.8fr] md:pl-8">
          <p className="max-w-2xl text-xl leading-[1.45] tracking-[-0.025em] text-zinc-300 md:text-2xl">
            PoliNetwork is 500+ group chats for Politecnico students, 18,000 of them in the main one, kept running by around 200 volunteers. I own the product, the testing and the treasury: I write the specs, break the services on purpose, and follow the fixes to release.
          </p>
          <div className="border-t border-white/[0.1] pt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            <span className="text-blue-soft">Current curiosity</span>
            <p className="mt-3 max-w-xs leading-relaxed text-zinc-400">
              Coding agents that run somewhere other than my laptop. Claude Code and Codex live on a VPS I reach over Tailscale; they open the pull requests, I review the previews.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className="mt-14">
        <div ref={statsRef} className="proof-grid grid grid-cols-2 border-y border-white/[0.09] lg:grid-cols-4">
          {[
            { value: "18,000", label: "members in the network's main Telegram group" },
            { value: "6.7K", label: "monthly clicks from Google on the site I run" },
            { value: "30+", label: "volunteers recruited across 5 teams" },
            { value: "Education", label: "Computer Engineering at Politecnico di Milano", link: "https://www.polimi.it/en" },
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

      <div ref={principlesRef} className="mt-16 border-y border-white/[0.08]">
        {lines.map((line, index) => {
          const fromLeft = index % 2 === 0;
          return (
            <m.div
              key={line}
              initial={disableMotion ? false : { opacity: 0, x: fromLeft ? -20 : 20 }}
              animate={disableMotion ? undefined : principlesInView ? { opacity: 1, x: 0 } : { opacity: 0, x: fromLeft ? -20 : 20 }}
              transition={{ duration: 0.75, delay: index * 0.12, ease: ease.cinematic }}
              className="group flex items-center gap-5 border-b border-white/[0.06] py-5 last:border-b-0"
            >
              <span className="font-mono text-[10px] text-zinc-600">0{index + 1}</span>
              <p className="text-lg tracking-[-0.03em] text-zinc-300 transition-[color,font-variation-settings] group-hover:text-accent group-hover:[font-variation-settings:'wght'_620] md:text-2xl">
                {line}
              </p>
            </m.div>
          );
        })}
      </div>
    </section>
  );
}
