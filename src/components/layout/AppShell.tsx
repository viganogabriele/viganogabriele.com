import type { ReactNode } from "react";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { AmbientBackground } from "../motion/AmbientBackground";
import { CustomCursor } from "../motion/CustomCursor";

export function AppShell({ children }: { children: ReactNode }) {
  const { isTouch } = useFeatureDetect();
  return <div className={`${isTouch ? "" : "noise"} min-h-screen overflow-x-clip bg-background text-zinc-300 selection:bg-accent/20 selection:text-white`}><a href="#main-content" className="skip-link">Skip to content</a><CustomCursor />{!isTouch && <AmbientBackground />}<div className="relative z-10">{children}</div></div>;
}
