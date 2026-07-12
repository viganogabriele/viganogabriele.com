import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { PageMeta } from "../lib/seo";
import { m } from "framer-motion";
import { useMotionProfile } from "../hooks/useMotionProfile";

export function NotFoundPage() {
  const { level } = useMotionProfile();
  return <AppShell><PageMeta title="Page Not Found | Gabriele Viganò" description="The requested page is not available." path="/404" /><main id="main-content" className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col justify-center overflow-hidden px-5 py-24 sm:px-8"><m.div aria-hidden className="absolute right-[-3rem] top-1/2 font-mono text-[clamp(10rem,38vw,28rem)] leading-none text-white/[0.025]" animate={level === "full" ? { x: [0, -12, 0], opacity: [0.45, 1, 0.45] } : undefined} transition={{ duration: 8, repeat: Infinity }}>404</m.div><div className="relative"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-soft">404 / signal lost</p><h1 className="mt-4 text-[clamp(3.75rem,18vw,8rem)] leading-[0.86] tracking-[-0.07em] text-bone">Not here.</h1><p className="mt-5 max-w-lg text-zinc-400">This coordinate does not point to a published page.</p><Link to="/" className="mt-8 inline-flex min-h-12 w-fit items-center bg-bone px-5 text-sm font-semibold text-[#080b16]">Return to the index</Link></div></main></AppShell>;
}
