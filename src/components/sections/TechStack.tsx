import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { secondaryTools, techSkills } from "../../data/techStack";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { useMatterPhysics } from "../../hooks/useMatterPhysics";
import { ScrollReveal } from "../motion/ScrollReveal";
import { SectionHeader } from "../ui/SectionHeader";

export function TechStack({ systemActive = false }: { systemActive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { isTouch, hasNoHover, isTelegramWebView, isCompact } = useFeatureDetect();
  const reduced = useReducedMotion();
  const disableMotion = Boolean(
    reduced || isTouch || hasNoHover || isTelegramWebView || isCompact,
  );
  // Physics is a SYS-mode-only easter egg on desktop.
  const physicsEnabled = !disableMotion && systemActive;
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
            className="relative min-h-[34rem] overflow-hidden border border-cyan-400/40 bg-[#0b0d12] p-5 shadow-[0_0_60px_rgba(127,231,255,0.15)] touch-pan-y"
          >
            <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan-100">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Bench / physics active
              <span className="text-cyan-400/80">· drag to play</span>
            </div>
            <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-fuchsia-300/80">
              MATTER.JS · X 00–100 / Y 00–100
            </div>
            {techSkills.map((skill, index) => {
              const pos = positions[index] ?? { x: skill.x, y: skill.y, angle: 0 };
              const Icon = skill.icon;
              return (
                <div
                  key={skill.label}
                  className="absolute flex h-11 w-[8.75rem] cursor-grab select-none items-center justify-center gap-2 border border-white/[0.12] bg-[#10131a]/90 px-3 font-mono text-[11px] text-zinc-200 shadow-xl active:cursor-grabbing"
                  style={{ transform: `translate(${pos.x - 70}px, ${pos.y - 22}px) rotate(${pos.angle}rad)` }}
                >
                  <Icon className="h-4 w-4" style={{ color: skill.color }} />
                  {skill.label}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative border border-white/[0.1] bg-[#0b0d12] p-5">
            <div className="mb-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">
              <span>Bench / toolkit</span>
              {!disableMotion && (
                <span data-sys-reveal className="text-cyan-400/80">SYS ON → physics live</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {techSkills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <motion.div
                    key={skill.label}
                    initial={disableMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={disableMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-center gap-2 border border-white/[0.12] bg-[#10131a]/90 px-3 py-2.5 font-mono text-[11px] text-zinc-200 transition-all hover:-translate-y-0.5 hover:border-cyan-400/40"
                  >
                    <Icon className="h-4 w-4 shrink-0" style={{ color: skill.color }} />
                    {skill.label}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Secondary tools */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">
            Secondary /
          </span>
          {secondaryTools.map((tool) => (
            <span
              key={tool}
              className="inline-flex cursor-default items-center border border-white/[0.1] bg-[#10131a]/60 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400 transition-all hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-[#10131a] hover:text-cyan-100"
            >
              {tool}
            </span>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
