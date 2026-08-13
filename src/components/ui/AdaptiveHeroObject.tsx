import { useEffect, useState } from "react";
import photoAvif from "../../assets/gabriele-photo.avif";
import photoWebp from "../../assets/gabriele-photo.webp";
import systemPhotoAvif from "../../assets/gabriele-photo-sys.avif";
import systemPhotoWebp from "../../assets/gabriele-photo-sys.webp";
import { heroCopy } from "../../data/sections";
import { HERO_PORTRAIT_MEDIA } from "../../lib/viewport";

/**
 * The SYS portrait is 58kB that most visits never paint — SYS is off by
 * default. Hold its source back until someone signals they want the mode,
 * using the same pointer/focus intent signal lib/routePrefetch uses for
 * routes, so the swap is still warm by the time the toggle is pressed.
 * Touch has no hover: there the fetch starts on activation, and the photo
 * layer covers the gap exactly as it already does on a slow connection.
 */
function useSystemPortraitArmed(systemActive: boolean) {
  const [armed, setArmed] = useState(systemActive);
  // Adjusted during render (React's documented pattern for state derived from
  // a prop change) rather than in an effect, so the source is on the element
  // in the same commit that turns SYS on.
  if (systemActive && !armed) setArmed(true);

  useEffect(() => {
    if (armed) return;
    const arm = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("[data-sys-toggle], .hero-object-button")) return;
      setArmed(true);
    };
    document.addEventListener("pointerover", arm, { passive: true });
    document.addEventListener("focusin", arm);
    return () => {
      document.removeEventListener("pointerover", arm);
      document.removeEventListener("focusin", arm);
    };
  }, [armed]);

  return armed;
}

function PortraitFallback({ systemActive }: { systemActive: boolean }) {
  const [systemPortraitReady, setSystemPortraitReady] = useState(false);
  const systemPortraitArmed = useSystemPortraitArmed(systemActive);
  const showSystemPortrait = systemActive && systemPortraitReady;

  return (
    <div className="hero-fallback">
      <div className="hero-fallback-motion h-full w-full">
        {/* The photograph rests here and SYS swaps in the SYS portrait. Both
            layers stay mounted: toggling would otherwise show a gap while the
            second image decodes. Only the photo gets high fetch priority, since
            it is the one the hero is measured on.

            Every source is gated on HERO_PORTRAIT_MEDIA, which mirrors the `hidden
            sm:block` on .hero-visual-frame in Hero.tsx. A phone paints none of
            this, but an <img src> inside a display:none subtree is still
            fetched, so the photograph cost every mobile visit ~14kB to render
            nothing. With the source list empty below the breakpoint the <img>
            resolves to no candidate and asks for nothing; crossing the breakpoint makes
            the browser re-run selection and load it. */}
        <picture className="hero-portrait-layer" data-hero-portrait-layer="photo" data-visible={!showSystemPortrait}>
          <source media={HERO_PORTRAIT_MEDIA} srcSet={photoAvif} type="image/avif" />
          <source media={HERO_PORTRAIT_MEDIA} srcSet={photoWebp} type="image/webp" />
          <img
            data-hero-portrait
            alt=""
            width="1200"
            height="1200"
            decoding="async"
            fetchPriority="high"
            className="hero-portrait hero-portrait--photo h-full w-full object-cover object-top"
          />
        </picture>
        <picture className="hero-portrait-layer" data-hero-portrait-layer="system" data-visible={showSystemPortrait}>
          {systemPortraitArmed && <source media={HERO_PORTRAIT_MEDIA} srcSet={systemPhotoAvif} type="image/avif" />}
          {systemPortraitArmed && <source media={HERO_PORTRAIT_MEDIA} srcSet={systemPhotoWebp} type="image/webp" />}
          <img
            alt=""
            width="1254"
            height="1254"
            decoding="async"
            fetchPriority="low"
            onLoad={() => setSystemPortraitReady(true)}
            className="hero-portrait hero-portrait--system h-full w-full object-cover object-top"
          />
        </picture>
      </div>
      <span className="hero-fallback-grid" />
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
