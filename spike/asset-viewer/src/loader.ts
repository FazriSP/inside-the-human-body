import { Box3, Group, Mesh, Object3D, Raycaster, Vector2, Vector3, type Camera } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { BufferGeometry } from 'three';

// Enable BVH-accelerated raycasting globally (opt-in per geometry via computeBoundsTree).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BufferGeometry.prototype as any).computeBoundsTree = computeBoundsTree;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BufferGeometry.prototype as any).disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

export interface LoadResult {
  scene: Group;
  bytes: number;
  downloadMs: number;
  parseMs: number;
  meshCount: number;
  triangles: number;
  materialCount: number;
  meshNames: string[];
  emptyNameCount: number;
  duplicateNameCount: number;
  size: Vector3;
}

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

export async function loadGlb(url: string): Promise<LoadResult> {
  const t0 = performance.now();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Gagal memuat ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  const t1 = performance.now();
  const gltf = await loader.parseAsync(buf, '');
  const t2 = performance.now();

  const scene = gltf.scene;
  let meshCount = 0;
  let triangles = 0;
  const materials = new Set<string>();
  const names: string[] = [];
  scene.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    meshCount++;
    const g = m.geometry;
    triangles += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mt) => materials.add(mt.uuid));
    names.push(meshLabel(m));
  });
  const counts = new Map<string, number>();
  names.forEach((n) => counts.set(n, (counts.get(n) ?? 0) + 1));

  const box = new Box3().setFromObject(scene);
  return {
    scene,
    bytes: buf.byteLength,
    downloadMs: t1 - t0,
    parseMs: t2 - t1,
    meshCount,
    triangles: Math.round(triangles),
    materialCount: materials.size,
    meshNames: names,
    emptyNameCount: names.filter((n) => n.trim() === '').length,
    duplicateNameCount: [...counts.values()].filter((c) => c > 1).reduce((a, c) => a + c, 0),
    size: box.getSize(new Vector3()),
  };
}

/** Name used for picking. GLTFLoader puts multi-primitive meshes in a Group, so fall back to parent. */
export function meshLabel(o: Object3D): string {
  if (o.name && !/^mesh_\d+/.test(o.name)) return o.name;
  return o.parent?.name ?? o.name;
}

/** Build BVH for every mesh; returns build time in ms. */
export function buildBvh(root: Object3D): number {
  const t0 = performance.now();
  root.traverse((o) => {
    const m = o as Mesh;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (m.isMesh) (m.geometry as any).computeBoundsTree();
  });
  return performance.now() - t0;
}

export function disposeBvh(root: Object3D) {
  root.traverse((o) => {
    const m = o as Mesh;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (m.isMesh && (m.geometry as any).boundsTree) (m.geometry as any).disposeBoundsTree();
  });
}

/** Average time of N raycasts across the viewport, in ms. */
export function measureRaycast(root: Object3D, camera: Camera, samples = 40): number {
  const rc = new Raycaster();
  const ndc = new Vector2();
  const t0 = performance.now();
  for (let i = 0; i < samples; i++) {
    ndc.set(((i * 37) % samples) / samples * 1.6 - 0.8, ((i * 53) % samples) / samples * 1.6 - 0.8);
    rc.setFromCamera(ndc, camera);
    rc.intersectObject(root, true);
  }
  return (performance.now() - t0) / samples;
}
