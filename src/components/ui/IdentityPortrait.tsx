import { motion, useReducedMotion, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import imageFace from "../../assets/image-face.png";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { cn } from "../../lib/cn";

type IdentityPortraitProps = {
  className?: string;
};

export function IdentityPortrait({ className }: IdentityPortraitProps) {
  const { isTouch, hasNoHover, isCompact } = useFeatureDetect();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 90, damping: 22 });
  const rotateY = useSpring(x, { stiffness: 90, damping: 22 });
  const enableInteraction = !isTouch && !hasNoHover && !isCompact && !reduced;

  useEffect(() => {
    if (!enableInteraction || !ref.current) return;
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
  }, [enableInteraction, x, y]);

  return (
    <motion.div
      animate={reduced ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className={cn("relative mx-auto w-[min(74vw,22rem)] sm:w-[20rem] lg:w-[25rem]", className)}
    >
      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(ellipse_at_55%_45%,rgba(127,231,255,0.09)_0%,transparent_65%)] blur-3xl"
      />
      <motion.div
        ref={ref}
        data-cursor="hover"
        className="portrait-frame group relative [perspective:900px]"
        style={enableInteraction ? { rotateX, rotateY } : undefined}
      >
        <div className="absolute -inset-px rounded-[2px] bg-gradient-to-b from-cyan-100/70 via-white/5 to-violet-500/30" />
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#0b0d12]">
          <img
            src={imageFace}
            alt="Gabriele Viganò"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover object-top contrast-[1.04] transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(127,231,255,0.10),transparent_27%,transparent_72%,rgba(139,92,246,0.14))]" />
          <div className="portrait-wireframe-overlay" />
        </div>
        <span className="absolute -bottom-6 left-0 font-mono text-[9px] tracking-[0.16em] text-zinc-500">IDENTITY / 45.4642° N, 9.1900° E</span>
        <span className="absolute -right-6 top-5 hidden -rotate-90 origin-top-left font-mono text-[9px] tracking-[0.16em] text-zinc-500 sm:block">MILAN / IT</span>
      </motion.div>
    </motion.div>
  );
}
