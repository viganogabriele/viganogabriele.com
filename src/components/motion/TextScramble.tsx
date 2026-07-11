import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionProfile } from "../../hooks/useMotionProfile";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export function TextScramble({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const { level, canUsePointerEffects } = useMotionProfile();
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
