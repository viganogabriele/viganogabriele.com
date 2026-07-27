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
