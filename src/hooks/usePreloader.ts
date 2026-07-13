import { useEffect, useState } from "react";

const PRELOADED_KEY = "gv-preloaded";

function hasPreloaded() {
  try {
    return window.sessionStorage.getItem(PRELOADED_KEY) === "1";
  } catch {
    return false;
  }
}

function markPreloaded() {
  try {
    window.sessionStorage.setItem(PRELOADED_KEY, "1");
  } catch {
    // Storage can be unavailable in private or embedded browsing contexts.
  }
}

export function usePreloader(reducedMotion: boolean | null) {
  const [loading, setLoading] = useState(() => !reducedMotion && !hasPreloaded());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) return;
    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setLoading(false));
      return () => cancelAnimationFrame(frame);
    }
    let frame = 0;
    let mounted = true;
    let amount = 0;
    let timeout = 0;

    const tick = () => {
      amount = Math.min(92, amount + (92 - amount) * 0.08 + 0.35);
      if (mounted) setProgress(amount);
      if (amount < 91.8) frame = requestAnimationFrame(tick);
    };

    const finish = async () => {
      const fonts = document.fonts?.ready ?? Promise.resolve();
      const hero = document.querySelector<HTMLImageElement>("[data-hero-portrait]");
      const image = !hero ? Promise.resolve() : hero.complete ? hero.decode?.().catch(() => undefined) : new Promise<void>((resolve) => {
        hero?.addEventListener("load", () => resolve(), { once: true });
        hero?.addEventListener("error", () => resolve(), { once: true });
      });
      const ready = Promise.all([fonts, image ?? Promise.resolve()]);
      const fallback = new Promise<void>((resolve) => { timeout = window.setTimeout(resolve, 3000); });
      await Promise.race([ready, fallback]);
      if (!mounted) return;
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      setProgress(100);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!mounted) return;
          markPreloaded();
          setLoading(false);
        });
      });
    };

    frame = requestAnimationFrame(tick);
    void finish();
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [loading, reducedMotion]);

  return { loading, progress };
}
