import { useEffect, useRef } from "react";
import { loadHeadGltf } from "../../lib/headModel";

export default function HeroHeadScene({ scan, onError, onReady }: { scan: boolean; onError: () => void; onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<import("three").MeshStandardMaterial[]>([]);

  useEffect(() => {
    materialsRef.current.forEach((material) => {
      material.color.setHex(scan ? 0x07151b : 0x101820);
      material.emissive.setHex(scan ? 0x0a3540 : 0x02080b);
      material.emissiveIntensity = scan ? 0.75 : 0.22;
      material.wireframe = scan;
      material.needsUpdate = true;
    });
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
    let scrollProgress = 0;
    const materials: import("three").MeshStandardMaterial[] = [];

    const setup = async () => {
      const [THREE, gltf] = await Promise.all([import("three"), loadHeadGltf()]);
      if (disposed) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0.05, 6.2);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.5));
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xa9efff, 0x030406, 1.65));
      const key = new THREE.DirectionalLight(0xe9fbff, 4.1);
      key.position.set(-2.5, 3.5, 4);
      scene.add(key);
      const rim = new THREE.PointLight(0x62d9ff, 16, 10);
      rim.position.set(2.4, 0.8, 2.6);
      scene.add(rim);
      const violet = new THREE.PointLight(0x8b5cf6, 9, 8);
      violet.position.set(-2.6, -1.2, 1.5);
      scene.add(violet);

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
        if (!(child instanceof THREE.Mesh)) return;
        const material = new THREE.MeshStandardMaterial({
          color: 0x101820,
          emissive: 0x02080b,
          emissiveIntensity: 0.22,
          metalness: 0.76,
          roughness: 0.3,
          flatShading: true,
          wireframe: false,
        });
        child.material = material;
        materials.push(material);
        materialsRef.current.push(material);
      });
      scene.add(model);

      const pointer = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.32;
        targetX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.18;
      };
      const resetPointer = () => { targetX = 0; targetY = 0; };
      const onScroll = () => { scrollProgress = Math.min(1, window.scrollY / Math.max(420, window.innerHeight * 0.7)); };
      const onVisibility = () => { visible = !document.hidden; if (visible && !frame) frame = requestAnimationFrame(render); };
      const intersection = new IntersectionObserver(([entry]) => {
        visible = Boolean(entry?.isIntersecting) && !document.hidden;
        if (visible && !frame) frame = requestAnimationFrame(render);
      }, { rootMargin: "120px" });

      let announcedReady = false;
      const render = (time: number) => {
        frame = 0;
        if (!visible || disposed) return;
        if (!announcedReady) {
          announcedReady = true;
          // First real frame is about to be presented — let the host crossfade.
          onReady?.();
        }
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
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      intersection.observe(host);
      onScroll();
      frame = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(frame);
        intersection.disconnect();
        resizeObserver.disconnect();
        host.removeEventListener("pointermove", pointer);
        host.removeEventListener("pointerleave", resetPointer);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibility);
        materials.forEach((material) => material.dispose());
        materialsRef.current = [];
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    let cleanup: (() => void) | undefined;
    void setup().then((dispose) => { cleanup = dispose; }).catch(onError);
    return () => { disposed = true; cleanup?.(); };
  }, [onError, onReady]);

  return <div ref={hostRef} className="h-full w-full" aria-hidden="true" />;
}
