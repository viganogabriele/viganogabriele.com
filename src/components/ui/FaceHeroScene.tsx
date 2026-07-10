import { Bounds, Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, type ReactNode, Suspense, useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Points,
  PointsMaterial,
  type Object3D,
} from "three";

type SceneErrorBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function WebGLContextMonitor({ onError }: { onError: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [gl, onError]);

  return null;
}

function TechnicalHead({ modelUrl, systemActive, staticScene, onReady }: { modelUrl: string; systemActive: boolean; staticScene: boolean; onReady: () => void }) {
  const { scene } = useGLTF(modelUrl);
  const group = useRef<Group>(null);
  const model = useMemo(() => {
    const root = scene.clone(true);
    const meshes: Mesh[] = [];
    const baseMaterials: MeshPhysicalMaterial[] = [];
    const wireMaterials: MeshBasicMaterial[] = [];
    const pointMaterials: PointsMaterial[] = [];

    root.traverse((child: Object3D) => {
      if (child instanceof Mesh) meshes.push(child);
    });

    for (const mesh of meshes) {
      const name = mesh.name.toLowerCase();
      const isDarkFeature = name.includes("hair") || name.includes("eye-socket");
      const isEyeGlint = name.includes("eye-glint");
      const base = new MeshPhysicalMaterial({
        color: isEyeGlint ? "#5a3519" : isDarkFeature ? "#010307" : systemActive ? "#040b10" : "#070b10",
        metalness: 0.78,
        roughness: 0.27,
        clearcoat: 0.35,
        clearcoatRoughness: 0.32,
      });
      const wire = new MeshBasicMaterial({
        color: isEyeGlint ? "#e1a865" : systemActive ? "#b6f5ff" : "#e9f9ff",
        transparent: true,
        opacity: systemActive ? 0.32 : isEyeGlint ? 0.94 : isDarkFeature ? 0.48 : 0.72,
        wireframe: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
      const points = new PointsMaterial({
        color: systemActive ? "#d7fbff" : "#dffaff",
        size: systemActive ? 0.019 : 0.012,
        sizeAttenuation: true,
        transparent: true,
        opacity: systemActive ? 0.72 : 0.2,
        depthWrite: false,
      });
      const wireOverlay = new Mesh(mesh.geometry, wire);
      const pointOverlay = new Points(mesh.geometry, points);
      wireOverlay.renderOrder = 2;
      pointOverlay.renderOrder = 3;
      wireOverlay.frustumCulled = mesh.frustumCulled;
      pointOverlay.frustumCulled = mesh.frustumCulled;
      mesh.material = base;
      mesh.add(wireOverlay);
      mesh.add(pointOverlay);
      baseMaterials.push(base);
      wireMaterials.push(wire);
      pointMaterials.push(points);
    }

    return { root, baseMaterials, wireMaterials, pointMaterials };
  }, [scene, systemActive]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => () => {
    for (const material of [...model.baseMaterials, ...model.wireMaterials, ...model.pointMaterials]) material.dispose();
  }, [model]);

  useFrame((state, delta) => {
    if (staticScene || !group.current) return;
    const idle = Math.sin(state.clock.getElapsedTime() * 0.55) * 0.052;
    const targetY = idle + state.pointer.x * 0.055;
    const targetX = state.pointer.y * -0.035;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, targetY, 4, delta);
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, targetX, 4, delta);
    group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.035;
  });

  return (
    <group ref={group}>
      <primitive object={model.root} />
    </group>
  );
}

// Sparse pixel-grid particle field drifting behind the head, giving the
// black digital space atmospheric depth (see docs/face.md target style).
function BackgroundGrid({ systemActive, staticScene }: { systemActive: boolean; staticScene: boolean }) {
  const points = useRef<Points>(null);
  const { geometry, material } = useMemo(() => {
    const cols = 26;
    const rows = 20;
    const positions: number[] = [];
    for (let ix = 0; ix < cols; ix += 1) {
      for (let iy = 0; iy < rows; iy += 1) {
        const x = (ix / (cols - 1) - 0.5) * 7.2;
        const y = (iy / (rows - 1) - 0.5) * 5.6;
        // Push most of the grid well behind the head, with mild depth scatter.
        const z = -2.6 - ((ix * 7 + iy * 13) % 5) * 0.42;
        positions.push(x, y, z);
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    const mat = new PointsMaterial({
      color: systemActive ? "#8fe9ff" : "#4a6c86",
      size: 0.028,
      sizeAttenuation: true,
      transparent: true,
      opacity: systemActive ? 0.5 : 0.32,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, [systemActive]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((state) => {
    if (staticScene || !points.current) return;
    const t = state.clock.getElapsedTime();
    points.current.position.y = Math.sin(t * 0.18) * 0.14;
    points.current.position.x = state.pointer.x * 0.22;
  });

  return <points ref={points} geometry={geometry} material={material} />;
}

function FaceScene({ modelUrl, systemActive, staticScene, onReady }: { modelUrl: string; systemActive: boolean; staticScene: boolean; onReady: () => void }) {
  return (
    <>
      <color attach="background" args={["#07090d"]} />
      <fog attach="fog" args={["#07090d", 4.5, 11]} />
      <ambientLight intensity={0.2} />
      <directionalLight color="#eefbff" intensity={2.6} position={[3.4, 2.8, 4.2]} />
      <pointLight color="#5fd8f7" intensity={systemActive ? 3.6 : 2.2} position={[-3.4, 1.4, -1.8]} />
      <pointLight color="#8096ff" intensity={0.6} position={[2.8, -2, -2]} />
      <BackgroundGrid systemActive={systemActive} staticScene={staticScene} />
      <Bounds fit clip observe margin={1.14}>
        <Center>
          <TechnicalHead modelUrl={modelUrl} systemActive={systemActive} staticScene={staticScene} onReady={onReady} />
        </Center>
      </Bounds>
    </>
  );
}

export function FaceHeroScene({ modelUrl, systemActive, staticScene, onReady, onError }: { modelUrl: string; systemActive: boolean; staticScene: boolean; onReady: () => void; onError: () => void }) {
  return (
    <Canvas
      dpr={staticScene ? [1, 1] : [1, 1.5]}
      camera={{ fov: 34, near: 0.01, far: 100 }}
      gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
      frameloop={staticScene ? "demand" : "always"}
    >
      <WebGLContextMonitor onError={onError} />
      <SceneErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <FaceScene modelUrl={modelUrl} systemActive={systemActive} staticScene={staticScene} onReady={onReady} />
        </Suspense>
      </SceneErrorBoundary>
    </Canvas>
  );
}
