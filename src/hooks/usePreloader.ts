import { useEffect, useState } from "react";

export function usePreloader(reducedMotion: boolean | null) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) return;
    let frame = 0;
    let mounted = true;
    let amount = 0;

    const tick = () => {
      amount = Math.min(92, amount + (92 - amount) * 0.08 + 0.35);
      if (mounted) setProgress(amount);
      if (amount < 91.8) frame = requestAnimationFrame(tick);
    };

    const finish = async () => {
      const fonts = document.fonts?.ready ?? Promise.resolve();
      const hero = document.querySelector<HTMLImageElement>("[data-hero-portrait]");
      const image = hero?.complete ? hero.decode?.().catch(() => undefined) : new Promise<void>((resolve) => {
        hero?.addEventListener("load", () => resolve(), { once: true });
        hero?.addEventListener("error", () => resolve(), { once: true });
      });
      await Promise.all([fonts, image ?? Promise.resolve()]);
      if (!mounted) return;
      cancelAnimationFrame(frame);
      setProgress(100);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { if (mounted) setLoading(false); });
      });
    };

    frame = requestAnimationFrame(tick);
    void finish();
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
    };
  }, [loading, reducedMotion]);

  return { loading, progress };
}
