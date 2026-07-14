import { ArrowUpRight } from "lucide-react";
import { m } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notes } from "../../data/notes";
import { createNoteNavigationState } from "../../lib/navigationState";
import { FadeIn } from "../motion/FadeIn";
import { SectionHeader } from "../ui/SectionHeader";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function Notes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { level } = useMotionProfile();
  const staticMotion = level === "static";

  return (
    <section id="notes" data-scroll-anchor="notes" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader
        index="06 / FIELD NOTES"
        title="Notes from the build."
        subtitle="Compact thoughts on operations, interfaces, and resilient systems."
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
                  navigate(to, { state: createNoteNavigationState(location) });
                }}
                data-scroll-anchor={`note-${note.slug}`}
                data-cursor="hover"
                className="group grid gap-3 py-6 transition-colors md:grid-cols-[3rem_1.25fr_.75fr_auto] md:items-center md:gap-6 md:py-8"
              >
                <m.span
                  className="font-mono text-[10px] text-zinc-600"
                  initial={staticMotion ? false : { opacity: 0 }}
                  whileInView={staticMotion ? undefined : { opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                >
                  0{index + 1}
                </m.span>
                <m.div
                  initial={staticMotion ? false : { opacity: 0, y: 6 }}
                  whileInView={staticMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="text-2xl tracking-[-0.045em] text-zinc-200 transition-colors group-hover:text-accent md:text-3xl">
                    {note.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 md:hidden">{note.preview}</p>
                </m.div>
                <m.div
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600"
                  initial={staticMotion ? false : { opacity: 0, y: 6 }}
                  whileInView={staticMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p>{note.date} / {note.readingTime}</p>
                  <p className="mt-2 hidden text-zinc-500 md:block">{note.tags.join(" · ")}</p>
                </m.div>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
