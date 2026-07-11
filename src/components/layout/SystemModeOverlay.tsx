import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";

const HEX = "0123456789ABCDEF";
const genLine = () => Array.from({ length: 8 }, () => HEX[Math.floor(Math.random() * 16)]).join("");
const genBlock = () => Array.from({ length: 10 }, genLine);

const FLOATING_TAGS = [
  { text: "0x7FE3.A1", top: "18%", left: "12%", color: "text-cyan-400/70" },
  { text: "NODE.OK", top: "62%", left: "8%", color: "text-emerald-300/70" },
  { text: "PING 8ms", top: "28%", left: "82%", color: "text-cyan-400/70" },
  { text: "SYNC.42", top: "72%", left: "86%", color: "text-fuchsia-300/70" },
  { text: "RX 128 KB/s", top: "42%", left: "6%", color: "text-amber-200/70" },
  { text: "CHK.OK", top: "82%", left: "48%", color: "text-cyan-400/70" },
];

const CORNER_POS = [
  { key: "tl", cls: "left-6 top-6 border-l-2 border-t-2" },
  { key: "tr", cls: "right-6 top-6 border-r-2 border-t-2" },
  { key: "bl", cls: "bottom-6 left-6 border-b-2 border-l-2" },
  { key: "br", cls: "bottom-6 right-6 border-b-2 border-r-2" },
];

export function SystemModeOverlay({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [stream, setStream] = useState<string[]>(genBlock);

  useEffect(() => {
    if (!active || reduced) return;
    const id = setInterval(() => setStream(genBlock()), 320);
    return () => clearInterval(id);
  }, [active, reduced]);

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {active ? "System mode enabled" : "System mode disabled"}
      </div>
      <AnimatePresence>
        {active && (
          <motion.div
            key="sys-overlay"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
            aria-hidden
            className="system-overlay pointer-events-none fixed inset-0 z-[45]"
          >
            {/* Full-page dot grid */}
            <div className="absolute inset-0 sys-grid-overlay opacity-70" />

            {/* Radial burst rings — one-shot on activation */}
            {!reduced &&
              [0, 0.18, 0.36].map((delay, i) => (
                <motion.span
                  key={`ring-${i}`}
                  initial={{ scale: 0, opacity: 0.55 }}
                  animate={{ scale: 6, opacity: 0 }}
                  transition={{ duration: 1.6, delay, ease: "easeOut" }}
                  className={cn(
                    "absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
                    i === 1 ? "border-fuchsia-400/60" : "border-cyan-400/60",
                  )}
                />
              ))}

            {/* One-shot scan sweep */}
            {!reduced && (
              <motion.div
                key="sweep"
                initial={{ y: "-25%", opacity: 0.7 }}
                animate={{ y: "125vh", opacity: 0 }}
                transition={{ duration: 1.4, ease: "linear" }}
                className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
              />
            )}

            {/* Corner HUD brackets */}
            {CORNER_POS.map((c, i) => (
              <motion.span
                key={c.key}
                initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28 + i * 0.06, duration: 0.4 }}
                className={cn("absolute h-10 w-10 border-cyan-400/80", c.cls)}
              />
            ))}

            {/* Top status HUD — max-width prevents overlap with corner brackets */}
            <motion.div
              initial={reduced ? false : { y: -22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="absolute left-1/2 top-24 flex max-w-[calc(100%-8rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 border border-cyan-400/40 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100 backdrop-blur-sm sm:gap-3 sm:px-4"
            >
              <motion.span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="whitespace-nowrap">SYSTEM MODE</span>
              <span className="text-cyan-400/50">//</span>
              <span className="text-cyan-100/70">ONLINE</span>
              <span className="hidden text-cyan-400/50 sm:inline">·</span>
              <span className="hidden whitespace-nowrap text-fuchsia-300/80 sm:inline">45.4642 N — 9.1900 E</span>
            </motion.div>

            {/* Left data-stream column */}
            <div className="absolute left-6 top-1/3 hidden max-h-64 overflow-hidden font-mono text-[9px] leading-relaxed text-cyan-400/40 md:block">
              {stream.map((line, i) => (
                <div key={`${i}-${line}`} style={{ opacity: 1 - i * 0.09 }}>
                  {line}
                </div>
              ))}
            </div>

            {/* Right vertical rail — pinned to lower half so it doesn't reach top-right bracket */}
            <div className="pointer-events-none absolute bottom-24 right-8 hidden origin-bottom-right -rotate-90 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.24em] text-cyan-100/50 lg:block">
              CHAN 03 · UPTIME OK
            </div>

            {/* Bottom status */}
            <motion.div
              initial={reduced ? false : { x: -18, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.4 }}
              className="absolute bottom-5 left-24 hidden font-mono text-[9px] tracking-[0.14em] text-cyan-100/60 sm:block"
            >
              SYS.MODE / ON · SCAN ACTIVE · SHIFT+S TO EXIT
            </motion.div>

            {/* Floating hex tags — soft pulsing */}
            {!reduced &&
              FLOATING_TAGS.map((tag, i) => (
                <motion.span
                  key={tag.text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0.9, 0] }}
                  transition={{
                    duration: 3.2,
                    delay: 0.6 + i * 0.35,
                    repeat: Infinity,
                    repeatDelay: 2 + (i % 3),
                    ease: "easeInOut",
                  }}
                  style={{ top: tag.top, left: tag.left }}
                  className={cn(
                    "absolute font-mono text-[9px] uppercase tracking-[0.22em]",
                    tag.color,
                  )}
                >
                  {tag.text}
                </motion.span>
              ))}

            {/* Left cyan rail */}
            <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-200/25 to-transparent" />
            <div className="absolute right-4 top-0 h-full w-px bg-gradient-to-b from-transparent via-fuchsia-300/25 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
