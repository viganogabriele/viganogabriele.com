import { m, useInView } from "framer-motion";
import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { dur, ease as easings } from "../../lib/motion";

/**
 * Scroll reveal built on the `useInView` hook + a CONCRETE `animate` target.
 *
 * Framer only applies `initial` (and therefore only reveals) when `animate`
 * resolves to a concrete object. `whileInView`, or `animate={inView ? x : undefined}`,
 * leaves the element permanently visible with no animation — which is why the
 * scroll reveals across the site were not firing. Toggling `animate` between two
 * concrete objects keyed off `useInView` is the pattern that works.
 */

type MotionKeys = keyof typeof REST;
const REST: Record<string, number | string> = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  scaleX: 1,
  filter: "blur(0px)",
};

const TAGS = {
  div: m.div,
  span: m.span,
  p: m.p,
  h2: m.h2,
  h3: m.h3,
  li: m.li,
  ul: m.ul,
  article: m.article,
} as const;

export type RevealTag = keyof typeof TAGS;

export function Reveal({
  children,
  className,
  from = { opacity: 0, y: 18 },
  delay = 0,
  duration = dur.reveal,
  ease = easings.cinematic,
  margin = "-72px",
  as = "div",
  style,
}: {
  children?: ReactNode;
  className?: string;
  from?: Partial<Record<MotionKeys, number | string>>;
  delay?: number;
  duration?: number;
  ease?: readonly number[] | string;
  margin?: string;
  as?: RevealTag;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inView = useInView(ref, { once: true, margin: margin as any });
  const shown: Record<string, number | string> = {};
  for (const key of Object.keys(from)) shown[key] = REST[key] ?? 0;
  const Comp = TAGS[as];
  return (
    <Comp
      ref={ref as never}
      className={className}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={style as any}
      initial={from as never}
      animate={(inView ? shown : from) as never}
      transition={{ duration, delay, ease: ease as never }}
    >
      {children}
    </Comp>
  );
}
