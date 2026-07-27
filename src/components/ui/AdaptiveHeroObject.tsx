import { m } from "framer-motion";
import imageAvif from "../../assets/image-face.avif";
import imageWebp from "../../assets/image-face.webp";
import { useMotionProfile } from "../../hooks/useMotionProfile";

function PortraitFallback({ staticMode }: { staticMode: boolean }) {
  return (
    <div className="hero-fallback">
      <m.div
        className="hero-fallback-motion h-full w-full"
        animate={staticMode ? undefined : { y: [0, -7, 0], rotate: [0, 0.25, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <picture>
          <source srcSet={imageAvif} type="image/avif" />
          <img
            data-hero-portrait
            src={imageWebp}
            alt=""
            width="900"
            height="900"
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover object-top"
          />
        </picture>
      </m.div>
      <span className="hero-fallback-grid" />
      <span className="hero-fallback-scan" />
      {/* Targeting reticle — CSS-only, appears in SYS mode */}
      <div className="hero-reticle" aria-hidden="true">
        <div className="hero-reticle-ring" />
        <div className="hero-reticle-inner" />
        <div className="hero-reticle-h" />
        <div className="hero-reticle-v" />
      </div>
    </div>
  );
}

export function AdaptiveHeroObject({
  systemActive,
  onToggleSystem,
}: {
  systemActive: boolean;
  onToggleSystem: () => void;
}) {
  const { level, isCompact } = useMotionProfile();
  const label = systemActive ? "Return to portrait" : "Alternate view";

  return (
    <div className="hero-object-shell">
      <button
        type="button"
        className="hero-object-button"
        aria-label={systemActive ? "Disable alternate system view" : "Enable alternate system view"}
        aria-keyshortcuts="Shift+S"
        aria-pressed={systemActive}
        onClick={onToggleSystem}
        onPointerUp={(event) => { if (event.pointerType !== "mouse") event.currentTarget.blur(); }}
        data-cursor="hover"
      >
        <span className="hero-object-aura" aria-hidden="true" />
        <PortraitFallback staticMode={level !== "full" || isCompact} />
        <span className="hero-object-corner hero-object-corner-tl" aria-hidden="true" />
        <span className="hero-object-corner hero-object-corner-br" aria-hidden="true" />
        <span className="hero-object-label" aria-hidden="true">{label}</span>
      </button>
    </div>
  );
}
