import { ArrowUpRight } from "lucide-react";
import type { Certification } from "../../data/certifications";

/**
 * One credential as a full-width row. Now that the section header carries the
 * aside, the list has the whole column: the numbering, title, issuer and year
 * get their own tracks instead of being crowded into a narrow half.
 */
export function CertRow({ certification, index }: { certification: Certification; index: number }) {
  const Icon = certification.icon;
  return (
    <a
      href={certification.link}
      target="_blank"
      rel="noreferrer"
      data-cursor="hover"
      className="cert-row group grid min-h-16 grid-cols-[auto_auto_1fr_auto] items-center gap-x-3 border-b border-white/[0.08] px-3 py-4 sm:grid-cols-[auto_auto_1fr_auto_auto] sm:gap-x-5 sm:py-5"
    >
      <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
      <Icon aria-hidden className="h-4 w-4 text-accent/70 transition-colors group-hover:text-accent" />
      {/* One row on mobile — icon beside the text block, not above it. `contents`
          on sm+ dissolves this wrapper so title and issuer resume being their
          own grid columns, same as the desktop layout before. */}
      <div className="min-w-0 sm:contents">
        <span className="block min-w-0 text-base tracking-[-0.02em] text-zinc-200 transition-colors group-hover:text-bone sm:text-lg">
          {certification.title}
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 sm:mt-0 sm:text-right">
          {certification.issuer} · {certification.year}
        </span>
      </div>
      <span className="flex items-center gap-2 justify-self-end font-mono text-[9px] uppercase tracking-[0.14em] text-accent/80">
        <span className="hidden lg:inline">View credential</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}
