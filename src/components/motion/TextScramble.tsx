import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import type { SystemToggleDetail } from "../../hooks/useSystemMode";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export function TextScramble({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const { level, canUsePointerEffects, isCompact } = useMotionProfile();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scramble = useCallback(() => {
    let frame = 0;
    const tick = () => {
      frame += 1;
      const progress = frame / 16;
      setDisplay(text.split("").map((character, index) => {
        if (character === " " || index / text.length < progress) return character;
        return characters[Math.floor(Math.random() * characters.length)];
      }).join(""));
      if (frame < 16) timer.current = setTimeout(tick, 30);
      else setDisplay(text);
    };
    if (timer.current) clearTimeout(timer.current);
    tick();
  }, [text]);
  useEffect(() => {
    if (level !== "static") scramble();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [level, scramble]);
  useEffect(() => {
    const onSystemToggle = (event: CustomEvent<SystemToggleDetail>) => {
      // Reading the typed detail also keeps this listener compatible with
      // consumers that use SYS state to coordinate other visual responses.
      // On compact layouts, the temporary glyph widths can rewrap the hero
      // tagline and move the content below it. Keep the toggle feedback
      // layout-stable there while preserving the desktop response.
      if (typeof event.detail.active === "boolean" && level !== "static" && !isCompact) scramble();
    };
    window.addEventListener("sys:toggle", onSystemToggle);
    return () => window.removeEventListener("sys:toggle", onSystemToggle);
  }, [isCompact, level, scramble]);
  return (
    <span
      className={className}
      onMouseEnter={() => canUsePointerEffects && scramble()}
      aria-label={text}
    >
      {display}
    </span>
  );
}
