import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import imageAvif from "../../assets/image-face.avif";
import imageWebp from "../../assets/image-face.webp";
import { useMotionProfile } from "../../hooks/useMotionProfile";

const HeroHeadScene = lazy(() => import("./HeroHeadScene"));

function PortraitFallback({ staticMode }: { staticMode: boolean }) {
  return <motion.div className="hero-fallback h-full w-full" animate={staticMode ? undefined : { y: [0, -7, 0], rotate: [0, 0.25, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}><picture><source srcSet={imageAvif} type="image/avif" /><img src={imageWebp} alt="" width="900" height="900" decoding="async" fetchPriority="high" className="h-full w-full object-cover object-top" /></picture><span className="hero-fallback-grid" /><span className="hero-fallback-scan" /></motion.div>;
}

export function AdaptiveHeroObject() {
  const { canUseWebGL, level } = useMotionProfile();
  const [scan, setScan] = useState(false);
  const [failed, setFailed] = useState(false);
  const [webGLReady, setWebGLReady] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const showWebGL = canUseWebGL && webGLReady && !failed;

  useEffect(() => {
    if (!canUseWebGL) return;
    let idle = 0;
    const timer = window.setTimeout(() => {
      const requestIdle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 8 }), 1));
      idle = requestIdle(() => setWebGLReady(true), { timeout: 1200 });
    }, 2200);
    return () => {
      clearTimeout(timer);
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [canUseWebGL]);

  const label = `${showWebGL ? "LIVE MESH" : "PORTRAIT FIELD"} · TAP TO ${scan ? "RESTORE" : "SCAN"}`;
  return <div className={`hero-object-shell ${scan ? "is-scanning" : ""}`}><button type="button" className="hero-object-button" aria-label={label} aria-pressed={scan} onPointerEnter={() => canUseWebGL && setWebGLReady(true)} onClick={() => { if (canUseWebGL) setWebGLReady(true); setScan((value) => !value); }}><span className="hero-object-aura" aria-hidden="true" />{showWebGL ? <Suspense fallback={<PortraitFallback staticMode={level === "static"} />}><HeroHeadScene scan={scan} onError={onError} /></Suspense> : <PortraitFallback staticMode={level === "static"} />}<span className="hero-object-corner hero-object-corner-tl" aria-hidden="true" /><span className="hero-object-corner hero-object-corner-br" aria-hidden="true" /><span className="hero-object-label" aria-hidden="true">{label}</span></button></div>;
}
