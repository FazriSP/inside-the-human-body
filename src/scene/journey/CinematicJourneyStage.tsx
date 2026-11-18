import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import {
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import {
  getActiveChapterForProgress,
  getJourneyById,
} from '@/content/anatomy';
import { setLiveJourneyCameraPose } from '@/scene/camera/CameraDirector';
import { useCameraStore } from '@/stores/cameraStore';
import { useSceneStore } from '@/stores/sceneStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLearningStore } from '@/stores/learningStore';

const VENOUS_COLOR = new Color('#3b82f6');
const TRANSITION_COLOR = new Color('#a855f7');
const ARTERIAL_COLOR = new Color('#ef4444');

const COMPANION_COUNT = 36;
const GAS_PARTICLE_COUNT = 18;

function computeBloodColorAtProgress(t: number, out: Color): Color {
  if (t < 0.64) {
    return out.copy(VENOUS_COLOR);
  }
  if (t < 0.74) {
    const alpha = (t - 0.64) / 0.10;
    return out.copy(VENOUS_COLOR).lerp(TRANSITION_COLOR, alpha);
  }
  if (t < 0.84) {
    const alpha = (t - 0.74) / 0.10;
    return out.copy(TRANSITION_COLOR).lerp(ARTERIAL_COLOR, alpha);
  }
  return out.copy(ARTERIAL_COLOR);
}

/**
 * 3D Cinematic Journey Stage for "Perjalanan Sel Darah Merah".
 * Renders the CatmullRomCurve3 vascular rail, the lead biconcave erythrocyte,
 * companion bloodstream erythrocytes, and the schematic alveolar O2/CO2 diffusion cluster.
 */
export function CinematicJourneyStage() {
  const activeJourneyId = useCameraStore((s) => s.journey.activeJourneyId);
  const isPlaying = useCameraStore((s) => s.journey.isPlaying);
  const progress = useCameraStore((s) => s.journey.progress);
  const speed = useCameraStore((s) => s.journey.speed);
  const followCamera = useCameraStore((s) => s.journey.followCamera);
  const setJourneyPlayback = useCameraStore((s) => s.setJourneyPlayback);

  const selectStructure = useSceneStore((s) => s.selectStructure);
  const tampilkanLabel3D = useSettingsStore((s) => s.tampilkanLabel3D);
  const kurangiGerakan = useSettingsStore((s) => s.kurangiGerakan);
  const markStructureExplored = useLearningStore(
    (s) => s.markStructureExplored,
  );

  const journeyData = useMemo(
    () => (activeJourneyId ? getJourneyById(activeJourneyId) : undefined),
    [activeJourneyId],
  );

  const curve = useMemo(() => {
    if (!journeyData) return null;
    const pts = journeyData.controlPoints.map(
      ([x, y, z]) => new Vector3(x, y, z),
    );
    return new CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  }, [journeyData]);

  const railPoints = useMemo(() => {
    if (!curve) return [];
    return curve
      .getPoints(120)
      .map((v): [number, number, number] => [v.x, v.y, v.z]);
  }, [curve]);

  const tubeGeometry = useMemo(() => {
    if (!curve) return null;
    return new TubeGeometry(curve, 96, 0.0042, 12, false);
  }, [curve]);

  const rbcGeometry = useMemo(() => {
    const geo = new CylinderGeometry(0.0068, 0.0068, 0.0024, 24);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  const gasSphereGeometry = useMemo(
    () => new SphereGeometry(0.0022, 10, 10),
    [],
  );

  const leadGroupRef = useRef<Group | null>(null);
  const leadMeshRef = useRef<Mesh | null>(null);
  const companionInstancedRef = useRef<InstancedMesh | null>(null);
  const o2InstancedRef = useRef<InstancedMesh | null>(null);
  const co2InstancedRef = useRef<InstancedMesh | null>(null);

  const progressRef = useRef<number>(progress);
  progressRef.current = progress;

  const dummyObj = useMemo(() => new Object3D(), []);
  const tempColor = useMemo(() => new Color(), []);
  const tempPos = useMemo(() => new Vector3(), []);
  const tempTangent = useMemo(() => new Vector3(), []);
  const smoothCamPos = useMemo(() => new Vector3(0, 1.32, 0.32), []);
  const smoothCamTarget = useMemo(() => new Vector3(0, 1.3, 0.02), []);

  useEffect(() => {
    return () => {
      setLiveJourneyCameraPose(false);
      tubeGeometry?.dispose();
      rbcGeometry.dispose();
      gasSphereGeometry.dispose();
    };
  }, [tubeGeometry, rbcGeometry, gasSphereGeometry]);

  useFrame((state, delta) => {
    if (!journeyData || !curve) return;

    let currentT = progressRef.current;
    if (isPlaying) {
      const step = (delta * speed) / journeyData.durasiDetikDefault;
      currentT += step;
      if (currentT >= 1) {
        currentT = 1;
        setJourneyPlayback({ progress: 1, isPlaying: false });
      } else {
        const activeChap = getActiveChapterForProgress(journeyData, currentT);
        const chapIdx = Math.max(0, activeChap.nomor - 1);
        setJourneyPlayback({
          progress: currentT,
          chapterIndex: chapIdx,
        });
      }
      progressRef.current = currentT;
    }

    const activeChapter = getActiveChapterForProgress(journeyData, currentT);
    if (
      useSceneStore.getState().selectedStructureId !== activeChapter.structureId
    ) {
      selectStructure(activeChapter.structureId);
      markStructureExplored(activeChapter.structureId);
    }

    // 1. Update Lead Red Blood Cell (Eritrosit Utama)
    curve.getPointAt(currentT, tempPos);
    curve.getTangentAt(currentT, tempTangent);

    if (leadGroupRef.current) {
      leadGroupRef.current.position.copy(tempPos);
      const lookAtPoint = tempPos.clone().add(tempTangent);
      leadGroupRef.current.lookAt(lookAtPoint);
      if (!kurangiGerakan) {
        leadGroupRef.current.rotateZ(state.clock.elapsedTime * 1.8);
      }
    }

    if (leadMeshRef.current) {
      const mat = leadMeshRef.current.material as MeshPhysicalMaterial;
      computeBloodColorAtProgress(currentT, tempColor);
      mat.color.copy(tempColor);
      mat.emissive.copy(tempColor);
      mat.emissiveIntensity = 0.55;
    }

    // 2. Update Companion Erythrocytes along the CatmullRomCurve3 rail
    const inst = companionInstancedRef.current;
    if (inst) {
      const baseFlowOffset = kurangiGerakan
        ? 0
        : (state.clock.elapsedTime * 0.055 * speed) % 1;
      for (let i = 0; i < COMPANION_COUNT; i++) {
        const u = (i / COMPANION_COUNT + baseFlowOffset) % 1;
        curve.getPointAt(u, dummyObj.position);
        curve.getTangentAt(u, tempTangent);
        // Subtle radial offset inside the vessel lumen
        const angle = i * 2.39996;
        const radial = 0.0024 * ((i % 3) * 0.45);
        dummyObj.position.x += Math.cos(angle) * radial;
        dummyObj.position.y += Math.sin(angle) * radial;
        dummyObj.lookAt(dummyObj.position.clone().add(tempTangent));
        dummyObj.scale.setScalar(0.62);
        dummyObj.updateMatrix();
        inst.setMatrixAt(i, dummyObj.matrix);

        computeBloodColorAtProgress(u, tempColor);
        inst.setColorAt(i, tempColor);
      }
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    }

    // 3. Update Schematic Alveolar O2 & CO2 Gas Diffusion Particles (Chapter 5 focus)
    const alveolusCenter = new Vector3(-0.098, 1.298, 0.008);
    const time = state.clock.elapsedTime;
    if (o2InstancedRef.current && co2InstancedRef.current) {
      for (let i = 0; i < GAS_PARTICLE_COUNT; i++) {
        const phase = ((time * 0.75 + i / GAS_PARTICLE_COUNT) % 1);
        const theta = (i / GAS_PARTICLE_COUNT) * Math.PI * 2;
        const phi = ((i % 5) - 2) * 0.35;

        // O2 diffuses inward from alveolar sac into the capillary (radius 0.026 -> 0.004)
        const rIn = 0.026 * (1 - phase) + 0.004;
        dummyObj.position.set(
          alveolusCenter.x + Math.cos(theta) * Math.cos(phi) * rIn,
          alveolusCenter.y + Math.sin(phi) * rIn,
          alveolusCenter.z + Math.sin(theta) * Math.cos(phi) * rIn,
        );
        dummyObj.scale.setScalar(1);
        dummyObj.updateMatrix();
        o2InstancedRef.current.setMatrixAt(i, dummyObj.matrix);

        // CO2 diffuses outward from capillary into alveolar sac (radius 0.004 -> 0.026)
        const rOut = 0.004 + 0.024 * phase;
        dummyObj.position.set(
          alveolusCenter.x + Math.cos(theta + 0.4) * Math.cos(phi) * rOut,
          alveolusCenter.y + Math.sin(phi) * rOut,
          alveolusCenter.z + Math.sin(theta + 0.4) * Math.cos(phi) * rOut,
        );
        dummyObj.updateMatrix();
        co2InstancedRef.current.setMatrixAt(i, dummyObj.matrix);
      }
      o2InstancedRef.current.instanceMatrix.needsUpdate = true;
      co2InstancedRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Update Cinematic Chase Camera along the CatmullRomCurve3 spline
    if (followCamera) {
      // Position camera at an intimate anterior-superior vantage tracking the lead erythrocyte
      const desiredTarget = tempPos
        .clone()
        .addScaledVector(tempTangent, 0.015);
      const isAlveolarChapter = currentT >= 0.62 && currentT <= 0.84;
      const camDistance = isAlveolarChapter ? 0.145 : 0.185;
      const sideOffset = currentT < 0.48 ? -0.025 : currentT < 0.84 ? -0.045 : 0.035;

      const desiredPos = new Vector3(
        tempPos.x + sideOffset,
        tempPos.y + 0.032,
        tempPos.z + camDistance,
      );

      const lerpFactor = kurangiGerakan ? 1.0 : Math.min(1, delta * 5.5);
      smoothCamPos.lerp(desiredPos, lerpFactor);
      smoothCamTarget.lerp(desiredTarget, lerpFactor);

      setLiveJourneyCameraPose(
        true,
        [smoothCamPos.x, smoothCamPos.y, smoothCamPos.z],
        [smoothCamTarget.x, smoothCamTarget.y, smoothCamTarget.z],
      );
    } else {
      setLiveJourneyCameraPose(false);
    }
  });

  if (!journeyData || !curve || !tubeGeometry) return null;

  const activeChapter = getActiveChapterForProgress(journeyData, progress);
  const leadPosition = curve.getPointAt(Math.max(0, Math.min(1, progress)));

  return (
    <group name="ITHB_CinematicJourneyStage">
      {/* Translucent Vascular Spline Tube & Core Guide Line */}
      <mesh geometry={tubeGeometry}>
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.25}
          transparent
          opacity={0.26}
          roughness={0.3}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {railPoints.length > 1 && (
        <Line
          points={railPoints}
          color="#22d3ee"
          lineWidth={1.5}
          transparent
          opacity={0.62}
        />
      )}

      {/* Lead Red Blood Cell (Eritrosit Utama) */}
      <group ref={leadGroupRef}>
        <mesh ref={leadMeshRef} geometry={rbcGeometry}>
          <meshPhysicalMaterial
            color="#3b82f6"
            roughness={0.28}
            metalness={0.08}
            clearcoat={0.6}
          />
        </mesh>
        <pointLight color="#38bdf8" intensity={0.45} distance={0.14} />
      </group>

      {/* Floating 3D Badge for the Lead Red Blood Cell */}
      {tampilkanLabel3D && (
        <Html
          position={[leadPosition.x, leadPosition.y + 0.018, leadPosition.z]}
          center
          distanceFactor={0.95}
          style={{ pointerEvents: 'none', zIndex: 6 }}
        >
          <div
            style={{
              background: 'rgba(6, 12, 24, 0.92)',
              border: `1px solid ${
                activeChapter.statusDarah === 'oksigenasi'
                  ? '#ef4444'
                  : activeChapter.statusDarah === 'transisi-alveolus'
                    ? '#a855f7'
                    : '#3b82f6'
              }`,
              color: '#edf4ff',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.75)',
            }}
          >
            Eritrosit ({activeChapter.kadarO2Persen}% O₂) • Bab{' '}
            {activeChapter.nomor}
          </div>
        </Html>
      )}

      {/* Companion Bloodstream Erythrocytes */}
      <instancedMesh
        ref={companionInstancedRef}
        args={[rbcGeometry, undefined, COMPANION_COUNT]}
      >
        <meshStandardMaterial roughness={0.35} metalness={0.05} />
      </instancedMesh>

      {/* Schematic Alveolar Capillary Gas-Exchange Micro-Stage in Right Lung */}
      <group position={[-0.098, 1.298, 0.008]}>
        <mesh>
          <sphereGeometry args={[0.025, 24, 24]} />
          <meshPhysicalMaterial
            color="#22d3ee"
            emissive="#06b6d4"
            emissiveIntensity={0.22}
            transparent
            opacity={0.18}
            roughness={0.25}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* O2 Molecules (Cyan) Diffusing Inward */}
      <instancedMesh
        ref={o2InstancedRef}
        args={[gasSphereGeometry, undefined, GAS_PARTICLE_COUNT]}
      >
        <meshBasicMaterial color="#22d3ee" />
      </instancedMesh>

      {/* CO2 Molecules (Amber) Diffusing Outward */}
      <instancedMesh
        ref={co2InstancedRef}
        args={[gasSphereGeometry, undefined, GAS_PARTICLE_COUNT]}
      >
        <meshBasicMaterial color="#f59e0b" />
      </instancedMesh>
    </group>
  );
}
