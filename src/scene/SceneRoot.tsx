import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { QualityManager } from '@/scene/performance/QualityManager';
import { CameraDirector } from '@/scene/camera/CameraDirector';
import { SceneEnvironment } from '@/scene/environment/SceneEnvironment';
import { BodyModel } from '@/scene/body/BodyModel';
import { IsolatedOrganViewer } from '@/scene/organ/IsolatedOrganViewer';
import { CinematicJourneyStage } from '@/scene/journey/CinematicJourneyStage';
import { BiologicalSimulations } from '@/scene/simulation/BiologicalSimulations';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useSimulationStore } from '@/stores/simulationStore';

/**
 * Triggers on-demand frame invalidations whenever Zustand scene, camera,
 * or settings state changes while the canvas is in power-saving 'demand' mode.
 */
function SceneInvalidator() {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const unsubScene = useSceneStore.subscribe(() => invalidate());
    const unsubCamera = useCameraStore.subscribe(() => invalidate());
    const unsubSettings = useSettingsStore.subscribe(() => invalidate());
    const unsubSim = useSimulationStore.subscribe(() => invalidate());
    return () => {
      unsubScene();
      unsubCamera();
      unsubSettings();
      unsubSim();
    };
  }, [invalidate]);

  return null;
}

/**
 * Persistent R3F Canvas mounted once at the application root.
 * Remains alive across all React Router page transitions to prevent WebGL
 * context loss, asset re-downloads, or shader recompilation.
 */
export function SceneRoot() {
  const dpr = useSettingsStore((s) => s.dpr);
  const shadowsEnabled = useSettingsStore((s) => s.shadowsEnabled);
  const kurangiGerakan = useSettingsStore((s) => s.kurangiGerakan);

  const isolatedOrganId = useSceneStore((s) => s.isolatedOrganId);
  const selectedStructureId = useSceneStore((s) => s.selectedStructureId);
  const selectStructure = useSceneStore((s) => s.selectStructure);
  const selectSubStructure = useSceneStore((s) => s.selectSubStructure);
  const loadingChunks = useSceneStore((s) => s.loadingChunks);

  const autoRotate = useCameraStore((s) => s.autoRotate);
  const activeJourneyId = useCameraStore((s) => s.journey.activeJourneyId);
  const simulationViewActive = useSimulationStore(
    (s) => s.simulationViewActive,
  );

  const [contextLost, setContextLost] = useState(false);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  // Switch between continuous 60fps loop (during active animations) and battery-saving on-demand rendering
  const continuousLoop =
    Boolean(activeJourneyId) ||
    simulationViewActive ||
    (autoRotate &&
      !kurangiGerakan &&
      selectedStructureId === null &&
      isolatedOrganId === null);

  useEffect(() => {
    if (!canvasEl) return;
    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => {
      setContextLost(false);
    };
    canvasEl.addEventListener('webglcontextlost', onLost);
    canvasEl.addEventListener('webglcontextrestored', onRestored);
    return () => {
      canvasEl.removeEventListener('webglcontextlost', onLost);
      canvasEl.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [canvasEl]);

  return (
    <div className="scene-root-layer" aria-label="Kanvas Anatomi 3D Interaktif">
      {contextLost && (
        <div
          className="glass-panel pointer-auto"
          role="alert"
          style={{
            position: 'fixed',
            top: 84,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            padding: '12px 20px',
            borderColor: 'var(--status-danger)',
          }}
        >
          Konteks grafis WebGL terputus sementara. Memulihkan tampilan 3D...
        </div>
      )}

      {loadingChunks.length > 0 && (
        <div
          className="glass-panel pointer-auto"
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 76,
            right: 20,
            zIndex: 45,
            padding: '8px 14px',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderColor: 'var(--glass-border-strong)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-cyan)',
              boxShadow: 'var(--accent-glow)',
            }}
          />
          <span>
            Memuat model anatomi 3D ({loadingChunks.length} berkas)...
          </span>
        </div>
      )}

      <Canvas
        frameloop={continuousLoop ? 'always' : 'demand'}
        dpr={dpr}
        shadows={shadowsEnabled}
        camera={{ fov: 42, near: 0.01, far: 25, position: [0, 1.08, 2.15] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          setCanvasEl(gl.domElement);
        }}
        onPointerMissed={() => {
          if (isolatedOrganId) {
            selectSubStructure(null);
          } else {
            selectStructure(null);
          }
        }}
      >
        <SceneInvalidator />
        <QualityManager />
        <CameraDirector />
        <SceneEnvironment />
        <BodyModel />
        {isolatedOrganId && <IsolatedOrganViewer organId={isolatedOrganId} />}
        {activeJourneyId && <CinematicJourneyStage />}
        <BiologicalSimulations />
      </Canvas>
    </div>
  );
}
