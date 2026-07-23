import { ArrowUpRight } from "lucide-react";
import type { Certification } from "../../data/certifications";

export function CertRow({ certification }: { certification: Certification }) {
  const Icon = certification.icon;
  return <a href={certification.link} target="_blank" rel="noreferrer" data-cursor="hover" className="group grid min-h-14 grid-cols-[auto_1fr_auto] items-center gap-4 px-3 py-3 font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-500 transition-colors hover:text-zinc-100 sm:grid-cols-[auto_1fr_auto_auto]"><Icon className="h-4 w-4 text-blue-soft/80" /><span className="text-zinc-300">{certification.title}</span><span className="hidden sm:block">{certification.issuer}</span><span className="flex items-center gap-2 text-accent/80"><span className="hidden lg:inline">View credential</span>{certification.year}<ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span><span data-sys-reveal className="col-start-2 text-[8px] tracking-[0.1em] text-accent sm:col-start-auto">ID / {certification.year}-{certification.issuer.replace(/\W+/g, "").slice(0, 6).toUpperCase()}</span></a>;
}
