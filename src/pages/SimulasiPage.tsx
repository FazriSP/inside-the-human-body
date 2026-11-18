import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CameraBookmark } from '@/content/schema/anatomy.schema';
import {
  useSimulationStore,
  type CirculationFilterMode,
  type RespirationMechanicMode,
  type SimulationModuleId,
} from '@/stores/simulationStore';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useLearningStore } from '@/stores/learningStore';

const MODULE_CAMERA_BOOKMARKS: Record<SimulationModuleId, CameraBookmark> = {
  'detak-jantung': {
    position: [0.015, 1.29, 0.42],
    target: [0.01, 1.285, 0.015],
  },
  'mekanisme-pernapasan': {
    position: [0, 1.31, 0.64],
    target: [0, 1.3, 0.01],
  },
  'aliran-darah': {
    position: [0, 1.3, 0.6],
    target: [0, 1.29, 0.01],
  },
};

interface MissionStateSnapshot {
  heartRateBPM: number;
  strokeVolumeMl: number;
  respirationAutoCycle: boolean;
  breathingRateRPM: number;
  breathingMechanic: RespirationMechanicMode;
  circulationFilter: CirculationFilterMode;
  particleCount: number;
  flowSpeedMultiplier: number;
}

interface MedicalMission {
  id: string;
  nomor: number;
  judul: string;
  kasusSingkat: string;
  moduleId: SimulationModuleId;
  applyInitialEmergency: () => void;
  checks: {
    label: string;
    isMet: (s: MissionStateSnapshot) => boolean;
  }[];
  faktaMedis: string;
}

const MEDICAL_MISSIONS: MedicalMission[] = [
  {
    id: 'misi-1-bradikardia',
    nomor: 1,
    judul: 'Pulihkan Detak Jantung Lemah',
    kasusSingkat:
      'Pasien pusing karena detak jantung terlalu lambat (46 BPM). Kembalikan pompa jantung ke zona istirahat normal.',
    moduleId: 'detak-jantung',
    applyInitialEmergency: () => {
      const sim = useSimulationStore.getState();
      sim.setActiveModule('detak-jantung');
      sim.setIsPlaying(true);
      sim.setHeartRateBPM(46);
      sim.setStrokeVolumeMl(55);
      sim.setShowConductionSystem(true);
    },
    checks: [
      {
        label: 'Detak jantung normal (70–90 BPM)',
        isMet: (s) => s.heartRateBPM >= 70 && s.heartRateBPM <= 90,
      },
      {
        label: 'Volume sekuncup optimal (70–85 mL)',
        isMet: (s) => s.strokeVolumeMl >= 70 && s.strokeVolumeMl <= 85,
      },
    ],
    faktaMedis:
      'Jantung orang dewasa sehat saat santai memompa sekitar 5 liter darah setiap menit (72 BPM × 70 mL).',
  },
  {
    id: 'misi-2-diafragma',
    nomor: 2,
    judul: 'Bantuan Napas Diafragma',
    kasusSingkat:
      'Pasien panik bernapas cepat dan dangkal. Aktifkan napas perut otomatis agar paru kembali rileks.',
    moduleId: 'mekanisme-pernapasan',
    applyInitialEmergency: () => {
      const sim = useSimulationStore.getState();
      sim.setActiveModule('mekanisme-pernapasan');
      sim.setIsPlaying(true);
      sim.setBreathingMechanic('pernapasan-dada');
      sim.setBreathingRateRPM(28);
      sim.setRespirationAutoCycle(true);
      sim.setShowAirflowParticles(true);
    },
    checks: [
      {
        label: 'Mode Siklus Otomatis aktif',
        isMet: (s) => s.respirationAutoCycle,
      },
      {
        label: 'Pilih Pernapasan Perut (Diafragma)',
        isMet: (s) => s.breathingMechanic === 'pernapasan-perut',
      },
      {
        label: 'Laju napas tenang (14–18 napas/mnt)',
        isMet: (s) => s.breathingRateRPM >= 14 && s.breathingRateRPM <= 18,
      },
    ],
    faktaMedis:
      'Saat diafragma berkontraksi turun, rongga dada membesar maksimal sehingga udara segar masuk lebih hemat energi.',
  },
  {
    id: 'misi-3-oksigen',
    nomor: 3,
    judul: 'Distribusi Oksigen Darurat',
    kasusSingkat:
      'Suplai oksigen jaringan menurun! Aktifkan jalur sirkulasi ganda dan tingkatkan aliran sel darah merah.',
    moduleId: 'aliran-darah',
    applyInitialEmergency: () => {
      const sim = useSimulationStore.getState();
      sim.setActiveModule('aliran-darah');
      sim.setIsPlaying(true);
      sim.setCirculationFilter('pulmonal-kecil');
      sim.setParticleCount(60);
      sim.setFlowSpeedMultiplier(0.5);
    },
    checks: [
      {
        label: 'Jalur: Sirkulasi Ganda Lengkap',
        isMet: (s) => s.circulationFilter === 'ganda-lengkap',
      },
      {
        label: 'Kepadatan sel darah minimal 135',
        isMet: (s) => s.particleCount >= 135,
      },
      {
        label: 'Kecepatan aliran 1.25x – 1.75x',
        isMet: (s) =>
          s.flowSpeedMultiplier >= 1.25 && s.flowSpeedMultiplier <= 1.75,
      },
    ],
    faktaMedis:
      'Sirkulasi ganda menggabungkan rute paru-paru untuk mengambil O₂ dan rute sistemik untuk mengirimnya ke seluruh tubuh.',
  },
  {
    id: 'misi-4-atlet',
    nomor: 4,
    judul: 'Pacu Jantung Atlet Lari',
    kasusSingkat:
      'Seorang pelari memulai sprint! Naikkan curah jantung di atas 12.0 L/mnt agar otot tidak kekurangan oksigen.',
    moduleId: 'detak-jantung',
    applyInitialEmergency: () => {
      const sim = useSimulationStore.getState();
      sim.setActiveModule('detak-jantung');
      sim.setIsPlaying(true);
      sim.setHeartRateBPM(72);
      sim.setStrokeVolumeMl(65);
      sim.setShowConductionSystem(true);
    },
    checks: [
      {
        label: 'Detak jantung sprint (130–160 BPM)',
        isMet: (s) => s.heartRateBPM >= 130 && s.heartRateBPM <= 160,
      },
      {
        label: 'Volume sekuncup tinggi (≥ 90 mL)',
        isMet: (s) => s.strokeVolumeMl >= 90,
      },
    ],
    faktaMedis:
      'Saat olahraga berat, jantung atlet mampu memompa lebih dari 12–20 liter darah per menit untuk menyuplai energi otot.',
  },
];

export function SimulasiPage() {
  const navigate = useNavigate();
  const [playMode, setPlayMode] = useState<'misi' | 'bebas'>('misi');
  const [activeMissionIdx, setActiveMissionIdx] = useState<number>(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [justStabilizedId, setJustStabilizedId] = useState<string | null>(null);

  const activeModule = useSimulationStore((s) => s.activeModule);
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const heartRateBPM = useSimulationStore((s) => s.heartRateBPM);
  const strokeVolumeMl = useSimulationStore((s) => s.strokeVolumeMl);
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

  const setSimulationViewActive = useSimulationStore(
    (s) => s.setSimulationViewActive,
  );
  const setActiveModule = useSimulationStore((s) => s.setActiveModule);
  const setIsPlaying = useSimulationStore((s) => s.setIsPlaying);
  const setHeartRateBPM = useSimulationStore((s) => s.setHeartRateBPM);
  const setStrokeVolumeMl = useSimulationStore((s) => s.setStrokeVolumeMl);
  const setShowConductionSystem = useSimulationStore(
    (s) => s.setShowConductionSystem,
  );
  const setRespirationAutoCycle = useSimulationStore(
    (s) => s.setRespirationAutoCycle,
  );
  const setBreathingRateRPM = useSimulationStore((s) => s.setBreathingRateRPM);
  const setBreathingMechanic = useSimulationStore(
    (s) => s.setBreathingMechanic,
  );
  const setManualBreathPhase = useSimulationStore(
    (s) => s.setManualBreathPhase,
  );
  const setShowAirflowParticles = useSimulationStore(
    (s) => s.setShowAirflowParticles,
  );
  const setFlowSpeedMultiplier = useSimulationStore(
    (s) => s.setFlowSpeedMultiplier,
  );
  const setParticleCount = useSimulationStore((s) => s.setParticleCount);
  const setCirculationFilter = useSimulationStore(
    (s) => s.setCirculationFilter,
  );
  const resetSimulationDefaults = useSimulationStore(
    (s) => s.resetSimulationDefaults,
  );

  const setXrayMode = useSceneStore((s) => s.setXrayMode);
  const setLayerVisible = useSceneStore((s) => s.setLayerVisible);
  const setLayerOpacity = useSceneStore((s) => s.setLayerOpacity);
  const selectStructure = useSceneStore((s) => s.selectStructure);
  const hoverStructure = useSceneStore((s) => s.hoverStructure);

  const flyTo = useCameraStore((s) => s.flyTo);
  const setAutoRotate = useCameraStore((s) => s.setAutoRotate);
  const recordQuizSession = useLearningStore((s) => s.recordQuizSession);

  // Activate isolated 3D mini-game engine on mount & restore default layers on unmount
  useEffect(() => {
    setAutoRotate(false);
    selectStructure(null);
    hoverStructure(null, null);
    setSimulationViewActive(true);
    return () => {
      setSimulationViewActive(false);
      setLayerVisible('rangka', true);
      setLayerVisible('peredaran-darah', true);
      setLayerVisible('pernapasan', true);
      setLayerOpacity('rangka', 1.0);
      setLayerOpacity('peredaran-darah', 1.0);
      setLayerOpacity('pernapasan', 1.0);
      setXrayMode(false);
    };
  }, [
    hoverStructure,
    selectStructure,
    setAutoRotate,
    setLayerOpacity,
    setLayerVisible,
    setSimulationViewActive,
    setXrayMode,
  ]);

  const activeMission =
    MEDICAL_MISSIONS[activeMissionIdx] ?? MEDICAL_MISSIONS[0];

  useEffect(() => {
    if (playMode !== 'misi') return;
    setJustStabilizedId(null);
    activeMission.applyInitialEmergency();
  }, [playMode, activeMissionIdx, activeMission]);

  // Strict Context-Aware Isolation: hide unrelated skeleton & peripheral layers per active module
  useEffect(() => {
    setLayerVisible('kulit', false);
    setLayerVisible('rangka', false);

    if (activeModule === 'detak-jantung') {
      setLayerVisible('peredaran-darah', true);
      setLayerVisible('pernapasan', false);
      setLayerOpacity('peredaran-darah', 1.0);
      setXrayMode(false);
    } else if (activeModule === 'mekanisme-pernapasan') {
      setLayerVisible('peredaran-darah', false);
      setLayerVisible('pernapasan', true);
      setLayerOpacity('pernapasan', 1.0);
      setXrayMode(false);
    } else {
      setLayerVisible('peredaran-darah', true);
      setLayerVisible('pernapasan', true);
      setLayerOpacity('peredaran-darah', 0.88);
      setLayerOpacity('pernapasan', 0.38);
      setXrayMode(false);
    }

    flyTo(MODULE_CAMERA_BOOKMARKS[activeModule], 'orbit');
  }, [activeModule, flyTo, setLayerOpacity, setLayerVisible, setXrayMode]);

  const snapshot: MissionStateSnapshot = {
    heartRateBPM,
    strokeVolumeMl,
    respirationAutoCycle,
    breathingRateRPM,
    breathingMechanic,
    circulationFilter,
    particleCount,
    flowSpeedMultiplier,
  };

  const checkResults = activeMission.checks.map((c) => ({
    label: c.label,
    met: c.isMet(snapshot),
  }));
  const allChecksMet = checkResults.every((r) => r.met);
  const isMissionCompleted = completedMissions.includes(activeMission.id);
  const missionScore = completedMissions.length * 250;

  const cardiacOutputLMin = ((heartRateBPM * strokeVolumeMl) / 1000).toFixed(2);
  const manualBreathPct = Math.round(manualBreathPhase * 100);
  const minuteVentilationLMin = ((breathingRateRPM * 500) / 1000).toFixed(1);

  const handleCompleteMission = () => {
    if (!allChecksMet) return;
    setJustStabilizedId(activeMission.id);
    if (!isMissionCompleted) {
      const nextCompleted = [...completedMissions, activeMission.id];
      setCompletedMissions(nextCompleted);
      recordQuizSession({
        quizId: 'misi-medis-3d',
        scorePercent: Math.round(
          (nextCompleted.length / MEDICAL_MISSIONS.length) * 100,
        ),
        maxStreak: nextCompleted.length,
        point3DCorrectCount: 0,
      });
    }
  };

  return (
    <div className="hud-split-layout">
      {/* LEFT HUD COLUMN: Mode Selector, Mission List & Live Organ Sliders */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Panel Kontrol Misi Medis 3D"
      >
        <section className="glass-panel section-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span className="badge badge-cyan">Misi Medis 3D</span>
            <strong style={{ fontSize: 13, color: 'var(--accent-light)' }}>
              {missionScore} Poin
            </strong>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className={
                playMode === 'misi' ? 'btn btn-primary btn-sm' : 'btn btn-sm'
              }
              style={{ flex: 1 }}
              onClick={() => setPlayMode('misi')}
            >
              Mode Misi ({completedMissions.length}/{MEDICAL_MISSIONS.length})
            </button>
            <button
              type="button"
              className={
                playMode === 'bebas' ? 'btn btn-primary btn-sm' : 'btn btn-sm'
              }
              style={{ flex: 1 }}
              onClick={() => {
                setPlayMode('bebas');
                resetSimulationDefaults();
              }}
            >
              Eksperimen Bebas
            </button>
          </div>

          {playMode === 'misi' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {MEDICAL_MISSIONS.map((m, idx) => {
                const isSelected = idx === activeMissionIdx;
                const isDone = completedMissions.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={
                      isSelected ? 'btn btn-primary btn-sm' : 'btn btn-sm'
                    }
                    style={{
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      borderLeft: `3px solid ${
                        isDone ? '#34d399' : 'var(--accent-primary)'
                      }`,
                    }}
                    onClick={() => setActiveMissionIdx(idx)}
                  >
                    <span style={{ fontWeight: 600 }}>
                      Misi {m.nomor}: {m.judul}
                    </span>
                    <span style={{ fontSize: 12 }}>
                      {isDone ? '✓' : '○'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                type="button"
                className={
                  activeModule === 'detak-jantung'
                    ? 'btn btn-primary btn-sm'
                    : 'btn btn-sm'
                }
                style={{ justifyContent: 'space-between', textAlign: 'left' }}
                onClick={() => setActiveModule('detak-jantung')}
              >
                <span>Detak Jantung</span>
                <span>{heartRateBPM} BPM</span>
              </button>
              <button
                type="button"
                className={
                  activeModule === 'mekanisme-pernapasan'
                    ? 'btn btn-primary btn-sm'
                    : 'btn btn-sm'
                }
                style={{ justifyContent: 'space-between', textAlign: 'left' }}
                onClick={() => setActiveModule('mekanisme-pernapasan')}
              >
                <span>Mekanisme Pernapasan</span>
                <span>{breathingRateRPM} RPM</span>
              </button>
              <button
                type="button"
                className={
                  activeModule === 'aliran-darah'
                    ? 'btn btn-primary btn-sm'
                    : 'btn btn-sm'
                }
                style={{ justifyContent: 'space-between', textAlign: 'left' }}
                onClick={() => setActiveModule('aliran-darah')}
              >
                <span>Aliran Darah Ganda</span>
                <span>{particleCount} Sel</span>
              </button>
            </div>
          )}
        </section>

        {/* Parameter Sliders for the Active 3D Organ Module */}
        <section className="glass-panel section-card">
          {activeModule === 'detak-jantung' && (
            <>
              <h2 style={{ fontSize: 15 }}>Kendali Jantung 3D</h2>

              <div className="layer-control-row">
                <div className="layer-control-header">
                  <span>Detak Jantung</span>
                  <strong style={{ color: 'var(--accent-light)' }}>
                    {heartRateBPM} BPM
                  </strong>
                </div>
                <input
                  type="range"
                  className="opacity-slider"
                  aria-label="Frekuensi Detak Jantung BPM"
                  min={40}
                  max={180}
                  step={2}
                  value={heartRateBPM}
                  onChange={(e) => setHeartRateBPM(Number(e.target.value))}
                />
                <div className="chip-row" style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className={
                      heartRateBPM === 72 ? 'chip-btn active' : 'chip-btn'
                    }
                    onClick={() => setHeartRateBPM(72)}
                  >
                    Santai (72)
                  </button>
                  <button
                    type="button"
                    className={
                      heartRateBPM === 140 ? 'chip-btn active' : 'chip-btn'
                    }
                    onClick={() => setHeartRateBPM(140)}
                  >
                    Lari (140)
                  </button>
                </div>
              </div>

              <div className="layer-control-row">
                <div className="layer-control-header">
                  <span>Volume Sekuncup</span>
                  <strong style={{ color: 'var(--accent-light)' }}>
                    {strokeVolumeMl} mL
                  </strong>
                </div>
                <input
                  type="range"
                  className="opacity-slider"
                  aria-label="Volume Sekuncup mL"
                  min={50}
                  max={110}
                  step={5}
                  value={strokeVolumeMl}
                  onChange={(e) => setStrokeVolumeMl(Number(e.target.value))}
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={showConductionSystem}
                  onChange={(e) => setShowConductionSystem(e.target.checked)}
                />
                <span>Tampilkan sinyal listrik jantung</span>
              </label>
            </>
          )}

          {activeModule === 'mekanisme-pernapasan' && (
            <>
              <h2 style={{ fontSize: 15 }}>Kendali Paru &amp; Diafragma</h2>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={
                    respirationAutoCycle
                      ? 'btn btn-primary btn-sm'
                      : 'btn btn-sm'
                  }
                  style={{ flex: 1 }}
                  onClick={() => setRespirationAutoCycle(true)}
                >
                  Otomatis
                </button>
                <button
                  type="button"
                  className={
                    !respirationAutoCycle
                      ? 'btn btn-primary btn-sm'
                      : 'btn btn-sm'
                  }
                  style={{ flex: 1 }}
                  onClick={() => setRespirationAutoCycle(false)}
                >
                  Manual
                </button>
              </div>

              {!respirationAutoCycle && (
                <div className="layer-control-row">
                  <div className="layer-control-header">
                    <span>Tarik / Embus Manual</span>
                    <strong style={{ color: 'var(--accent-light)' }}>
                      {manualBreathPct > 0
                        ? `Tarik +${manualBreathPct}%`
                        : `${manualBreathPct}%`}
                    </strong>
                  </div>
                  <input
                    type="range"
                    className="opacity-slider"
                    aria-label="Penggeser Napas Manual"
                    min={-100}
                    max={100}
                    step={5}
                    value={manualBreathPct}
                    onChange={(e) =>
                      setManualBreathPhase(Number(e.target.value) / 100)
                    }
                  />
                </div>
              )}

              <div className="layer-control-row">
                <div className="layer-control-header">
                  <span>Laju Pernapasan</span>
                  <strong style={{ color: 'var(--accent-light)' }}>
                    {breathingRateRPM} napas/mnt
                  </strong>
                </div>
                <input
                  type="range"
                  className="opacity-slider"
                  aria-label="Laju Pernapasan per Menit"
                  min={8}
                  max={35}
                  step={1}
                  value={breathingRateRPM}
                  onChange={(e) => {
                    setRespirationAutoCycle(true);
                    setBreathingRateRPM(Number(e.target.value));
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Jenis Pernapasan
                </span>
                <div className="chip-row">
                  {(
                    [
                      ['kombinasi', 'Kombinasi'],
                      ['pernapasan-perut', 'Perut (Diafragma)'],
                      ['pernapasan-dada', 'Dada (Rusuk)'],
                    ] as [RespirationMechanicMode, string][]
                  ).map(([modeKey, label]) => (
                    <button
                      key={modeKey}
                      type="button"
                      className={
                        breathingMechanic === modeKey
                          ? 'chip-btn active'
                          : 'chip-btn'
                      }
                      onClick={() => setBreathingMechanic(modeKey)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={showAirflowParticles}
                  onChange={(e) => setShowAirflowParticles(e.target.checked)}
                />
                <span>Tampilkan partikel aliran udara</span>
              </label>
            </>
          )}

          {activeModule === 'aliran-darah' && (
            <>
              <h2 style={{ fontSize: 15 }}>Kendali Sirkulasi Darah</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Rute Sirkulasi
                </span>
                <div className="chip-row">
                  {(
                    [
                      ['ganda-lengkap', 'Ganda Lengkap'],
                      ['pulmonal-kecil', 'Kecil (Paru)'],
                      ['sistemik-besar', 'Besar (Tubuh)'],
                    ] as [CirculationFilterMode, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={
                        circulationFilter === key
                          ? 'chip-btn active'
                          : 'chip-btn'
                      }
                      onClick={() => setCirculationFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="layer-control-row">
                <div className="layer-control-header">
                  <span>Kecepatan Aliran</span>
                  <strong style={{ color: 'var(--accent-light)' }}>
                    {flowSpeedMultiplier.toFixed(2)}x
                  </strong>
                </div>
                <input
                  type="range"
                  className="opacity-slider"
                  aria-label="Kecepatan Aliran Darah"
                  min={25}
                  max={250}
                  step={25}
                  value={Math.round(flowSpeedMultiplier * 100)}
                  onChange={(e) =>
                    setFlowSpeedMultiplier(Number(e.target.value) / 100)
                  }
                />
              </div>

              <div className="layer-control-row">
                <div className="layer-control-header">
                  <span>Jumlah Sel Darah</span>
                  <strong style={{ color: 'var(--accent-light)' }}>
                    {particleCount} sel
                  </strong>
                </div>
                <input
                  type="range"
                  className="opacity-slider"
                  aria-label="Jumlah Sel Darah"
                  min={30}
                  max={150}
                  step={15}
                  value={Math.min(150, particleCount)}
                  onChange={(e) => setParticleCount(Number(e.target.value))}
                />
              </div>
            </>
          )}
        </section>
      </aside>

      {/* CENTER VIEWPORT HUD: Minimalist Play/Pause & Refocus only */}
      <div className="hud-center-column">
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            className="btn btn-primary btn-sm pointer-auto"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸ Jeda' : '▶ Lanjut'}
          </button>

          <button
            type="button"
            className="btn btn-sm pointer-auto"
            onClick={() =>
              flyTo(MODULE_CAMERA_BOOKMARKS[activeModule], 'orbit')
            }
          >
            Reset Posisi Kamera
          </button>
        </div>
      </div>

      {/* RIGHT HUD COLUMN: Mission Objective Card & Biometric Telemetry */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Target Misi dan Telemetri Pasien"
      >
        <section className="glass-panel-strong section-card">
          {playMode === 'misi' ? (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span className="badge badge-cyan">
                  Misi {activeMission.nomor} dari {MEDICAL_MISSIONS.length}
                </span>
                <span
                  className={
                    allChecksMet ? 'badge badge-anatomis' : 'badge badge-skematis'
                  }
                >
                  {allChecksMet ? 'Target Tercapai' : 'Butuh Penyesuaian'}
                </span>
              </div>

              <div>
                <h1 style={{ fontSize: 18 }}>{activeMission.judul}</h1>
                <p className="muted-text" style={{ marginTop: 4 }}>
                  {activeMission.kasusSingkat}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg-subtle)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <strong style={{ fontSize: 12 }}>Target Pemeriksaan:</strong>
                {checkResults.map((res) => (
                  <div
                    key={res.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12.5,
                      color: res.met ? '#34d399' : 'var(--text-secondary)',
                      fontWeight: res.met ? 600 : 400,
                    }}
                  >
                    <span>{res.met ? '✓' : '○'}</span>
                    <span>{res.label}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                <div className="layer-control-row">
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Curah Jantung
                  </span>
                  <strong style={{ fontSize: 17, color: 'var(--accent-light)' }}>
                    {cardiacOutputLMin} L/mnt
                  </strong>
                </div>
                <div className="layer-control-row">
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Ventilasi Napas
                  </span>
                  <strong style={{ fontSize: 17, color: 'var(--accent-light)' }}>
                    {minuteVentilationLMin} L/mnt
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                disabled={!allChecksMet}
                onClick={handleCompleteMission}
              >
                {isMissionCompleted
                  ? 'Pasien Sudah Stabil ✓'
                  : allChecksMet
                    ? 'Stabilkan Pasien (+250 Poin)'
                    : 'Sesuaikan Pengaturan di Panel Kiri'}
              </button>

              {(justStabilizedId === activeMission.id || isMissionCompleted) && (
                <div
                  role="status"
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(52, 211, 153, 0.14)',
                    border: '1px solid rgba(52, 211, 153, 0.45)',
                    fontSize: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <strong style={{ color: '#34d399' }}>
                    Hebat! Kondisi pasien berhasil distabilkan.
                  </strong>
                  <p className="muted-text" style={{ fontSize: 12 }}>
                    {activeMission.faktaMedis}
                  </p>
                  {activeMissionIdx < MEDICAL_MISSIONS.length - 1 ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveMissionIdx((i) => i + 1)}
                    >
                      Lanjut ke Misi {activeMissionIdx + 2} →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/kuis')}
                    >
                      Tantang Diri di Kuis 3D →
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <span className="badge badge-cyan">Eksperimen Fisiologi 3D</span>
              <h2 style={{ fontSize: 18 }}>
                {activeModule === 'detak-jantung'
                  ? 'Simulasi Siklus Jantung'
                  : activeModule === 'mekanisme-pernapasan'
                    ? 'Simulasi Pernapasan'
                    : 'Simulasi Sirkulasi Ganda'}
              </h2>
              <p className="muted-text">
                {activeModule === 'detak-jantung'
                  ? 'Ubah kecepatan detak dan volume pompa untuk melihat respons serambi dan bilik jantung secara langsung.'
                  : activeModule === 'mekanisme-pernapasan'
                    ? 'Bandingkan gerak diafragma pada napas perut dengan gerak paru-paru dan aliran udara.'
                    : 'Amati sel darah kaya oksigen (merah) dan miskin oksigen (biru) melewati jantung dan paru-paru.'}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                <div className="layer-control-row">
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Curah Jantung
                  </span>
                  <strong style={{ fontSize: 17, color: 'var(--accent-light)' }}>
                    {cardiacOutputLMin} L/mnt
                  </strong>
                </div>
                <div className="layer-control-row">
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Ventilasi Paru
                  </span>
                  <strong style={{ fontSize: 17, color: 'var(--accent-light)' }}>
                    {minuteVentilationLMin} L/mnt
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() =>
                  navigate(
                    activeModule === 'mekanisme-pernapasan'
                      ? '/organ/paru-paru'
                      : '/organ/jantung',
                  )
                }
              >
                Bedah Organ di Sayatan 3D →
              </button>
            </>
          )}
        </section>
      </aside>
    </div>
  );
}
