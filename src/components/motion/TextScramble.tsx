import { useCallback, useEffect, useRef, useState } from "react";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export function TextScramble({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const { hasNoHover } = useFeatureDetect();
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
    scramble();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [scramble]);
  return (
    <span
      className={className}
      onMouseEnter={() => !hasNoHover && scramble()}
      aria-label={text}
    >
      {display}
    </span>
  );
}
