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

// Same rationale as `sharedSystemActive` above, but for whether SYS has ever
// been turned on this tab. A per-instance ref left a route transition that
// mounts a fresh instance while the previous one is still holding the 460 ms
// exit ("off") state: the new instance's ref started at false, read as
// "first mount", and stripped `data-system-mode` immediately, cutting the
// exit laser short.
let sharedHasActivated = false;

// Route transitions briefly mount both the exiting and entering page
// (AnimatePresence mode="sync"), so two `useSystemMode()` instances can be
// alive at once, each with its own window keydown listener. Without this,
// a single Shift+S press during that overlap fires both listeners for the
// same physical event, double-toggling the shared state back to its
// original value while each instance's local `active` disagrees about why.
const handledToggleEvents = new WeakSet<KeyboardEvent>();

export function useSystemMode() {
  const [active, setActive] = useState(sharedSystemActive);
  const [transitionId, setTransitionId] = useState(0);
  const activeRef = useRef(active);
  const [webkitSafeMode] = useState(usesAppleWebKit);
  const [laserEnabled] = useState(() => !isDesktopSafari());

  useEffect(() => {
    if (!webkitSafeMode) return;
    document.documentElement.setAttribute("data-webkit-safe", "");
    return () => document.documentElement.removeAttribute("data-webkit-safe");
  }, [webkitSafeMode]);

  useEffect(() => {
    activeRef.current = active;
    if (active) {
      sharedHasActivated = true;
      // Enter SYS in the same frame as the laser. Delaying this flip left the
      // overlay and HUD blue while the rest of the transition had already
      // started, creating a visible second phase after the sweep.
      document.documentElement.setAttribute("data-system-mode", "on");
      return;
    }

    // Deactivation — no laser or first mount: snap immediately.
    if (!laserEnabled || !sharedHasActivated) {
      document.documentElement.removeAttribute("data-system-mode");
      return;
    }

    if (document.documentElement.getAttribute("data-system-mode") === "off") {
      // `toggle()` owns the synchronous on -> off transition so the accent
      // changes in the same frame as the exit laser. This effect owns only
      // the delayed removal after the beam has cleared.
      const timer = setTimeout(() => {
        if (!activeRef.current) {
          document.documentElement.removeAttribute("data-system-mode");
        }
      }, 460);
      return () => clearTimeout(timer);
    }

    // No violet exit state exists, so there is nothing to hold.
    document.documentElement.removeAttribute("data-system-mode");
  }, [active, laserEnabled]);

  const toggle = useCallback(() => {
    const next = !activeRef.current;
    activeRef.current = next;
    sharedSystemActive = next;

    // Apply the accent synchronously with the interaction, before React's
    // post-render effects, so the laser and all SYS UI share one transition.
    if (next) {
      sharedHasActivated = true;
      document.documentElement.setAttribute("data-system-mode", "on");
    } else {
      // Keep the violet tokens in their explicit exit state while the laser
      // clears. The inactive effect removes the attribute after 460 ms.
      if (laserEnabled && sharedHasActivated) {
        document.documentElement.setAttribute("data-system-mode", "off");
      } else {
        document.documentElement.removeAttribute("data-system-mode");
      }
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
  }, [laserEnabled]);

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
      if (handledToggleEvents.has(event)) return;
      handledToggleEvents.add(event);
      toggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  // Keep every concurrently mounted instance (see the overlap note above the
  // WeakSet) in sync with whichever instance actually toggled, so a page that
  // didn't originate the change never surfaces with stale local `active`.
  // Also bumps this instance's own `transitionId` so its SystemModeOverlay
  // plays the wipe and announces the change too — without this, only the
  // instance that originated the toggle animated, and an overlapping route
  // mounted during a transition sat there with a stale accent and no wipe.
  useEffect(() => {
    const handler = (event: CustomEvent<SystemToggleDetail>) => {
      const next = event.detail.active;
      if (next === activeRef.current) return;
      activeRef.current = next;
      if (next) sharedHasActivated = true;
      setActive(next);
      setTransitionId((id) => id + 1);
    };
    window.addEventListener("sys:toggle", handler);
    return () => window.removeEventListener("sys:toggle", handler);
  }, []);

  return { active, transitionId, toggle, webkitSafeMode, laserEnabled };
}
