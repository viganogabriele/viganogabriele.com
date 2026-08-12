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
  stagger = 0.035,
  by = "word",
  className = "",
  as: Tag = "p",
  id,
}: {
  text: string;
  trigger?: boolean;
  delay?: number;
  stagger?: number;
  /** "char" is for short headings: two words stagger away in 70ms and read as no animation at all. */
  by?: "word" | "char";
  className?: string;
  as?: "p" | "h1" | "h2";
  id?: string;
}) {
  const { level, prefersReducedMotion } = useMotionProfile();
  const parts = useMemo(() => (by === "char" ? [...text] : text.split(/(\s+)/)), [text, by]);

  if (prefersReducedMotion || level === "static") {
    return <Tag id={id} className={className}>{text}</Tag>;
  }

  const lite = level === "lite";
  // The pieces are inline-block so they can be transformed, and browsers insert
  // a word break between inline-block boxes when computing an accessible name —
  // per character that turns a heading into "C u r r i c u l u m". The label
  // states the real string and the pieces are hidden from the tree.
  return (
    <Tag id={id} className={className} aria-label={text}>
      {parts.map((part, index) =>
        part.trim().length === 0 ? (
          <span key={index} aria-hidden>{part}</span>
        ) : (
          <m.span
            key={index}
            aria-hidden
            className="inline-block whitespace-pre-line"
            initial={{ opacity: 0, y: lite ? 12 : 20, filter: lite ? "none" : "blur(3px)" }}
            animate={trigger ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: lite ? 12 : 20, filter: lite ? "none" : "blur(3px)" }}
            transition={{ duration: 0.65, delay: delay + index * stagger, ease: ease.cinematic }}
          >
            {part}
          </m.span>
        ),
      )}
    </Tag>
  );
}
