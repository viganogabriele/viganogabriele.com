import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { PageMeta } from "../lib/seo";

export function NotFoundPage() {
  return <AppShell><PageMeta title="Page Not Found | Gabriele Viganò" description="The requested page is not available." path="/404" /><main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/70">404 / signal lost</p><h1 className="mt-4 text-6xl tracking-[-0.07em] text-[#f2f3f5] sm:text-8xl">Not here.</h1><p className="mt-5 max-w-lg text-zinc-400">This coordinate does not point to a published page.</p><Link to="/" className="mt-8 inline-flex w-fit bg-[#f2f3f5] px-5 py-3 text-sm font-semibold text-black">Return to the index</Link></main></AppShell>;
}
