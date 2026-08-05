import { m, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const INTERACTIVE = "a, button, [role='button'], input, select, textarea, [data-cursor='hover']";
const HOVERED_INTERACTIVE = "a:hover, button:hover, [role='button']:hover, input:hover, select:hover, textarea:hover, [data-cursor='hover']:hover";
const TRAIL_LENGTH = 8;

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>(Array.from({ length: TRAIL_LENGTH }, () => null));
  const trailPositions = useRef<{ x: number; y: number }[]>([]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ringX = useSpring(x, { stiffness: 110, damping: 22 });
  const ringY = useSpring(y, { stiffness: 110, damping: 22 });
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER_QUERY);
    const sync = () => setEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-custom-cursor");

    const clearTrail = () => {
      trailPositions.current.length = 0;
      trailRefs.current.forEach((ref) => { if (ref) ref.style.opacity = "0"; });
    };

    const move = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      // Use the individual `translate` property so it composes correctly
      // with the `scale` property (CSS applies translate then scale, so the
      // translation distance isn't multiplied by the scale factor).
      dot.current?.style.setProperty("translate", `${event.clientX}px ${event.clientY}px`);
      setVisible(true);

      // Update trail only when SYS mode is active — read the attribute directly
      // to avoid re-registering the effect when SYS state changes.
      if (document.documentElement.hasAttribute("data-system-mode")) {
        const positions = trailPositions.current;
        positions.unshift({ x: event.clientX, y: event.clientY });
        if (positions.length > TRAIL_LENGTH) positions.length = TRAIL_LENGTH;
        trailRefs.current.forEach((ref, i) => {
          const pos = positions[i];
          if (ref && pos) {
            ref.style.translate = `${pos.x}px ${pos.y}px`;
            ref.style.opacity = ((TRAIL_LENGTH - i) / TRAIL_LENGTH * 0.38).toFixed(2);
          } else if (ref) {
            ref.style.opacity = "0";
          }
        });
      } else if (trailPositions.current.length > 0) {
        clearTrail();
      }
    };

    const updateTarget = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      setActive(Boolean(target?.closest(INTERACTIVE) || document.querySelector(HOVERED_INTERACTIVE)));
    };

    const reset = () => { setActive(false); setVisible(false); clearTrail(); };
    // HOVERED_INTERACTIVE is a seven-clause :hover selector; running it
    // straight off the scroll event meant a full document match per event,
    // several times a frame on a trackpad. Coalesce to one per frame.
    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        setActive(Boolean(document.querySelector(HOVERED_INTERACTIVE)));
      });
    };
    const onVisibility = () => { if (document.visibilityState !== "visible") reset(); };

    // SYS mode can toggle off while the mouse is idle — clear the trail
    // immediately so leftover dots don't linger on the page.
    const observer = new MutationObserver(() => {
      if (!document.documentElement.hasAttribute("data-system-mode")) clearTrail();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-system-mode"] });

    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", updateTarget, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      observer.disconnect();
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", updateTarget);
      window.removeEventListener("blur", reset);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return createPortal(
    <div data-custom-cursor data-visible={visible} data-active={active} aria-hidden="true">
      <div ref={dot} className={`cursor-dot${active ? " is-active" : ""}`} />
      <m.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: active ? 1.5 : 1, opacity: visible ? (active ? 0.9 : 0.55) : 0 }}
      />
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => (
        <div
          key={i}
          ref={(el) => { trailRefs.current[i] = el; }}
          className="cursor-trail-dot"
          aria-hidden="true"
        />
      ))}
    </div>,
    document.body,
  );
}
