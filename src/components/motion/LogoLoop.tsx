import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { stackLogos } from "../../data/stackLogos";

/**
 * Adapted from ReactBits `LogoLoop` (MIT + Commons Clause).
 * https://reactbits.dev/animations/logo-loop
 *
 * Trimmed to what this site uses: one horizontal track of inline marks. The
 * upstream vertical mode, image branch, renderItem hook and hover-scale are
 * gone, along with its `dark:` fade colour — the theme here is unconditionally
 * dark, so that variant never resolved and the fade edge would have blended
 * toward white. It also ran its rAF for the life of the page; this one parks
 * when the strip is off-screen or the tab is hidden.
 *
 * Kept from upstream: measuring one sequence and duplicating it enough times to
 * cover the container, then translating modulo the sequence width so the wrap
 * is seamless, and easing velocity toward the target rather than snapping.
 */

const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
const COPY_HEADROOM = 2;
const SPEED = 26;
const HOVER_SPEED = 8;

export function LogoLoop({ className = "" }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const sequence = useRef<HTMLUListElement>(null);
  const [sequenceWidth, setSequenceWidth] = useState(0);
  const [copies, setCopies] = useState(MIN_COPIES);
  const [hovered, setHovered] = useState(false);

  const measure = useCallback(() => {
    const width = sequence.current?.getBoundingClientRect().width ?? 0;
    if (width <= 0) return;
    setSequenceWidth(Math.ceil(width));
    const visible = container.current?.clientWidth ?? 0;
    setCopies(Math.max(MIN_COPIES, Math.ceil(visible / width) + COPY_HEADROOM));
  }, []);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    // ResizeObserver delivers an initial observation for every element it is
    // given, so the first measurement arrives without calling it here — which
    // would be a setState directly inside the effect.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (sequence.current) observer.observe(sequence.current);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const node = track.current;
    const host = container.current;
    if (!node || !host || sequenceWidth <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    let frame: number | null = null;
    let last: number | null = null;
    let offset = 0;
    let velocity = 0;
    let onScreen = true;

    const tick = (now: number) => {
      if (last === null) last = now;
      const delta = Math.max(0, now - last) / 1000;
      last = now;
      const target = hovered ? HOVER_SPEED : SPEED;
      velocity += (target - velocity) * (1 - Math.exp(-delta / SMOOTH_TAU));
      offset = (((offset + velocity * delta) % sequenceWidth) + sequenceWidth) % sequenceWidth;
      node.style.transform = `translate3d(${-offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (frame === null && onScreen && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const park = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      last = null;
    };

    const observer = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      if (onScreen) run(); else park();
    }, { threshold: 0 });
    observer.observe(host);
    const onVisibility = () => { if (document.hidden) park(); else run(); };
    document.addEventListener("visibilitychange", onVisibility);
    run();

    return () => {
      park();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sequenceWidth, hovered]);

  const lists = useMemo(() => Array.from({ length: copies }, (_, copy) => (
    <ul
      key={copy}
      ref={copy === 0 ? sequence : undefined}
      aria-hidden={copy > 0}
      className="flex shrink-0 items-center gap-10 pr-10"
    >
      {stackLogos.map((logo) => (
        <li key={logo.label} className="flex shrink-0 items-center gap-2.5 text-zinc-600 transition-colors duration-300 hover:text-accent">
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0 fill-current"><path d={logo.path} /></svg>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] whitespace-nowrap">{logo.label}</span>
        </li>
      ))}
    </ul>
  )), [copies]);

  return (
    <div
      ref={container}
      className={`logo-loop relative overflow-hidden ${className}`}
      role="region"
      aria-label="Tools in regular use"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={track} className="flex h-full w-max items-center will-change-transform motion-reduce:transform-none">
        {lists}
      </div>
    </div>
  );
}
