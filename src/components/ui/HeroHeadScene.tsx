import { useEffect, useRef } from "react";
import { loadHeadGltf } from "../../lib/headModel";

type SceneMaterials = {
  base: import("three").MeshStandardMaterial;
  glint: import("three").MeshStandardMaterial;
  points: import("three").PointsMaterial;
};

// Normal mode: dark graphite with a faint cool sheen.
// Scan mode: phosphor wireframe — the "structure visible" read.
function applyMode(materials: SceneMaterials, scan: boolean) {
  materials.base.color.setHex(scan ? 0x06130a : 0x101820);
  materials.base.emissive.setHex(scan ? 0x224d1a : 0x02080b);
  materials.base.emissiveIntensity = scan ? 0.85 : 0.22;
  materials.base.wireframe = scan;
  materials.base.needsUpdate = true;
  materials.glint.emissiveIntensity = scan ? 1.6 : 0.9;
  materials.points.opacity = scan ? 0.95 : 0.55;
}

export default function HeroHeadScene({ scan, onError, onReady }: { scan: boolean; onError: () => void; onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<SceneMaterials | null>(null);

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
      const materials: SceneMaterials = {
        base: new THREE.MeshStandardMaterial({ metalness: 0.76, roughness: 0.3, flatShading: true }),
        glint: new THREE.MeshStandardMaterial({ color: 0x1a1208, emissive: 0xd9a05b, emissiveIntensity: 0.9, roughness: 0.4 }),
        points: new THREE.PointsMaterial({ color: 0x9fb4c4, size: 0.014, transparent: true, opacity: 0.55, sizeAttenuation: true }),
      };
      materialsRef.current = materials;
      applyMode(materials, scan);

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
        const glinted = /glint/i.test(child.name) || (child instanceof THREE.Mesh && /glint/i.test((child.material as { name?: string })?.name ?? ""));
        if (child instanceof THREE.Points) {
          child.material = materials.points;
        } else if (child instanceof THREE.Mesh) {
          child.material = glinted ? materials.glint : materials.base;
        }
      });
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
        materials.base.dispose();
        materials.glint.dispose();
        materials.points.dispose();
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
