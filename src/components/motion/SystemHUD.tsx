import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ease } from "../../lib/motion";

const SECTIONS: { id: string; label: string }[] = [
  { id: "top", label: "00 / HERO" },
  { id: "about", label: "01 / ABOUT" },
  { id: "expertise", label: "02 / CAPABILITIES" },
  { id: "projects", label: "03 / PROJECTS" },
  { id: "stack", label: "04 / TOOLKIT" },
  { id: "journey", label: "05 / JOURNEY" },
];

function buildBar(pct: number) {
  const filled = Math.round(Math.min(100, Math.max(0, pct)) / 10);
  return "▓".repeat(filled) + "░".repeat(10 - filled);
}

function viewportLabel() {
  return `${window.innerWidth} × ${window.innerHeight} · ×${window.devicePixelRatio}`;
}

export function SystemHUD({ active }: { active: boolean }) {
  const { canUsePointerEffects, isCompact, level } = useMotionProfile();
  const [cur, setCur] = useState({ x: 0, y: 0 });
  const [scrollPct, setScrollPct] = useState(0);
  const [section, setSection] = useState("00 / HERO");
  const [env, setEnv] = useState("");
  const visible = active && canUsePointerEffects && !isCompact;
  const animated = level === "full";

  useEffect(() => {
    if (!visible) return;

    let metricFrame = 0;
    let cursorFrame = 0;
    let latestCursor: { x: number; y: number } | null = null;

    const updateMetrics = () => {
      metricFrame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const nextScrollPct = total > 0 ? Math.round((window.scrollY / total) * 100) : 0;
      const probe = window.innerHeight * 0.38;
      let nextSection = "00 / HERO";

      for (const item of [...SECTIONS].reverse()) {
        const element = document.getElementById(item.id);
        const top = element?.getBoundingClientRect().top;
        if (top !== undefined && top <= probe) {
          nextSection = item.label;
          break;
        }
      }

      setScrollPct((current) => current === nextScrollPct ? current : nextScrollPct);
      setSection((current) => current === nextSection ? current : nextSection);
      const nextEnv = viewportLabel();
      setEnv((current) => current === nextEnv ? current : nextEnv);
    };

    const scheduleMetrics = () => {
      if (!metricFrame) metricFrame = requestAnimationFrame(updateMetrics);
    };
    const onMove = (event: MouseEvent) => {
      latestCursor = { x: event.clientX, y: event.clientY };
      if (cursorFrame) return;
      cursorFrame = requestAnimationFrame(() => {
        cursorFrame = 0;
        if (latestCursor) setCur(latestCursor);
      });
    };

    scheduleMetrics();
    document.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", scheduleMetrics, { passive: true });
    window.addEventListener("resize", scheduleMetrics, { passive: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", scheduleMetrics);
      window.removeEventListener("resize", scheduleMetrics);
      if (metricFrame) cancelAnimationFrame(metricFrame);
      if (cursorFrame) cancelAnimationFrame(cursorFrame);
    };
  }, [visible]);

  const px = String(cur.x).padStart(4, "0");
  const py = String(cur.y).padStart(4, "0");
  const pct = String(scrollPct).padStart(3, "0");

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          aria-hidden="true"
          className="sys-hud"
          initial={animated ? { opacity: 0, x: 16 } : false}
          animate={{ opacity: 1, x: 0 }}
          exit={animated ? { opacity: 0, x: 16 } : undefined}
          transition={{ duration: animated ? 0.35 : 0, ease: ease.softSettle }}
        >
          <div className="sys-hud-header">
            <span>SYS / ONLINE</span>
            <span className="sys-hud-dot">●</span>
          </div>
          <div className="sys-hud-divider">────────────────</div>
          <div className="sys-hud-row">
            <span>CUR</span>
            <span>X:{px} Y:{py}</span>
          </div>
          <div className="sys-hud-row">
            <span>SCR</span>
            <span>{pct}% {buildBar(scrollPct)}</span>
          </div>
          <div className="sys-hud-row">
            <span>SEC</span>
            <span>{section}</span>
          </div>
          <div className="sys-hud-row">
            <span>ENV</span>
            <span>{env}</span>
          </div>
          <div className="sys-hud-divider">────────────────</div>
          <div className="sys-hud-trace">
            TRACING<span className="sys-hud-blink">_</span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
