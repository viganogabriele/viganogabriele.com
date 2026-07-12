import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gv-system-mode";

export function useSystemMode() {
  const [active, setActive] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "on";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (active) {
      document.documentElement.setAttribute("data-system-mode", "on");
    } else {
      document.documentElement.removeAttribute("data-system-mode");
    }
    try {
      localStorage.setItem(STORAGE_KEY, active ? "on" : "off");
    } catch {
      // ignore storage errors in restricted contexts
    }
    window.dispatchEvent(new CustomEvent("sys:toggle", { detail: { active } }));
  }, [active]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "s" &&
        e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggle = useCallback(() => setActive((prev) => {
    // A short, optional tactile acknowledgement makes SYS feel like an
    // instrument control without assuming that vibration is available.
    navigator.vibrate?.(12);
    return !prev;
  }), []);

  return { active, toggle };
}
