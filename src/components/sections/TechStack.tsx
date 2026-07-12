import { useRef } from "react";
import { m, useReducedMotion } from "framer-motion";
import { techSkills, toolGroups, toolHeat } from "../../data/techStack";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { useMatterPhysics } from "../../hooks/useMatterPhysics";
import { ScrollReveal } from "../motion/ScrollReveal";
import { SectionHeader } from "../ui/SectionHeader";

export function TechStack({ systemActive = false }: { systemActive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { level, canUsePointerEffects } = useMotionProfile();
  const reduced = useReducedMotion();
  const disableMotion = Boolean(reduced || level === "static");
  // Physics is a SYS-mode-only easter egg on desktop.
  const physicsEnabled = !disableMotion && canUsePointerEffects && systemActive;
  const positions = useMatterPhysics(ref, techSkills, !physicsEnabled);

  return (
    <section id="stack" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader
        index="04 / TOOLKIT"
        title="The workshop bench."
        subtitle="Tools I return to across product, interface, infrastructure, and operations."
      />
      <ScrollReveal>
        {physicsEnabled ? (
          <div
            ref={ref}
            data-cursor="hover"
            className="relative min-h-[34rem] overflow-hidden border border-accent/40 bg-surface p-5 shadow-[0_0_60px_color-mix(in_srgb,var(--accent)_15%,transparent)] touch-pan-y"
          >
            <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-accent">
              <m.span
                className="h-1.5 w-1.5 rounded-full bg-accent"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Bench / physics active
              <span className="text-accent/80">· drag to play</span>
            </div>
            <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-accent/80">
              MATTER.JS · X 00–100 / Y 00–100
            </div>
            {techSkills.map((skill, index) => {
              const pos = positions[index] ?? { x: skill.x, y: skill.y, angle: 0 };
              const Icon = skill.icon;
              return (
                <div
                  key={skill.label}
                  className="absolute flex h-11 w-[8.75rem] cursor-grab select-none items-center justify-center gap-2 border border-white/[0.12] bg-surface/90 px-3 font-mono text-[11px] text-zinc-200 shadow-xl active:cursor-grabbing"
                  style={{ transform: `translate(${pos.x - 70}px, ${pos.y - 22}px) rotate(${pos.angle}rad)` }}
                >
                  <Icon className="h-4 w-4" style={{ color: skill.color }} />
                  {skill.label}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative border border-white/[0.1] bg-surface p-5">
            <div className="mb-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">
              <span>Bench / toolkit</span>
              {!disableMotion && (
                <span data-sys-reveal className="text-accent/80">SYS ON → physics live</span>
              )}
            </div>
            <div className="grid gap-7 md:grid-cols-2">{toolGroups.map((group, groupIndex) => <div key={group.label}><p className="mb-3 font-mono text-[9px] uppercase tracking-[0.16em] text-accent">{group.label}</p><div className="flex flex-wrap gap-2">{group.tools.map((tool, index) => <m.span key={tool} initial={disableMotion ? false : { opacity: 0, y: 10, scale: 0.98 }} whileInView={disableMotion ? undefined : { opacity: 1, y: 0, scale: 1 }} whileTap={disableMotion ? undefined : { scale: 0.97 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: groupIndex * 0.04 + index * 0.025 }} className="tool-chip inline-flex min-h-10 items-center gap-2 border border-white/[0.12] bg-[#15110f]/90 px-3 py-2 font-mono text-[10px] text-zinc-200">{tool}{toolHeat.has(tool) && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-phosphor" />}</m.span>)}</div></div>)}</div>
          </div>
        )}

      </ScrollReveal>
    </section>
  );
}
