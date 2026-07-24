import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Menu, Power, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo-dark-small.webp";
import { navItems } from "../../data/nav";
import { profile } from "../../data/profile";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { cn } from "../../lib/cn";
import { dur, ease } from "../../lib/motion";

export function Navbar({ onNavigate, systemActive, onToggleSystem }: { onNavigate: (target: string) => void; systemActive: boolean; onToggleSystem: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#about");
  const { isTelegramWebView, hasNoHover } = useFeatureDetect();
  const { level } = useMotionProfile();
  const reduced = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
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
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstLink = navRef.current?.querySelector<HTMLElement>("#mobile-navigation a");
    requestAnimationFrame(() => firstLink?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(navRef.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? []).filter((node) => !node.hasAttribute("disabled"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  const go = (event: React.MouseEvent<HTMLElement>, target: string) => {
    event.preventDefault(); setOpen(false); setActive(target);
    onNavigate(target);
  };
  // backdrop-filter forces the browser to re-sample everything scrolling
  // underneath this fixed bar on every frame — proven (profiled under CPU
  // throttling) to be a major source of mobile scroll jank. Touch devices
  // get the same opaque, blur-free treatment already used for lite/Telegram.
  const noBlur = isTelegramWebView || level === "lite" || hasNoHover;
  const glass = noBlur ? "rgba(8,11,22,0.94)" : scrolled ? "rgba(8,11,22,0.78)" : "rgba(8,11,22,0.52)";
  return <>
    <m.nav ref={navRef} aria-label="Primary navigation" initial={reduced ? false : { y: -36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: ease.cinematic, delay: 0.12 }} className="safe-nav fixed left-1/2 top-3 z-[60] w-[calc(100%-1.25rem)] max-w-6xl -translate-x-1/2 sm:top-6 sm:w-[calc(100%-2rem)]">
      <div className="border border-white/[0.09] px-2 py-1.5 sm:px-4 sm:py-2" style={{ background: glass, backdropFilter: noBlur ? "none" : "blur(22px)", WebkitBackdropFilter: noBlur ? "none" : "blur(22px)" }}>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={(event) => go(event, "body")} data-cursor="hover" className="flex h-11 w-11 items-center justify-center" aria-label="Back to top"><img src={logo} alt="Gabriele Viganò" width="160" height="134" className="h-5 w-auto invert" /></button>
          <div className="hidden items-center gap-1 lg:flex">{navItems.map((item) => <a key={item.href} href={item.href} onClick={(event) => go(event, item.href)} data-cursor="hover" className={cn("relative px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors", active === item.href ? "text-white" : "text-zinc-500 hover:text-zinc-200")}><span className={cn("absolute bottom-0 left-3 right-3 h-px bg-accent transition-opacity", active === item.href ? "opacity-100" : "opacity-0")} />{item.label}</a>)}</div>
          <div className="flex items-center gap-1.5 sm:gap-2"><div className="relative"><AnimatePresence>{systemActive && level === "full" && <m.span key="ring" className="pointer-events-none absolute inset-[-3px] rounded-sm border border-accent/70" initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.55, opacity: 0 }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }} />}</AnimatePresence><button type="button" onClick={onToggleSystem} onPointerUp={(e) => { if (e.pointerType !== "mouse") e.currentTarget.blur(); }} data-cursor="hover" className={cn("nav-sys-btn relative inline-flex h-11 min-w-[4.25rem] items-center justify-center gap-2 border px-2.5 font-mono text-[9px] uppercase tracking-[0.13em] transition-colors", systemActive ? "border-accent/60 text-accent" : "border-white/[0.1] text-zinc-300")} aria-pressed={systemActive} aria-label="Toggle system mode" aria-keyshortcuts="Shift+S"><Power className={cn("h-3 w-3 transition-colors", systemActive ? "text-accent" : "")} /><span>SYS</span></button></div><a href={`mailto:${profile.email}`} data-cursor="hover" className="hidden min-h-11 items-center bg-bone px-3 text-[10px] font-semibold text-[#080b16] sm:inline-flex">Contact</a><button ref={menuButtonRef} type="button" onClick={() => setOpen((value) => !value)} data-cursor="hover" className="inline-flex h-11 w-11 items-center justify-center border border-white/[0.1] text-zinc-200 lg:hidden" aria-label="Toggle navigation" aria-controls="mobile-navigation" aria-expanded={open}>{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div>
        </div>
      </div>
      <AnimatePresence>{open && <m.div id="mobile-navigation" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reduced ? 0 : dur.micro }} className="mt-2 border border-white/[0.09] bg-surface/98 p-2 lg:hidden">{navItems.map((item) => <a key={item.href} href={item.href} onClick={(event) => go(event, item.href)} className="flex min-h-12 items-center px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 hover:bg-white/[0.04] hover:text-white">{item.label}</a>)}</m.div>}</AnimatePresence>
    </m.nav>
  </>;
}
