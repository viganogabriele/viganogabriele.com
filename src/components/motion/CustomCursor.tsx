import { m, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const INTERACTIVE = "a, button, [role='button'], input, select, textarea, [data-cursor='hover']";
const HOVERED_INTERACTIVE = "a:hover, button:hover, [role='button']:hover, input:hover, select:hover, textarea:hover, [data-cursor='hover']:hover";

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
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
    const move = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      dot.current?.style.setProperty("transform", `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`);
      setVisible(true);
    };
    const updateTarget = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      setActive(Boolean(target?.closest(INTERACTIVE) || document.querySelector(HOVERED_INTERACTIVE)));
    };
    const reset = () => { setActive(false); setVisible(false); };
    // Re-check CSS :hover state after scroll; pointer didn't move so no mouseover fires.
    const onScroll = () => setActive(Boolean(document.querySelector(HOVERED_INTERACTIVE)));
    const onVisibility = () => { if (document.visibilityState !== "visible") reset(); };
    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", updateTarget, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", updateTarget);
      window.removeEventListener("blur", reset);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  return createPortal(<div data-custom-cursor data-visible={visible} data-active={active} aria-hidden="true"><div ref={dot} className={`cursor-dot${active ? " is-active" : ""}`} /><m.div className="cursor-ring" style={{ left: ringX, top: ringY }} animate={{ scale: active ? 1.5 : 1, opacity: visible ? (active ? 0.9 : 0.55) : 0 }} /></div>, document.body);
}
