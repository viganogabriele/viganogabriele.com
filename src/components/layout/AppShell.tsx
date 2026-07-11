import type { ReactNode } from "react";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { AmbientBackground } from "../motion/AmbientBackground";
import { CustomCursor } from "../motion/CustomCursor";

export function AppShell({ children }: { children: ReactNode }) {
  const { isTelegramWebView } = useFeatureDetect();
  return <div className={`noise min-h-screen overflow-x-clip bg-[#050608] text-zinc-300 selection:bg-cyan-200/20 selection:text-white ${isTelegramWebView ? "telegram-safe" : ""}`}><a href="#main-content" className="skip-link">Skip to content</a><CustomCursor /><AmbientBackground /><div className="relative z-10">{children}</div></div>;
}
