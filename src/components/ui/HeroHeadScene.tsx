import { useEffect, useRef } from "react";
import { loadHeadGltf } from "../../lib/headModel";

type SceneKit = {
  base: import("three").MeshStandardMaterial;
  hair: import("three").MeshStandardMaterial;
  glint: import("three").MeshStandardMaterial;
  points: import("three").PointsMaterial;
  wireBase: import("three").MeshBasicMaterial;
  wireHair: import("three").MeshBasicMaterial;
  baseMeshes: import("three").Mesh[];
  hairMeshes: import("three").Mesh[];
};

// Normal mode: lit dark graphite. Scan mode: unlit phosphor wireframe — the
// model ships without NORMALs (flat shading uses triangle derivatives), and
// on GL line primitives those derivatives degenerate, so a lit wireframe
// would render black. Swapping to MeshBasicMaterial sidesteps lighting.
function applyMode(kit: SceneKit, scan: boolean) {
  for (const mesh of kit.baseMeshes) mesh.material = scan ? kit.wireBase : kit.base;
  for (const mesh of kit.hairMeshes) mesh.material = scan ? kit.wireHair : kit.hair;
  kit.glint.emissiveIntensity = scan ? 1.1 : 0.55;
  kit.points.opacity = scan ? 0.95 : 0.55;
}

export default function HeroHeadScene({ scan, onError, onReady }: { scan: boolean; onError: () => void; onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<SceneKit | null>(null);

  useEffect(() => {
    if (materialsRef.current) applyMode(materialsRef.current, scan);
  }, [scan]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let frame = 0;
    let visible = true;
    let model: import("three").Group | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const setup = async () => {
      const [THREE, gltf] = await Promise.all([import("three"), loadHeadGltf()]);
      if (disposed) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0.05, 6.2);
      // High-DPI screens antialias naturally through density; MSAA is only
      // worth its cost when the backing store is coarse.
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 1.75);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: dpr < 1.75, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(dpr);
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      // 3 lights: hemisphere carries the violet ground bounce the removed
      // point light used to provide.
      scene.add(new THREE.HemisphereLight(0xa9efff, 0x1a1030, 1.65));
      const key = new THREE.DirectionalLight(0xe9fbff, 4.1);
      key.position.set(-2.5, 3.5, 4);
      scene.add(key);
      const rim = new THREE.PointLight(0x62d9ff, 16, 10);
      rim.position.set(2.4, 0.8, 2.6);
      scene.add(rim);

      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      // Shared materials, assigned by node/material name — the whole head is
      // a handful of merged primitives, so mode switches touch 3 materials
      // instead of one per mesh.
      const kit: SceneKit = {
        base: new THREE.MeshStandardMaterial({ color: 0x101820, emissive: 0x02080b, emissiveIntensity: 0.22, metalness: 0.76, roughness: 0.3, flatShading: true }),
        hair: new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x01050a, emissiveIntensity: 0.2, metalness: 0.55, roughness: 0.5, flatShading: true }),
        glint: new THREE.MeshStandardMaterial({ color: 0x1a1208, emissive: 0xd9a05b, emissiveIntensity: 0.55, roughness: 0.4 }),
        points: new THREE.PointsMaterial({ color: 0x9fb4c4, size: 0.014, transparent: true, opacity: 0.55, sizeAttenuation: true }),
        wireBase: new THREE.MeshBasicMaterial({ color: 0x6fce4a, wireframe: true, transparent: true, opacity: 0.5 }),
        wireHair: new THREE.MeshBasicMaterial({ color: 0x3f7a2e, wireframe: true, transparent: true, opacity: 0.38 }),
        baseMeshes: [],
        hairMeshes: [],
      };
      materialsRef.current = kit;

      // Clone the cached GLTF scene: geometry stays shared (and is never
      // disposed here) so re-entering system mode is instant.
      model = gltf.scene.clone(true);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const fit = 3.15 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(fit);
      model.rotation.set(0.03, -0.12, 0);
      model.traverse((child) => {
        const sourceName = `${child.name} ${(child as { material?: { name?: string } }).material?.name ?? ""}`;
        if (child instanceof THREE.Points) {
          child.material = kit.points;
        } else if (child instanceof THREE.Mesh) {
          if (/glint/i.test(sourceName)) child.material = kit.glint;
          else if (/hair/i.test(sourceName)) kit.hairMeshes.push(child);
          else kit.baseMeshes.push(child);
        }
      });
      applyMode(kit, scan);
      scene.add(model);

      const pointer = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.32;
        targetX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.18;
      };
      const resetPointer = () => { targetX = 0; targetY = 0; };
      const onVisibility = () => { visible = !document.hidden; if (visible && !frame) frame = requestAnimationFrame(render); };
      const intersection = new IntersectionObserver(([entry]) => {
        visible = Boolean(entry?.isIntersecting) && !document.hidden;
        if (visible && !frame) frame = requestAnimationFrame(render);
      }, { rootMargin: "120px" });

      const onContextLost = (event: Event) => {
        event.preventDefault();
        onError();
      };
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);

      let announcedReady = false;
      const render = (time: number) => {
        frame = 0;
        if (!visible || disposed) return;
        if (!announcedReady) {
          announcedReady = true;
          // First real frame is about to be presented — let the host crossfade.
          onReady?.();
        }
        // Scroll progress read inline: the loop is already rAF-gated and
        // stops off-screen, so a scroll listener would be redundant.
        const scrollProgress = Math.min(1, window.scrollY / Math.max(420, window.innerHeight * 0.7));
        currentX += (targetX - currentX) * 0.055;
        currentY += (targetY - currentY) * 0.055;
        if (model) {
          model.rotation.x = 0.03 + currentX;
          model.rotation.y = -0.12 + currentY + Math.sin(time * 0.00028) * 0.075;
          model.position.z = scrollProgress * 0.35;
          model.position.y = -scrollProgress * 0.18;
        }
        rim.intensity = 16 - scrollProgress * 5;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };

      host.addEventListener("pointermove", pointer, { passive: true });
      host.addEventListener("pointerleave", resetPointer);
      document.addEventListener("visibilitychange", onVisibility);
      intersection.observe(host);
      frame = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(frame);
        intersection.disconnect();
        resizeObserver.disconnect();
        host.removeEventListener("pointermove", pointer);
        host.removeEventListener("pointerleave", resetPointer);
        document.removeEventListener("visibilitychange", onVisibility);
        renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
        kit.base.dispose();
        kit.hair.dispose();
        kit.glint.dispose();
        kit.points.dispose();
        kit.wireBase.dispose();
        kit.wireHair.dispose();
        materialsRef.current = null;
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    let cleanup: (() => void) | undefined;
    void setup().then((dispose) => { cleanup = dispose; }).catch(onError);
    return () => { disposed = true; cleanup?.(); };
    // `scan` is applied via the ref effect above; re-running setup for it
    // would rebuild the renderer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError, onReady]);

  return <div ref={hostRef} className="h-full w-full" aria-hidden="true" />;
}
