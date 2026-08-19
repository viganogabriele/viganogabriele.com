import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { stackLogos } from "../../data/stackLogos";
import { useMotionProfile } from "../../hooks/useMotionProfile";

/**
 * Adapted from ReactBits `LogoLoop` (MIT + Commons Clause).
 * https://reactbits.dev/animations/logo-loop
 *
 * Trimmed to what this site uses: one horizontal track of inline marks. The
 * upstream vertical mode, image branch and renderItem hook are gone, along
 * with its `dark:` fade colour — the theme here is unconditionally
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
const HOVER_SPEED = 132;
/** Touch has no hover to leave, so a press releases on a timer instead —
 *  long enough to read as a deliberate accelerate-and-grow, short enough that
 *  it can never look stuck if a pointerup/pointercancel is somehow missed. */
const PRESS_MS = 700;

export function LogoLoop({ className = "" }: { className?: string }) {
  const { prefersReducedMotion } = useMotionProfile();
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const sequence = useRef<HTMLUListElement>(null);
  const hovering = useRef(false);
  const touchAccelerated = useRef(false);
  const pressedCount = useRef(0);
  const pressTimers = useRef(new Map<Element, number>());
  const [sequenceWidth, setSequenceWidth] = useState(0);
  const [copies, setCopies] = useState(MIN_COPIES);

  // Imperative, like `hovering`: this runs from pointer events, not React
  // state, so a press can't force a re-render of every duplicated logo copy
  // on every tap.
  const clearPressTimer = useCallback((element: Element) => {
    const timer = pressTimers.current.get(element);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      pressTimers.current.delete(element);
    }
  }, []);

  const releasePress = useCallback((element: Element) => {
    clearPressTimer(element);
    if (!element.classList.contains("logo-loop-item--pressed")) return;
    element.classList.remove("logo-loop-item--pressed");
    pressedCount.current = Math.max(0, pressedCount.current - 1);
    if (pressedCount.current === 0) touchAccelerated.current = false;
  }, [clearPressTimer]);

  const pressItem = useCallback((element: Element) => {
    if (!element.classList.contains("logo-loop-item--pressed")) {
      element.classList.add("logo-loop-item--pressed");
      pressedCount.current += 1;
    }
    touchAccelerated.current = true;
    clearPressTimer(element);
    pressTimers.current.set(element, window.setTimeout(() => releasePress(element), PRESS_MS));
  }, [clearPressTimer, releasePress]);

  useEffect(() => () => {
    for (const timer of pressTimers.current.values()) window.clearTimeout(timer);
    pressTimers.current.clear();
  }, []);

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
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (sequence.current) observer.observe(sequence.current);
    // WebKit can defer the observer's initial delivery while this lazy-loaded
    // strip is scrolled into view. Measure on the next frame as a deterministic
    // fallback, outside the effect body, so Safari does not leave the loop at
    // translateX(0) until the next resize.
    const frame = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    const node = track.current;
    const host = container.current;
    if (!node || !host || sequenceWidth <= 0) return;
    if (prefersReducedMotion) {
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
      const targetSpeed = hovering.current || touchAccelerated.current ? HOVER_SPEED : SPEED;
      velocity += (targetSpeed - velocity) * (1 - Math.exp(-delta / SMOOTH_TAU));
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
  }, [prefersReducedMotion, sequenceWidth]);

  const lists = useMemo(() => Array.from({ length: copies }, (_, copy) => (
    <ul
      key={copy}
      ref={copy === 0 ? sequence : undefined}
      aria-hidden={copy > 0}
      className="logo-loop-sequence flex shrink-0 items-center"
    >
      {stackLogos.map((logo) => (
        <li
          key={logo.label}
          className="logo-loop-item flex shrink-0 items-center text-zinc-500"
          onPointerEnter={(event) => {
            if (event.pointerType !== "mouse") return;
            hovering.current = true;
          }}
          // Touch's equivalent of hover: a tap/press stands in for
          // mouseenter, since there is no hover state to leave once the
          // finger lifts. `pointerdown` never calls preventDefault, so a
          // press that turns into a vertical page scroll is unaffected.
          onPointerDown={(event) => { if (event.pointerType !== "mouse") pressItem(event.currentTarget); }}
          onPointerUp={(event) => { if (event.pointerType !== "mouse") releasePress(event.currentTarget); }}
          onPointerCancel={(event) => { if (event.pointerType !== "mouse") releasePress(event.currentTarget); }}
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 shrink-0 fill-current sm:h-9 sm:w-9"><path d={logo.path} /></svg>
        </li>
      ))}
    </ul>
  )), [copies, pressItem, releasePress]);

  return (
    <div
      ref={container}
      aria-hidden
      onPointerLeave={() => { hovering.current = false; }}
      className={`logo-loop relative select-none overflow-hidden ${className}`}
    >
      <div ref={track} className="flex h-full w-max items-center will-change-transform motion-reduce:transform-none">
        {lists}
      </div>
    </div>
  );
}
