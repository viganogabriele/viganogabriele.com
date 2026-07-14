import { useEffect, useState } from "react";

const MINIMUM_VISIBLE_MS = 300;
const ASSET_TIMEOUT_MS = 3000;

export function usePreloader(enabled: boolean, reducedMotion: boolean) {
  const [loading, setLoading] = useState(enabled);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled || !loading) return;
    let frame = 0;
    let mounted = true;
    let amount = 0;
    let assetTimeout = 0;
    let minimumTimeout = 0;
    let completionFrame = 0;
    let removalFrame = 0;

    const tick = () => {
      amount = Math.min(92, amount + (92 - amount) * 0.08 + 0.35);
      if (mounted) setProgress(amount);
      if (amount < 91.8) frame = requestAnimationFrame(tick);
    };

    const finish = async () => {
      const fonts = document.fonts?.ready ?? Promise.resolve();
      const hero = document.querySelector<HTMLImageElement>("[data-hero-portrait]");
      // `complete` means the browser has finished loading the image. Calling
      // `decode()` again can remain pending in Firefox even for a cached AVIF,
      // unnecessarily forcing the three-second safety timeout on reload.
      const image = !hero || hero.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        hero?.addEventListener("load", () => resolve(), { once: true });
        hero?.addEventListener("error", () => resolve(), { once: true });
      });
      const ready = Promise.all([fonts, image ?? Promise.resolve()]);
      const fallback = new Promise<void>((resolve) => { assetTimeout = window.setTimeout(resolve, ASSET_TIMEOUT_MS); });
      const minimum = new Promise<void>((resolve) => { minimumTimeout = window.setTimeout(resolve, MINIMUM_VISIBLE_MS); });
      await Promise.all([Promise.race([ready, fallback]), minimum]);
      if (!mounted) return;
      window.clearTimeout(assetTimeout);
      window.clearTimeout(minimumTimeout);
      cancelAnimationFrame(frame);
      setProgress(100);
      completionFrame = requestAnimationFrame(() => {
        removalFrame = requestAnimationFrame(() => {
          if (!mounted) return;
          setLoading(false);
        });
      });
    };

    if (!reducedMotion) frame = requestAnimationFrame(tick);
    void finish();
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(completionFrame);
      cancelAnimationFrame(removalFrame);
      window.clearTimeout(assetTimeout);
      window.clearTimeout(minimumTimeout);
    };
  }, [enabled, loading, reducedMotion]);

  return { loading, progress };
}
