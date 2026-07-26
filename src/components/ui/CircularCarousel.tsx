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
  const [activeIndex, setActiveIndex] = useState(0);
  const [tickerRevision, setTickerRevision] = useState(0);
  const [inView, setInView] = useState(true);

  const updateCards = useCallback(() => {
    const count = items.length;
    if (!count) return;
    const root = rootRef.current;
    const width = root?.clientWidth ?? 0;
    const compact = width < 640;
    const radius = Math.min(compact ? 180 : 290, Math.max(compact ? 145 : 210, width * (compact ? 0.52 : 0.34))) * radiusScale;
    const depth = compact ? 76 : 96;
    const step = 360 / count;
    const nearest = items.reduce((best, _item, index) => (
      Math.abs(normalizeAngle(rotation.current + index * step)) < Math.abs(normalizeAngle(rotation.current + best * step)) ? index : best
    ), 0);
    const selected = selectionTarget.current ?? nearest;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
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
      card.style.zIndex = String(Math.round(frontness * 100));
      card.style.filter = "none";
      card.style.pointerEvents = frontness < 0.1 ? "none" : "auto";
    });

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const active = index === selected;
      card.dataset.active = String(active);
      card.setAttribute("aria-current", active ? "true" : "false");
    });
    if (activeRef.current !== selected) {
      activeRef.current = selected;
      setActiveIndex(selected);
      onActiveIndexChange?.(selected);
    }
  }, [items, onActiveIndexChange, radiusScale]);

  const stopAnimation = useCallback(() => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    lastFrame.current = null;
  }, []);

  const animateTo = useCallback((target: number, duration = reducedMotion ? 180 : 540, onComplete?: () => void) => {
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
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 4;
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
  }, [reducedMotion, stopAnimation, updateCards]);

  const settle = useCallback(() => {
    if (!snap || !items.length) return;
    const step = 360 / items.length;
    const target = Math.round(rotation.current / step) * step;
    animateTo(target);
  }, [animateTo, items.length, snap]);

  const pause = useCallback(() => { pauseUntil.current = performance.now() + pauseDuration; }, [pauseDuration]);

  useEffect(() => {
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

  useEffect(() => () => {
    if (moveFrame.current !== null) window.cancelAnimationFrame(moveFrame.current);
  }, []);

  useEffect(() => {
    if (reducedMotion || !items.length || !inView) return;
    const tick = (now: number) => {
      const previous = lastFrame.current ?? now;
      const elapsed = Math.min(40, now - previous);
      lastFrame.current = now;
      if (!dragging.current) {
        if (Math.abs(velocity.current) > 0.003) {
          rotation.current += velocity.current * elapsed;
          velocity.current *= Math.exp(-elapsed / 260);
          if (Math.abs(velocity.current) <= 0.003) { velocity.current = 0; settle(); }
        } else if (!hovering.current && now >= pauseUntil.current) {
          rotation.current -= autoRotateSpeed * elapsed / 1000;
        }
        updateCards();
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return stopAnimation;
  }, [autoRotateSpeed, inView, items.length, reducedMotion, settle, stopAnimation, tickerRevision, updateCards]);

  const select = useCallback((index: number) => {
    if (!items.length) return;
    pause();
    velocity.current = 0;
    const step = 360 / items.length;
    selectionTarget.current = index;
    updateCards();
    animateTo(rotation.current - normalizeAngle(rotation.current + index * step), undefined, () => {
      selectionTarget.current = null;
    });
  }, [animateTo, items.length, pause, updateCards]);

  const navigate = useCallback((direction: 1 | -1) => {
    const current = selectionTarget.current ?? activeRef.current;
    const next = (current + direction + items.length) % items.length;
    select(next);
  }, [items.length, select]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest(".circular-carousel__controls")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stopAnimation();
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
    }
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

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointer.current?.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (moveFrame.current !== null) { window.cancelAnimationFrame(moveFrame.current); moveFrame.current = null; }
    pointer.current = null;
    dragging.current = false;
    pause();
    if (reducedMotion || !moved.current) { velocity.current = 0; settle(); }
    else {
      lastFrame.current = null;
      frameRef.current = window.requestAnimationFrame((now) => {
        lastFrame.current = now;
        const run = (next: number) => {
          const elapsed = Math.min(40, next - (lastFrame.current ?? next));
          lastFrame.current = next;
          rotation.current += velocity.current * elapsed;
          velocity.current *= Math.exp(-elapsed / 260);
          updateCards();
          if (Math.abs(velocity.current) > 0.003) frameRef.current = window.requestAnimationFrame(run);
          else { velocity.current = 0; settle(); }
        };
        frameRef.current = window.requestAnimationFrame(run);
      });
    }
  };

  if (!items.length) return null;
  const activeLabel = getItemLabel(items[activeIndex], activeIndex);

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
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerEnter={() => { hovering.current = pauseOnHover; if (pauseOnHover) pause(); }}
      onPointerLeave={() => { hovering.current = false; if (pauseOnHover && !dragging.current) pause(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); navigate(1); }
      }}
    >
      <span className="sr-only" aria-live="polite">Active card: {activeLabel}.</span>
      <div className="circular-carousel__stage">
        {items.map((item, index) => (
          <article
            key={getItemLabel(item, index)}
            ref={(element) => { cardRefs.current[index] = element; }}
            className="circular-carousel__card"
            data-carousel-card
            data-active={index === 0 ? "true" : "false"}
            role="button"
            tabIndex={0}
            aria-label={`Bring ${getItemLabel(item, index)} to the front`}
            onClick={() => { if (!moved.current) select(index); }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(index); }
            }}
          >
            {renderCard(item, index, activeIndex === index)}
          </article>
        ))}
      </div>
      <div className="circular-carousel__controls" aria-label="Carousel controls">
        <button type="button" className="circular-carousel__control" onClick={() => navigate(-1)} aria-label={previousControlLabel}><ChevronLeft aria-hidden="true" /></button>
        <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-500" aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        <button type="button" className="circular-carousel__control" onClick={() => navigate(1)} aria-label={nextControlLabel}><ChevronRight aria-hidden="true" /></button>
      </div>
    </div>
  );
}
