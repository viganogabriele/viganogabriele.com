import { lazy, Suspense, useRef } from "react";
import type { ReactNode } from "react";
import { useMotionProfile } from "../../hooks/useMotionProfile";

/**
 * Wrapper for the ReactBits `SpecularButton` light (see SpecularEdgeGL).
 *
 * The GL layer is a separate lazy chunk on purpose. `ogl` is about 15 kB gzip,
 * and the nav's Contact button puts this on every route — imported directly it
 * landed in the shared first-paint bundle, which is exactly the weight PR #18
 * cut. Split out, the button paints immediately and the shader attaches after;
 * nothing is visible until the pointer is near it anyway.
 */
const SpecularEdgeGL = lazy(() => import("./SpecularEdgeGL"));

export function SpecularEdge({ children, className = "", radius = 0 }: { children: ReactNode; className?: string; radius?: number }) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const { canUsePointerEffects } = useMotionProfile();

  if (!canUsePointerEffects) return <>{children}</>;

  return (
    <span ref={hostRef} className={`relative inline-flex ${className}`}>
      {children}
      <Suspense fallback={null}><SpecularEdgeGL hostRef={hostRef} radius={radius} /></Suspense>
    </span>
  );
}
