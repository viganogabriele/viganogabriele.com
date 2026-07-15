import { m, useInView } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import { dur, ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function ScrollReveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { level } = useMotionProfile();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  // Reduced-motion: opacity-only reveal (no translation).
  if (level === "static") {
    const hidden = { opacity: 0 };
    const shown = { opacity: 1 };
    return (
      <m.div
        ref={ref}
        className={className}
        initial={hidden}
        animate={inView ? shown : hidden}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      >
        {children}
      </m.div>
    );
  }

  const hidden = { opacity: 0, y: level === "lite" ? 14 : 22 };
  const shown = { opacity: 1, y: 0 };
  return (
    <m.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={inView ? shown : hidden}
      transition={{ duration: level === "lite" ? 0.45 : dur.reveal, delay, ease: ease.cinematic }}
    >
      {children}
    </m.div>
  );
}
