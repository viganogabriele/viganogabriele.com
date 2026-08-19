import { lazy, Suspense, type ReactNode } from "react";
import { AmbientBackground } from "../motion/AmbientBackground";
import { useMotionProfile } from "../../hooks/useMotionProfile";

// The cursor is a desktop-only enhancement. Keep its event listeners and
// spring code out of the initial route chunk on touch, reduced-motion, and
// lower-capability devices where it can never mount.
const CustomCursor = lazy(() => import("../motion/CustomCursor").then((module) => ({ default: module.CustomCursor })));

export function AppShell({ children }: { children: ReactNode }) {
  const { canUsePointerEffects } = useMotionProfile();
  return <div className="noise min-h-screen overflow-x-clip bg-background text-zinc-300 selection:bg-accent/20 selection:text-white"><a href="#main-content" className="skip-link">Skip to content</a>{canUsePointerEffects && <Suspense fallback={null}><CustomCursor /></Suspense>}<AmbientBackground /><div className="relative z-10">{children}</div></div>;
}
