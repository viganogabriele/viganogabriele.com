import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { noteJsonLd, noteMetadata } from "../data/site";
import { legacySlugRedirects, noteBySlug } from "../data/notes";
import { JsonLd, PageMeta } from "../lib/seo";
import { NotFoundPage } from "./NotFoundPage";
import { ScrollBar } from "../components/motion/ScrollBar";
import { Footer } from "../components/layout/Footer";
import { queueNoteReturn, readNoteNavigationState, registerNoteReturn } from "../lib/navigationState";
import { useRouteReady } from "../hooks/useRouteReady";

export function NotePage() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = readNoteNavigationState(location.state);
  const note = noteBySlug.get(slug);
  const redirecting = !note && Object.prototype.hasOwnProperty.call(legacySlugRedirects, slug);
  useRouteReady(Boolean(note));

  useEffect(() => {
    if (navigationState) registerNoteReturn(navigationState);
  }, [navigationState]);

  useEffect(() => {
    if (redirecting) {
      navigate(`/notes/${legacySlugRedirects[slug]}`, { replace: true });
    }
  }, [redirecting, slug, navigate]);

  if (redirecting) return null;
  if (!note) return <NotFoundPage />;
  const closeNote = () => {
    if (navigationState) {
      registerNoteReturn(navigationState);
      queueNoteReturn(navigationState.noteReturn.snapshot);
      navigate({
        pathname: navigationState.noteReturn.pathname,
        search: navigationState.noteReturn.search,
        hash: navigationState.noteReturn.hash,
      }, { replace: true, state: navigationState });
      return;
    }
    navigate({ pathname: "/", hash: "#notes" }, { replace: true });
  };

  return <AppShell><PageMeta metadata={noteMetadata(note)} /><JsonLd id={`note-${note.slug}`} data={noteJsonLd(note)} /><ScrollBar /><main id="main-content" className="fixed inset-0 z-[90] overflow-y-auto bg-background px-5 pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-8 sm:pt-[max(3.5rem,env(safe-area-inset-top))]"><div className="mx-auto max-w-3xl"><button type="button" onClick={closeNote} aria-label="Close note and return to notes" data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 border border-white/[0.1] px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition-colors hover:border-blue/50 hover:text-blue-soft"><ArrowLeft className="h-3.5 w-3.5" />Back to notes</button><article><p className="mt-14 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{note.date} / {note.readingTime}</p><h1 className="mt-5 text-[clamp(2.7rem,12vw,4.5rem)] leading-[0.94] tracking-[-0.065em] text-bone">{note.title}</h1><div className="mt-10 max-w-[68ch] space-y-6 border-l border-white/[0.1] pl-5 text-[clamp(1rem,4.2vw,1.075rem)] leading-[1.75] text-zinc-300 md:pl-8">{note.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article></div>{/* The footer sits outside the 3xl reading column: inside it, the footer's own
      two-column grid left the display heading ~437px and wrapped it to four
      ragged lines. Same max-w-7xl the home page gives it, so it reads identically. */}
    <div className="mx-auto max-w-7xl pb-24"><Footer /></div></main></AppShell>;
}
