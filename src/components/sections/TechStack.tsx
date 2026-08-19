import { Bot, Code2, PanelsTopLeft, Server } from "lucide-react";
import { lazy, Suspense, type ComponentType } from "react";
import { toolGroups } from "../../data/techStack";
import { techStackSection } from "../../data/sections";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { BorderGlow } from "../motion/BorderGlow";
import { ScrollReveal } from "../motion/ScrollReveal";
import type { CircularCarouselProps } from "../ui/CircularCarousel";
import { SectionHeader } from "../ui/SectionHeader";

const LogoLoop = lazy(() => import("../motion/LogoLoop").then((module) => ({ default: module.LogoLoop })));

type ToolGroupType = typeof toolGroups[number];

// See Projects.tsx for why this is lazy and why the generic needs narrowing
// at the import site.
const CircularCarousel = lazy(() =>
  import("../ui/CircularCarousel").then((module) => ({
    default: module.CircularCarousel as unknown as ComponentType<CircularCarouselProps<ToolGroupType>>,
  })),
);

const groupIcons = [Code2, Server, PanelsTopLeft, Bot];

function ToolGroupCard({ group, index, active }: { group: ToolGroupType; index: number; active: boolean }) {
  const Icon = groupIcons[index] ?? Code2;
  return (
    <BorderGlow className="tool-group static-skill h-full p-5 sm:p-6" backgroundColor="#0e1223" animated={active} sweepAtLiteLevel glowRadius={34} fillOpacity={0.32}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">0{index + 1} / skills</p>
          <h3 className="mt-3 text-xl tracking-[-0.045em] text-bone sm:text-2xl">{group.label}</h3>
        </div>
        <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-accent/80" />
      </div>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">{group.description}</p>
      <ul className={`mt-5 grid gap-2 ${active ? "" : "circular-carousel__secondary"}`} aria-label={group.label}>
        {group.tools.map((tool) => (
          <li key={tool} className="tool-row flex min-h-10 items-center border-l border-accent/45 bg-white/[0.025] px-3 font-mono text-[10px] tracking-[0.08em] text-zinc-200">{tool}</li>
        ))}
      </ul>
    </BorderGlow>
  );
}

export function TechStack() {
  const { prefersReducedMotion, level } = useMotionProfile();

  return (
    <>
    <section id="stack" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader
        index={techStackSection.index}
        title={techStackSection.title}
        subtitle={techStackSection.subtitle}
      />
      <ScrollReveal>
        <div className="tool-workbench border border-white/[0.1] bg-surface/80">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">
            <span>Bench / toolkit</span>
            <span className="text-accent">Practical systems</span>
          </div>
          <Suspense fallback={<div className="circular-carousel tool-carousel" aria-hidden="true"><div className="circular-carousel__stage" /><div className="circular-carousel__controls" style={{ height: "2.75rem" }} /></div>}>
            <CircularCarousel
              items={toolGroups}
              ariaLabel="Skill groups"
              getItemLabel={(group) => group.label}
              renderCard={(group, index, active) => <ToolGroupCard group={group} index={index} active={active} />}
              reducedMotion={prefersReducedMotion || level === "static"}
              className="tool-carousel"
            />
          </Suspense>
        </div>
      </ScrollReveal>
    </section>

    {/* Outside the section's max-width so the marks run edge to edge: a slow,
        untouchable band under the bench. Fixed height so the lazy chunk cannot
        shift the page when it lands. */}
    <div className="tool-marquee mt-12 h-16">
      <Suspense fallback={null}><LogoLoop className="h-full" /></Suspense>
    </div>
    </>
  );
}
