/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onViewportWidthChange } from "../lib/viewport";

export type MotionLevel = "full" | "lite" | "static";

export interface MotionProfile {
  level: MotionLevel;
  canUsePointerEffects: boolean;
  prefersReducedMotion: boolean;
  saveData: boolean;
  isCompact: boolean;
}

const defaultProfile: MotionProfile = {
  level: "lite",
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

function readProfile(): MotionProfile {
  if (typeof window === "undefined") return defaultProfile;
  const nav = navigator as NavigatorWithHints;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // A touch screen is authoritative over the pointer media queries: Brave with
  // "Desktop site" and in-app webviews report hover/fine-pointer on phones,
  // which used to hand them the full desktop treatment (custom cursor, WebGL
  // hero, blurred ambient blobs) on mobile hardware.
  const isTouch = "ontouchstart" in window || nav.maxTouchPoints > 0;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !isTouch;
  const isCompact = window.innerWidth < 768 || isTouch;
  const saveData = Boolean(nav.connection?.saveData);
  const isTelegram = /Telegram/i.test(nav.userAgent);
  const memory = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;
  const capableHardware = memory >= 4 && cores >= 4;
  // "full" buys the optional flourishes — blurred ambient blobs, looping
  // pulses, the SYS aura ring. Everything that carries meaning renders at
  // "lite" too, so this can stay conservative.
  const canRunFullMotion = !prefersReducedMotion && !saveData && !isTelegram && !isTouch && capableHardware;
  const level: MotionLevel = prefersReducedMotion ? "static" : canRunFullMotion ? "full" : "lite";

  return {
    level,
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
    // Nothing this profile reads can change from a width-unchanged resize
    // (the mobile URL bar collapsing) — skip the matchMedia work then.
    const removeResizeListener = onViewportWidthChange(refresh);
    return () => {
      reduced.removeEventListener("change", refresh);
      pointer.removeEventListener("change", refresh);
      removeResizeListener();
    };
  }, []);

  return <MotionProfileContext.Provider value={profile}>{children}</MotionProfileContext.Provider>;
}

export function useMotionProfile() {
  return useContext(MotionProfileContext);
}
