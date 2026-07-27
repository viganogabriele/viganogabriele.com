import { AnimatePresence, m, useInView } from "framer-motion";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ScrollReveal } from "../motion/ScrollReveal";

const EMAIL = "info@viganogabriele.com";

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 4.77A5.44 5.44 0 0 0 3.5 8.55c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer({ context = "home" }: { context?: "home" | "cv" }) {
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const { level } = useMotionProfile();
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setCopyMessage("Email address copied.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyMessage(`Copy unavailable. Email ${EMAIL}.`);
    }
  };

  return (
    <ScrollReveal>
      <footer className="mt-36 border-t border-white/[0.09] pb-7 pt-14 md:mt-48 md:pt-20">
        <div ref={headingRef} className="grid gap-12 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Contact</p>
            <m.h2
              className="mt-5 max-w-3xl text-5xl font-medium leading-[0.92] tracking-[-0.06em] text-bone sm:text-6xl md:text-8xl"
              initial={level === "static" ? false : { opacity: 0, y: 22 }}
              animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: level === "static" ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Let’s work together.
            </m.h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400">
              Have a project, collaboration, or idea in mind? Send me a note and tell me what you’re working on.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={`mailto:${EMAIL}`} data-cursor="hover" className="inline-flex min-h-12 items-center gap-3 bg-bone px-5 text-sm font-semibold text-[#0d0f13] transition-colors hover:bg-blue-soft">
                <Mail className="h-4 w-4" />
                Send email
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <button type="button" onClick={copy} data-cursor="hover" className="inline-flex min-h-12 items-center gap-2 border border-white/[0.14] px-5 text-sm text-zinc-300 transition-colors hover:border-accent hover:text-white">
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <m.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2 text-accent">
                      <Check className="h-4 w-4" /> Copied
                    </m.span>
                  ) : (
                    <m.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2">
                      <Copy className="h-4 w-4" /> Copy address
                    </m.span>
                  )}
                </AnimatePresence>
              </button>
              <span className="sr-only" aria-live="polite">{copyMessage}</span>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-col justify-end gap-3 text-sm text-zinc-400">
            <a href="https://github.com/viganogabriele" target="_blank" rel="noreferrer" data-cursor="hover" className="flex min-h-12 items-center justify-between border-b border-white/[0.08] transition-colors hover:text-white">
              GitHub <GitHubIcon className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com/in/viganogabriele" target="_blank" rel="noreferrer" data-cursor="hover" className="flex min-h-12 items-center justify-between border-b border-white/[0.08] transition-colors hover:text-white">
              LinkedIn <LinkedInIcon className="h-4 w-4" />
            </a>
            <Link to={context === "cv" ? "/" : "/cv"} data-cursor="hover" className="flex min-h-12 items-center justify-between border-b border-white/[0.08] transition-colors hover:text-white">
              {context === "cv" ? "Website" : "CV"} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-5 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-600 sm:flex-row">
          <span>Gabriele Viganò · Milan, Italy</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </ScrollReveal>
  );
}
