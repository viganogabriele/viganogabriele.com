/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type MotionLevel = "full" | "lite" | "static";

export interface MotionProfile {
  level: MotionLevel;
  canUseWebGL: boolean;
  canUsePointerEffects: boolean;
  prefersReducedMotion: boolean;
  saveData: boolean;
  isCompact: boolean;
}

const defaultProfile: MotionProfile = {
  level: "lite",
  canUseWebGL: false,
  canUsePointerEffects: false,
  prefersReducedMotion: false,
  saveData: false,
  isCompact: false,
};

const MotionProfileContext = createContext<MotionProfile>(defaultProfile);

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

let cachedWebGLSupport: boolean | undefined;

function supportsWebGL() {
  if (cachedWebGLSupport !== undefined) return cachedWebGLSupport;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    cachedWebGLSupport = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return cachedWebGLSupport;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}

function readProfile(): MotionProfile {
  if (typeof window === "undefined") return defaultProfile;
  const nav = navigator as NavigatorWithHints;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isCompact = window.innerWidth < 768;
  const saveData = Boolean(nav.connection?.saveData);
  const isTelegram = /Telegram/i.test(nav.userAgent);
  const memory = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;
  const capableHardware = memory >= 4 && cores >= 4;
  const canUseWebGL = !prefersReducedMotion && !saveData && !isTelegram && capableHardware && supportsWebGL();
  const level: MotionLevel = prefersReducedMotion || saveData ? "static" : canUseWebGL ? "full" : "lite";

  return {
    level,
    canUseWebGL,
    canUsePointerEffects: finePointer && !prefersReducedMotion,
    prefersReducedMotion,
    saveData,
    isCompact,
  };
}

export function MotionProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<MotionProfile>(() => readProfile());

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const refresh = () => setProfile((current) => {
      const next = readProfile();
      return Object.keys(next).every((key) => next[key as keyof MotionProfile] === current[key as keyof MotionProfile]) ? current : next;
    });
    reduced.addEventListener("change", refresh);
    pointer.addEventListener("change", refresh);
    window.addEventListener("resize", refresh, { passive: true });
    return () => {
      reduced.removeEventListener("change", refresh);
      pointer.removeEventListener("change", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  const value = useMemo(() => profile, [profile]);
  return <MotionProfileContext.Provider value={value}>{children}</MotionProfileContext.Provider>;
}

export function useMotionProfile() {
  return useContext(MotionProfileContext);
}
