import { AnimatePresence, motion } from "framer-motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { cn } from "../../lib/cn";

const CORNER_POS = [
  { key: "tl", cls: "left-6 top-6 border-l-2 border-t-2" },
  { key: "tr", cls: "right-6 top-6 border-r-2 border-t-2" },
  { key: "bl", cls: "bottom-6 left-6 border-b-2 border-l-2" },
  { key: "br", cls: "bottom-6 right-6 border-b-2 border-r-2" },
];

export function SystemModeOverlay({ active }: { active: boolean }) {
  const { level } = useMotionProfile();
  const animated = level === "full";

  return <><div aria-live="polite" className="sr-only">{active ? "System mode enabled" : "System mode disabled"}</div><AnimatePresence>{active && <motion.div key="sys-overlay" initial={animated ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: animated ? 0.35 : 0 }} aria-hidden className="system-overlay pointer-events-none fixed inset-0 z-[45]"><div className="absolute inset-0 sys-grid-overlay opacity-55" />{animated && [0, 0.16].map((delay, index) => <motion.span key={delay} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 6, opacity: 0 }} transition={{ duration: 1.45, delay, ease: "easeOut" }} className={cn("absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border", index ? "border-violet-400/50" : "border-cyan-400/55")} />)}{animated && <motion.div initial={{ y: "-25%", opacity: 0.55 }} animate={{ y: "125vh", opacity: 0 }} transition={{ duration: 1.2, ease: "linear" }} className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent" />}{CORNER_POS.map((corner, index) => <motion.span key={corner.key} initial={animated ? { opacity: 0, scale: 0.5 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05, duration: 0.3 }} className={cn("absolute h-10 w-10 border-cyan-400/70", corner.cls)} />)}<motion.div initial={animated ? { y: -18, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} className="absolute left-1/2 top-24 flex -translate-x-1/2 items-center gap-3 border border-cyan-400/35 bg-black/80 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-100"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /><span className="whitespace-nowrap">System layer active</span></motion.div><div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.18em] text-cyan-100/55">Structure visible · Shift+S to close</div></motion.div>}</AnimatePresence></>;
}
