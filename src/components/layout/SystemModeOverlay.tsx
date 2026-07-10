import { motion, useReducedMotion } from "framer-motion";

export function SystemModeOverlay({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  return (
    <>
      <div aria-live="polite" className="sr-only">{active ? "System mode enabled" : "System mode disabled"}</div>
      {active && <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.28 }} aria-hidden className="system-overlay fixed inset-0 z-[45] pointer-events-none">
        <div className="absolute bottom-5 left-5 hidden font-mono text-[9px] tracking-[0.14em] text-cyan-100/60 sm:block">SYS.MODE / ON</div>
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 rotate-90 font-mono text-[9px] tracking-[0.14em] text-cyan-100/60 lg:block">COORDINATE GRID / 45.4642 N — 9.1900 E</div>
        <div className="absolute left-4 top-0 h-full w-px bg-cyan-200/20" />
      </motion.div>}
    </>
  );
}
