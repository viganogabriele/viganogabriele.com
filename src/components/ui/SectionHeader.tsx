import { ScrollReveal } from "../motion/ScrollReveal";

export function SectionHeader({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <ScrollReveal className="mb-12 md:mb-16">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        <span>{index}</span><span className="h-px w-10 bg-zinc-700" />
        <span className="section-anchor-label text-cyan-200">GRID / {index}</span>
      </div>
      <h2 className="mt-4 max-w-4xl whitespace-pre-line text-4xl font-medium tracking-[-0.06em] text-[#f2f3f5] sm:text-5xl md:text-7xl">{title}</h2>
      {subtitle && <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">{subtitle}</p>}
    </ScrollReveal>
  );
}
