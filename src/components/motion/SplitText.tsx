import { m } from "framer-motion";
import { useMemo } from "react";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ease } from "../../lib/motion";

/**
 * The per-word reveal the footer heading already uses, as a primitive: each
 * word rises and unblurs on a stagger, whitespace kept as its own node so the
 * text still wraps and reads as one string to a screen reader.
 *
 * Blur is dropped at the "lite" tier — it is the expensive part of the effect —
 * and the whole thing collapses to a plain fade when motion is off.
 */
export function SplitText({
  text,
  trigger = true,
  delay = 0,
  className = "",
  as: Tag = "p",
  id,
}: {
  text: string;
  trigger?: boolean;
  delay?: number;
  className?: string;
  as?: "p" | "h1" | "h2";
  id?: string;
}) {
  const { level, prefersReducedMotion } = useMotionProfile();
  const parts = useMemo(() => text.split(/(\s+)/), [text]);

  if (prefersReducedMotion || level === "static") {
    return <Tag id={id} className={className}>{text}</Tag>;
  }

  const lite = level === "lite";
  return (
    <Tag id={id} className={className}>
      {parts.map((part, index) =>
        part.trim().length === 0 ? (
          <span key={index}>{part}</span>
        ) : (
          <m.span
            key={index}
            className="inline-block whitespace-pre-line"
            initial={{ opacity: 0, y: lite ? 12 : 20, filter: lite ? "none" : "blur(3px)" }}
            animate={trigger ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: lite ? 12 : 20, filter: lite ? "none" : "blur(3px)" }}
            transition={{ duration: 0.65, delay: delay + index * 0.035, ease: ease.cinematic }}
          >
            {part}
          </m.span>
        ),
      )}
    </Tag>
  );
}
