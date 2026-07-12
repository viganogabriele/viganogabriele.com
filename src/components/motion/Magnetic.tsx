import { m, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import type { ReactElement } from "react";

export function Magnetic({ children, strength = 0.22 }: { children: ReactElement; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 16, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 180, damping: 16, mass: 0.45 });
  return (
    <m.div
      ref={ref}
      className="inline-block"
      onMouseMove={(event) => {
        if (!ref.current) return;
        const bounds = ref.current.getBoundingClientRect();
        x.set((event.clientX - bounds.left - bounds.width / 2) * strength);
        y.set((event.clientY - bounds.top - bounds.height / 2) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: springX, y: springY }}
    >
      {children}
    </m.div>
  );
}
