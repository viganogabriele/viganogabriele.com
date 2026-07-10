import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { cn } from "../../lib/cn";
import { IdentityPortrait } from "./IdentityPortrait";

const FaceHeroScene = lazy(() =>
  import("./FaceHeroScene").then(({ FaceHeroScene: Scene }) => ({ default: Scene })),
);

const OPTIONAL_FALLBACK = "/images/gabriele-head-fallback.webp";
const MODEL_URL = "/models/gabriele-head.glb";

type ModelStatus = "checking" | "available" | "unavailable";

function useModelStatus(url: string, enabled: boolean) {
  const [status, setStatus] = useState<ModelStatus>("checking");

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const checkModel = async () => {
      try {
        let response = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (response.status === 405) {
          response = await fetch(url, {
            cache: "no-store",
            headers: { Range: "bytes=0-0" },
          });
        }
        const isHtml = response.headers.get("content-type")?.includes("text/html");
        if (mounted) setStatus(response.ok && !isHtml ? "available" : "unavailable");
      } catch {
        if (mounted) setStatus("unavailable");
      }
    };

    void checkModel();
    return () => { mounted = false; };
  }, [enabled, url]);

  return status;
}

export function FaceHero3D({ systemActive }: { systemActive: boolean }) {
  const reduced = useReducedMotion();
  const { isCompact, isTelegramWebView, isTouch, hasNoHover } = useFeatureDetect();
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const usePhotoFallback = Boolean(reduced || isTelegramWebView);
  const useStaticScene = Boolean(isCompact || isTouch || hasNoHover);
  const modelStatus = useModelStatus(MODEL_URL, !usePhotoFallback);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const onSceneError = useCallback(() => setSceneFailed(true), []);

  if (usePhotoFallback) {
    return <IdentityPortrait fallbackImage={OPTIONAL_FALLBACK} />;
  }

  return (
    <div className="face-hero-frame relative mx-auto w-[min(74vw,22rem)] sm:w-[20rem] lg:w-[25rem]">
      <IdentityPortrait className="w-full" fallbackImage={OPTIONAL_FALLBACK} />
      {modelStatus === "available" && !sceneFailed && (
        <div
          aria-hidden
          className={cn(
            "face-hero-canvas pointer-events-none absolute inset-0 overflow-hidden rounded-[2px] transition-opacity duration-700",
            sceneReady ? useStaticScene ? "opacity-100" : "pointer-events-auto opacity-100" : "opacity-0",
          )}
        >
          <Suspense fallback={null}>
            <FaceHeroScene modelUrl={MODEL_URL} systemActive={systemActive} staticScene={useStaticScene} onReady={onSceneReady} onError={onSceneError} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
