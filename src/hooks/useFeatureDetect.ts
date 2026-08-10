import { useEffect, useState } from "react";
import { onViewportWidthChange } from "../lib/viewport";

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const hasNoHoverPointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

const isTelegramBrowser = () =>
  typeof navigator !== "undefined" && /Telegram/i.test(navigator.userAgent);

export function useFeatureDetect() {
  const [isTouch] = useState(() => isTouchDevice());
  const [hasNoHover] = useState(() => hasNoHoverPointer());
  const [isTelegramWebView] = useState(() => isTelegramBrowser());
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => onViewportWidthChange(() => setIsCompact(window.innerWidth < 768)), []);

  return { isTouch, hasNoHover, isTelegramWebView, isCompact };
}
