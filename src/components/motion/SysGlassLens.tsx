import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { usePointerFrames } from "../../hooks/usePointerFrames";
import { getLastPointer } from "../../lib/pointerPosition";

/**
 * A glass lens that follows the cursor while SYS mode is on.
 *
 * This is the idea behind ReactBits `FluidGlass` at a cost the site can carry.
 * That component is not really a component — it is the demo page: it mounts its
 * own <Canvas>, wraps the scene in <ScrollControls>, which would take over
 * scrolling from RouteScrollManager in App.tsx, and hard-codes GLB models and
 * demo imagery that do not exist in this repository, on top of three,
 * @react-three/fiber, @react-three/drei and maath. PR #18 removed exactly that
 * toolchain.
 *
 * So the refraction is done the cheap way: backdrop-filter over the SYS grid,
 * with a bright rim and an inner shadow doing the work of the glass edge. Note
 * this is not the SVG feDisplacementMap the plan proposed — `backdrop-filter`
 * does not accept a url() filter reference in Safari or Firefox, so a genuine
 * displacement would have shown glass in Chrome and nothing anywhere else.
 *
 * Mounted only while SYS is active, and only where the site already allows its
 * heavier flourishes.
 */
export function SysGlassLens() {
  const lens = useRef<HTMLDivElement>(null);
  // canUsePointerEffects already means a fine pointer, no touch screen and no
  // reduced-motion request. Requiring level "full" on top of that also demanded
  // four cores and 4GB, which is why the lens never appeared on machines that
  // are perfectly able to draw it.
  const { canUsePointerEffects, isCompact } = useMotionProfile();
  const enabled = canUsePointerEffects && !isCompact;

  // SYS is turned on by pressing a button, so the pointer is already somewhere
  // and typically still. Show the lens there at once instead of waiting for a
  // move that may not come — which made the toggle look like it did nothing.
  useEffect(() => {
    const node = lens.current;
    const point = getLastPointer();
    if (!node || !point) return;
    node.style.translate = `${point.x}px ${point.y}px`;
    node.style.opacity = "1";
  }, [enabled]);

  usePointerFrames({
    enabled,
    target: () => window,
    onPoint: (point) => {
      const node = lens.current;
      if (!node) return;
      if (!point) {
        node.style.opacity = "0";
        return;
      }
      node.style.opacity = "1";
      node.style.translate = `${point.x}px ${point.y}px`;
    },
  });

  if (!enabled) return null;

  return createPortal(
    <div ref={lens} aria-hidden className="sys-glass-lens" />,
    document.body,
  );
}
