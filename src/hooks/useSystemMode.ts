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

export function useSystemMode() {
  // System mode is deliberately transient. Restoring it during hydration made
  // its transition run without a user action on later visits.
  const [active, setActive] = useState(false);
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
      if (!laserEnabled) {
        document.documentElement.setAttribute("data-system-mode", "on");
        domIsVioletRef.current = true;
        return;
      }
      // Hold off setting the attr so the activation wipe runs in the current
      // blue accent, then snaps the page to violet once the beam has passed.
      const timer = setTimeout(() => {
        if (activeRef.current) {
          document.documentElement.setAttribute("data-system-mode", "on");
          domIsVioletRef.current = true;
        }
      }, 720);
      return () => clearTimeout(timer);
    }

    // Deactivation — no laser or first mount: snap immediately.
    if (!laserEnabled || !hasActivatedRef.current) {
      document.documentElement.removeAttribute("data-system-mode");
      domIsVioletRef.current = false;
      return;
    }

    if (domIsVioletRef.current) {
      // Page is actually violet: keep it violet while the wipe-out runs,
      // then snap to blue once the beam has cleared.
      document.documentElement.setAttribute("data-system-mode", "off");
      domIsVioletRef.current = false;
      const timer = setTimeout(() => {
        if (!activeRef.current) {
          document.documentElement.removeAttribute("data-system-mode");
        }
      }, 720);
      return () => clearTimeout(timer);
    }

    // Rapid deactivation before the activation timer fired — page was never
    // violet, so there is nothing to keep or animate away.
    document.documentElement.removeAttribute("data-system-mode");
  }, [active, laserEnabled]);

  const toggle = useCallback(() => {
    const next = !activeRef.current;
    activeRef.current = next;
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
