/**
 * The width at which the hero portrait frame appears.
 *
 * Written in rem, not 640px, because that is what it has to agree with:
 * Tailwind's `sm:` compiles to `@media (width>=40rem)`, and rem in a media
 * query resolves against the browser's default font size. A reader who has
 * raised or lowered that default moves the breakpoint, and the two conditions
 * only stay in step if they are expressed in the same unit. Out of step, a
 * smaller default paints an empty portrait frame — the frame is shown while no
 * <source> matches — and a larger one puts the fetch back on phones.
 *
 * Used by the frame's `sm:block`, the `<source media>` on both portrait
 * layers, the preload in index.html, and the readiness gate in HomePage.
 */
export const HERO_PORTRAIT_MEDIA = "(min-width: 40rem)";

// Mobile browsers collapse/expand their URL bar as the scroll direction
// reverses, firing `resize` with a changed innerHeight but an unchanged
// innerWidth. Anything that reacts to `resize` to recompute a height-derived
// value (viewport-relative probes, layout ranges) must ignore those events —
// otherwise it recomputes mid-scroll and visibly jumps. Real viewport changes
// (rotation, window resize, devtools docking) always move the width too.
export function onViewportWidthChange(handler: () => void) {
  let width = window.innerWidth;
  const listener = () => {
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    handler();
  };
  window.addEventListener("resize", listener, { passive: true });
  return () => window.removeEventListener("resize", listener);
}

function setStableViewportHeight() {
  const height = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty("--stable-viewport-height", `${Math.round(height)}px`);
}

export function installStableTouchViewport() {
  const root = document.documentElement;
  if (!root.hasAttribute("data-touch")) return;
  if (!root.style.getPropertyValue("--stable-viewport-height")) setStableViewportHeight();
  onViewportWidthChange(setStableViewportHeight);
}
