import {
  Box3,
  BufferGeometry,
  Group,
  Mesh,
  Object3D,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from 'three-mesh-bvh';
import type {
  CameraBookmark,
  GlbChunkId,
  LayerId,
} from '@/content/schema/anatomy.schema';
import {
  getStructureById,
  resolveStructureForMesh,
} from '@/content/anatomy';
import { createAnatomicalMaterial } from './xrayMaterial';

// Install BVH-accelerated raycasting globally on Three.js geometries and meshes
const proto = BufferGeometry.prototype as BufferGeometry & {
  computeBoundsTree?: typeof computeBoundsTree;
  disposeBoundsTree?: typeof disposeBoundsTree;
};
proto.computeBoundsTree = computeBoundsTree;
proto.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

const templateCache = new Map<string, Promise<Group>>();

/** Live registry mapping structureId -> Set of mounted Three.js Meshes */
const structureMeshRegistry = new Map<string, Set<Mesh>>();

export function registerStructureMesh(structureId: string, mesh: Mesh) {
  let set = structureMeshRegistry.get(structureId);
  if (!set) {
    set = new Set<Mesh>();
    structureMeshRegistry.set(structureId, set);
  }
  set.add(mesh);
}

export function unregisterLayerMeshes(root: Object3D) {
  root.traverse((obj) => {
    const m = obj as Mesh;
    if (!m.isMesh) return;
    const sid = m.userData.structureId as string | undefined;
    if (sid) {
      structureMeshRegistry.get(sid)?.delete(m);
    }
    if (Array.isArray(m.material)) {
      for (const mat of m.material) mat.dispose();
    } else if (m.material) {
      m.material.dispose();
    }
  });
}

export function getMountedMeshesForStructure(
  structureId: string,
): Set<Mesh> | undefined {
  return structureMeshRegistry.get(structureId);
}

/**
 * Scales a structure's mounted meshes in-place around their local quantized
 * geometry origin while preserving each mesh's initial GLTF de-quantization
 * baseScale and basePosition (preventing quantized meshes from blowing up to scale=1).
 */
export function deformStructureAroundCentroid(
  structureId: string,
  scale: [number, number, number],
  _offset: [number, number, number] = [0, 0, 0],
) {
  const meshes = structureMeshRegistry.get(structureId);
  if (!meshes || meshes.size === 0) return;

  const [sx, sy, sz] = scale;

  for (const m of meshes) {
    let basePos = m.userData.basePosition as Vector3 | undefined;
    if (!basePos) {
      basePos = m.position.clone();
      m.userData.basePosition = basePos;
    }

    let baseScale = m.userData.baseScale as Vector3 | undefined;
    if (!baseScale) {
      baseScale = m.scale.clone();
      m.userData.baseScale = baseScale;
    }

    m.scale.set(baseScale.x * sx, baseScale.y * sy, baseScale.z * sz);
    m.position.copy(basePos);
  }
}

export function resetAllStructureDeformations() {
  for (const meshes of structureMeshRegistry.values()) {
    for (const m of meshes) {
      const basePos = m.userData.basePosition as Vector3 | undefined;
      const baseScale = m.userData.baseScale as Vector3 | undefined;
      if (basePos) {
        m.position.copy(basePos);
      }
      if (baseScale) {
        m.scale.copy(baseScale);
      }
    }
  }
}

/**
 * Computes a live camera bookmark framing the actual 3D bounding box of a structure's
 * mounted meshes in the scene, falling back to the static registry bookmark if not yet loaded.
 */
export function computeStructureFocusBookmark(
  structureId: string,
): CameraBookmark | undefined {
  const fallback = getStructureById(structureId)?.kameraFokus;
  const meshes = structureMeshRegistry.get(structureId);
  if (!meshes || meshes.size === 0) return fallback;

  const box = new Box3();
  for (const m of meshes) {
    m.updateWorldMatrix(true, false);
    box.expandByObject(m);
  }
  if (box.isEmpty()) return fallback;

  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  const radius = Math.max(size.length() * 0.5, 0.08);
  const distance = Math.max(radius * 2.5, 0.28);

  // Position camera slightly above and in front (+Z is anterior in Three.js Y-up export)
  const sideBias = Math.abs(center.x) > 0.03 ? Math.sign(center.x) * distance * 0.28 : distance * 0.14;
  return {
    target: [
      +center.x.toFixed(4),
      +center.y.toFixed(4),
      +center.z.toFixed(4),
    ],
    position: [
      +(center.x + sideBias).toFixed(4),
      +(center.y + radius * 0.22).toFixed(4),
      +(center.z + distance).toFixed(4),
    ],
  };
}

/**
 * Computes the world-space top anchor point of a structure for floating 3D <Html> labels.
 */
export function computeStructureLabelPosition(
  structureId: string,
): [number, number, number] | null {
  const meshes = structureMeshRegistry.get(structureId);
  if (meshes && meshes.size > 0) {
    const box = new Box3();
    for (const m of meshes) {
      m.updateWorldMatrix(true, false);
      box.expandByObject(m);
    }
    if (!box.isEmpty()) {
      const center = box.getCenter(new Vector3());
      return [center.x, box.max.y + 0.025, center.z];
    }
  }
  const st = getStructureById(structureId);
  if (!st) return null;
  const [tx, ty, tz] = st.kameraFokus.target;
  return [tx, ty + 0.05, tz];
}

export function extractNodeName(obj: Object3D): string {
  const ownUserName = obj.userData?.name;
  if (
    typeof ownUserName === 'string' &&
    ownUserName.trim().length > 0 &&
    !/^mesh_\d+/i.test(ownUserName)
  ) {
    return ownUserName;
  }

  const parentUserName = obj.parent?.userData?.name;
  if (
    typeof parentUserName === 'string' &&
    parentUserName.trim().length > 0 &&
    !/^mesh_\d+/i.test(parentUserName)
  ) {
    return parentUserName;
  }

  const fallbackRaw =
    obj.name && !/^mesh_\d+/i.test(obj.name)
      ? obj.name
      : obj.parent?.name || obj.name || '';
  return fallbackRaw.replace(/_/g, ' ').replace(/\.\d+$/, '').trim();
}

export async function fetchTemplateGroup(
  chunkId: GlbChunkId,
  variant: 'opt' | 'lite',
): Promise<Group> {
  const key = `${chunkId}.${variant}`;
  let pending = templateCache.get(key);
  if (!pending) {
    const url = `/models/${chunkId}.${variant}.glb`;
    pending = gltfLoader.loadAsync(url).then((gltf) => {
      gltf.scene.traverse((obj) => {
        const m = obj as Mesh;
        if (!m.isMesh) return;
        const g = m.geometry as BufferGeometry & {
          boundsTree?: unknown;
          computeBoundsTree?: () => void;
        };
        if (!g.boundsTree && g.computeBoundsTree) {
          g.computeBoundsTree();
        }
      });
      return gltf.scene;
    });
    templateCache.set(key, pending);
  }
  return pending;
}

/**
 * Loads a GLB chunk for a specific anatomical layer and returns a cloned Group
 * with dedicated anatomical materials and structureId metadata attached to each Mesh.
 */
export async function instantiateLayerChunk(
  chunkId: GlbChunkId,
  layerId: LayerId,
  variant: 'opt' | 'lite',
): Promise<Group> {
  const template = await fetchTemplateGroup(chunkId, variant);
  const instance = template.clone(true);

  instance.traverse((obj) => {
    const m = obj as Mesh;
    if (!m.isMesh) return;
    const nodeName = extractNodeName(m);
    const resolved = resolveStructureForMesh(nodeName, layerId);
    m.userData.layerId = layerId;
    m.userData.nodeName = nodeName;
    m.userData.structureId = resolved?.id ?? null;
    m.userData.basePosition = m.position.clone();
    m.userData.baseScale = m.scale.clone();
    m.material = createAnatomicalMaterial(layerId, nodeName);

    if (resolved) {
      registerStructureMesh(resolved.id, m);
    }
  });

  return instance;
}
