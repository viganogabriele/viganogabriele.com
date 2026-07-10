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

  const toggle = useCallback(() => setActive((prev) => !prev), []);

  return { active, toggle };
}
