import type { ReactNode } from "react";
import { AmbientBackground } from "../motion/AmbientBackground";
import { CustomCursor } from "../motion/CustomCursor";

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="noise min-h-screen overflow-x-clip bg-background text-zinc-300 selection:bg-accent/20 selection:text-white"><a href="#main-content" className="skip-link">Skip to content</a><CustomCursor /><AmbientBackground /><div className="relative z-10">{children}</div></div>;
}
