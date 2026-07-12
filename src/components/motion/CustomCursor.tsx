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
    const onPointerOver = (event: PointerEvent) => {
      if ((event.target as Element).closest("a, button, [data-cursor='hover']")) enter();
    };
    const onPointerOut = (event: PointerEvent) => {
      const next = event.relatedTarget as Element | null;
      if (!next?.closest("a, button, [data-cursor='hover']")) leave();
    };
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, [hasNoHover, isCompact, isTouch, x, y]);
  if (isTouch || hasNoHover || isCompact) return null;
  return <><div ref={dot} className={`cursor-dot ${active ? "is-active" : ""}`} /><m.div className="cursor-ring" style={{ left: ringX, top: ringY }} animate={{ scale: active ? 1.5 : 1, opacity: active ? 0.9 : 0.55 }} /></>;
}
