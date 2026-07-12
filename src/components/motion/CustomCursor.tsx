import { m, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";

export function CustomCursor() {
  const { isTouch, hasNoHover, isCompact } = useFeatureDetect();
  const dot = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ringX = useSpring(x, { stiffness: 95, damping: 20 });
  const ringY = useSpring(y, { stiffness: 95, damping: 20 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (isTouch || hasNoHover || isCompact) return;
    const move = (event: MouseEvent) => {
      x.set(event.clientX); y.set(event.clientY);
      if (dot.current) dot.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
    };
    const enter = () => setActive(true);
    const leave = () => setActive(false);
    const bindings = new Set<HTMLElement>();
    const bind = () => document.querySelectorAll<HTMLElement>("a, button, [data-cursor='hover']").forEach((element) => {
      if (bindings.has(element)) return;
      bindings.add(element);
      element.addEventListener("mouseenter", enter);
      element.addEventListener("mouseleave", leave);
    });
    bind();
    const observer = new MutationObserver(bind);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      observer.disconnect();
      bindings.forEach((element) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
      });
      window.removeEventListener("mousemove", move);
    };
  }, [hasNoHover, isCompact, isTouch, x, y]);
  if (isTouch || hasNoHover || isCompact) return null;
  return <><div ref={dot} className="cursor-dot" /><m.div className="cursor-ring" style={{ left: ringX, top: ringY }} animate={{ width: active ? 42 : 28, height: active ? 42 : 28, opacity: active ? 0.9 : 0.55 }} /></>;
}
