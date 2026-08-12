import { useEffect, useRef } from "react";
import { useMotionProfile } from "../../hooks/useMotionProfile";

/**
 * Adapted from ReactBits `BorderGlow` (MIT + Commons Clause).
 * https://reactbits.dev/components/border-glow
 *
 * Two things changed on the way in. The original is a *wrapper* that owns its
 * background, radius and box-shadow, and paints an outer halo at `inset:-40px`.
 * Every surface we want this on — carousel cards, the portrait frame — already
 * has its own border, background and active state, and clips overflow, so the
 * halo would be sliced off and the imposed background would fight the card. It
 * is an absolutely-positioned overlay here instead: drop it inside any
 * `position:relative` element and it lights that element's own edge.
 *
 * The original also called setState on every pointermove, re-rendering the whole
 * subtree at pointer frequency — inside a carousel card that means re-rendering
 * the carousel. This writes CSS custom properties through a ref on a rAF, the
 * way CircularCarousel and CustomCursor already drive their transforms.
 */
export function BorderGlow({ sensitivity = 0.34, coneSpread = 26 }: { sensitivity?: number; coneSpread?: number }) {
  const layer = useRef<HTMLSpanElement>(null);
  const { canUsePointerEffects } = useMotionProfile();

  useEffect(() => {
    const node = layer.current;
    const host = node?.parentElement;
    if (!node || !host) return;

    let frame: number | null = null;
    let pending: { x: number; y: number } | null = null;

    const flush = () => {
      frame = null;
      const point = pending;
      if (!point) return;
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      const dx = point.x - rect.left - halfWidth;
      const dy = point.y - rect.top - halfHeight;

      // Proximity to the edge, 0 at the centre and 1 on the border, measured
      // along the ray through the cursor so it reads the same on every side of
      // a non-square card.
      const reach = Math.min(dx === 0 ? Infinity : halfWidth / Math.abs(dx), dy === 0 ? Infinity : halfHeight / Math.abs(dy));
      const edge = Math.min(Math.max(1 / reach, 0), 1);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

      node.style.setProperty("--glow-angle", `${angle.toFixed(2)}deg`);
      node.style.setProperty("--glow-x", `${(dx + halfWidth).toFixed(1)}px`);
      node.style.setProperty("--glow-y", `${(dy + halfHeight).toFixed(1)}px`);
      node.style.setProperty("--glow-opacity", Math.max(0, (edge - sensitivity) / (1 - sensitivity)).toFixed(3));
    };

    const move = (event: PointerEvent) => {
      pending = { x: event.clientX, y: event.clientY };
      if (frame === null) frame = requestAnimationFrame(flush);
    };
    const leave = () => {
      pending = null;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      node.style.setProperty("--glow-opacity", "0");
    };

    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [sensitivity]);

  // A pointer-driven edge light has nothing to say on a touch screen, and the
  // surfaces it sits on all keep their own border either way.
  if (!canUsePointerEffects) return null;

  return <span ref={layer} aria-hidden className="border-glow" style={{ "--glow-cone": `${coneSpread}%` } as React.CSSProperties} />;
}
