import { ArrowUpRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notes } from "../../data/notes";
import { notesSection } from "../../data/sections";
import { createNoteNavigationState } from "../../lib/navigationState";
import { FadeIn } from "../motion/FadeIn";
import { SectionHeader } from "../ui/SectionHeader";

export function Notes() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <section id="notes" data-scroll-anchor="notes" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader
        index={notesSection.index}
        title={notesSection.title}
        subtitle={notesSection.subtitle}
      />
      <div className="note-row">
        {notes.map((note, index) => {
          const to = `/notes/${note.slug}`;
          return (
            <FadeIn key={note.slug} delay={index * 0.05}>
              <Link
                to={to}
                onClick={(event) => {
                  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  navigate(to, { state: createNoteNavigationState(location, event.currentTarget) });
                }}
                data-scroll-anchor={`note-${note.slug}`}
                data-cursor="hover"
                className="group grid gap-3 pb-6 pt-5 transition-colors md:grid-cols-[3rem_1.25fr_.75fr_auto] md:items-center md:gap-6 md:pb-8 md:pt-5"
              >
                <span className="font-mono text-[10px] text-zinc-600">0{index + 1}</span>
                <div>
                  <h3 className="text-2xl tracking-[-0.045em] text-zinc-200 transition-colors group-hover:text-accent md:text-3xl">
                    {note.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 md:hidden">{note.preview}</p>
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">
                  <p>{note.date} / {note.readingTime}</p>
                  <p className="mt-2 hidden text-zinc-500 md:block">{note.tags.join(" · ")}</p>
                </div>
                <span className="inline-flex min-h-11 items-center justify-end gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500 transition-colors group-hover:text-accent">
                  <span>Read note</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </span>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
