import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { notes } from "../../data/notes";
import { FadeIn } from "../motion/FadeIn";
import { SectionHeader } from "../ui/SectionHeader";

export function Notes() {
  return <section id="notes" data-scroll-anchor="notes" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10"><SectionHeader index="06 / FIELD NOTES" title="Notes from the build." subtitle="Compact thoughts on operations, interfaces, and resilient systems." /><div className="note-row">{notes.map((note, index) => <FadeIn key={note.slug} delay={index * 0.05}><Link to={`/notes/${note.slug}`} data-scroll-anchor={`note-${note.slug}`} data-cursor="hover" className="group grid gap-3 py-6 transition-colors md:grid-cols-[3rem_1.25fr_.75fr_auto] md:items-center md:gap-6 md:py-8"><span className="font-mono text-[10px] text-zinc-600">0{index + 1}</span><div><h3 className="text-2xl tracking-[-0.045em] text-zinc-200 transition-colors group-hover:text-accent md:text-3xl">{note.title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-500 md:hidden">{note.preview}</p></div><div className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600"><p>{note.date} / {note.readingTime}</p><p className="mt-2 hidden text-zinc-500 md:block">{note.tags.join(" · ")}</p></div><ArrowUpRight className="h-4 w-4 text-zinc-600 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" /></Link></FadeIn>)}</div></section>;
}
