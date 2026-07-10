import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { dur, ease } from "../../lib/motion";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";

export function ScrollReveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  const { isTouch, hasNoHover, isTelegramWebView, isCompact } = useFeatureDetect();
  if (reduced || isTouch || hasNoHover || isTelegramWebView || isCompact) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: dur.reveal, delay, ease: ease.cinematic }}
    >
      {children}
    </motion.div>
  );
}
