import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
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
  const rotateX = useSpring(y, { stiffness: 82, damping: 20, mass: 0.7 });
  const rotateY = useSpring(x, { stiffness: 82, damping: 20, mass: 0.7 });
  const glowX = useSpring(useTransform(x, (v) => v * -0.7), { stiffness: 64, damping: 20 });
  const glowY = useSpring(useTransform(y, (v) => v * 0.5), { stiffness: 64, damping: 20 });
  const enableInteraction = !isTouch && !hasNoHover && !isCompact && !reduced;
  // On mobile / no-hover devices, run a subtle auto-rotation loop so the card still feels 3D
  const autoRotate = !enableInteraction && !reduced;

  useEffect(() => {
    if (!enableInteraction || !ref.current) return;
    const element = ref.current;
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      const pointerX = (event.clientX - box.left) / box.width;
      const pointerY = (event.clientY - box.top) / box.height;
      x.set((pointerX - 0.5) * -14);
      y.set((pointerY - 0.5) * 14);
      element.style.setProperty("--portrait-pointer-x", `${pointerX * 100}%`);
      element.style.setProperty("--portrait-pointer-y", `${pointerY * 100}%`);
    };
    const reset = () => {
      x.set(0);
      y.set(0);
      element.style.setProperty("--portrait-pointer-x", "50%");
      element.style.setProperty("--portrait-pointer-y", "45%");
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", reset);
    return () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
    };
  }, [enableInteraction, x, y]);

  // Device orientation tilt on mobile (iOS / Android)
  useEffect(() => {
    if (!isTouch || reduced || !ref.current) return;
    const element = ref.current;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      const px = Math.max(-1, Math.min(1, e.gamma / 45));
      const py = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
      x.set(px * -8);
      y.set(py * 8);
      element.style.setProperty("--portrait-pointer-x", `${50 + px * 30}%`);
      element.style.setProperty("--portrait-pointer-y", `${50 + py * 30}%`);
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [isTouch, reduced, x, y]);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.92, y: 22 }}
      animate={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative mx-auto w-[min(78vw,22rem)] sm:w-[20rem] lg:w-[25rem]", className)}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -9, 0], rotateZ: [0, 0.32, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        className="portrait-float"
      >
        <div aria-hidden className="portrait-orbit portrait-orbit-one" />
        <div aria-hidden className="portrait-orbit portrait-orbit-two" />
        <motion.div
          ref={ref}
          data-cursor="hover"
          className="portrait-frame group relative"
          animate={
            autoRotate
              ? { rotateY: [-8, 8, -8], rotateX: [4, -4, 4] }
              : undefined
          }
          transition={
            autoRotate ? { duration: 9, repeat: Infinity, ease: "easeInOut" } : undefined
          }
          style={enableInteraction ? { rotateX, rotateY } : undefined}
        >
          <div aria-hidden className="portrait-shadow" />
          <div aria-hidden className="portrait-border" />
          <div className="portrait-visual relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#06090e]">
            <img
              src={imageFace}
              alt="Gabriele Viganò"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="portrait-base h-full w-full object-cover object-top"
              style={{ transform: "translateZ(-30px)" }}
            />
            <motion.div
              aria-hidden
              className="portrait-glow-layer"
              style={enableInteraction ? { x: glowX, y: glowY, z: 60 } : { z: 30 }}
            />
            <div aria-hidden className="portrait-grid-layer" style={{ transform: "translateZ(20px)" }} />
            <div aria-hidden className="portrait-lens" />
            <div aria-hidden className="portrait-scan" style={{ transform: "translateZ(40px)" }} />
            <div aria-hidden className="portrait-noise-layer" />
            <div aria-hidden className="portrait-wireframe-overlay" />
            <span aria-hidden className="portrait-corner portrait-corner-tl" style={{ transform: "translateZ(50px)" }} />
            <span aria-hidden className="portrait-corner portrait-corner-tr" style={{ transform: "translateZ(50px)" }} />
            <span aria-hidden className="portrait-corner portrait-corner-bl" style={{ transform: "translateZ(50px)" }} />
            <span aria-hidden className="portrait-corner portrait-corner-br" style={{ transform: "translateZ(50px)" }} />
            <span aria-hidden className="portrait-readout absolute left-3 top-3 font-mono text-[8px] uppercase tracking-[0.17em] text-cyan-100/80" style={{ transform: "translateZ(60px)" }}>Live / 3D field</span>
            <span aria-hidden className="portrait-status absolute right-3 top-3 font-mono text-[8px] uppercase tracking-[0.13em] text-zinc-300" style={{ transform: "translateZ(60px)" }}>tracking</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
