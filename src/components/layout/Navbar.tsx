import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Power, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo-dark.png";
import { navItems } from "../../data/nav";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { cn } from "../../lib/cn";
import { dur, ease } from "../../lib/motion";

export function Navbar({ onNavigate, systemActive, onToggleSystem }: { onNavigate: (target: string) => void; systemActive: boolean; onToggleSystem: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#about");
  const { isTelegramWebView } = useFeatureDetect();
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 36);
    handler(); window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  useEffect(() => {
    // scroll-based active detection — works reliably for tall sections
    // (IntersectionObserver with thresholds misses updates between crossings)
    const nodes = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const probe = window.innerHeight * 0.32; // line 32% down the viewport
      let winner: HTMLElement | null = null;
      let bestTop = -Infinity;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom >= probe && rect.top > bestTop) {
          bestTop = rect.top;
          winner = node;
        }
      }
      if (winner?.id) setActive(`#${winner.id}`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const go = (event: React.MouseEvent<HTMLElement>, target: string) => {
    event.preventDefault(); setOpen(false); setActive(target);
    timer.current = setTimeout(() => onNavigate(target), 50);
  };
  const glass = isTelegramWebView ? "rgba(5,6,8,0.96)" : scrolled ? "rgba(5,6,8,0.74)" : "rgba(5,6,8,0.48)";
  return <>
    <motion.nav initial={reduced ? false : { y: -36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: ease.cinematic, delay: 0.12 }} className="fixed left-1/2 top-4 z-[60] w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 sm:top-6">
      <div className="border border-white/[0.09] px-3 py-2 sm:px-4" style={{ background: glass, backdropFilter: isTelegramWebView ? "none" : "blur(22px)", WebkitBackdropFilter: isTelegramWebView ? "none" : "blur(22px)" }}>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={(event) => go(event, "body")} data-cursor="hover" className="flex h-9 w-10 items-center justify-center" aria-label="Back to top"><img src={logo} alt="Gabriele Viganò" className="h-5 w-auto invert" /></button>
          <div className="hidden items-center gap-1 lg:flex">{navItems.map((item) => <a key={item.href} href={item.href} onClick={(event) => go(event, item.href)} data-cursor="hover" className={cn("relative px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors", active === item.href ? "text-white" : "text-zinc-500 hover:text-zinc-200")}><span className={cn("absolute bottom-0 left-3 right-3 h-px bg-cyan-200 transition-opacity", active === item.href ? "opacity-100" : "opacity-0")} />{item.label}</a>)}</div>
          <div className="flex items-center gap-2"><span data-sys-reveal className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-cyan-400/70 md:inline">60fps · 8ms</span><div className="relative"><AnimatePresence>{systemActive && <motion.span key="ring" className="pointer-events-none absolute inset-[-3px] rounded-sm border border-cyan-400/70" initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.55, opacity: 0 }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }} />}</AnimatePresence><button type="button" onClick={onToggleSystem} data-cursor="hover" className={cn("nav-sys-btn relative inline-flex items-center gap-2 border px-2.5 py-2 font-mono text-[9px] uppercase tracking-[0.13em] transition-colors", systemActive ? "border-cyan-400/60 text-cyan-400 hover:border-cyan-300 hover:text-cyan-300" : "border-white/[0.1] text-zinc-300 hover:border-cyan-200/50 hover:text-cyan-100")} aria-pressed={systemActive} aria-label="Toggle system mode"><Power className={cn("h-3 w-3 transition-colors", systemActive ? "text-cyan-400" : "")} /><span className="hidden sm:inline">SYS</span></button></div><a href="mailto:info@viganogabriele.com" data-cursor="hover" className="hidden bg-[#f2f3f5] px-3 py-2 text-[10px] font-semibold text-black sm:inline-block">Let’s talk</a><button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex h-8 w-8 items-center justify-center border border-white/[0.1] text-zinc-200 lg:hidden" aria-label="Toggle navigation" aria-expanded={open}>{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div>
        </div>
      </div>
      <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reduced ? 0 : dur.micro }} className="mt-2 border border-white/[0.09] bg-[#080a0e]/95 p-2 backdrop-blur-xl lg:hidden">{navItems.map((item) => <a key={item.href} href={item.href} onClick={(event) => go(event, item.href)} className="block px-3 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 hover:bg-white/[0.04] hover:text-white">{item.label}</a>)}</motion.div>}</AnimatePresence>
    </motion.nav>
  </>;
}
