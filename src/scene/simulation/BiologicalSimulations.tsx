import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
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
  Vector3,
} from 'three';
import {
  deformStructureAroundCentroid,
  resetAllStructureDeformations,
} from '@/scene/body/glbLoader';
import { useSimulationStore } from '@/stores/simulationStore';
import { useSceneStore } from '@/stores/sceneStore';
import { useSettingsStore } from '@/stores/settingsStore';

const MAX_BLOOD_PARTICLES = 150;
const AIRFLOW_PARTICLE_COUNT = 32;

const VENOUS_BLUE = new Color('#3b82f6');
const ARTERIAL_RED = new Color('#ef4444');
const CAPILLARY_PURPLE = new Color('#a855f7');
const O2_CYAN = new Color('#2dd4bf');
const CO2_AMBER = new Color('#f59e0b');

// 3D Conduction Pathway Coordinates in Z-Anatomy Heart Space
const SA_NODE_POS: [number, number, number] = [-0.032, 1.308, 0.026];
const AV_NODE_POS: [number, number, number] = [-0.004, 1.286, 0.034];
const HIS_BUNDLE_POS: [number, number, number] = [0.008, 1.278, 0.042];
const PURKINJE_R_APEX: [number, number, number] = [0.004, 1.252, 0.056];
const PURKINJE_R_WALL: [number, number, number] = [-0.016, 1.268, 0.052];
const PURKINJE_L_APEX: [number, number, number] = [0.044, 1.254, 0.042];
const PURKINJE_L_WALL: [number, number, number] = [0.052, 1.276, 0.026];

const CONDUCTION_MAIN_PATH: [number, number, number][] = [
  SA_NODE_POS,
  [-0.018, 1.298, 0.03],
  AV_NODE_POS,
  HIS_BUNDLE_POS,
];

const CONDUCTION_RIGHT_BRANCH: [number, number, number][] = [
  HIS_BUNDLE_POS,
  PURKINJE_R_APEX,
  PURKINJE_R_WALL,
];

const CONDUCTION_LEFT_BRANCH: [number, number, number][] = [
  HIS_BUNDLE_POS,
  PURKINJE_L_APEX,
  PURKINJE_L_WALL,
];

/**
 * Lightweight 3D Biological Process Simulations Engine for /simulasi.
 * Animates only the isolated target organ system without stray floating labels,
 * redundant wireframe guide lines, or full-body skeletal deformation overhead.
 */
export function BiologicalSimulations() {
  const simulationViewActive = useSimulationStore((s) => s.simulationViewActive);
  const activeModule = useSimulationStore((s) => s.activeModule);
  const isPlaying = useSimulationStore((s) => s.isPlaying);

  const heartRateBPM = useSimulationStore((s) => s.heartRateBPM);
  const showConductionSystem = useSimulationStore(
    (s) => s.showConductionSystem,
  );

  const respirationAutoCycle = useSimulationStore(
    (s) => s.respirationAutoCycle,
  );
  const breathingRateRPM = useSimulationStore((s) => s.breathingRateRPM);
  const breathingMechanic = useSimulationStore((s) => s.breathingMechanic);
  const manualBreathPhase = useSimulationStore((s) => s.manualBreathPhase);
  const showAirflowParticles = useSimulationStore(
    (s) => s.showAirflowParticles,
  );

  const flowSpeedMultiplier = useSimulationStore((s) => s.flowSpeedMultiplier);
  const particleCount = useSimulationStore((s) => s.particleCount);
  const circulationFilter = useSimulationStore((s) => s.circulationFilter);

  const isolatedOrganId = useSceneStore((s) => s.isolatedOrganId);
  const kurangiGerakan = useSettingsStore((s) => s.kurangiGerakan);

  const saMeshRef = useRef<Mesh | null>(null);
  const avMeshRef = useRef<Mesh | null>(null);
  const purkinjeSparkRef = useRef<Mesh | null>(null);
  const diaphragmGroupRef = useRef<Group | null>(null);
  const airflowInstancedRef = useRef<InstancedMesh | null>(null);
  const bloodInstancedRef = useRef<InstancedMesh | null>(null);

  const simClockRef = useRef<number>(0);
  const dummyObj = useMemo(() => new Object3D(), []);
  const tempColor = useMemo(() => new Color(), []);

  const rbcGeometry = useMemo(() => {
    const g = new CylinderGeometry(0.0046, 0.0046, 0.0018, 12);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);

  const airSphereGeometry = useMemo(
    () => new SphereGeometry(0.0028, 8, 8),
    [],
  );

  // Vascular curves concentrated within Heart & Thoracic Lungs so blood cells stay neatly inside visible organs
  const pulmonaryCurveRight = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-0.032, 1.38, 0.012), // Superior Vena Cava
        new Vector3(-0.028, 1.32, 0.022), // Right Atrium entry
        new Vector3(-0.024, 1.292, 0.028),// Right Atrium
        new Vector3(0.005, 1.258, 0.052), // Right Ventricle
        new Vector3(0.012, 1.308, 0.036), // Pulmonary Trunk
        new Vector3(-0.035, 1.33, 0.012), // Right Pulmonary Artery
        new Vector3(-0.085, 1.312, 0.015),// Right Lung Capillary
        new Vector3(-0.05, 1.292, 0.004), // Right Pulmonary Vein
        new Vector3(0.026, 1.296, -0.006),// Left Atrium
      ]),
    [],
  );

  const pulmonaryCurveLeft = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-0.024, 1.292, 0.028),// Right Atrium
        new Vector3(0.005, 1.258, 0.052), // Right Ventricle
        new Vector3(0.012, 1.308, 0.036), // Pulmonary Trunk
        new Vector3(0.042, 1.33, 0.012),  // Left Pulmonary Artery
        new Vector3(0.086, 1.312, 0.014), // Left Lung Capillary
        new Vector3(0.052, 1.294, 0.002), // Left Pulmonary Vein
        new Vector3(0.028, 1.296, -0.006),// Left Atrium
      ]),
    [],
  );

  const systemicCurve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(0.028, 1.296, -0.006),// Left Atrium
        new Vector3(0.044, 1.258, 0.036), // Left Ventricle
        new Vector3(0.018, 1.305, 0.026), // Ascending Aorta
        new Vector3(0.006, 1.352, 0.014), // Aortic Arch
        new Vector3(-0.004, 1.318, -0.01),// Arch Return
        new Vector3(-0.022, 1.275, 0.008),// Venous entry
        new Vector3(-0.024, 1.295, 0.024),// Right Atrium
      ]),
    [],
  );

  // Airflow curves (Larynx -> Trachea -> Bronchi -> Lungs)
  const airwayRightCurve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(0, 1.47, 0.018),      // Larynx
        new Vector3(0, 1.4, 0.014),       // Mid Trachea
        new Vector3(0, 1.345, 0.008),     // Carina
        new Vector3(-0.045, 1.32, 0.008), // Right Main Bronchus
        new Vector3(-0.085, 1.29, 0.012), // Right Lung Bronchioles
      ]),
    [],
  );

  const airwayLeftCurve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(0, 1.47, 0.018),      // Larynx
        new Vector3(0, 1.4, 0.014),       // Mid Trachea
        new Vector3(0, 1.345, 0.008),     // Carina
        new Vector3(0.048, 1.318, 0.008), // Left Main Bronchus
        new Vector3(0.085, 1.288, 0.012), // Left Lung Bronchioles
      ]),
    [],
  );

  useEffect(() => {
    return () => {
      resetAllStructureDeformations();
    };
  }, [simulationViewActive, activeModule]);

  useEffect(() => {
    return () => {
      rbcGeometry.dispose();
      airSphereGeometry.dispose();
    };
  }, [rbcGeometry, airSphereGeometry]);

  useFrame((_, delta) => {
    if (!simulationViewActive || isolatedOrganId !== null) return;

    if (isPlaying) {
      simClockRef.current += delta * (kurangiGerakan ? 0.55 : 1);
    }
    const elapsed = simClockRef.current;
    const motionAmp = kurangiGerakan ? 0.42 : 1;

    // A. DETAK JANTUNG & ALIRAN DARAH: Cardiac Cycle Deformation
    if (activeModule === 'detak-jantung' || activeModule === 'aliran-darah') {
      const freqHz = heartRateBPM / 60;
      const cardiacPhase = (elapsed * freqHz) % 1;

      const atrialPulse =
        (cardiacPhase < 0.18
          ? Math.sin((cardiacPhase / 0.18) * Math.PI)
          : 0) * motionAmp;
      const atrialScale = 1 - 0.09 * atrialPulse;
      deformStructureAroundCentroid('serambi-kanan', [
        atrialScale,
        1 - 0.06 * atrialPulse,
        atrialScale,
      ]);
      deformStructureAroundCentroid('serambi-kiri', [
        atrialScale,
        1 - 0.06 * atrialPulse,
        atrialScale,
      ]);

      const ventPulse =
        (cardiacPhase >= 0.18 && cardiacPhase < 0.52
          ? Math.sin(((cardiacPhase - 0.18) / 0.34) * Math.PI)
          : 0) * motionAmp;
      const ventRadial = 1 - 0.115 * ventPulse;
      const ventAxial = 1 - 0.06 * ventPulse;
      deformStructureAroundCentroid(
        'bilik-kanan',
        [ventRadial, ventAxial, ventRadial],
        [0, 0.002 * ventPulse, 0.002 * ventPulse],
      );
      deformStructureAroundCentroid(
        'bilik-kiri',
        [ventRadial, ventAxial, ventRadial],
        [0, 0.002 * ventPulse, 0.002 * ventPulse],
      );
      deformStructureAroundCentroid('katup-jantung', [
        1 + 0.055 * ventPulse,
        1 - 0.075 * ventPulse,
        1 + 0.055 * ventPulse,
      ]);

      const artPulse =
        (cardiacPhase >= 0.24 && cardiacPhase < 0.64
          ? Math.sin(((cardiacPhase - 0.24) / 0.4) * Math.PI)
          : 0) * motionAmp;
      deformStructureAroundCentroid('aorta', [
        1 + 0.05 * artPulse,
        1,
        1 + 0.05 * artPulse,
      ]);
      deformStructureAroundCentroid('pembuluh-pulmonal', [
        1 + 0.05 * artPulse,
        1,
        1 + 0.05 * artPulse,
      ]);

      if (saMeshRef.current && avMeshRef.current && purkinjeSparkRef.current) {
        const saMat = saMeshRef.current.material as MeshPhysicalMaterial;
        const avMat = avMeshRef.current.material as MeshPhysicalMaterial;
        saMat.emissiveIntensity = cardiacPhase < 0.16 ? 1.4 : 0.25;
        avMat.emissiveIntensity =
          cardiacPhase >= 0.12 && cardiacPhase < 0.26 ? 1.4 : 0.25;

        if (cardiacPhase < 0.46) {
          purkinjeSparkRef.current.visible = true;
          const u = cardiacPhase / 0.46;
          if (u < 0.45) {
            const alpha = u / 0.45;
            purkinjeSparkRef.current.position.set(
              SA_NODE_POS[0] + (AV_NODE_POS[0] - SA_NODE_POS[0]) * alpha,
              SA_NODE_POS[1] + (AV_NODE_POS[1] - SA_NODE_POS[1]) * alpha,
              SA_NODE_POS[2] + (AV_NODE_POS[2] - SA_NODE_POS[2]) * alpha,
            );
          } else {
            const alpha = (u - 0.45) / 0.55;
            purkinjeSparkRef.current.position.set(
              HIS_BUNDLE_POS[0] +
                (PURKINJE_L_APEX[0] - HIS_BUNDLE_POS[0]) * alpha,
              HIS_BUNDLE_POS[1] +
                (PURKINJE_L_APEX[1] - HIS_BUNDLE_POS[1]) * alpha,
              HIS_BUNDLE_POS[2] +
                (PURKINJE_L_APEX[2] - HIS_BUNDLE_POS[2]) * alpha,
            );
          }
        } else {
          purkinjeSparkRef.current.visible = false;
        }
      }
    }

    // B. MEKANISME PERNAPASAN: Isolated Lung Expansion & Diaphragm Dome
    if (activeModule === 'mekanisme-pernapasan') {
      const breathWave =
        (respirationAutoCycle
          ? Math.sin(elapsed * (breathingRateRPM / 60) * Math.PI * 2)
          : manualBreathPhase) * motionAmp;

      const sx = 1 + 0.095 * breathWave;
      const sy = 1 + 0.115 * breathWave;
      const sz = 1 + 0.105 * breathWave;

      deformStructureAroundCentroid(
        'paru-paru-kanan',
        [sx, sy, sz],
        [-0.003 * breathWave, -0.007 * breathWave, 0.004 * breathWave],
      );
      deformStructureAroundCentroid(
        'paru-paru-kiri',
        [sx, sy, sz],
        [0.003 * breathWave, -0.007 * breathWave, 0.004 * breathWave],
      );
      deformStructureAroundCentroid('percabangan-bronkus', [
        1 + 0.04 * breathWave,
        1 + 0.04 * breathWave,
        1 + 0.04 * breathWave,
      ]);

      const diaphragmFactor =
        breathingMechanic === 'pernapasan-dada'
          ? breathWave * 0.28
          : breathingMechanic === 'pernapasan-perut'
            ? breathWave * 1.15
            : breathWave * 0.85;

      if (diaphragmGroupRef.current) {
        diaphragmGroupRef.current.position.set(
          0,
          1.192 - 0.024 * diaphragmFactor,
          0.008,
        );
        diaphragmGroupRef.current.scale.set(
          1 + 0.06 * diaphragmFactor,
          Math.max(0.35, 1 - 0.34 * diaphragmFactor),
          1 + 0.06 * diaphragmFactor,
        );
      }

      const airInst = airflowInstancedRef.current;
      if (airInst && showAirflowParticles) {
        const isInhaling = respirationAutoCycle
          ? Math.cos(elapsed * (breathingRateRPM / 60) * Math.PI * 2) >= 0
          : breathWave >= 0;
        const flowDir = isInhaling ? 1 : -1;
        const speedRate = (breathingRateRPM / 15) * 0.45;

        for (let i = 0; i < AIRFLOW_PARTICLE_COUNT; i++) {
          const curve = i % 2 === 0 ? airwayRightCurve : airwayLeftCurve;
          const rawU =
            (i / AIRFLOW_PARTICLE_COUNT + elapsed * speedRate * flowDir) % 1;
          const u = rawU < 0 ? rawU + 1 : rawU;
          curve.getPointAt(u, dummyObj.position);
          const jitter = ((i % 3) - 1) * 0.0014;
          dummyObj.position.x += jitter;
          dummyObj.position.z += jitter * 0.6;
          dummyObj.scale.setScalar(1);
          dummyObj.updateMatrix();
          airInst.setMatrixAt(i, dummyObj.matrix);
          airInst.setColorAt(i, isInhaling ? O2_CYAN : CO2_AMBER);
        }
        airInst.instanceMatrix.needsUpdate = true;
        if (airInst.instanceColor) airInst.instanceColor.needsUpdate = true;
      }
    }

    // C. ALIRAN DARAH: Clean Instanced Erythrocytes
    if (activeModule === 'aliran-darah' && bloodInstancedRef.current) {
      const inst = bloodInstancedRef.current;
      const heartSpeedFactor = heartRateBPM / 72;
      const advance = elapsed * 0.14 * flowSpeedMultiplier * heartSpeedFactor;
      const activeCount = Math.min(particleCount, MAX_BLOOD_PARTICLES);

      for (let i = 0; i < MAX_BLOOD_PARTICLES; i++) {
        if (i >= activeCount) {
          dummyObj.scale.setScalar(0);
          dummyObj.updateMatrix();
          inst.setMatrixAt(i, dummyObj.matrix);
          continue;
        }

        let loopType: 'pul-r' | 'pul-l' | 'sys';
        if (circulationFilter === 'pulmonal-kecil') {
          loopType = i % 2 === 0 ? 'pul-r' : 'pul-l';
        } else if (circulationFilter === 'sistemik-besar') {
          loopType = 'sys';
        } else {
          const mod = i % 3;
          loopType = mod === 0 ? 'pul-r' : mod === 1 ? 'pul-l' : 'sys';
        }

        const curve =
          loopType === 'pul-r'
            ? pulmonaryCurveRight
            : loopType === 'pul-l'
              ? pulmonaryCurveLeft
              : systemicCurve;

        const u = (i / activeCount + advance) % 1;
        curve.getPointAt(u, dummyObj.position);
        const tangent = curve.getTangentAt(u);

        const radialAngle = i * 2.4;
        const radialOffset = ((i % 3) - 1) * 0.0018;
        dummyObj.position.x += Math.cos(radialAngle) * radialOffset;
        dummyObj.position.z += Math.sin(radialAngle) * radialOffset;
        dummyObj.lookAt(dummyObj.position.clone().add(tangent));
        dummyObj.scale.setScalar(0.85);
        dummyObj.updateMatrix();
        inst.setMatrixAt(i, dummyObj.matrix);

        if (loopType === 'sys') {
          if (u < 0.78) {
            tempColor.copy(ARTERIAL_RED);
          } else {
            tempColor
              .copy(ARTERIAL_RED)
              .lerp(VENOUS_BLUE, (u - 0.78) / 0.22);
          }
        } else {
          if (u < 0.58) {
            tempColor.copy(VENOUS_BLUE);
          } else if (u < 0.74) {
            tempColor
              .copy(VENOUS_BLUE)
              .lerp(CAPILLARY_PURPLE, (u - 0.58) / 0.16);
          } else {
            tempColor
              .copy(CAPILLARY_PURPLE)
              .lerp(ARTERIAL_RED, Math.min(1, (u - 0.74) / 0.14));
          }
        }
        inst.setColorAt(i, tempColor);
      }

      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    }
  });

  if (!simulationViewActive || isolatedOrganId !== null) return null;

  return (
    <group name="ITHB_BiologicalSimulationsStage">
      {/* 1. DETAK JANTUNG: Clean Electrical Conduction Pathway without floating text clutter */}
      {activeModule === 'detak-jantung' && showConductionSystem && (
        <group name="CardiacConductionSystem">
          <Line
            points={CONDUCTION_MAIN_PATH}
            color="#facc15"
            lineWidth={2}
            transparent
            opacity={0.88}
          />
          <Line
            points={CONDUCTION_RIGHT_BRANCH}
            color="#fde047"
            lineWidth={1.6}
            transparent
            opacity={0.82}
          />
          <Line
            points={CONDUCTION_LEFT_BRANCH}
            color="#fde047"
            lineWidth={1.6}
            transparent
            opacity={0.82}
          />

          <mesh ref={saMeshRef} position={SA_NODE_POS}>
            <sphereGeometry args={[0.005, 14, 14]} />
            <meshPhysicalMaterial
              color="#facc15"
              emissive="#facc15"
              emissiveIntensity={0.8}
            />
          </mesh>

          <mesh ref={avMeshRef} position={AV_NODE_POS}>
            <sphereGeometry args={[0.0044, 14, 14]} />
            <meshPhysicalMaterial
              color="#fb923c"
              emissive="#fb923c"
              emissiveIntensity={0.6}
            />
          </mesh>

          <mesh ref={purkinjeSparkRef} position={SA_NODE_POS}>
            <sphereGeometry args={[0.004, 10, 10]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      )}

      {/* 2. MEKANISME PERNAPASAN: Diaphragm Dome & Airway Flow */}
      {activeModule === 'mekanisme-pernapasan' && (
        <group name="RespirationSimulationVisuals">
          <group ref={diaphragmGroupRef} position={[0, 1.192, 0.008]}>
            <mesh scale={[1.15, 0.48, 0.82]}>
              <sphereGeometry
                args={[0.082, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.48]}
              />
              <meshPhysicalMaterial
                color="#be123c"
                emissive="#881337"
                emissiveIntensity={0.2}
                roughness={0.44}
                transparent
                opacity={0.78}
                side={DoubleSide}
              />
            </mesh>
          </group>

          {showAirflowParticles && (
            <instancedMesh
              ref={airflowInstancedRef}
              args={[airSphereGeometry, undefined, AIRFLOW_PARTICLE_COUNT]}
            >
              <meshBasicMaterial />
            </instancedMesh>
          )}
        </group>
      )}

      {/* 3. ALIRAN DARAH: Clean Erythrocytes without messy guide line clutter */}
      {activeModule === 'aliran-darah' && (
        <group name="BloodFlowSimulationVisuals">
          <instancedMesh
            ref={bloodInstancedRef}
            args={[rbcGeometry, undefined, MAX_BLOOD_PARTICLES]}
          >
            <meshStandardMaterial roughness={0.32} metalness={0.08} />
          </instancedMesh>
        </group>
      )}
    </group>
  );
}
