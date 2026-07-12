import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
  TubeGeometry,
  Uint32BufferAttribute,
  Vector3,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

// GLTFExporter uses FileReader for Blob conversion in browsers. Node exposes
// Blob but not FileReader, so this minimal adapter keeps the generator portable.
globalThis.FileReader ??= class FileReader {
  result = null;
  onloadend = null;

  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

// ---------------------------------------------------------------------------
// Likeness targets (docs/face.md):
// slim oval-to-long-oval face · narrow tapered jaw · softly pointed chin ·
// carved almond eye sockets under a straight low brow ridge · straight nose
// with a prominent bridge · thinner upper / fuller lower lip · thick wavy
// hair with a curtain fringe and a center lock · light stubble · visible ears.
//
// Coordinate system: +y up, +z toward viewer (face front), +x subject's left.
// The skull is a ring/segment grid; every facial plane (sockets, brow,
// cheekbones, chin) is carved INTO the grid as a radial displacement field so
// the features read in wireframe mode, instead of spheres glued on top.
// ---------------------------------------------------------------------------

// Deterministic RNG so regenerating the model never changes the asymmetry.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260712);

const root = new Group();
root.name = "GabrieleHead";

const headMaterial = new MeshStandardMaterial({ name: "head", color: "#111820", metalness: 0.74, roughness: 0.32, flatShading: true });
const hairMaterial = new MeshStandardMaterial({ name: "hair", color: "#0a0d12", metalness: 0.55, roughness: 0.5, flatShading: true });
const glintMaterial = new MeshStandardMaterial({ name: "glint", color: "#1a1208", emissive: "#d9a05b", emissiveIntensity: 0.9, roughness: 0.4 });

function addMesh(geometry, material, name, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
  geometry.deleteAttribute("normal");
  geometry.deleteAttribute("uv");
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  root.add(mesh);
  return mesh;
}

// t: 0 = crown, 1 = under the chin. y spans +1.24 → −1.18.
const T = {
  brow: 0.335,
  eye: 0.397,
  cheekbone: 0.47,
  noseTip: 0.57,
  upperLip: 0.636,
  lowerLip: 0.678,
  chin: 0.875,
};
const FRONT = Math.PI / 2;
const EYE_A = 0.42; // angular offset of each eye from the front axis

// Base horizontal profile of the skull at a given t: [width, depth].
function skullProfile(t) {
  const oval = Math.pow(Math.sin(Math.PI * Math.min(Math.max(t, 0.004), 0.996)), 0.42);
  const upperFace = 0.86 + 0.2 * Math.exp(-Math.pow((t - 0.29) / 0.2, 2));
  const cheekHollow = 1 - 0.05 * Math.exp(-Math.pow((t - 0.55) / 0.1, 2));
  // Narrow tapered jaw pulling toward the softly pointed chin — tapered but
  // never gaunt (face.md: slim, not skeletal).
  const jaw = t > 0.6 ? 1 - Math.pow((t - 0.6) / 0.4, 1.5) * 0.5 : 1;
  const width = 0.76 * oval * upperFace * cheekHollow * jaw;
  const depth = 0.7 * oval * cheekHollow * (0.92 + 0.09 * Math.cos(t * Math.PI));
  return [width, depth];
}

// Radial displacement field: carved features. Positive pushes outward.
// Each bump is a 2D gaussian in (angle, t) space, mirrored when `mirror`.
const FEATURES = [
  // Almond eye sockets — recessed, wider than tall (σa > σt).
  { a: FRONT - EYE_A, t: T.eye, sa: 0.17, st: 0.042, amp: -0.085 },
  { a: FRONT + EYE_A, t: T.eye, sa: 0.17, st: 0.042, amp: -0.085 },
  // Straight, low brow ridge casting the shadow line over the eyes.
  { a: FRONT, t: T.brow, sa: 0.5, st: 0.03, amp: 0.055 },
  // Nose root recess between the brows so the bridge reads from 3/4.
  { a: FRONT, t: T.eye - 0.015, sa: 0.075, st: 0.04, amp: -0.028 },
  // Cheekbones — defined but not heavy, set above the lean hollow.
  { a: FRONT - 0.78, t: T.cheekbone, sa: 0.16, st: 0.065, amp: 0.038 },
  { a: FRONT + 0.78, t: T.cheekbone, sa: 0.16, st: 0.065, amp: 0.038 },
  // Lean under-cheek hollow.
  { a: FRONT - 0.58, t: 0.60, sa: 0.2, st: 0.08, amp: -0.032 },
  { a: FRONT + 0.58, t: 0.60, sa: 0.2, st: 0.08, amp: -0.032 },
  // Mouth barrel recess between lower lip and chin.
  { a: FRONT, t: 0.765, sa: 0.22, st: 0.05, amp: -0.018 },
  // Softly pointed chin with subtle forward projection.
  { a: FRONT, t: T.chin, sa: 0.26, st: 0.075, amp: 0.06 },
];

function displacement(angle, t) {
  let d = 0;
  for (const f of FEATURES) {
    const da = Math.atan2(Math.sin(angle - f.a), Math.cos(angle - f.a));
    d += f.amp * Math.exp(-(da * da) / (2 * f.sa * f.sa) - ((t - f.t) * (t - f.t)) / (2 * f.st * f.st));
  }
  return d;
}

// Non-uniform ring spacing: denser mesh through the eye–nose–mouth band
// (face.md: "denser mesh around eyes, nose, lips"), sparser on the crown.
function remapT(u) {
  return u + 0.16 * Math.sin(Math.PI * u) * (u < 0.5 ? (u - 0.18) : (0.82 - u));
}

function buildSkull() {
  const rings = 46;
  const segments = 48;
  const positions = [];
  const indices = [];

  // The grid stops at the base of the chin and closes with a rounded cap —
  // letting the parametric oval run to t=1 makes a dagger, not a chin.
  const tMax = 0.93;
  for (let ring = 0; ring <= rings; ring += 1) {
    const t = remapT(ring / rings) * tMax;
    const y = 1.24 - t * 2.42;
    const [width, depth] = skullProfile(t);
    for (let segment = 0; segment <= segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const front = Math.max(0, Math.sin(angle));
      // Gentle front flattening around the mid-face plane.
      const facePlanes = 0.03 + 0.04 * Math.exp(-Math.pow((t - 0.44) / 0.22, 2));
      const bump = displacement(angle, t);
      const wobble = 1 + (rand() - 0.5) * 0.012; // natural asymmetry
      const x = Math.cos(angle) * (width + bump * 0.9) * wobble;
      const z = Math.sin(angle) * (depth + bump) + front * facePlanes;
      positions.push(x, y, z);
    }
  }

  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = ring * (segments + 1) + segment;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  // Rounded under-chin cap: one shrunken ring plus a center point.
  const capRing = rings + 1;
  const [wEnd, dEnd] = skullProfile(tMax);
  const yEnd = 1.24 - tMax * 2.42;
  for (let segment = 0; segment <= segments; segment += 1) {
    const angle = (segment / segments) * Math.PI * 2;
    const front = Math.max(0, Math.sin(angle));
    positions.push(Math.cos(angle) * wEnd * 0.55, yEnd - 0.07, Math.sin(angle) * dEnd * 0.55 + front * 0.05);
  }
  const centerIndex = positions.length / 3;
  positions.push(0, yEnd - 0.11, 0.06);
  for (let segment = 0; segment < segments; segment += 1) {
    const a = rings * (segments + 1) + segment;
    const b = capRing * (segments + 1) + segment;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
    indices.push(b, centerIndex, b + 1);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(new Uint32BufferAttribute(indices, 1));
  return geometry;
}

// Surface point of the skull for placing features / stubble.
function surfacePoint(angle, t, outset = 0) {
  const y = 1.24 - t * 2.42;
  const [width, depth] = skullProfile(t);
  const front = Math.max(0, Math.sin(angle));
  const facePlanes = 0.03 + 0.04 * Math.exp(-Math.pow((t - 0.44) / 0.22, 2));
  const bump = displacement(angle, t);
  const x = Math.cos(angle) * (width + bump * 0.9 + outset);
  const z = Math.sin(angle) * (depth + bump + outset) + front * facePlanes;
  return [x, y, z];
}

addMesh(buildSkull(), headMaterial, "skull");

// ---------------------------------------------------------------------------
// HAIR — one sculpted wavy mass over the same parametric grid: volume on top,
// short tapered sides, a curtain fringe over the forehead with a deeper
// center lock, low-frequency waves and a left-heavy asymmetry. The bottom row
// tucks under the skull surface so the edge never shows a gap.
// ---------------------------------------------------------------------------
function hairEdge(angle) {
  // How far down (in t) the hair reaches at this angle.
  const front = Math.sin(angle); // 1 = front center, -1 = back
  const side = Math.abs(Math.cos(angle));
  let edge = 0.5 - side * 0.02; // sides reach just above the ears
  if (front < -0.2) edge = 0.56 + 0.06 * -front; // nape falls lower
  if (front > 0.35) {
    // Curtain fringe: scalloped lobes, deepest lock just right of center.
    const da = Math.atan2(Math.sin(angle - FRONT), Math.cos(angle - FRONT));
    const lobes = 0.045 * Math.cos(da * 7.0 + 0.8) + 0.02 * Math.cos(da * 3.0 - 0.4);
    const centerLock = 0.085 * Math.exp(-Math.pow((da - 0.07) / 0.16, 2));
    edge = 0.315 + (lobes + centerLock) * Math.min(1, (front - 0.35) / 0.4);
  }
  return edge;
}

function buildHair() {
  const rows = 22;
  const segments = 48;
  const positions = [];
  const indices = [];

  for (let row = 0; row <= rows + 1; row += 1) {
    for (let segment = 0; segment <= segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const edge = hairEdge(angle);
      const tucked = row === rows + 1;
      const s = tucked ? 1 : row / rows;
      const t = Math.max(0.004, s * edge);
      const [width, depth] = skullProfile(t);
      const front = Math.max(0, Math.sin(angle));

      // Thickness: tall volume on top, tapering toward the edge; waves give
      // the mass directionality instead of a helmet silhouette.
      const volume = 0.22 * (1 - s * 0.55) + 0.05;
      const wave = 0.038 * Math.sin(angle * 5 + t * 9 + 0.7) * (0.35 + 0.65 * s)
        + 0.016 * Math.sin(angle * 2 + 1.3);
      // Fringe locks get extra forward push so they read as falling strands.
      const fringe = front > 0.5 && s > 0.6
        ? 0.05 * Math.sin(angle * 9 + 0.5) * (s - 0.6) * front
        : 0;
      const k = tucked ? -0.05 : volume + wave + fringe;

      const facePlanes = 0.03 + 0.04 * Math.exp(-Math.pow((t - 0.44) / 0.22, 2));
      const lift = tucked ? 0 : 0.08 * Math.pow(1 - s, 1.6); // crown volume
      const x = Math.cos(angle) * (width + k);
      const y = 1.24 - t * 2.42 + lift;
      const z = Math.sin(angle) * (depth + k) + front * facePlanes * (tucked ? 1 : 0.6);
      positions.push(x, y, z);
    }
  }

  for (let row = 0; row < rows + 1; row += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = row * (segments + 1) + segment;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(new Uint32BufferAttribute(indices, 1));
  return geometry;
}

addMesh(buildHair(), hairMaterial, "hair");

// ---------------------------------------------------------------------------
// FACE FEATURES — kept minimal and correctly proportioned; the planes carved
// into the skull do most of the likeness work.
// ---------------------------------------------------------------------------

// Nose: straight prominent bridge (diamond cross-section reads as a ridge),
// softly rounded tip, small alae. A major likeness anchor per face.md.
const bridgeTopY = 0.36;
const bridgeBottomY = -0.10;
addMesh(
  new CylinderGeometry(0.045, 0.085, bridgeTopY - bridgeBottomY, 4, 3),
  headMaterial,
  "nose-bridge",
  [0, (bridgeTopY + bridgeBottomY) / 2, 0.735],
  [1, 1, 0.85],
  [-0.16, Math.PI / 4, 0],
);
addMesh(new SphereGeometry(1, 12, 9), headMaterial, "nose-tip", [0, -0.11, 0.775], [0.078, 0.068, 0.072]);
for (const side of [-1, 1]) {
  addMesh(new SphereGeometry(1, 9, 7), headMaterial, "nose-wing", [side * 0.085, -0.145, 0.715], [0.045, 0.04, 0.044]);
}

for (const side of [-1, 1]) {
  // Eyebrows: dark, thick, dense, nearly straight, sitting low on the ridge.
  addMesh(
    new BoxGeometry(0.26, 0.055, 0.05),
    headMaterial,
    "eyebrow",
    [side * 0.235, 0.435, 0.69],
    [1, 1, 1],
    [0.14, side * -0.42, side * -0.04],
  );

  // Warm amber glint set inside the carved socket (never a full eyeball).
  const [gx, gy, gz] = surfacePoint(FRONT - side * EYE_A, T.eye, -0.02);
  addMesh(new SphereGeometry(1, 10, 8), glintMaterial, "eye-glint", [gx, gy + 0.005, gz + 0.012], [0.026, 0.02, 0.015]);

  // Ears: visible, oval, slightly protruding, anchored to the skull surface
  // (face.md insists they show; they sit brow-to-nose-tip in height).
  const earT = 0.45;
  const [earW] = skullProfile(earT);
  const earY = 1.24 - earT * 2.42;
  addMesh(new SphereGeometry(1, 12, 9), headMaterial, "ear", [side * (earW - 0.01), earY, -0.06], [0.07, 0.155, 0.06], [0, 0, side * 0.16]);
  addMesh(new SphereGeometry(1, 8, 6), headMaterial, "ear-inner", [side * (earW + 0.02), earY - 0.01, -0.04], [0.042, 0.095, 0.045], [0, 0, side * 0.16]);
}

// Lips: thinner defined upper lip, fuller lower lip, neutral closed mouth.
function lipCurve(points, radius, name, squash = 0.55) {
  const curve = new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
  const mesh = addMesh(new TubeGeometry(curve, 14, radius, 5, false), headMaterial, name);
  mesh.scale.z = 1; // depth squash baked into control points instead
  mesh.scale.y = squash + 0.45;
  return mesh;
}
lipCurve(
  [
    [-0.17, -0.302, 0.60],
    [-0.07, -0.286, 0.645],
    [0, -0.298, 0.65], // Cupid's bow dip
    [0.07, -0.286, 0.645],
    [0.17, -0.302, 0.60],
  ],
  0.018,
  "upper-lip",
);
lipCurve(
  [
    [-0.14, -0.36, 0.60],
    [0, -0.382, 0.645],
    [0.14, -0.36, 0.60],
  ],
  0.028,
  "lower-lip",
);

// ---------------------------------------------------------------------------
// STUBBLE — a single Points cloud along jaw, chin, upper lip and sideburns:
// one draw call, and it doubles as the halftone read face.md asks for.
// ---------------------------------------------------------------------------
function buildStubble() {
  const positions = [];
  const target = 320;
  let attempts = 0;
  while (positions.length / 3 < target && attempts < 6000) {
    attempts += 1;
    const angle = FRONT + (rand() - 0.5) * 2 * 1.05;
    const t = 0.56 + rand() * 0.33;
    const da = Math.abs(Math.atan2(Math.sin(angle - FRONT), Math.cos(angle - FRONT)));
    // Skip the lips themselves; keep the moustache band above the upper lip.
    const inMouth = t > 0.615 && t < 0.71 && da < 0.3;
    if (inMouth) continue;
    // Density: strongest along the jaw band and chin, lighter on the cheeks.
    const jawBand = Math.exp(-Math.pow((t - 0.78) / 0.12, 2));
    const chin = Math.exp(-Math.pow((t - 0.86) / 0.08, 2) - Math.pow(da / 0.35, 2));
    const moustache = Math.exp(-Math.pow((t - 0.585) / 0.03, 2) - Math.pow(da / 0.32, 2));
    const sideburn = Math.exp(-Math.pow((da - 1.0) / 0.14, 2) - Math.pow((t - 0.52) / 0.1, 2));
    const density = jawBand * 0.9 + chin + moustache * 0.8 + sideburn;
    if (rand() > density) continue;
    const [x, y, z] = surfacePoint(angle, t, 0.012);
    positions.push(x, y, z);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  return geometry;
}

const stubbleMaterial = new PointsMaterial({ name: "stubble", color: "#9fb4c4", size: 0.014, transparent: true, opacity: 0.55 });
const stubble = new Points(buildStubble(), stubbleMaterial);
stubble.name = "stubble";
root.add(stubble);

// ---------------------------------------------------------------------------
// Export + optimization pipeline + hard budgets. The runtime pays for every
// mesh (draw call), vertex and byte at SYS-mode toggle time, so the generator
// fails loud instead of shipping a regression.
// ---------------------------------------------------------------------------
const exporter = new GLTFExporter();
const output = await new Promise((resolveExport, rejectExport) => {
  exporter.parse(root, resolveExport, rejectExport, {
    binary: true,
    onlyVisible: true,
    truncateDrawRange: true,
  });
});

const BUDGET = {
  primitives: 6,
  vertices: 14_000,
  triangles: 22_000,
  bytes: 100 * 1024,
};

const { optimized, report } = await optimizeGlb(new Uint8Array(output));

async function optimizeGlb(binary) {
  const { NodeIO } = await import("@gltf-transform/core");
  const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
  const { prune, dedup, flatten, join, weld, quantize, meshopt } = await import("@gltf-transform/functions");
  const { MeshoptEncoder } = await import("meshoptimizer");
  await MeshoptEncoder.ready;

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

  const document = await io.readBinary(binary);
  await document.transform(
    dedup(),
    flatten(),
    join({ keepNamed: false }),
    weld(),
    prune(),
    quantize({ quantizePosition: 14 }),
    meshopt({ encoder: MeshoptEncoder, level: "high" }),
  );

  const stats = { meshes: 0, primitives: 0, vertices: 0, triangles: 0 };
  for (const mesh of document.getRoot().listMeshes()) {
    stats.meshes += 1;
    for (const primitive of mesh.listPrimitives()) {
      stats.primitives += 1;
      stats.vertices += primitive.getAttribute("POSITION")?.getCount() ?? 0;
      const index = primitive.getIndices();
      stats.triangles += Math.round((index ? index.getCount() : 0) / 3);
    }
  }

  const bytes = await io.writeBinary(document);
  return { optimized: bytes, report: { ...stats, bytes: bytes.byteLength } };
}

console.log(
  `model report — meshes: ${report.meshes}, primitives: ${report.primitives}, ` +
  `vertices: ${report.vertices}, triangles: ${report.triangles}, size: ${(report.bytes / 1024).toFixed(1)} KB`,
);

const violations = [
  report.primitives > BUDGET.primitives && `primitives ${report.primitives} > ${BUDGET.primitives}`,
  report.vertices > BUDGET.vertices && `vertices ${report.vertices} > ${BUDGET.vertices}`,
  report.triangles > BUDGET.triangles && `triangles ${report.triangles} > ${BUDGET.triangles}`,
  report.bytes > BUDGET.bytes && `size ${report.bytes} > ${BUDGET.bytes} bytes`,
].filter(Boolean);
if (violations.length) {
  console.error(`BUDGET EXCEEDED:\n  ${violations.join("\n  ")}`);
  process.exit(1);
}

const outputPath = resolve(dirname(fileURLToPath(import.meta.url)), "../public/models/gabriele-head.v2.glb");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.from(optimized));
console.log(`Generated ${outputPath}`);
