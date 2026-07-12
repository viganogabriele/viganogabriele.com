import { lazy, Suspense, useCallback, useState } from "react";
import { motion } from "framer-motion";
import imageAvif from "../../assets/image-face.avif";
import imageWebp from "../../assets/image-face.webp";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { loadHeroSceneModule } from "../../lib/headModel";

const HeroHeadScene = lazy(loadHeroSceneModule);

function PortraitFallback({ staticMode }: { staticMode: boolean }) {
  return <motion.div className="hero-fallback h-full w-full" animate={staticMode ? undefined : { y: [0, -7, 0], rotate: [0, 0.25, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}><picture><source srcSet={imageAvif} type="image/avif" /><img src={imageWebp} alt="" width="900" height="900" decoding="async" fetchPriority="high" className="h-full w-full object-cover object-top" /></picture><span className="hero-fallback-grid" /><span className="hero-fallback-scan" /></motion.div>;
}

export function AdaptiveHeroObject({ systemActive }: { systemActive: boolean }) {
  const { canUseWebGL, level } = useMotionProfile();
  const [scan, setScan] = useState(false);
  const [failed, setFailed] = useState(false);
  const [meshReady, setMeshReady] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const onReady = useCallback(() => setMeshReady(true), []);
  const showWebGL = systemActive && canUseWebGL && !failed;
  const meshLive = showWebGL && meshReady;

  // Adjust state during render (React-endorsed pattern): leaving system mode
  // rearms the crossfade so the next toggle waits for a fresh first frame.
  if (!showWebGL && meshReady) setMeshReady(false);

  const label = meshLive
    ? `LIVE MESH · TAP TO ${scan ? "RESTORE" : "SCAN"}`
    : showWebGL
      ? "SYNCING MESH…"
      : `PORTRAIT FIELD · TAP TO ${scan ? "RESTORE" : "SCAN"}`;

  // The portrait stays mounted underneath the canvas and crossfades out only
  // once the first WebGL frame has rendered — no sudden swap while the model
  // chunk or GLB is still in flight.
  return <div className={`hero-object-shell ${scan ? "is-scanning" : ""} ${meshLive ? "mesh-ready" : ""}`}><button type="button" className="hero-object-button" aria-label={label} aria-pressed={scan} onClick={() => setScan((value) => !value)}><span className="hero-object-aura" aria-hidden="true" /><PortraitFallback staticMode={level === "static"} />{showWebGL && <span className="hero-scene-layer" aria-hidden="true"><Suspense fallback={null}><HeroHeadScene scan={scan} onError={onError} onReady={onReady} /></Suspense></span>}<span className="hero-object-corner hero-object-corner-tl" aria-hidden="true" /><span className="hero-object-corner hero-object-corner-br" aria-hidden="true" /><span className="hero-object-label" aria-hidden="true">{label}</span></button></div>;
}
