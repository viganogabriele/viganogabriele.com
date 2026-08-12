import { useEffect, useRef } from "react";

export interface PointerFramesOptions {
  /** Resolved inside the effect, so a parent element ref is available by then. */
  target: () => EventTarget | null;
  /** Called at most once per frame with the latest position, and once with null when the pointer leaves. */
  onPoint: (point: { x: number; y: number } | null) => void;
  enabled?: boolean;
}

/**
 * Pointer position at frame rate. `pointermove` fires far more often than the
 * display refreshes, and both the edge light and the specular rim only want the
 * newest position per frame — reacting to every event re-runs layout reads for
 * frames that never paint.
 */
export function usePointerFrames({ target, onPoint, enabled = true }: PointerFramesOptions) {
  const handler = useRef(onPoint);
  const resolve = useRef(target);

  // Declared before the listener effect so the freshest callbacks are in place
  // by the time it runs, without writing to a ref during render.
  useEffect(() => {
    handler.current = onPoint;
    resolve.current = target;
  });

  useEffect(() => {
    if (!enabled) return;
    const node = resolve.current();
    if (!node) return;

    let frame: number | null = null;
    let pending: { x: number; y: number } | null = null;

    const flush = () => {
      frame = null;
      if (pending) handler.current(pending);
    };
    const move = (event: Event) => {
      const { clientX, clientY } = event as PointerEvent;
      pending = { x: clientX, y: clientY };
      if (frame === null) frame = requestAnimationFrame(flush);
    };
    const leave = () => {
      pending = null;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      handler.current(null);
    };

    node.addEventListener("pointermove", move, { passive: true });
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [enabled]);
}
