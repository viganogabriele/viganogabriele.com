import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { dur, ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function ScrollReveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { level } = useMotionProfile();
  if (level === "static") return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: level === "lite" ? 14 : 22, filter: level === "lite" ? "none" : "blur(3px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: level === "lite" ? 0.45 : dur.reveal, delay, ease: ease.cinematic }}
    >
      {children}
    </motion.div>
  );
}
