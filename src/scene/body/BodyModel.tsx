import { useEffect, useMemo, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Bvh, Html } from '@react-three/drei';
import { Color, type Group, type Mesh } from 'three';
import {
  getStructureById,
  getSystemById,
} from '@/content/anatomy';
import type {
  GlbChunkId,
  LayerId,
} from '@/content/schema/anatomy.schema';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLearningStore } from '@/stores/learningStore';
import {
  useSimulationStore,
  type SimulationModuleId,
} from '@/stores/simulationStore';
import {
  computeStructureFocusBookmark,
  computeStructureLabelPosition,
  instantiateLayerChunk,
  unregisterLayerMeshes,
} from './glbLoader';
import type { AnatomicalMeshMaterial } from './xrayMaterial';

const LAYER_CHUNKS: { layerId: LayerId; chunkId: GlbChunkId }[] = [
  { layerId: 'rangka', chunkId: 'za-skeletal-full' },
  { layerId: 'peredaran-darah', chunkId: 'za-cardiovascular-core' },
  { layerId: 'pernapasan', chunkId: 'za-respiratory' },
  { layerId: 'kulit', chunkId: 'za-regions-skin' },
];

const HOVER_EMISSIVE = new Color('#2dd4bf');
const SELECT_FALLBACK_EMISSIVE = new Color('#14b8a6');

const PERIPHERAL_VESSEL_BLACKLIST_RE =
  /femoral|popliteal|saphenous|iliac|brachial|radial|ulnar|axillary|antebrachial|carotid|maxillary|jugular|thyrocervical|costocervical|thyroid|suprascapular|cervical|renal|suprarenal|mesenteric|splenic|hepatic|abdominal|phrenic|subcostal|intercostal|azygos|subclavian|segmental artery|lingular artery|lobar artery|basal vein|lingular vein|(?:superior|anterior|apical|apicoposterior|lateral|medial|posterior) vein of (?:left|right) lung/i;

const UPPER_HEAD_AIRWAY_BLACKLIST_RE = /nasal/i;

function isMeshVisibleInSimulation(
  layerId: LayerId,
  activeModule: SimulationModuleId,
  _structureId: string | null,
  nodeName: string,
): boolean {
  const cleanName = nodeName.replace(/_/g, ' ');

  if (activeModule === 'detak-jantung') {
    if (layerId === 'peredaran-darah') {
      return !PERIPHERAL_VESSEL_BLACKLIST_RE.test(cleanName);
    }
    return false;
  }

  if (activeModule === 'mekanisme-pernapasan') {
    if (layerId === 'pernapasan') {
      return !UPPER_HEAD_AIRWAY_BLACKLIST_RE.test(cleanName);
    }
    return false;
  }

  if (activeModule === 'aliran-darah') {
    if (layerId === 'peredaran-darah') {
      return !PERIPHERAL_VESSEL_BLACKLIST_RE.test(cleanName);
    }
    if (layerId === 'pernapasan') {
      return !UPPER_HEAD_AIRWAY_BLACKLIST_RE.test(cleanName);
    }
    return false;
  }

  return true;
}

interface LayerMeshGroupProps {
  layerId: LayerId;
  chunkId: GlbChunkId;
  variant: 'opt' | 'lite';
  visible: boolean;
  opacity: number;
  xrayMode: boolean;
  allowRaycast: boolean;
  simulationViewActive: boolean;
  activeSimModule: SimulationModuleId;
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  activeRegionFilter: string;
  onSelectStructure: (structureId: string) => void;
  onHoverStructure: (structureId: string | null, meshName: string | null) => void;
}

function LayerMeshGroup({
  layerId,
  chunkId,
  variant,
  visible,
  opacity,
  xrayMode,
  allowRaycast,
  simulationViewActive,
  activeSimModule,
  selectedStructureId,
  hoveredStructureId,
  activeRegionFilter,
  onSelectStructure,
  onHoverStructure,
}: LayerMeshGroupProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const markChunkLoading = useSceneStore((s) => s.markChunkLoading);
  const markChunkLoaded = useSceneStore((s) => s.markChunkLoaded);

  // Lazy-load chunks only when visible so hidden layers (like heavy full skeleton in mini-game) don't load unnecessarily
  useEffect(() => {
    if (!visible && !group) return;
    let cancelled = false;
    const key = `${chunkId}.${variant}`;
    markChunkLoading(key);

    instantiateLayerChunk(chunkId, layerId, variant)
      .then((g) => {
        if (cancelled) {
          unregisterLayerMeshes(g);
          return;
        }
        setGroup((prev) => {
          if (prev) unregisterLayerMeshes(prev);
          return g;
        });
        markChunkLoaded(key);
      })
      .catch(() => {
        if (!cancelled) markChunkLoaded(key);
      });

    return () => {
      cancelled = true;
    };
  }, [chunkId, layerId, variant, visible, group, markChunkLoading, markChunkLoaded]);

  // Synchronize materials with layer opacity, X-ray mode, region filter, hover, selection, and simulation focus
  useEffect(() => {
    if (!group) return;
    const selectedStruct = selectedStructureId
      ? getStructureById(selectedStructureId)
      : undefined;
    const selectedSys = selectedStruct
      ? getSystemById(selectedStruct.sistem)
      : undefined;
    const selectColor = selectedSys
      ? new Color(selectedSys.warnaAksen)
      : SELECT_FALLBACK_EMISSIVE;

    group.traverse((obj) => {
      const m = obj as Mesh;
      if (!m.isMesh) return;
      const mat = m.material as AnatomicalMeshMaterial;
      if (!mat) return;

      const sid = (m.userData.structureId as string | null) ?? null;
      const nodeName = (m.userData.nodeName as string | undefined) ?? m.name;
      const struct = sid ? getStructureById(sid) : undefined;
      const isSelected = !simulationViewActive && sid !== null && sid === selectedStructureId;
      const isHovered = !simulationViewActive && sid !== null && sid === hoveredStructureId;

      const matchesRegion =
        activeRegionFilter === 'semua' ||
        !struct ||
        struct.wilayah === activeRegionFilter;

      const matchesSimContext =
        !simulationViewActive ||
        isMeshVisibleInSimulation(layerId, activeSimModule, sid, nodeName);

      m.visible = visible && matchesRegion && matchesSimContext;

      const dimOthers =
        !simulationViewActive &&
        selectedStructureId !== null &&
        !isSelected &&
        layerId !== 'kulit';
      const targetOpacity = isSelected
        ? 1.0
        : xrayMode
          ? Math.min(opacity, layerId === 'kulit' ? 0.18 : 0.42)
          : dimOthers
            ? Math.min(opacity, 0.48)
            : opacity;

      const isTransparent = targetOpacity < 0.98 || xrayMode;
      mat.transparent = isTransparent;
      mat.opacity = targetOpacity;
      mat.depthWrite = !isTransparent || isSelected;

      if (mat.userData.xrayUniforms) {
        mat.userData.xrayUniforms.uXrayMix.value =
          xrayMode && !isSelected ? 1.0 : 0.0;
      }

      if (isSelected) {
        mat.emissive.copy(selectColor);
        mat.emissiveIntensity = 0.68;
      } else if (isHovered) {
        mat.emissive.copy(HOVER_EMISSIVE);
        mat.emissiveIntensity = 0.42;
      } else {
        mat.emissive.setRGB(0, 0, 0);
        mat.emissiveIntensity = 0;
      }
    });
  }, [
    group,
    visible,
    opacity,
    xrayMode,
    simulationViewActive,
    activeSimModule,
    selectedStructureId,
    hoveredStructureId,
    activeRegionFilter,
    layerId,
  ]);

  if (!group || !visible) return null;

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!allowRaycast) return;
    e.stopPropagation();
    const sid = (e.object.userData.structureId as string | null) ?? null;
    const nodeName = (e.object.userData.nodeName as string | null) ?? e.object.name;
    onHoverStructure(sid, nodeName);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    if (!allowRaycast) return;
    e.stopPropagation();
    onHoverStructure(null, null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!allowRaycast) return;
    e.stopPropagation();
    const sid = (e.object.userData.structureId as string | null) ?? null;
    if (sid) {
      onSelectStructure(sid);
    }
  };

  return (
    <Bvh firstHitOnly>
      <primitive
        object={group}
        onPointerMove={allowRaycast ? handlePointerMove : undefined}
        onPointerOut={allowRaycast ? handlePointerOut : undefined}
        onClick={allowRaycast ? handleClick : undefined}
      />
    </Bvh>
  );
}

/**
 * Full 3D Human Body Explorer & Simulation Stage Component.
 * Streams validated Z-Anatomy GLB chunks lazily and applies context-aware isolation
 * during medical mini-game simulations so target organs render cleanly without overlap.
 */
export function BodyModel() {
  const effectiveTier = useSettingsStore((s) => s.effectiveTier);
  const tampilkanLabel3D = useSettingsStore((s) => s.tampilkanLabel3D);

  const visibleLayers = useSceneStore((s) => s.visibleLayers);
  const layerOpacity = useSceneStore((s) => s.layerOpacity);
  const xrayMode = useSceneStore((s) => s.xrayMode);
  const activeRegionFilter = useSceneStore((s) => s.activeRegionFilter);
  const selectedStructureId = useSceneStore((s) => s.selectedStructureId);
  const hoveredStructureId = useSceneStore((s) => s.hoveredStructureId);
  const isolatedOrganId = useSceneStore((s) => s.isolatedOrganId);
  const selectStructure = useSceneStore((s) => s.selectStructure);
  const hoverStructure = useSceneStore((s) => s.hoverStructure);

  const simulationViewActive = useSimulationStore(
    (s) => s.simulationViewActive,
  );
  const activeSimModule = useSimulationStore((s) => s.activeModule);

  const flyTo = useCameraStore((s) => s.flyTo);
  const markStructureExplored = useLearningStore(
    (s) => s.markStructureExplored,
  );

  const variant: 'opt' | 'lite' = effectiveTier === 'rendah' ? 'lite' : 'opt';

  const anyInternalVisible =
    visibleLayers.rangka ||
    visibleLayers['peredaran-darah'] ||
    visibleLayers.pernapasan;

  const handleSelectStructure = (structureId: string) => {
    selectStructure(structureId);
    markStructureExplored(structureId);
    const bookmark = computeStructureFocusBookmark(structureId);
    if (bookmark) {
      flyTo(bookmark, 'organ-focus');
    }
  };

  const activeLabelStructureId = hoveredStructureId ?? selectedStructureId;
  const activeLabelStructure = activeLabelStructureId
    ? getStructureById(activeLabelStructureId)
    : undefined;
  const activeLabelSystem = activeLabelStructure
    ? getSystemById(activeLabelStructure.sistem)
    : undefined;

  const labelPosition = useMemo(() => {
    if (!activeLabelStructureId || simulationViewActive) return null;
    return computeStructureLabelPosition(activeLabelStructureId);
  }, [activeLabelStructureId, simulationViewActive]);

  const isWholeBodyActive = isolatedOrganId === null;

  return (
    <group name="ITHB_BodyModelRoot" visible={isWholeBodyActive}>
      {LAYER_CHUNKS.map(({ layerId, chunkId }) => {
        const isVisible = isWholeBodyActive && visibleLayers[layerId];
        const opacity = layerOpacity[layerId];
        const allowRaycast =
          !simulationViewActive &&
          isVisible &&
          !(
            layerId === 'kulit' &&
            anyInternalVisible &&
            (opacity < 0.75 || xrayMode)
          );

        return (
          <LayerMeshGroup
            key={layerId}
            layerId={layerId}
            chunkId={chunkId}
            variant={variant}
            visible={isVisible}
            opacity={opacity}
            xrayMode={xrayMode}
            allowRaycast={allowRaycast}
            simulationViewActive={simulationViewActive}
            activeSimModule={activeSimModule}
            selectedStructureId={selectedStructureId}
            hoveredStructureId={hoveredStructureId}
            activeRegionFilter={activeRegionFilter}
            onSelectStructure={handleSelectStructure}
            onHoverStructure={hoverStructure}
          />
        );
      })}

      {/* Floating 3D Label (disabled during Mini-Game / Simulation to prevent clutter) */}
      {isWholeBodyActive &&
        !simulationViewActive &&
        tampilkanLabel3D &&
        activeLabelStructure &&
        labelPosition && (
        <Html
          position={labelPosition}
          center
          distanceFactor={1.45}
          style={{ pointerEvents: 'none', zIndex: 5 }}
        >
          <div
            style={{
              background: 'rgba(6, 12, 24, 0.92)',
              border: `1px solid ${activeLabelSystem?.warnaAksen ?? '#14b8a6'}`,
              color: '#f0fdfa',
              padding: '5px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.72)',
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
                background: activeLabelSystem?.warnaAksen ?? '#14b8a6',
                display: 'inline-block',
              }}
            />
            <span>{activeLabelStructure.namaID}</span>
            <em style={{ opacity: 0.75, fontWeight: 400 }}>
              ({activeLabelStructure.namaLatin})
            </em>
          </div>
        </Html>
      )}
    </group>
  );
}
