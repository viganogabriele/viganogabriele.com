import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { secondaryTools, techSkills } from "../../data/techStack";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { useMatterPhysics } from "../../hooks/useMatterPhysics";
import { ScrollReveal } from "../motion/ScrollReveal";
import { SectionHeader } from "../ui/SectionHeader";

export function TechStack() {
  const ref = useRef<HTMLDivElement>(null);
  const { isTouch, hasNoHover, isTelegramWebView, isCompact } = useFeatureDetect();
  const reduced = useReducedMotion();
  // Matter is deliberately desktop-only. A narrow desktop viewport can still
  // report a fine pointer, but it needs the same paint-budget-safe panel as a phone.
  const staticMode = Boolean(
    reduced || isTouch || hasNoHover || isTelegramWebView || isCompact,
  );
  const compactStatic = staticMode && typeof window !== "undefined" && window.innerWidth < 560;
  const positions = useMatterPhysics(ref, techSkills, staticMode);
  return <section id="stack" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10"><SectionHeader index="04 / TOOLKIT" title="The workshop bench." subtitle="Tools I return to across product, interface, infrastructure, and operations." /><ScrollReveal><div ref={ref} data-cursor="hover" className={`relative min-h-[29rem] overflow-hidden border border-white/[0.1] bg-[#0b0d12] p-5 ${staticMode ? "instrument-static" : "touch-pan-y"}`}><div className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">Bench / {staticMode ? "static readout" : "physics active"}</div><div className="absolute bottom-4 right-4 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">X 00–100 / Y 00–100</div>{techSkills.map((skill, index) => { const narrowPosition = { x: 82 + (index % 2) * 125, y: 90 + Math.floor(index / 2) * 78, angle: 0 }; const pos = staticMode ? (compactStatic ? narrowPosition : { x: skill.x, y: skill.y, angle: 0 }) : positions[index] ?? { x: skill.x, y: skill.y, angle: 0 }; const Icon = skill.icon; return <div key={skill.label} className={`absolute flex h-11 w-[8.75rem] select-none items-center justify-center gap-2 border border-white/[0.12] bg-[#10131a]/90 px-3 font-mono text-[11px] text-zinc-200 shadow-xl ${staticMode ? "static-skill" : "cursor-grab active:cursor-grabbing"}`} style={{ transform: `translate(${pos.x - 70}px, ${pos.y - 22}px) rotate(${pos.angle}rad)` }}><Icon className="h-4 w-4" style={{ color: skill.color }} />{skill.label}</div>; })}</div><div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600"><span className="text-zinc-500">Secondary /</span>{secondaryTools.map((tool) => <span key={tool}>{tool}</span>)}</div></ScrollReveal></section>;
}
