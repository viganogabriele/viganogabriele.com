/* eslint-disable react-refresh/only-export-components */
import { animate, useInView, useReducedMotion } from "framer-motion";
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
  /** Pass the parent's inView boolean so the count starts in sync with the parent reveal. */
  trigger,
  /** Delay in seconds before the count starts (match parent stagger delay). */
  delay = 0,
}: {
  value: string;
  className?: string;
  duration?: number;
  trigger?: boolean;
  delay?: number;
}) {
  const parsed = parseCountValue(value);
  const reduced = useReducedMotion();
  const { level } = useMotionProfile();
  const allowMotion = !reduced && level !== "static" && parsed !== null;

  // Own in-view detection used only when the caller doesn't pass a trigger.
  const containerRef = useRef<HTMLSpanElement>(null);
  const ownInView = useInView(containerRef, { once: true, margin: "-40px" });
  const active = trigger !== undefined ? trigger : ownInView;

  const animatedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!allowMotion || !parsed || !active) return;

    const el = animatedRef.current;
    if (!el) return;

    let animControls: { stop: () => void } | null = null;

    const start = () => {
      animControls = animate(0, parsed.target, {
        duration,
        ease: ease.cinematic,
        onUpdate: (v) => {
          el.textContent =
            parsed.prefix +
            formatNumber(v, parsed.decimals, parsed.grouped) +
            parsed.suffix;
        },
        onComplete: () => {
          // Guarantee the exact final string (no floating-point rounding artefact).
          el.textContent = value;
        },
      });
    };

    if (delay > 0) {
      const timer = window.setTimeout(start, delay * 1000);
      return () => {
        clearTimeout(timer);
        animControls?.stop();
      };
    }

    start();
    return () => animControls?.stop();
  }, [allowMotion, parsed, active, duration, delay, value]);

  if (!parsed || !allowMotion) {
    return <span className={cn("tabular-nums", className)}>{value}</span>;
  }

  return (
    <span ref={containerRef} className={cn("relative inline-block tabular-nums", className)}>
      {/* Invisible twin reserves the final width from frame 0 (incl. comma at 1,000). */}
      <span aria-hidden="true" style={{ visibility: "hidden" }}>{value}</span>
      {/* Animated overlay — absolutely positioned, contributes no layout width. */}
      <span ref={animatedRef} aria-hidden="true" className="absolute inset-0">
        {parsed.prefix}0{parsed.suffix}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
