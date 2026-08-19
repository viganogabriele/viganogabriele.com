import { useCallback, useEffect, useRef, useState } from "react";

export interface SystemToggleDetail {
  active: boolean;
}

declare global {
  interface WindowEventMap {
    "sys:toggle": CustomEvent<SystemToggleDetail>;
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable]"));
}

function usesAppleWebKit() {
  const userAgent = navigator.userAgent;
  return /AppleWebKit/i.test(userAgent) && (isIOSLike() || !/(Chrome|Chromium|Edg|OPR)/i.test(userAgent));
}

function isIOSLike() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isDesktopSafari() {
  const userAgent = navigator.userAgent;
  const alternativeBrowser = /(Chrome|Chromium|CriOS|FxiOS|EdgiOS|EdgA|Edg|OPR|OPiOS)/i.test(userAgent);
  return (
    !isIOSLike() &&
    /AppleWebKit/i.test(userAgent) &&
    /Safari/i.test(userAgent) &&
    /Apple/i.test(navigator.vendor) &&
    !alternativeBrowser
  );
}

// Shared across every `useSystemMode()` instance for the life of the tab, but
// deliberately never written to storage. Home and the CV page each mount
// their own instance (unmounting one loses its local `active` state), and
// without this a route change bounced the accent back to blue until the
// reader toggled it again. Restoring it from storage during hydration was
// tried and reverted: the transition then replayed on a fresh page load the
// reader never asked for. In-memory-only gets cross-route continuity within a
// session without that replay, since a full reload always starts from false.
let sharedSystemActive = false;

export function useSystemMode() {
  const [active, setActive] = useState(sharedSystemActive);
  const [transitionId, setTransitionId] = useState(0);
  const activeRef = useRef(active);
  const [webkitSafeMode] = useState(usesAppleWebKit);
  const [laserEnabled] = useState(() => !isDesktopSafari());
  const hasActivatedRef = useRef(false);
  const domIsVioletRef = useRef(false);

  useEffect(() => {
    if (!webkitSafeMode) return;
    document.documentElement.setAttribute("data-webkit-safe", "");
    return () => document.documentElement.removeAttribute("data-webkit-safe");
  }, [webkitSafeMode]);

  useEffect(() => {
    activeRef.current = active;
    if (active) {
      hasActivatedRef.current = true;
      // Enter SYS in the same frame as the laser. Delaying this flip left the
      // overlay and HUD blue while the rest of the transition had already
      // started, creating a visible second phase after the sweep.
      document.documentElement.setAttribute("data-system-mode", "on");
      domIsVioletRef.current = true;
      return;
    }

    // Deactivation — no laser or first mount: snap immediately.
    if (!laserEnabled || !hasActivatedRef.current) {
      document.documentElement.removeAttribute("data-system-mode");
      domIsVioletRef.current = false;
      return;
    }

    if (domIsVioletRef.current) {
      // Page is actually violet: keep it violet until the beam has cleared.
      document.documentElement.setAttribute("data-system-mode", "off");
      domIsVioletRef.current = false;
      const timer = setTimeout(() => {
        if (!activeRef.current) {
          document.documentElement.removeAttribute("data-system-mode");
        }
      }, 460);
      return () => clearTimeout(timer);
    }

    // Rapid deactivation before the activation timer fired — page was never
    // violet, so there is nothing to keep or animate away.
    document.documentElement.removeAttribute("data-system-mode");
  }, [active, laserEnabled]);

  const toggle = useCallback(() => {
    const next = !activeRef.current;
    activeRef.current = next;
    sharedSystemActive = next;

    // Apply the accent synchronously with the interaction, before React's
    // post-render effects, so the laser and all SYS UI share one transition.
    if (next) {
      hasActivatedRef.current = true;
      domIsVioletRef.current = true;
      document.documentElement.setAttribute("data-system-mode", "on");
    } else {
      // The SYS overlay leaves immediately, so restore the shared accent in
      // the same frame rather than leaving counters violet after it is gone.
      domIsVioletRef.current = false;
      document.documentElement.removeAttribute("data-system-mode");
    }
    setTransitionId((id) => id + 1);

    // Vibration is an optional enhancement. Safari does not implement it and
    // privacy/browser extensions can expose a throwing implementation.
    try {
      navigator.vibrate?.(12);
    } catch {
      // A haptic failure must never block the visible state transition.
    }

    setActive(next);
    window.dispatchEvent(new CustomEvent<SystemToggleDetail>("sys:toggle", { detail: { active: next } }));
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.key.toLowerCase() !== "s" ||
        !event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        isEditableTarget(event.target)
      ) return;

      event.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  return { active, transitionId, toggle, webkitSafeMode, laserEnabled };
}
