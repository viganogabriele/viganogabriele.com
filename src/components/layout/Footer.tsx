import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { Magnetic } from "../motion/Magnetic";
import { ScrollReveal } from "../motion/ScrollReveal";
import { useMotionProfile } from "../../hooks/useMotionProfile";

const EMAIL = "info@viganogabriele.com";

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4" />
  </svg>
);
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer({ onNavigate }: { onNavigate: (target: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const { level } = useMotionProfile();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setCopyMessage("Email address copied.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyMessage(`Copy unavailable. Email ${EMAIL}.`);
    }
  };

  return (
    <ScrollReveal>
      <footer className="mt-36 border-t border-white/[0.08] pb-7 pt-14 md:mt-48 md:pt-20">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              End of transmission / start a conversation
            </p>
            <h2 className="mt-5 max-w-3xl text-5xl font-medium leading-[0.9] tracking-[-0.065em] text-[#f2f3f5] sm:text-6xl md:text-8xl">
              Let’s build something that holds up.
            </h2>

            {/* Terminal-style prompt */}
            <div className="mt-9 flex items-center font-mono text-xs text-zinc-500 sm:text-sm">
              <span className="mr-2 text-cyan-400">$</span>
              <span>connect --to</span>
              <span className="ml-1.5 text-cyan-100">gabriele</span>
              <m.span
                className="ml-1.5 inline-block h-3.5 w-1.5 bg-cyan-400 align-middle"
                animate={level === "full" ? { opacity: [1, 0, 1] } : undefined}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Multi-channel action row */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={`mailto:${EMAIL}`}
                  data-cursor="hover"
                  className="group relative inline-flex items-center gap-3 overflow-hidden bg-[#f2f3f5] px-6 py-4 text-sm font-semibold text-black transition-colors hover:bg-cyan-100"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Mail className="relative h-4 w-4" />
                  <span className="relative">Send email</span>
                  <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>

              <button
                type="button"
                onClick={copy}
                data-cursor="hover"
                className="group relative inline-flex min-h-11 items-center gap-2 border border-white/[0.14] px-4 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-100"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <m.span
                      key="check"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Check className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-cyan-100">{EMAIL}</span>
                    </m.span>
                  ) : (
                    <m.span
                      key="copy"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy address
                    </m.span>
                  )}
                </AnimatePresence>
              </button>

              <span className="sr-only" aria-live="polite">{copyMessage}</span>

            </div>
          </div>

          <div className="flex flex-col justify-end gap-5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            <a
              href="https://github.com/viganogabriele"
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="flex min-h-12 items-center justify-between border-b border-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
            >
              GitHub <GitHubIcon className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com/in/viganogabriele"
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="flex min-h-12 items-center justify-between border-b border-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
            >
              LinkedIn <LinkedInIcon className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => onNavigate("body")}
              className="flex min-h-12 items-center justify-between border-b border-white/[0.08] text-left hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
            >
              Back to top <span>↑</span>
            </button>
          </div>
        </div>
        <div className="mt-24 flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600 sm:flex-row">
          <span>Gabriele Viganò · Milan, IT</span>
          <span>React · Vite · Motion · 2026</span>
        </div>
      </footer>
    </ScrollReveal>
  );
}
