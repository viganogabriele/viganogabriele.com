import { useEffect, type ReactNode } from "react";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { startPointerTracking } from "../../lib/pointerPosition";
import { AmbientBackground } from "../motion/AmbientBackground";
import { CustomCursor } from "../motion/CustomCursor";

export function AppShell({ children }: { children: ReactNode }) {
  const { isTelegramWebView } = useFeatureDetect();
  // So anything mounted by a click — the SYS lens — can appear under the
  // pointer immediately rather than on its next move.
  useEffect(startPointerTracking, []);
  return <div className={`noise min-h-screen overflow-x-clip bg-background text-zinc-300 selection:bg-accent/20 selection:text-white ${isTelegramWebView ? "telegram-safe" : ""}`}><a href="#main-content" className="skip-link">Skip to content</a><CustomCursor /><AmbientBackground /><div className="relative z-10">{children}</div></div>;
}
