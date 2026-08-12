import { useRef } from "react";
import type { ReactElement } from "react";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { usePointerFrames } from "../../hooks/usePointerFrames";

const PROXIMITY = 260;

/**
 * The light behaviour of ReactBits `SpecularButton`, without the WebGL.
 * https://reactbits.dev/components/specular-button
 *
 * Upstream spins up an `ogl` renderer per button and draws a signed-distance
 * rounded rectangle in a fragment shader, holding a live GL context and a rAF
 * loop for the lifetime of the page. What it actually produces is two specular
 * streaks 180° apart, steering toward the pointer anywhere on the page and
 * fading in with proximity — which is a conic gradient masked to a 1px ring.
 * That is what this draws, for no dependency and no GL context.
 *
 * The rim sits just *outside* the element rather than on it: the primary call
 * to action is filled bone, so a highlight painted on top of it would be
 * invisible. Against the page it reads as light catching the button edge.
 */
export function SpecularRim({ children }: { children: ReactElement }) {
  const host = useRef<HTMLSpanElement>(null);
  const angle = useRef(0);
  const { canUsePointerEffects } = useMotionProfile();

  usePointerFrames({
    enabled: canUsePointerEffects,
    target: () => window,
    onPoint: (point) => {
      const node = host.current;
      if (!node || !point) return;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      // Distance to the button's box, zero anywhere inside it.
      const gapX = Math.max(rect.left - point.x, 0, point.x - rect.right);
      const gapY = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
      const proximity = Math.max(0, 1 - Math.hypot(gapX, gapY) / PROXIMITY);

      // Unwrap the angle so it always takes the short way round: a raw jump
      // from 350deg to 10deg would let the CSS transition run the long way.
      const target = (Math.atan2(point.y - centreY, point.x - centreX) * 180) / Math.PI + 90;
      angle.current += (((target - angle.current) % 360) + 540) % 360 - 180;

      node.style.setProperty("--rim-angle", `${angle.current.toFixed(2)}deg`);
      node.style.setProperty("--rim-opacity", (proximity * proximity * (3 - 2 * proximity)).toFixed(3));
    },
  });

  if (!canUsePointerEffects) return children;

  return (
    <span ref={host} className="specular-rim-host relative inline-flex">
      {children}
      <span aria-hidden className="specular-rim" />
    </span>
  );
}
