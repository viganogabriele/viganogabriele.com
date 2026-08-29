import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CircularCarouselProps<T> {
  items: readonly T[];
  renderCard: (item: T, index: number, active: boolean) => React.ReactNode;
  getItemLabel: (item: T, index: number) => string;
  ariaLabel: string;
  autoRotateSpeed?: number;
  dragSensitivity?: number;
  momentumStrength?: number;
  pauseDuration?: number;
  snap?: boolean;
  reducedMotion?: boolean;
  radiusScale?: number;
  className?: string;
  previousControlLabel?: string;
  nextControlLabel?: string;
  onActiveIndexChange?: (index: number) => void;
  pauseOnHover?: boolean;
}

const normalizeAngle = (angle: number) => ((angle + 180) % 360 + 360) % 360 - 180;
const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
type SelectionInput = "pointer" | "keyboard";

/**
 * A deliberately DOM-driven 3D ring. React only tracks the active card for
 * accessible text; transforms are written in rAF to keep drag and idle motion
 * out of the render path.
 */
export function CircularCarousel<T>({
  items,
  renderCard,
  getItemLabel,
  ariaLabel,
  autoRotateSpeed = 5,
  dragSensitivity = 0.34,
  momentumStrength = 1.15,
  pauseDuration = 3000,
  snap = true,
  reducedMotion = false,
  radiusScale = 1,
  className = "",
  previousControlLabel = "Show previous skill group",
  nextControlLabel = "Show next skill group",
  onActiveIndexChange,
  pauseOnHover = true,
}: CircularCarouselProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  /** Last non-continuous values written per card — see updateCards. */
  const written = useRef<{ zIndex: number; interactive: boolean; active: boolean }[]>([]);
  const rotation = useRef(0);
  const activeRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastFrame = useRef<number | null>(null);
  const velocity = useRef(0);
  const selectionTarget = useRef<number | null>(null);
  const pauseUntil = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const pointer = useRef<{ id: number; x: number; y: number; time: number; horizontal: boolean } | null>(null);
  const hovering = useRef(false);
  const moveFrame = useRef<number | null>(null);
  /** Set by the gestures a reader performs on purpose, so the live region does
   *  not narrate the idle rotation to a screen reader every few seconds. */
  const deliberate = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [tickerRevision, setTickerRevision] = useState(0);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  // A smaller ring travels a shorter visible arc, so giving it the same
  // duration as the full-radius Toolkit ring made it feel slower. Keep both in
  // one crisp 350–380ms family while preserving a consistent linear feel.
  const pointerSelectionDuration = 300 + 80 * Math.min(1, Math.max(0.65, radiusScale));

  // Call sites pass this inline, so reading it through a ref keeps updateCards
  // stable — it is a dependency of the idle loop, and a new identity on every
  // parent render would tear the loop down and rebuild it mid-rotation.
  const label = useRef(getItemLabel);
  useEffect(() => { label.current = getItemLabel; });

  const updateCards = useCallback(() => {
    const count = items.length;
    if (!count) return;
    const root = rootRef.current;
    const width = root?.clientWidth ?? 0;
    const compact = width < 640;
    // Keep enough radius to expose both neighbouring cards, but retain a
    // deliberate overlap so the cards read as one ring instead of four panels
    // floating apart. `.circular-carousel` clips the compact/mobile edges.
    const ceiling = compact ? 160 : Math.min(360, Math.max(245, width * 0.28));
    const radius = Math.min(ceiling, Math.max(compact ? 132 : 195, width * (compact ? 0.46 : 0.34))) * radiusScale;
    const depth = compact ? 76 : 96;
    const step = 360 / count;
    let nearest = 0;
    let nearestDistance = Infinity;
    for (let index = 0; index < count; index += 1) {
      const distance = Math.abs(normalizeAngle(rotation.current + index * step));
      if (distance < nearestDistance) { nearestDistance = distance; nearest = index; }
    }
    const selected = selectionTarget.current ?? nearest;

    for (let index = 0; index < count; index += 1) {
      const card = cardRefs.current[index];
      if (!card) continue;
      const angle = normalizeAngle(rotation.current + index * step);
      const radians = angle * Math.PI / 180;
      const frontness = (Math.cos(radians) + 1) / 2;
      const x = Math.sin(radians) * radius;
      // Keep the front card on the text-rendering plane. It still reads as the
      // closest card because every other card moves back into negative Z, but
      // avoids the soft rasterisation some browsers apply to positive-Z text.
      const z = (frontness - 1) * depth;
      const scale = (compact ? 0.78 : 0.84) + frontness * (compact ? 0.22 : 0.16);
      const opacity = (compact ? 0.18 : 0.28) + frontness * (compact ? 0.82 : 0.72);
      const rotateY = -Math.sin(radians) * 20;
      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), -50%, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);

      // Stacking order, hit-testing and the active attributes only actually
      // change as the ring crosses a card boundary — a handful of times per
      // revolution. Writing them every frame anyway invalidated style for each
      // card's whole subtree sixty times a second for nothing, and an attribute
      // write cannot be coalesced by the browser the way a transform can.
      const zIndex = index === selected ? 1000 : Math.round(frontness * 100) + (angle > 0 ? 1 : 0);
      const interactive = frontness >= 0.1;
      const active = index === selected;
      const previous = written.current[index];
      if (!previous || previous.zIndex !== zIndex) card.style.zIndex = String(zIndex);
      if (!previous || previous.interactive !== interactive) card.style.pointerEvents = interactive ? "auto" : "none";
      if (!previous || previous.active !== active) {
        card.dataset.active = String(active);
        card.setAttribute("aria-current", active ? "true" : "false");
      }
      written.current[index] = { zIndex, interactive, active };
    }

    if (activeRef.current !== selected) {
      activeRef.current = selected;
      setActiveIndex(selected);
      if (deliberate.current) {
        deliberate.current = false;
        setAnnouncement(`Active card: ${label.current(items[selected], selected)}.`);
      }
      onActiveIndexChange?.(selected);
    }
  }, [items, onActiveIndexChange, radiusScale]);

  // Three drivers write rotation on their own rAF: the idle loop, an explicit
  // selection animation, and the momentum decay after a drag. They share one
  // frame slot, so exactly one may be live at a time. Every start bumps this
  // generation and every tick bails once it no longer matches, which means a
  // driver whose id got overwritten can never keep running behind the one that
  // replaced it — see the guard in the idle effect for what that cost.
  const runRef = useRef(0);

  const stopAnimation = useCallback(() => {
    runRef.current += 1;
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    lastFrame.current = null;
  }, []);

  const animateTo = useCallback((target: number, duration = reducedMotion ? 0 : pointerSelectionDuration, onComplete?: () => void, easing: (t: number) => number = easeOutQuart) => {
    stopAnimation();
    if (duration === 0) {
      rotation.current = target;
      updateCards();
      velocity.current = 0;
      setTickerRevision((revision) => revision + 1);
      onComplete?.();
      return;
    }
    const start = rotation.current;
    const startedAt = performance.now();
    const run = runRef.current;
    const tick = (now: number) => {
      if (run !== runRef.current) return;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easing(progress);
      rotation.current = start + (target - start) * eased;
      updateCards();
      if (progress < 1) frameRef.current = window.requestAnimationFrame(tick);
      else {
        frameRef.current = null;
        velocity.current = 0;
        setTickerRevision((revision) => revision + 1);
        onComplete?.();
      }
    };
    frameRef.current = window.requestAnimationFrame(tick);
  }, [pointerSelectionDuration, reducedMotion, stopAnimation, updateCards]);

  const settle = useCallback(() => {
    if (!snap || !items.length) return;
    const step = 360 / items.length;
    const target = Math.round(rotation.current / step) * step;
    // Momentum has already decayed to a near-zero velocity by the time this
    // runs, so the handoff needs a curve that also starts at zero velocity
    // (ease-in-out) instead of the snappy ease-out used for explicit
    // selection — otherwise the carousel visibly lurches right as it settles.
    animateTo(target, reducedMotion ? 0 : 220, undefined, easeInOutQuad);
  }, [animateTo, items.length, reducedMotion, snap]);

  const pause = useCallback(() => { pauseUntil.current = performance.now() + pauseDuration; }, [pauseDuration]);

  useEffect(() => {
    // The cache above is keyed by index against whatever elements were there
    // last; a different item list means different elements, and a stale entry
    // would suppress the first write to a fresh card.
    written.current = [];
    updateCards();
    const observer = new ResizeObserver(updateCards);
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [updateCards]);

  // The idle-rotation loop below runs every frame indefinitely — pausing it
  // while scrolled off-screen avoids continuous work competing with real
  // scroll compositing (this ran unconditionally before, on every carousel,
  // for as long as the tab was open).
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "200px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  // Unmount stops whichever driver holds the slot. The idle effect's own
  // cleanup deliberately only tears down the loop that same run started, so on
  // its own it leaves a selection animation or a momentum decay begun after it
  // still running — up to a couple of seconds of frames writing transforms to
  // a torn-down tree. This is unconditional, so nothing outlives the component.
  useEffect(() => () => {
    if (moveFrame.current !== null) window.cancelAnimationFrame(moveFrame.current);
    stopAnimation();
  }, [stopAnimation]);

  useEffect(() => {
    if (reducedMotion || !items.length || !inView || !pageVisible) return;
    // A selection animation or a momentum decay owns the slot until it
    // finishes and bumps tickerRevision, which re-runs this effect. Starting a
    // second loop on top of one used to overwrite frameRef and orphan it: the
    // orphan kept ticking, and on completion cleared selectionTarget under the
    // animation that had replaced it, so the next Next/Previous press
    // recomputed the index it was already on and appeared to do nothing. The
    // window opened whenever this effect re-ran mid-animation — most often the
    // IntersectionObserver flipping inView as the section scrolled in.
    if (frameRef.current !== null) return;
    const run = runRef.current;
    const tick = (now: number) => {
      if (run !== runRef.current) return;
      const previous = lastFrame.current ?? now;
      const elapsed = Math.min(40, now - previous);
      lastFrame.current = now;
      if (!dragging.current) {
        const before = rotation.current;
        if (Math.abs(velocity.current) > 0.003) {
          rotation.current += velocity.current * elapsed;
          velocity.current *= Math.exp(-elapsed / 260);
          if (Math.abs(velocity.current) <= 0.003) { velocity.current = 0; settle(); }
        } else if (!hovering.current && now >= pauseUntil.current) {
          // Free rotation has resumed, so whatever comes next is the carousel's
          // doing and not the reader's — including the case where they selected
          // the card that was already at the front and nothing consumed the flag.
          deliberate.current = false;
          rotation.current -= autoRotateSpeed * elapsed / 1000;
        }
        // Hovering the ring, or the pause window after an interaction, holds
        // the rotation still. This loop still has to keep running to notice
        // when the hold ends, but rewriting identical transforms while it does
        // kept the whole ring in the browser's style and paint work the entire
        // time a reader was simply looking at a card.
        if (rotation.current !== before) updateCards();
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    // Only tear down the loop this run started. By the time the effect is
    // cleaned up another driver may already own the slot, and cancelling that
    // one would strand its rotation mid-arc with selectionTarget still set.
    return () => { if (run === runRef.current) stopAnimation(); };
  }, [autoRotateSpeed, inView, items.length, pageVisible, reducedMotion, settle, stopAnimation, tickerRevision, updateCards]);

  const select = useCallback((index: number, input: SelectionInput = "pointer") => {
    if (!items.length) return;
    deliberate.current = true;
    pause();
    velocity.current = 0;
    const step = 360 / items.length;
    selectionTarget.current = index;
    updateCards();
    // Focus movement and key commands must track the reader's action exactly;
    // decorative rotation is reserved for pointer selection.
    const duration = input === "keyboard" || reducedMotion ? 0 : pointerSelectionDuration;
    animateTo(rotation.current - normalizeAngle(rotation.current + index * step), duration, () => {
      selectionTarget.current = null;
    });
  }, [animateTo, items.length, pause, pointerSelectionDuration, reducedMotion, updateCards]);

  const navigate = useCallback((direction: 1 | -1, input: SelectionInput = "pointer") => {
    const current = selectionTarget.current ?? activeRef.current;
    const next = (current + direction + items.length) % items.length;
    select(next, input);
  }, [items.length, select]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest(".circular-carousel__controls")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stopAnimation();
    selectionTarget.current = null;
    updateCards();
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), horizontal: event.pointerType !== "touch" };
    dragging.current = true;
    moved.current = false;
    velocity.current = 0;
    pause();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = pointer.current;
    if (!point || point.id !== event.pointerId) return;
    const dx = event.clientX - point.x;
    const dy = event.clientY - point.y;
    if (!point.horizontal) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dx) <= Math.abs(dy)) { dragging.current = false; return; }
      point.horizontal = true;
      // Direction just locked in: rebase the tracking point to this event
      // instead of applying the whole dead-zone distance as one delta —
      // otherwise touch drags snap the carousel the instant the axis locks.
      point.x = event.clientX;
      point.y = event.clientY;
      point.time = performance.now();
      // `touch-action: pan-y` only grants the browser first refusal on the
      // vertical axis — it does not stop it from also starting a page scroll
      // the instant a touch drag has any vertical component, which every real
      // swipe does. Once the axis has resolved horizontal, cancelling the
      // pointer event's default action is what actually keeps that scroll
      // from riding along underneath the drag on touch browsers.
      if (event.pointerType === "touch") event.preventDefault();
      return;
    }
    if (event.pointerType === "touch") event.preventDefault();
    const now = performance.now();
    const delta = dx * dragSensitivity;
    rotation.current += delta;
    velocity.current = (delta / Math.max(8, now - point.time)) * momentumStrength;
    point.x = event.clientX;
    point.y = event.clientY;
    point.time = now;
    moved.current ||= Math.abs(dx) > 2;
    if (moved.current && !event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
    // Raw pointermove can fire far more often than the display refreshes,
    // especially on heavier browser engines (in-app webviews). Coalesce the
    // actual style writes to at most once per frame instead of once per
    // event — the rotation/velocity math above stays immediate since it's
    // just numbers, not DOM writes.
    if (moveFrame.current === null) {
      moveFrame.current = window.requestAnimationFrame(() => {
        moveFrame.current = null;
        updateCards();
      });
    }
  };

  const endPointer = useCallback((pointerId: number) => {
    if (pointer.current?.id !== pointerId) return;
    const root = rootRef.current;
    if (root?.hasPointerCapture(pointerId)) root.releasePointerCapture(pointerId);
    if (moveFrame.current !== null) { window.cancelAnimationFrame(moveFrame.current); moveFrame.current = null; }
    pointer.current = null;
    dragging.current = false;
    if (moved.current) deliberate.current = true;
    pause();
    if (reducedMotion || !moved.current) { velocity.current = 0; settle(); }
    else {
      // Take the frame slot the same way the other two drivers do, so a
      // selection animation started before the finger lifted cannot keep
      // ticking underneath this decay.
      stopAnimation();
      const generation = runRef.current;
      const decay = (next: number) => {
        if (generation !== runRef.current) return;
        const elapsed = Math.min(40, next - (lastFrame.current ?? next));
        lastFrame.current = next;
        rotation.current += velocity.current * elapsed;
        velocity.current *= Math.exp(-elapsed / 260);
        updateCards();
        if (Math.abs(velocity.current) > 0.003) frameRef.current = window.requestAnimationFrame(decay);
        else { velocity.current = 0; settle(); }
      };
      frameRef.current = window.requestAnimationFrame((now) => {
        if (generation !== runRef.current) return;
        lastFrame.current = now;
        frameRef.current = window.requestAnimationFrame(decay);
      });
    }
  }, [pause, reducedMotion, settle, stopAnimation, updateCards]);

  // The gesture ends wherever the pointer happens to be, which is often not
  // over the ring: pointer capture is only taken once a drag passes the 2px
  // threshold, so pressing a card, nudging it a pixel and releasing outside
  // the carousel never delivered pointerup to it. `dragging` stayed true and
  // the idle loop skipped every frame from then on — the ring simply stopped,
  // for good, until the next press. These fire wherever the release lands.
  useEffect(() => {
    const release = (event: PointerEvent) => endPointer(event.pointerId);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [endPointer]);

  if (!items.length) return null;

  return (
    <div
      ref={rootRef}
      className={`circular-carousel ${className}`}
      role="region"
      aria-roledescription="3D carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerEnter={() => { hovering.current = pauseOnHover; if (pauseOnHover) pause(); }}
      onPointerLeave={() => { hovering.current = false; if (pauseOnHover && !dragging.current) pause(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1, "keyboard"); }
        if (event.key === "ArrowRight") { event.preventDefault(); navigate(1, "keyboard"); }
      }}
    >
      {/* Only what a reader asked for is announced. This used to restate the
          card on every idle revolution, which a screen reader reads out over
          whatever else is being said. */}
      <span className="sr-only" aria-live="polite">{announcement}</span>
      <div className="circular-carousel__stage">
        {items.map((item, index) => (
          <article
            key={index}
            ref={(element) => { cardRefs.current[index] = element; }}
            className="circular-carousel__card"
            data-carousel-card
            data-active={index === 0 ? "true" : "false"}
            role="button"
            tabIndex={0}
            aria-label={`Bring ${getItemLabel(item, index)} to the front`}
            onClick={(event) => { if (!moved.current) select(index, event.detail === 0 ? "keyboard" : "pointer"); }}
            // Every card is tabbable, including the ones facing away at 18%
            // opacity behind the front one. Tabbing to those used to move focus
            // somewhere invisible; bringing the focused card round is the only
            // way the focus ring means anything. Gated on :focus-visible so a
            // mouse press does not select twice — onClick already handles it.
            onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) select(index, "keyboard"); }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(index, "keyboard"); }
            }}
          >
            {renderCard(item, index, activeIndex === index)}
          </article>
        ))}
      </div>
      <div className="circular-carousel__controls" aria-label="Carousel controls">
        <button type="button" className="circular-carousel__control" onClick={(event) => navigate(-1, event.detail === 0 ? "keyboard" : "pointer")} aria-label={previousControlLabel}><ChevronLeft aria-hidden="true" /></button>
        <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-500" aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        <button type="button" className="circular-carousel__control" onClick={(event) => navigate(1, event.detail === 0 ? "keyboard" : "pointer")} aria-label={nextControlLabel}><ChevronRight aria-hidden="true" /></button>
      </div>
    </div>
  );
}
