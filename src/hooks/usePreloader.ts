import { useEffect, useState } from "react";

export function usePreloader(reducedMotion: boolean | null) {
  const [loading, setLoading] = useState(() => {
    try { return sessionStorage.getItem("gv-preloaded") !== "1"; } catch { return true; }
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) return;
    let frame = 0;
    let timeout = 0;
    let mounted = true;
    let amount = 0;

    const tick = () => {
      amount = Math.min(92, amount + (92 - amount) * 0.08 + 0.35);
      if (mounted) setProgress(amount);
      if (amount < 91.8) frame = requestAnimationFrame(tick);
    };

    const finish = async () => {
      const fonts = document.fonts?.ready ?? Promise.resolve();
      await Promise.race([
        Promise.all([fonts, new Promise((resolve) => setTimeout(resolve, 360))]),
        new Promise((resolve) => setTimeout(resolve, 900)),
      ]);
      if (!mounted) return;
      cancelAnimationFrame(frame);
      setProgress(100);
      try { sessionStorage.setItem("gv-preloaded", "1"); } catch { /* restricted storage */ }
      timeout = window.setTimeout(() => mounted && setLoading(false), reducedMotion ? 40 : 260);
    };

    frame = requestAnimationFrame(tick);
    void finish();
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [loading, reducedMotion]);

  return { loading, progress };
}
