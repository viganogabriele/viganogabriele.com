import { motion } from "framer-motion";
import { ease } from "../../lib/motion";

const year = new Date().getFullYear();

export function Preloader({ progress, reducedMotion }: { progress: number; reducedMotion: boolean | null }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reducedMotion ? "none" : "blur(16px)" }}
      transition={{ duration: 0.45, ease: ease.softSettle }}
      className="fixed inset-0 z-[100] bg-[#050608]"
    >
      {/* Scan lines overlay */}
      <div className="hero-scanlines pointer-events-none absolute inset-0 z-10" />

      {/* Top-left: coordinates */}
      <div className="absolute left-6 top-6 font-mono text-[10px] tracking-[0.18em] text-zinc-600">
        45.4642 N · 9.1900 E
      </div>

      {/* Top-right: system label */}
      <div className="absolute right-6 top-6 font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-600">
        SYSTEM BOOT
      </div>

      {/* Center content */}
      <div className="flex h-full flex-col items-center justify-center">
        {/* Name block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: ease.cinematic }}
          className="flex flex-col items-center text-center"
        >
          <div className="text-5xl font-medium uppercase tracking-tight text-white">GABRIELE</div>
          <div className="text-5xl font-medium uppercase tracking-tight text-zinc-500">VIGANÒ</div>
          <div className="mt-4 font-mono text-[10px] tracking-[0.18em] text-zinc-600">
            portfolio.init / {year}
          </div>
        </motion.div>

        {/* Progress area */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: ease.cinematic }}
          className="mt-16 w-[min(28rem,82vw)]"
        >
          {/* Loading label + counter */}
          <div className="mb-2 flex justify-between font-mono text-[10px] tracking-[0.18em] uppercase">
            <span className="text-zinc-500">LOADING</span>
            <span className="text-cyan-100/60">{String(Math.round(progress)).padStart(3, "0")}</span>
          </div>

          {/* Progress bar */}
          <div className="h-px w-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Segment ticks */}
          <div className="mt-3 flex w-full gap-px">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="h-[3px] flex-1"
                style={{
                  backgroundColor:
                    (i + 1) * 5 <= progress ? "#7FE7FF" : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom-right: version */}
      <div className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.18em] text-zinc-600">
        v1.0
      </div>
    </motion.div>
  );
}
