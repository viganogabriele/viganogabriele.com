import photoAvif from "../../assets/gabriele-photo.avif";
import photoWebp from "../../assets/gabriele-photo.webp";
import imageAvif from "../../assets/image-face.avif";
import imageWebp from "../../assets/image-face.webp";
import { heroCopy } from "../../data/sections";

function PortraitFallback({ systemActive }: { systemActive: boolean }) {
  const [systemPortraitReady, setSystemPortraitReady] = useState(false);
  const showSystemPortrait = systemActive && systemPortraitReady;

  return (
    <div className="hero-fallback">
      <div className="hero-fallback-motion h-full w-full">
        {/* The photograph rests here and SYS swaps in the wireframe render. Both
            layers stay mounted: toggling would otherwise show a gap while the
            second image decodes. Only the photo gets high fetch priority, since
            it is the one the hero is measured on. */}
        <picture className="hero-portrait-layer" data-hero-portrait-layer="photo" data-visible={!showSystemPortrait}>
          <source srcSet={photoAvif} type="image/avif" />
          <img
            data-hero-portrait
            src={photoWebp}
            alt=""
            width="1200"
            height="1200"
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover object-top"
          />
        </picture>
        <picture className="hero-portrait-layer" data-hero-portrait-layer="system" data-visible={showSystemPortrait}>
          <source srcSet={imageAvif} type="image/avif" />
          <img
            src={imageWebp}
            alt=""
            width="900"
            height="900"
            decoding="async"
            fetchPriority="low"
            onLoad={() => setSystemPortraitReady(true)}
            className="h-full w-full object-cover object-top"
          />
        </picture>
      </div>
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
  const label = systemActive ? heroCopy.portraitLabel.active : heroCopy.portraitLabel.idle;

  return (
    <div className="hero-object-shell">
      <button
        type="button"
        className="hero-object-button"
        aria-label={label}
        aria-pressed={systemActive}
        onClick={onToggleSystem}
        data-cursor="hover"
      >
        <span className="hero-object-aura" aria-hidden="true" />
        <PortraitFallback systemActive={systemActive} />
        <span className="hero-object-corner hero-object-corner-tl" aria-hidden="true" />
        <span className="hero-object-corner hero-object-corner-br" aria-hidden="true" />
        <span className="hero-object-label" aria-hidden="true">{label}</span>
      </button>
    </div>
  );
}
import { useState } from "react";
