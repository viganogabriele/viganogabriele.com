/* eslint-disable react-refresh/only-export-components */
import { animate, m, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/cn";
import { ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";

interface ParsedValue {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  grouped: boolean;
}

const NUMERIC = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/;

export function parseCountValue(raw: string): ParsedValue | null {
  const match = raw.match(NUMERIC);
  if (!match) return null;
  const [, prefix, numeric, suffix] = match;
  const grouped = numeric.includes(",");
  const dot = numeric.indexOf(".");
  const decimals = dot === -1 ? 0 : numeric.length - dot - 1;
  const target = Number(numeric.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  return { prefix, suffix, target, decimals, grouped };
}

function formatNumber(value: number, decimals: number, grouped: boolean) {
  const fixed = value.toFixed(decimals);
  if (!grouped) return fixed;
  const [int, frac] = fixed.split(".");
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${withCommas}.${frac}` : withCommas;
}

export function CountUp({
  value,
  className,
  duration = 1.4,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const parsed = parseCountValue(value);
  const reduced = useReducedMotion();
  const { level } = useMotionProfile();
  const allowMotion = !reduced && level !== "static" && parsed !== null;

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    parsed
      ? parsed.prefix + formatNumber(v, parsed.decimals, parsed.grouped) + parsed.suffix
      : value,
  );
  const started = useRef(false);

  useEffect(() => {
    if (!allowMotion || !parsed || !inView || started.current) return;
    started.current = true;
    const controls = animate(count, parsed.target, { duration, ease: ease.cinematic });
    return () => controls.stop();
  }, [allowMotion, parsed, inView, count, duration]);

  if (!parsed || !allowMotion) {
    return <span className={cn("tabular-nums", className)}>{value}</span>;
  }

  return (
    <span ref={ref} className={cn("relative inline-block tabular-nums", className)}>
      {/* Invisible twin reserves final width so the counter never reflows. */}
      <span aria-hidden="true" style={{ visibility: "hidden" }}>{value}</span>
      {/* Animated overlay — out of flow, contributes no width. */}
      <m.span aria-hidden="true" className="absolute inset-0">
        {display as unknown as React.ReactNode}
      </m.span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
