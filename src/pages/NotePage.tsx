import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { noteBySlug } from "../data/notes";
import { JsonLd, PageMeta, SITE_URL } from "../lib/seo";

export function NotePage() {
  const { slug = "" } = useParams();
  const note = noteBySlug.get(slug);
  if (!note) return <Navigate to="/" replace />;
  return <AppShell><PageMeta title={`${note.title} | Gabriele Viganò`} description={note.preview} path={`/notes/${note.slug}`} /><JsonLd id={`note-${note.slug}`} data={{ "@context": "https://schema.org", "@type": "Article", headline: note.title, description: note.preview, datePublished: "2026-01-01", author: { "@type": "Person", name: "Gabriele Viganò" }, mainEntityOfPage: `${SITE_URL}/notes/${note.slug}` }} /><main className="mx-auto min-h-screen max-w-3xl px-5 pb-20 pt-28 sm:px-8"><Link to="/" data-cursor="hover" className="inline-flex items-center gap-2 border border-white/[0.1] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition-colors hover:border-cyan-100/40 hover:text-cyan-100"><ArrowLeft className="h-3.5 w-3.5" />Back to index</Link><p className="mt-16 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{note.date} / {note.readingTime}</p><h1 className="mt-5 text-5xl leading-[0.92] tracking-[-0.065em] text-[#f2f3f5] md:text-7xl">{note.title}</h1><div className="mt-12 space-y-6 border-l border-white/[0.1] pl-5 text-[17px] leading-relaxed text-zinc-300 md:pl-8">{note.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></main></AppShell>;
}
