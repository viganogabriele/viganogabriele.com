import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { ease } from "../../lib/motion";

const SECTIONS: { id: string; label: string }[] = [
  { id: "top",       label: "00 / HERO" },
  { id: "about",     label: "01 / ABOUT" },
  { id: "expertise", label: "02 / CAPABILITIES" },
  { id: "projects",  label: "03 / PROJECTS" },
  { id: "stack",     label: "04 / TOOLKIT" },
  { id: "journey",   label: "05 / JOURNEY" },
];

function buildBar(pct: number) {
  const filled = Math.round(Math.min(100, Math.max(0, pct)) / 10);
  return "▓".repeat(filled) + "░".repeat(10 - filled);
}

export function SystemHUD({ active }: { active: boolean }) {
  const [cur, setCur] = useState({ x: 0, y: 0 });
  const [scrollPct, setScrollPct] = useState(0);
  const [section, setSection] = useState("00 / HERO");
  const [env, setEnv] = useState("");

  useEffect(() => {
    if (!active) return;

    setEnv(`${window.innerWidth} × ${window.innerHeight} · ×${window.devicePixelRatio}`);

    const onMove = (e: MouseEvent) => setCur({ x: e.clientX, y: e.clientY });

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.round((window.scrollY / total) * 100) : 0;
      setScrollPct(pct);

      const probe = window.innerHeight * 0.38;
      for (const sec of [...SECTIONS].reverse()) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= probe) { setSection(sec.label); break; }
      }
    };

    const onResize = () => {
      setEnv(`${window.innerWidth} × ${window.innerHeight} · ×${window.devicePixelRatio}`);
      onScroll();
    };

    onScroll();
    document.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  const px = String(cur.x).padStart(4, "0");
  const py = String(cur.y).padStart(4, "0");
  const pct = String(scrollPct).padStart(3, "0");

  return (
    <AnimatePresence>
      {active && (
        <m.div
          role="status"
          aria-label="System diagnostics"
          className="sys-hud"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.35, ease: ease.softSettle }}
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
