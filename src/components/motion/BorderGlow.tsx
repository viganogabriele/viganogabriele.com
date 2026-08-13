/**
 * Adapted from ReactBits `BorderGlow` (MIT + Commons Clause).
 * https://reactbits.dev/components/border-glow
 *
 * Same picture as upstream — mesh-gradient border under a cursor-tracked conic
 * mask, the soft-light fill near the edges, the layered outer glow and the
 * one-shot sweep — but none of it goes through React any more.
 *
 * Upstream holds the cursor angle and the edge proximity in component state, so
 * every pointer frame re-renders the card and rebuilds eight gradient strings,
 * thirteen box-shadow layers and six mask images in JS. Inside a carousel that
 * subtree is a whole project or toolkit card, and the 4s intro sweep did the
 * same thing ~240 times without a pointer anywhere near it.
 *
 * Here the geometry lives in two registered custom properties, `--bg-angle` and
 * `--bg-edge` (see `@property` in index.css). The gradients and masks are static
 * CSS that reads them, hover writes them straight to the node, and the sweep is
 * a CSS keyframe animation — so it costs no JS at all and React renders once.
 */
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { usePointerFrames } from '../../hooks/usePointerFrames';
import { useMotionProfile } from '../../hooks/useMotionProfile';

interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  /** Solid colour the mesh border is masked against. */
  backgroundColor?: string;
  glowRadius?: number;
  glowIntensity?: number;
  fillOpacity?: number;
  /** Plays the one-shot intro sweep. Retriggers whenever it flips back to true. */
  animated?: boolean;
}

/** Name of the keyframes that own the sweep's lifetime, see index.css. */
const SWEEP_ANIMATION = 'border-glow-edge';

export function BorderGlow({
  children,
  className = '',
  backgroundColor = '#120F17',
  glowRadius = 40,
  glowIntensity = 1,
  fillOpacity = 0.5,
  animated = false,
}: BorderGlowProps) {
  const { canUsePointerEffects, level } = useMotionProfile();
  const cardRef = useRef<HTMLDivElement>(null);
  // Repainting three conic masks is the expensive half of this effect. A
  // pointer creeping across the card can report a dozen frames that round to
  // the same degree, and each one would re-rasterise all three for nothing.
  const lastAngle = useRef(Number.NaN);

  const handlePointerFrame = useCallback((point: { x: number; y: number } | null) => {
    const card = cardRef.current;
    if (!card) return;
    if (!point) {
      lastAngle.current = Number.NaN;
      card.style.setProperty('--bg-edge', '0');
      return;
    }
    // One rect read per frame: upstream took three, one here and one inside
    // each of the two geometry helpers.
    const rect = card.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    const dx = point.x - rect.left - halfWidth;
    const dy = point.y - rect.top - halfHeight;

    const kx = dx !== 0 ? halfWidth / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? halfHeight / Math.abs(dy) : Infinity;
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    card.style.setProperty('--bg-edge', edge.toFixed(4));

    if (dx === 0 && dy === 0) return;
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    if (Math.abs(degrees - lastAngle.current) < 1) return;
    lastAngle.current = degrees;
    card.style.setProperty('--bg-angle', `${degrees.toFixed(1)}deg`);
  }, []);

  usePointerFrames({ target: () => cardRef.current, onPoint: handlePointerFrame, enabled: canUsePointerEffects });

  useEffect(() => {
    const card = cardRef.current;
    if (!animated || !card || level !== 'full') return;

    // The attribute both starts the keyframes and suppresses the hover
    // transition for their duration, so the sweep is not chasing itself.
    card.dataset.sweep = 'true';
    const end = (event: AnimationEvent) => {
      if (event.animationName === SWEEP_ANIMATION) card.removeAttribute('data-sweep');
    };
    card.addEventListener('animationend', end);
    return () => {
      // Dragging the ring hands `animated` to every card the selection passes
      // through; without this a card that had already begun its sweep stayed
      // lit after it stopped being the selected one.
      card.removeAttribute('data-sweep');
      card.removeEventListener('animationend', end);
    };
  }, [animated, level]);

  return (
    <div
      ref={cardRef}
      className={`border-glow ${className}`}
      style={{
        '--bg-surface': backgroundColor,
        '--bg-glow-radius': `${glowRadius}px`,
        '--bg-glow-intensity': glowIntensity,
        '--bg-fill-opacity': fillOpacity,
      } as React.CSSProperties}
    >
      <div className="border-glow__border" />
      <div className="border-glow__fill" />
      <span className="border-glow__glow"><span /></span>
      <div className="border-glow__content">{children}</div>
    </div>
  );
}
