import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export const MODEL_URL = "/models/gabriele-head.glb";

type HeroSceneModule = typeof import("../components/ui/HeroHeadScene");

let modulePromise: Promise<HeroSceneModule> | null = null;
let gltfPromise: Promise<GLTF> | null = null;
let prefetchStarted = false;

/** Single shared promise for the lazy scene chunk (three + scene code). */
export function loadHeroSceneModule(): Promise<HeroSceneModule> {
  modulePromise ??= import("../components/ui/HeroHeadScene");
  return modulePromise;
}

/**
 * Single shared promise for the parsed head model. The decoded GLTF is cached
 * for the whole session so re-entering system mode never refetches or reparses;
 * consumers must clone the scene and never dispose the shared geometry.
 */
export function loadHeadGltf(): Promise<GLTF> {
  gltfPromise ??= (async () => {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import("three/examples/jsm/loaders/GLTFLoader.js"),
      import("three/examples/jsm/libs/meshopt_decoder.module.js"),
    ]);
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    return loader.loadAsync(MODEL_URL);
  })().catch((error) => {
    gltfPromise = null; // allow a retry on the next toggle
    throw error;
  });
  return gltfPromise;
}

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * Warm the system-mode 3D path during browser idle time so the first SYS
 * toggle swaps in the mesh without a network round trip. Respects Save-Data
 * and slow connections: 2g gets nothing, 3g only the code chunk.
 */
export function prefetchHeroHead(canUseWebGL: boolean, immediate = false) {
  if (!canUseWebGL || prefetchStarted) return;
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  const effectiveType = connection?.effectiveType ?? "";
  if (connection?.saveData || /(^|-)2g$/.test(effectiveType)) return;
  prefetchStarted = true;

  const warm = () => {
    void loadHeroSceneModule().catch(() => undefined);
    if (effectiveType !== "3g") void loadHeadGltf().catch(() => undefined);
  };
  if (immediate) {
    warm();
    return;
  }
  const idle = window.requestIdleCallback?.bind(window); // absent on iOS Safari
  if (idle) {
    idle(warm, { timeout: 8000 });
  } else {
    window.setTimeout(warm, 2500);
  }
}
