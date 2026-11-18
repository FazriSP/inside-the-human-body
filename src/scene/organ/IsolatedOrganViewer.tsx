import { useEffect, useMemo, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Bvh, Html, Line } from '@react-three/drei';
import {
  Box3,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  Plane,
  Vector3,
} from 'three';
import {
  getDetailedOrganById,
  getSystemById,
  resolveSubStructureForOrganMesh,
} from '@/content/anatomy';
import type {
  CameraBookmark,
  DetailedOrganId,
  OrganSubStructure,
} from '@/content/schema/anatomy.schema';
import {
  extractNodeName,
  fetchTemplateGroup,
} from '@/scene/body/glbLoader';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLearningStore } from '@/stores/learningStore';

const ORGAN_STAGE_CENTER = new Vector3(0, 1.22, 0);
const TARGET_ORGAN_EXTENT = 0.44;

const HOVER_EMISSIVE = new Color('#38bdf8');
const SELECT_EMISSIVE = new Color('#22d3ee');

export const ISOLATED_ORGAN_DEFAULT_BOOKMARK: CameraBookmark = {
  position: [0.14, 1.31, 0.72],
  target: [0, 1.22, 0],
};

/** Live registry of mounted sub-structure meshes for the active isolated organ */
const subStructureMeshRegistry = new Map<string, Set<Mesh>>();

export function computeSubStructureFocusBookmark(
  subStructureId: string,
): CameraBookmark | undefined {
  const meshes = subStructureMeshRegistry.get(subStructureId);
  if (!meshes || meshes.size === 0) return undefined;

  const box = new Box3();
  for (const m of meshes) {
    m.updateWorldMatrix(true, false);
    box.expandByObject(m);
  }
  if (box.isEmpty()) return undefined;

  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  const radius = Math.max(size.length() * 0.5, 0.055);
  const distance = Math.max(radius * 2.45, 0.24);
  const sideBias =
    Math.abs(center.x) > 0.015
      ? Math.sign(center.x) * distance * 0.32
      : distance * 0.16;

  return {
    target: [
      +center.x.toFixed(4),
      +center.y.toFixed(4),
      +center.z.toFixed(4),
    ],
    position: [
      +(center.x + sideBias).toFixed(4),
      +(center.y + radius * 0.2).toFixed(4),
      +(center.z + distance).toFixed(4),
    ],
  };
}

function createSubStructureMaterial(
  sub: OrganSubStructure | undefined,
  clippingPlane: Plane,
): MeshPhysicalMaterial {
  const baseHex = sub?.warnaDasar ?? '#38bdf8';
  const mat = new MeshPhysicalMaterial({
    color: new Color(baseHex),
    roughness: 0.44,
    metalness: 0.05,
    clearcoat: 0.24,
    clearcoatRoughness: 0.36,
    side: DoubleSide,
    clippingPlanes: [clippingPlane],
    clipShadows: true,
  });

  // Shade interior back-faces slightly warmer/darker when sliced open by the clipping plane
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      if (!gl_FrontFacing) {
        gl_FragColor.rgb = mix(gl_FragColor.rgb * 0.68, vec3(0.55, 0.16, 0.22), 0.35);
      }
      #include <dithering_fragment>
      `,
    );
  };
  mat.customProgramCacheKey = () => 'ithb-isolated-organ-v1';

  return mat;
}

interface IsolatedOrganViewerProps {
  organId: DetailedOrganId;
}

/**
 * High-Detail Isolated Organ 3D Viewer & Interactive Cross-Section Renderer.
 * Loads HuBMAP HRA organ GLB assets, centers and normalizes them on the studio stage,
 * applies interactive X/Y/Z clipping planes, and enables sub-structure picking.
 */
export function IsolatedOrganViewer({ organId }: IsolatedOrganViewerProps) {
  const effectiveTier = useSettingsStore((s) => s.effectiveTier);
  const tampilkanLabel3D = useSettingsStore((s) => s.tampilkanLabel3D);

  const selectedSubStructureId = useSceneStore((s) => s.selectedSubStructureId);
  const hoveredSubStructureId = useSceneStore((s) => s.hoveredSubStructureId);
  const xrayMode = useSceneStore((s) => s.xrayMode);
  const clipping = useSceneStore((s) => s.clipping);

  const selectSubStructure = useSceneStore((s) => s.selectSubStructure);
  const hoverSubStructure = useSceneStore((s) => s.hoverSubStructure);
  const markChunkLoading = useSceneStore((s) => s.markChunkLoading);
  const markChunkLoaded = useSceneStore((s) => s.markChunkLoaded);

  const flyTo = useCameraStore((s) => s.flyTo);
  const markStructureExplored = useLearningStore(
    (s) => s.markStructureExplored,
  );

  const [organGroup, setOrganGroup] = useState<Group | null>(null);
  const [organBounds, setOrganBounds] = useState<Box3 | null>(null);

  const clippingPlaneRef = useRef<Plane>(new Plane(new Vector3(0, 0, -1), 10));

  const organ = getDetailedOrganById(organId);
  const system = organ ? getSystemById(organ.sistem) : undefined;
  const variant: 'opt' | 'lite' = effectiveTier === 'rendah' ? 'lite' : 'opt';

  // Load, normalize, and register the isolated organ GLB
  useEffect(() => {
    if (!organ) return;
    let cancelled = false;
    let createdInstance: Group | null = null;
    const chunkKey = `${organ.glbChunkId}.${variant}`;
    markChunkLoading(chunkKey);

    fetchTemplateGroup(organ.glbChunkId, variant)
      .then((template) => {
        if (cancelled) return;
        const instance = template.clone(true);
        createdInstance = instance;

        // Compute raw bounding box in GLB local space
        instance.updateMatrixWorld(true);
        const rawBox = new Box3().setFromObject(instance);
        const rawCenter = rawBox.getCenter(new Vector3());
        const rawSize = rawBox.getSize(new Vector3());
        const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z, 0.01);
        const uniformScale = TARGET_ORGAN_EXTENT / maxDim;

        instance.scale.setScalar(uniformScale);
        instance.position.set(
          ORGAN_STAGE_CENTER.x - rawCenter.x * uniformScale,
          ORGAN_STAGE_CENTER.y - rawCenter.y * uniformScale,
          ORGAN_STAGE_CENTER.z - rawCenter.z * uniformScale,
        );
        instance.updateMatrixWorld(true);

        const worldBox = new Box3().setFromObject(instance);

        subStructureMeshRegistry.clear();
        instance.traverse((obj) => {
          const m = obj as Mesh;
          if (!m.isMesh) return;
          const nodeName = extractNodeName(m);
          const sub = resolveSubStructureForOrganMesh(organ.id, nodeName);
          m.userData.nodeName = nodeName;
          m.userData.subStructureId = sub?.id ?? null;
          m.material = createSubStructureMaterial(sub, clippingPlaneRef.current);

          if (sub) {
            let set = subStructureMeshRegistry.get(sub.id);
            if (!set) {
              set = new Set<Mesh>();
              subStructureMeshRegistry.set(sub.id, set);
            }
            set.add(m);
          }
        });

        setOrganGroup(instance);
        setOrganBounds(worldBox);
        markChunkLoaded(chunkKey);

        // Mark related whole-body structures as explored and frame the isolated organ
        for (const relId of organ.relatedStructureIds) {
          markStructureExplored(relId);
        }
        flyTo(ISOLATED_ORGAN_DEFAULT_BOOKMARK, 'organ-focus');
      })
      .catch(() => {
        if (!cancelled) markChunkLoaded(chunkKey);
      });

    return () => {
      cancelled = true;
      subStructureMeshRegistry.clear();
      if (createdInstance) {
        createdInstance.traverse((obj) => {
          const m = obj as Mesh;
          if (!m.isMesh) return;
          if (Array.isArray(m.material)) {
            for (const mat of m.material) mat.dispose();
          } else if (m.material) {
            m.material.dispose();
          }
        });
      }
    };
  }, [
    organ,
    variant,
    markChunkLoading,
    markChunkLoaded,
    markStructureExplored,
    flyTo,
  ]);

  // Update the live clipping plane & material states whenever clipping, selection, hover, or X-ray changes
  const activeCutCoord = useMemo(() => {
    if (!organBounds) return 0;
    const axis = clipping.axis;
    const minVal = organBounds.min[axis];
    const maxVal = organBounds.max[axis];
    const span = Math.max(maxVal - minVal, 0.01);
    const margin = span * 0.025;
    const t = (clipping.offset + 1) * 0.5;
    return minVal - margin + t * (span + margin * 2);
  }, [organBounds, clipping.axis, clipping.offset]);

  useEffect(() => {
    const plane = clippingPlaneRef.current;
    const axis = clipping.axis;
    const dir = clipping.inverted ? 1 : -1;

    plane.normal.set(
      axis === 'x' ? dir : 0,
      axis === 'y' ? dir : 0,
      axis === 'z' ? dir : 0,
    );
    plane.constant = clipping.inverted ? -activeCutCoord : activeCutCoord;

    if (!organGroup) return;
    const accentColor = system
      ? new Color(system.warnaAksen)
      : SELECT_EMISSIVE;

    organGroup.traverse((obj) => {
      const m = obj as Mesh;
      if (!m.isMesh) return;
      const mat = m.material as MeshPhysicalMaterial;
      if (!mat) return;

      const subId = m.userData.subStructureId as string | null;
      const isSelected = subId !== null && subId === selectedSubStructureId;
      const isHovered = subId !== null && subId === hoveredSubStructureId;
      const dimOthers = selectedSubStructureId !== null && !isSelected;

      mat.clippingPlanes = clipping.enabled ? [plane] : [];

      const targetOpacity = isSelected
        ? 1.0
        : xrayMode
          ? 0.36
          : dimOthers
            ? 0.45
            : 1.0;

      const isTransparent = targetOpacity < 0.98;
      mat.transparent = isTransparent;
      mat.opacity = targetOpacity;
      mat.depthWrite = !isTransparent || isSelected;

      if (isSelected) {
        mat.emissive.copy(accentColor);
        mat.emissiveIntensity = 0.62;
      } else if (isHovered) {
        mat.emissive.copy(HOVER_EMISSIVE);
        mat.emissiveIntensity = 0.42;
      } else {
        mat.emissive.setRGB(0, 0, 0);
        mat.emissiveIntensity = 0;
      }
    });
  }, [
    organGroup,
    clipping.enabled,
    clipping.axis,
    clipping.inverted,
    activeCutCoord,
    selectedSubStructureId,
    hoveredSubStructureId,
    xrayMode,
    system,
  ]);

  // Compute active sub-structure for floating 3D label
  const activeSubId = hoveredSubStructureId ?? selectedSubStructureId;
  const activeSub = useMemo(() => {
    if (!organ || !activeSubId) return undefined;
    return organ.subStructures.find((s) => s.id === activeSubId);
  }, [organ, activeSubId]);

  const activeLabelPos = useMemo((): [number, number, number] | null => {
    if (!activeSubId) return null;
    const meshes = subStructureMeshRegistry.get(activeSubId);
    if (!meshes || meshes.size === 0) return null;
    const box = new Box3();
    for (const m of meshes) {
      m.updateWorldMatrix(true, false);
      box.expandByObject(m);
    }
    if (box.isEmpty()) return null;
    const center = box.getCenter(new Vector3());
    return [center.x, box.max.y + 0.022, center.z];
  }, [activeSubId, organGroup]);

  if (!organGroup || !organ) return null;

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const subId = (e.object.userData.subStructureId as string | null) ?? null;
    const nodeName =
      (e.object.userData.nodeName as string | null) ?? e.object.name;
    hoverSubStructure(subId, nodeName);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoverSubStructure(null, null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const subId = (e.object.userData.subStructureId as string | null) ?? null;
    if (subId) {
      selectSubStructure(subId);
      const bookmark = computeSubStructureFocusBookmark(subId);
      if (bookmark) {
        flyTo(bookmark, 'organ-focus');
      }
    }
  };

  // Visual slicing plane guide position & rotation
  const planePos: [number, number, number] = [
    clipping.axis === 'x' ? activeCutCoord : ORGAN_STAGE_CENTER.x,
    clipping.axis === 'y' ? activeCutCoord : ORGAN_STAGE_CENTER.y,
    clipping.axis === 'z' ? activeCutCoord : ORGAN_STAGE_CENTER.z,
  ];
  const planeRot: [number, number, number] =
    clipping.axis === 'x'
      ? [0, Math.PI / 2, 0]
      : clipping.axis === 'y'
        ? [Math.PI / 2, 0, 0]
        : [0, 0, 0];
  const half = 0.25;
  const borderPoints: [number, number, number][] = [
    [-half, -half, 0],
    [half, -half, 0],
    [half, half, 0],
    [-half, half, 0],
    [-half, -half, 0],
  ];

  return (
    <group name={`ITHB_IsolatedOrgan_${organ.id}`}>
      <Bvh firstHitOnly>
        <primitive
          object={organGroup}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
      </Bvh>

      {/* Visual Cross-Section Slicing Plane Guide */}
      {clipping.enabled && clipping.showGuidePlane && (
        <group position={planePos} rotation={planeRot}>
          <mesh renderOrder={2}>
            <planeGeometry args={[half * 2, half * 2]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={0.09}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <Line
            points={borderPoints}
            color="#22d3ee"
            lineWidth={1.6}
            transparent
            opacity={0.75}
          />
        </group>
      )}

      {/* Floating 3D HTML Label for Hovered / Selected Sub-Structure */}
      {tampilkanLabel3D && activeSub && activeLabelPos && (
        <Html
          position={activeLabelPos}
          center
          distanceFactor={1.15}
          style={{ pointerEvents: 'none', zIndex: 5 }}
        >
          <div
            style={{
              background: 'rgba(6, 12, 24, 0.94)',
              border: `1px solid ${activeSub.warnaDasar}`,
              color: '#edf4ff',
              padding: '5px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: activeSub.warnaDasar,
                display: 'inline-block',
              }}
            />
            <span>{activeSub.namaID}</span>
            <em style={{ opacity: 0.75, fontWeight: 400 }}>
              ({activeSub.namaLatin})
            </em>
          </div>
        </Html>
      )}
    </group>
  );
}
