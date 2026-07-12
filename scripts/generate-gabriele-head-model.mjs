import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BufferGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
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

// Coordinate system: +y up, +z toward viewer (face front), +x subject's left.
// Likeness target (see docs/face.md): slim oval-to-long-oval face, narrow
// tapered jaw, softly pointed chin, thick wavy hair with front locks and a
// center curl, strong low straight brows, straight defined nose, almond eyes.

const root = new Group();
root.name = "GabrieleHead";

const material = new MeshStandardMaterial({
  color: "#111820",
  metalness: 0.74,
  roughness: 0.32,
  flatShading: true,
});

function makeMesh(geometry, name, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
  // Keep geometry indexed and strip attributes the runtime never reads:
  // flat shading is derived per-fragment (screen-space derivatives), so
  // exported NORMALs are dead weight, and no material samples a texture.
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

// Slim, longer-than-wide skull with a broader upper face, lean cheeks with a
// subtle hollow beneath the cheekbones, a narrow tapered jaw and a softly
// pointed chin. The front plane is gently flattened so features read cleanly.
function makeHeadGeometry() {
  const rings = 30;
  const segments = 40;
  const positions = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring += 1) {
    const t = ring / rings;
    const y = 1.24 - t * 2.42;
    const oval = Math.pow(Math.sin(Math.PI * Math.min(t, 0.995)), 0.5);
    // Broader upper face (forehead / temples), then narrowing.
    const upperFace = 0.86 + 0.2 * Math.exp(-Math.pow((t - 0.29) / 0.2, 2));
    // Lean cheek hollow just below the cheekbones.
    const cheekHollow = 1 - 0.08 * Math.exp(-Math.pow((t - 0.52) / 0.1, 2));
    // Narrow tapered jaw that pulls in toward a softly pointed chin.
    const jaw = t > 0.58 ? 1 - Math.pow((t - 0.58) / 0.42, 1.35) * 0.62 : 1;
    const width = 0.72 * oval * upperFace * cheekHollow * jaw;
    const depth = 0.68 * oval * cheekHollow * (0.92 + 0.09 * Math.cos(t * Math.PI));

    for (let segment = 0; segment <= segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const front = Math.max(0, Math.sin(angle));
      const x = Math.cos(angle) * width;
      // Gentle front flattening concentrated around the mid-face plane.
      const facePlanes = 0.03 + 0.04 * Math.exp(-Math.pow((t - 0.44) / 0.22, 2));
      const z = Math.sin(angle) * depth + front * facePlanes;
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

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(new Uint32BufferAttribute(indices, 1));
  return geometry;
}

function addCurve(name, points, radius, radialSegments = 4, tubularSegments = 18) {
  const curve = new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
  makeMesh(new TubeGeometry(curve, tubularSegments, radius, radialSegments, false), name);
}

makeMesh(makeHeadGeometry(), "face");

// ---------------------------------------------------------------------------
// HAIR — the strongest identity feature. Thick, dark, voluminous and wavy:
// tall swept volume on top, shorter tapered sides, a curtain-like front with a
// prominent curved lock dropping toward the center of the forehead, and a
// natural left-heavy asymmetry to match the photos.
// ---------------------------------------------------------------------------

// Main crown mass — taller than wide, pushed up and slightly back for volume.
makeMesh(
  new SphereGeometry(1, 32, 18, 0, Math.PI * 2, 0, 1.9),
  "hair-cap",
  [0.02, 0.46, -0.06],
  [0.82, 1.04, 0.78],
);

// Swept top volume (the quiff) sitting forward-of-center, giving the loose
// wave its lift instead of a helmet silhouette.
makeMesh(
  new SphereGeometry(1, 24, 16),
  "hair-volume",
  [0.08, 1.02, 0.16],
  [0.52, 0.4, 0.46],
);
makeMesh(
  new SphereGeometry(1, 20, 14),
  "hair-volume",
  [-0.24, 0.98, 0.06],
  [0.38, 0.32, 0.4],
);

// Front fringe locks. x = lateral position across the forehead, drop = how far
// the lock falls, curl = forward hook of the tip. The center/right locks fall
// lowest to create the loose wave that hooks toward the forehead center.
const frontLocks = [
  { x: -0.5, drop: 0.62, curl: 0.05, r: 0.05 },
  { x: -0.34, drop: 0.5, curl: 0.09, r: 0.055 },
  { x: -0.16, drop: 0.44, curl: 0.12, r: 0.06 },
  { x: 0.02, drop: 0.4, curl: 0.15, r: 0.062 }, // prominent center curl
  { x: 0.2, drop: 0.46, curl: 0.11, r: 0.058 },
  { x: 0.36, drop: 0.54, curl: 0.07, r: 0.052 },
  { x: 0.5, drop: 0.66, curl: 0.04, r: 0.048 },
];

for (const { x, drop, curl, r } of frontLocks) {
  const sway = x * 0.12; // natural sideways wave
  addCurve(
    "hair-lock",
    [
      [x * 0.72, 1.16, 0.34],
      [x * 0.86 + sway, 1.0, 0.58],
      [x * 0.94 + sway * 1.4, 0.86, 0.74],
      [x * 0.9 + sway, 0.86 - drop, 0.78 + curl],
    ],
    r,
  );
}

// Sideburns — short hair tapering in front of each ear.
for (const side of [-1, 1]) {
  addCurve(
    "hair-lock",
    [
      [side * 0.72, 0.5, 0.36],
      [side * 0.74, 0.26, 0.34],
      [side * 0.72, 0.06, 0.32],
    ],
    0.045,
    3,
  );
}

// ---------------------------------------------------------------------------
// FACE FEATURES
// ---------------------------------------------------------------------------

for (const side of [-1, 1]) {
  // Ears — visible, oval, slightly protruding, not buried under the hair.
  makeMesh(new SphereGeometry(1, 14, 10), "ear", [side * 0.74, 0.02, -0.02], [0.14, 0.28, 0.09]);
  addCurve(
    "ear-fold",
    [
      [side * 0.78, 0.17, 0.07],
      [side * 0.86, 0.02, 0.09],
      [side * 0.78, -0.13, 0.07],
    ],
    0.017,
    3,
  );

  // Almond eyes — recessed sockets with a small warm brown glint. Slightly
  // deep-set, sitting under strong brows.
  makeMesh(new SphereGeometry(1, 14, 10), "eye-socket", [side * 0.28, 0.28, 0.71], [0.185, 0.086, 0.07]);
  makeMesh(new SphereGeometry(1, 10, 8), "eye-glint", [side * 0.28, 0.288, 0.79], [0.026, 0.02, 0.02]);

  // Cheekbone — defined but not heavy, set above the lean cheek hollow.
  makeMesh(new SphereGeometry(1, 14, 10), "cheekbone", [side * 0.4, -0.12, 0.66], [0.22, 0.15, 0.07]);

  // Eyebrow — dark, thick, mostly straight with a slight arch, sitting low.
  addCurve(
    "eyebrow",
    [
      [side * 0.48, 0.44, 0.72],
      [side * 0.3, 0.48, 0.79],
      [side * 0.08, 0.45, 0.77],
    ],
    0.046,
  );

  // Jawline — defined but slim, sweeping in toward the chin.
  addCurve(
    "jawline",
    [
      [side * 0.62, -0.28, 0.46],
      [side * 0.48, -0.66, 0.57],
      [side * 0.18, -0.86, 0.66],
      [0, -0.9, 0.68],
    ],
    0.02,
    3,
  );
}

// Nose — straight narrow bridge running down from between the brows, a defined
// ridge, moderate projection and a softly rounded tip.
makeMesh(
  new CylinderGeometry(0.1, 0.15, 0.56, 5, 1),
  "nose-bridge",
  [0, 0.13, 0.66],
  [1, 1, 0.72],
  [0, 0, Math.PI],
);
makeMesh(new ConeGeometry(0.17, 0.5, 5, 1), "nose", [0, 0.0, 0.76], [1, 1, 1], [Math.PI / 2, 0, 0]);
makeMesh(new SphereGeometry(1, 14, 10), "nose-tip", [0, -0.14, 0.98], [0.13, 0.11, 0.11]);
for (const side of [-1, 1]) {
  makeMesh(new SphereGeometry(1, 10, 8), "nose-wing", [side * 0.12, -0.16, 0.9], [0.06, 0.06, 0.06]);
}

// Lips — thinner, defined upper lip and a fuller lower lip, neutral closed
// mouth with a mostly horizontal line and gentle Cupid's bow.
addCurve(
  "upper-lip",
  [
    [-0.24, -0.3, 0.67],
    [-0.09, -0.27, 0.72],
    [0, -0.3, 0.73],
    [0.09, -0.27, 0.72],
    [0.24, -0.3, 0.67],
  ],
  0.024,
  4,
);
addCurve(
  "lower-lip",
  [
    [-0.19, -0.37, 0.68],
    [0, -0.41, 0.74],
    [0.19, -0.37, 0.68],
  ],
  0.035,
  4,
);

// Chin — narrow, softly rounded and slightly pointed with a subtle projection.
makeMesh(new SphereGeometry(1, 16, 10), "chin", [0, -0.85, 0.66], [0.22, 0.19, 0.13]);

// Stubble — subtle sparse dots along the jaw, chin, upper lip and sideburns.
function stubbleField(name, cx, cy, cz, spanX, spanY, cols, rowsCount, jitter) {
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rowsCount; r += 1) {
      const fx = cols > 1 ? c / (cols - 1) - 0.5 : 0;
      const fy = rowsCount > 1 ? r / (rowsCount - 1) - 0.5 : 0;
      const x = cx + fx * spanX + (r % 2) * jitter;
      const y = cy + fy * spanY;
      addCurve(name, [[x, y, cz], [x + jitter, y - 0.03, cz - 0.005]], 0.005, 3, 1);
    }
  }
}

for (const side of [-1, 1]) {
  // Along the jaw/lower cheek.
  stubbleField("stubble", side * 0.34, -0.52, 0.62, 0.24, 0.26, 4, 4, side * 0.012);
}
// Chin patch and upper-lip (moustache-area) stubble — sparse, not a beard.
stubbleField("stubble", 0, -0.68, 0.68, 0.26, 0.14, 5, 2, 0.01);
stubbleField("stubble", 0, -0.24, 0.72, 0.28, 0.05, 6, 1, 0.008);

const exporter = new GLTFExporter();
const output = await new Promise((resolveExport, rejectExport) => {
  exporter.parse(root, resolveExport, rejectExport, {
    binary: true,
    onlyVisible: true,
    truncateDrawRange: true,
  });
});

// ---------------------------------------------------------------------------
// Optimization pipeline + hard budgets. The runtime pays for every mesh (draw
// call), vertex and byte at SYS-mode toggle time, so the generator fails loud
// instead of shipping a regression.
// ---------------------------------------------------------------------------
const BUDGET = {
  meshes: 6,
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
  report.primitives > BUDGET.meshes && `primitives ${report.primitives} > ${BUDGET.meshes}`,
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
