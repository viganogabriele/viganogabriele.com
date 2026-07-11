import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { noteBySlug } from "../data/notes";
import { JsonLd, PageMeta, SITE_URL } from "../lib/seo";
import { NotFoundPage } from "./NotFoundPage";
import { ScrollBar } from "../components/motion/ScrollBar";

export function NotePage() {
  const { slug = "" } = useParams();
  const note = noteBySlug.get(slug);
  if (!note) return <NotFoundPage />;
  return <AppShell><PageMeta title={`${note.title} | Gabriele Viganò`} description={note.preview} path={`/notes/${note.slug}`} /><JsonLd id={`note-${note.slug}`} data={{ "@context": "https://schema.org", "@type": "Article", headline: note.title, description: note.preview, datePublished: note.datePublished, author: { "@type": "Person", name: "Gabriele Viganò" }, mainEntityOfPage: `${SITE_URL}/notes/${note.slug}` }} /><ScrollBar /><main id="main-content" className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32"><Link to="/" data-cursor="hover" className="inline-flex min-h-11 items-center gap-2 border border-white/[0.1] px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition-colors hover:border-cyan-100/40 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"><ArrowLeft className="h-3.5 w-3.5" />Back to index</Link><article><p className="mt-14 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{note.date} / {note.readingTime}</p><h1 className="mt-5 text-[clamp(2.7rem,12vw,4.5rem)] leading-[0.94] tracking-[-0.065em] text-[#f2f3f5]">{note.title}</h1><div className="mt-10 max-w-[68ch] space-y-6 border-l border-white/[0.1] pl-5 text-[clamp(1rem,4.2vw,1.075rem)] leading-[1.75] text-zinc-300 md:pl-8">{note.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article></main></AppShell>;
}
