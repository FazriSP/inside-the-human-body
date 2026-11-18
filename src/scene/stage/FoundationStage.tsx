import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import {
  ANATOMICAL_STRUCTURES,
  getSystemById,
} from '@/content/anatomy';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLearningStore } from '@/stores/learningStore';

/**
 * Phase 1 Spatial Calibration & Landmark Stage.
 * Renders the metric Z-Anatomy reference frame (0.00 m - 1.71 m) and interactive
 * 3D anatomical anchor nodes mapped to the validated registry. Phase 2 mounts
 * the full multi-chunk GLB BodyModel in this same coordinate space.
 */
export function FoundationStage() {
  const visibleLayers = useSceneStore((s) => s.visibleLayers);
  const layerOpacity = useSceneStore((s) => s.layerOpacity);
  const xrayMode = useSceneStore((s) => s.xrayMode);
  const activeRegionFilter = useSceneStore((s) => s.activeRegionFilter);
  const selectedStructureId = useSceneStore((s) => s.selectedStructureId);
  const hoveredStructureId = useSceneStore((s) => s.hoveredStructureId);
  const selectStructure = useSceneStore((s) => s.selectStructure);
  const hoverStructure = useSceneStore((s) => s.hoverStructure);

  const flyTo = useCameraStore((s) => s.flyTo);
  const tampilkanLabel3D = useSettingsStore((s) => s.tampilkanLabel3D);
  const markStructureExplored = useLearningStore(
    (s) => s.markStructureExplored,
  );

  const visibleStructures = useMemo(
    () =>
      ANATOMICAL_STRUCTURES.filter((st) => {
        if (!visibleLayers[st.lapisan]) return false;
        if (
          activeRegionFilter !== 'semua' &&
          st.wilayah !== activeRegionFilter
        ) {
          return false;
        }
        return true;
      }),
    [visibleLayers, activeRegionFilter],
  );

  return (
    <group name="ITHB_MetricReferenceFrame">
      {/* Outer Body Silhouette Reference Cylinder (1.71 m stature when Kulit layer is active) */}
      {visibleLayers.kulit && (
        <mesh position={[0, 0.88, 0]}>
          <capsuleGeometry args={[0.19, 1.32, 12, 24]} />
          <meshStandardMaterial
            color="#a78bfa"
            transparent
            opacity={xrayMode ? 0.14 : layerOpacity.kulit}
            wireframe={xrayMode}
            roughness={0.4}
          />
        </mesh>
      )}

      {/* Subtle Vertical Anatomical Axis & Metric Elevation Rings */}
      {[0.01, 0.88, 1.28, 1.62].map((elevation) => (
        <mesh
          key={elevation}
          position={[0, elevation, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.26, 0.265, 48]} />
          <meshBasicMaterial color="#1d3b66" transparent opacity={0.45} />
        </mesh>
      ))}

      {/* Interactive 3D Landmark Nodes for Curated MVP Structures */}
      {visibleStructures.map((st) => {
        const sys = getSystemById(st.sistem);
        const isSelected = selectedStructureId === st.id;
        const isHovered = hoveredStructureId === st.id;
        const baseColor = sys?.warnaAksen ?? '#38bdf8';
        const opacity = xrayMode ? 0.55 : (layerOpacity[st.lapisan] ?? 1.0);
        const [tx, ty, tz] = st.kameraFokus.target;
        const [px] = st.kameraFokus.position;
        const xOffset = tx !== 0 ? tx : px * 0.28;

        return (
          <group key={st.id} position={[xOffset, ty, tz]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                selectStructure(st.id);
                markStructureExplored(st.id);
                flyTo(st.kameraFokus, 'organ-focus');
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                hoverStructure(st.id);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                if (hoveredStructureId === st.id) hoverStructure(null);
              }}
            >
              <sphereGeometry
                args={[isSelected ? 0.042 : isHovered ? 0.036 : 0.028, 24, 24]}
              />
              <meshStandardMaterial
                color={isSelected ? '#ffffff' : baseColor}
                emissive={isSelected || isHovered ? baseColor : '#000000'}
                emissiveIntensity={isSelected ? 0.95 : isHovered ? 0.55 : 0.15}
                roughness={0.25}
                metalness={0.1}
                transparent={opacity < 1}
                opacity={opacity}
                wireframe={xrayMode}
              />
            </mesh>

            {tampilkanLabel3D && (isSelected || isHovered) && (
              <Html
                position={[0, 0.065, 0]}
                center
                distanceFactor={1.6}
                style={{ pointerEvents: 'none' }}
              >
                <div
                  style={{
                    background: 'rgba(6, 12, 24, 0.92)',
                    border: `1px solid ${baseColor}`,
                    color: '#edf4ff',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.65)',
                  }}
                >
                  {st.namaID} <em style={{ opacity: 0.75 }}>({st.namaLatin})</em>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
