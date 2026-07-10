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
    const nodes = navItems.map((item) => document.querySelector<HTMLElement>(item.href)).filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(`#${visible.target.id}`);
    }, { rootMargin: "-35% 0px -45%", threshold: [0.1, 0.5] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
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
          <div className="flex items-center gap-2"><button type="button" onClick={onToggleSystem} data-cursor="hover" className="nav-sys-btn inline-flex items-center gap-2 border border-white/[0.1] px-2.5 py-2 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-300 transition-colors hover:border-cyan-200/50 hover:text-cyan-100" aria-pressed={systemActive} aria-label="Toggle system mode"><Power className="h-3 w-3" /><span className="hidden sm:inline">System</span></button><a href="mailto:info@viganogabriele.com" data-cursor="hover" className="hidden bg-[#f2f3f5] px-3 py-2 text-[10px] font-semibold text-black sm:inline-block">Let’s talk</a><button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex h-8 w-8 items-center justify-center border border-white/[0.1] text-zinc-200 lg:hidden" aria-label="Toggle navigation" aria-expanded={open}>{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div>
        </div>
      </div>
      <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reduced ? 0 : dur.micro }} className="mt-2 border border-white/[0.09] bg-[#080a0e]/95 p-2 backdrop-blur-xl lg:hidden">{navItems.map((item) => <a key={item.href} href={item.href} onClick={(event) => go(event, item.href)} className="block px-3 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 hover:bg-white/[0.04] hover:text-white">{item.label}</a>)}</motion.div>}</AnimatePresence>
    </motion.nav>
  </>;
}
