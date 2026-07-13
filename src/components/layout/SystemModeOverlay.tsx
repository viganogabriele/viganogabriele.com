import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";
import { dur, ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { cn } from "../../lib/cn";

const CORNER_POS = [
  { key: "tl", cls: "left-6 top-6 border-l-2 border-t-2" },
  { key: "tr", cls: "right-6 top-6 border-r-2 border-t-2" },
  { key: "bl", cls: "bottom-6 left-6 border-b-2 border-l-2" },
  { key: "br", cls: "bottom-6 right-6 border-b-2 border-r-2" },
];

export function SystemModeOverlay({ active, transitionId, safeMode = false }: { active: boolean; transitionId: number; safeMode?: boolean }) {
  const { level } = useMotionProfile();
  const animated = level === "full" && !safeMode;
  const shouldWipe = level !== "static" && !safeMode;

  // A transition token, rather than an effect-driven boolean, means that a
  // completion callback from an earlier rapid toggle can never hide a newer
  // wipe. This also avoids the synchronous-effect state update lint violation.
  const [completedWipeId, setCompletedWipeId] = useState(0);
  const wipeId = shouldWipe && transitionId > completedWipeId ? transitionId : null;
  const announcement = transitionId > 0 ? active ? "System mode enabled" : "System mode disabled" : "";

  return <>
    <div aria-live="polite" className="sr-only">{announcement}</div>
    <AnimatePresence>
      {wipeId !== null && <m.div key={wipeId} data-system-wipe initial={{ y: "-120%" }} animate={{ y: "400%" }} transition={{ duration: dur.mode, ease: ease.cinematic }} onAnimationComplete={() => setCompletedWipeId((completed) => Math.max(completed, wipeId))} aria-hidden className="system-mode-wipe pointer-events-none fixed inset-x-0 top-0 z-[80] h-[28vh]" />}
    </AnimatePresence>
    <AnimatePresence>
      {active && <m.div key="sys-overlay" initial={animated ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: animated ? 0.35 : 0 }} aria-hidden className={cn("system-overlay pointer-events-none fixed inset-0 z-[45]", safeMode && "system-overlay-safe")}>
        {!safeMode && <div className="absolute inset-0 sys-grid-overlay opacity-30 sm:opacity-55" />}
        {CORNER_POS.map((corner, index) => <m.span key={corner.key} initial={animated ? { opacity: 0, scale: 0.5 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: animated ? index * 0.05 : 0, duration: animated ? 0.3 : 0 }} className={cn("absolute hidden h-10 w-10 border-accent/70 sm:block", corner.cls)} />)}
        <m.div initial={animated ? { y: -18, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} className="absolute left-1/2 top-24 hidden -translate-x-1/2 items-center gap-3 border border-accent/35 bg-black/80 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-accent sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-accent" /><span className="whitespace-nowrap">System layer active</span></m.div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap border border-accent/25 bg-background/90 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.18em] text-accent sm:hidden">SYS / violet trace</div>
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.18em] text-accent/70 sm:block">Structure visible · Shift+S to close</div>
      </m.div>}
    </AnimatePresence>
  </>;
}
