import { useEffect, useRef } from "react";

type LenisModule = typeof import("lenis");
type LenisInstance = InstanceType<LenisModule["default"]>;

export function useLenis(disabled: boolean) {
  const lenisRef = useRef<LenisInstance | null>(null);

  useEffect(() => {
    if (disabled) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    let disposed = false;
    let frame = 0;
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      const { default: Lenis } = await import("lenis");
      if (disposed) return;

      const lenis = new Lenis({
        duration: 1.0,
        lerp: 0.13,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
      });
      lenisRef.current = lenis;

      const run = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(run);
      };
      frame = requestAnimationFrame(run);
      cleanup = () => {
        cancelAnimationFrame(frame);
        lenis.destroy();
        lenisRef.current = null;
      };
    };

    void setup();
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [disabled]);

  return lenisRef;
}
