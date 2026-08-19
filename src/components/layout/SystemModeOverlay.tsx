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
const SIGNAL_NODES = Array.from({ length: 8 }, (_, index) => index);

export function SystemModeOverlay({ active, transitionId, safeMode = false, laserEnabled = true }: { active: boolean; transitionId: number; safeMode?: boolean; laserEnabled?: boolean }) {
  const { level } = useMotionProfile();
  const animated = level === "full" && !safeMode;
  const shouldWipe = level !== "static" && laserEnabled;

  // A transition token, rather than an effect-driven boolean, means that a
  // completion callback from an earlier rapid toggle can never hide a newer
  // wipe. This also avoids the synchronous-effect state update lint violation.
  const [completedWipeId, setCompletedWipeId] = useState(0);
  const wipeId = shouldWipe && transitionId > completedWipeId ? transitionId : null;
  const announcement = transitionId > 0 ? active ? "System mode enabled" : "System mode disabled" : "";

  return <>
    <div aria-live="polite" className="sr-only">{announcement}</div>
    <AnimatePresence>
      {wipeId !== null && <div key={wipeId} data-system-wipe aria-hidden className="system-mode-wipe-container pointer-events-none fixed inset-0 z-[80]"><m.div initial={{ y: "-100%" }} animate={{ y: "100%" }} transition={{ duration: dur.mode, ease: ease.cinematic }} onAnimationComplete={() => setCompletedWipeId((completed) => Math.max(completed, wipeId))} className="system-mode-wipe absolute inset-0" /></div>}
    </AnimatePresence>
    <AnimatePresence>
      {active && <m.div key="sys-overlay" initial={animated ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: animated ? 0.22 : 0 }} aria-hidden className={cn("system-overlay pointer-events-none fixed inset-0 z-[45]", safeMode && "system-overlay-safe", animated && "system-overlay-animated")}>
        <div className="sys-overlay-glow absolute inset-0" />
        {!safeMode && <>
          <div className="absolute inset-0 sys-grid-overlay opacity-30 sm:opacity-55" />
          <div className="sys-scan-beam absolute inset-x-0" />
          <div className="sys-orbit-field sys-orbit-field-primary absolute" data-system-orbit>
            <span className="sys-orbit-ring sys-orbit-ring-outer" />
            <span className="sys-orbit-ring sys-orbit-ring-inner" />
            <span className="sys-orbit-core" />
          </div>
          <div className="sys-orbit-field sys-orbit-field-secondary absolute">
            <span className="sys-orbit-ring sys-orbit-ring-outer" />
            <span className="sys-orbit-ring sys-orbit-ring-inner" />
            <span className="sys-orbit-core" />
          </div>
          <div className="sys-signal-field absolute inset-0">
            {SIGNAL_NODES.map((index) => <span key={index} className="sys-signal-node" />)}
          </div>
        </>}
        {CORNER_POS.map((corner, index) => <m.span key={corner.key} initial={animated ? { opacity: 0, scale: 0.5 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: animated ? index * 0.05 : 0, duration: animated ? 0.3 : 0 }} className={cn("absolute hidden h-10 w-10 border-accent/70 sm:block", corner.cls)} />)}
      </m.div>}
    </AnimatePresence>
  </>;
}
