import { useEffect, useState } from "react";

export function usePreloader(reducedMotion: boolean | null) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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
      const images = Array.from(document.images)
        .filter((image) => !image.complete)
        .map(
          (image) =>
            new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
        );
      await Promise.all([fonts, ...images, new Promise((resolve) => setTimeout(resolve, 420))]);
      if (!mounted) return;
      cancelAnimationFrame(frame);
      setProgress(100);
      timeout = window.setTimeout(() => mounted && setLoading(false), reducedMotion ? 80 : 360);
    };

    frame = requestAnimationFrame(tick);
    void finish();
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [reducedMotion]);

  return { loading, progress };
}
