import { useCallback, useEffect, useState } from "react";

export function useSystemMode() {
  // System mode is deliberately transient. Restoring it during hydration made
  // its transition run without a user action on later visits.
  const [active, setActive] = useState(false);
  const [transitionId, setTransitionId] = useState(0);

  useEffect(() => {
    if (active) {
      document.documentElement.setAttribute("data-system-mode", "on");
    } else {
      document.documentElement.removeAttribute("data-system-mode");
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
        setTransitionId((id) => id + 1);
        setActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggle = useCallback(() => {
    navigator.vibrate?.(12);
    setActive((prev) => !prev);
  }, []);

  const toggleFromControl = useCallback(() => {
    setTransitionId((id) => id + 1);
    toggle();
  }, [toggle]);

  return { active, transitionId, toggle: toggleFromControl };
}
