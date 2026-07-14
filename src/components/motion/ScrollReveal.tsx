import { m } from "framer-motion";
import type { ReactNode } from "react";
import { dur, ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function ScrollReveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { level } = useMotionProfile();
  // Reduced-motion: keep a gentle opacity-only reveal (no translation/blur)
  // so the scroll-in still reads as intentional without triggering motion sensitivity.
  if (level === "static") {
    return (
      <m.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      >
        {children}
      </m.div>
    );
  }
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: level === "lite" ? 14 : 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: level === "lite" ? 0.45 : dur.reveal, delay, ease: ease.cinematic }}
    >
      {children}
    </m.div>
  );
}
