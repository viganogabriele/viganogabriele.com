import { m } from "framer-motion";
import { ScrollReveal } from "../motion/ScrollReveal";
import { SectionHeader } from "../ui/SectionHeader";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ease } from "../../lib/motion";

export function About() {
  const { level } = useMotionProfile();
  const disableMotion = level === "static";
  const lines = [
    "Make the complex legible.",
    "Give teams a path, not another meeting.",
    "Polish the details that build trust.",
  ];

  return (
    <section id="about" className="relative mx-auto mt-28 max-w-7xl px-5 sm:px-8 lg:px-10">
      <SectionHeader index="01 / ABOUT" title={"Serious work.\nHuman energy."} />
      <ScrollReveal>
        <div className="grid gap-12 border-l border-white/[0.1] pl-5 md:grid-cols-[1.2fr_0.8fr] md:pl-8">
          <p className="max-w-2xl text-xl leading-[1.45] tracking-[-0.025em] text-zinc-300 md:text-2xl">
            I’m Gabriele, a Computer Engineering student in Milan directing product, operations and people at PoliNetwork. I turn fragmented requirements into products, teams, and operations that people can actually rely on.
          </p>
          <div className="border-t border-white/[0.1] pt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            <span className="text-blue-soft">Personal detail</span>
            <p className="mt-3 max-w-xs leading-relaxed text-zinc-400">
              Between lectures and the next community event, I keep a Proxmox and TrueNAS homelab running—because recovery, redundancy, and maintainability are part of the build.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className="mt-14">
        <div className="proof-grid grid grid-cols-2 border-y border-white/[0.09] lg:grid-cols-4">
          {[{ value: "30+", label: "volunteers recruited" }, { value: "5", label: "teams built" }, { value: "1,000+", label: "event attendees" }, { value: "Education", label: "Computer Engineering student at Politecnico di Milano", link: "https://www.polimi.it/en" }].map((item, index) => <m.div key={item.label} initial={disableMotion ? false : { opacity: 0, y: 16 }} whileInView={disableMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06, duration: 0.5, ease: ease.cinematic }} className="proof-stat flex min-h-36 flex-col border-b border-white/[0.07] px-4 py-6 odd:border-r [&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:[&:not(:last-child)]:border-r"><p className="text-3xl font-medium leading-none tracking-[-0.06em] text-accent sm:text-4xl">{item.value}</p>{item.link ? <a href={item.link} target="_blank" rel="noreferrer" data-cursor="hover" className="mt-auto inline-flex min-h-11 items-end py-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-accent/80 hover:text-accent">{item.label}</a> : <p className="mt-auto font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">{item.label}</p>}</m.div>)}
        </div>
      </ScrollReveal>

      <div className="mt-16 border-y border-white/[0.08]">
        {lines.map((line, index) => {
          const fromLeft = index % 2 === 0;
          return (
            <m.div
              key={line}
              initial={disableMotion ? false : { opacity: 0, x: fromLeft ? -20 : 20 }}
              whileInView={disableMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
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
