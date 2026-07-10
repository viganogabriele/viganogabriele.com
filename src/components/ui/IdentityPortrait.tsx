import { motion, useReducedMotion, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import portrait from "../../assets/photo-gabriele.webp";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";

export function IdentityPortrait() {
  const { isTouch, hasNoHover, isCompact } = useFeatureDetect();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 90, damping: 22 });
  const rotateY = useSpring(x, { stiffness: 90, damping: 22 });
  useEffect(() => {
    if (isTouch || hasNoHover || isCompact || reduced || !ref.current) return;
    const element = ref.current;
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      x.set(((event.clientX - box.left) / box.width - 0.5) * -7);
      y.set(((event.clientY - box.top) / box.height - 0.5) * 7);
    };
    const reset = () => { x.set(0); y.set(0); };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", reset);
    return () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", reset); };
  }, [hasNoHover, isCompact, isTouch, reduced, x, y]);
  return (
    <motion.div
      ref={ref}
      data-cursor="hover"
      className="portrait-frame group relative mx-auto w-[min(74vw,22rem)] [perspective:900px] sm:w-[20rem] lg:w-[25rem]"
      style={{ rotateX, rotateY }}
    >
      <div className="absolute -inset-px rounded-[2px] bg-gradient-to-b from-cyan-100/80 via-white/5 to-violet-500/30" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#0b0d12]">
        <img src={portrait} alt="Gabriele Viganò" loading="eager" decoding="async" fetchPriority="high" className="h-full w-full object-cover object-[50%_14%] grayscale-[0.13] contrast-[1.06] transition-transform duration-700 group-hover:scale-[1.035]" />
        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(127,231,255,0.14),transparent_27%,transparent_72%,rgba(139,92,246,0.16))]" />
        <div className="portrait-wireframe-overlay" />
      </div>
      <span className="absolute -bottom-6 left-0 font-mono text-[9px] tracking-[0.16em] text-zinc-500">IDENTITY / 45.4642° N, 9.1900° E</span>
      <span className="absolute -right-6 top-5 hidden -rotate-90 origin-top-left font-mono text-[9px] tracking-[0.16em] text-zinc-500 sm:block">MILAN / IT</span>
    </motion.div>
  );
}
