import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ANATOMICAL_STRUCTURES,
  BODY_SYSTEMS,
  CURRICULUM_MODULES,
} from '@/content/anatomy';
import type { SystemId } from '@/content/schema/anatomy.schema';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useLearningStore } from '@/stores/learningStore';

const TOTAL_SUB_CHAPTERS = CURRICULUM_MODULES.reduce(
  (acc, m) => acc + m.subChapters.length,
  0,
);

export function BerandaPage() {
  const navigate = useNavigate();

  const activeSystemFilter = useSceneStore((s) => s.activeSystemFilter);
  const setSystemFilter = useSceneStore((s) => s.setSystemFilter);
  const selectStructure = useSceneStore((s) => s.selectStructure);
  const xrayMode = useSceneStore((s) => s.xrayMode);
  const setXrayMode = useSceneStore((s) => s.setXrayMode);

  const flyTo = useCameraStore((s) => s.flyTo);
  const resetCamera = useCameraStore((s) => s.resetCamera);
  const setAutoRotate = useCameraStore((s) => s.setAutoRotate);

  const exploredStructureIds = useLearningStore((s) => s.exploredStructureIds);
  const completedMateriIds = useLearningStore((s) => s.completedMateriIds);
  const bestQuizScore = useLearningStore((s) => s.bestQuizScore);

  const completedSubChapters = completedMateriIds.filter((id) =>
    id.startsWith('bab-'),
  ).length;
  const highestQuizScore = Math.max(0, ...Object.values(bestQuizScore));

  // Gentle showcase rotation while on the landing page
  useEffect(() => {
    selectStructure(null);
    setAutoRotate(true);
    return () => {
      setAutoRotate(false);
    };
  }, [selectStructure, setAutoRotate]);

  const handleSystemPreview = (sysId: SystemId) => {
    const sys = BODY_SYSTEMS.find((s) => s.id === sysId);
    if (!sys) return;
    setSystemFilter(sys.id);
    flyTo(sys.kameraFokus, 'orbit');
  };

  return (
    <div className="home-cinematic-stage">
      {/* Minimalist Hero Card */}
      <section
        className="home-hero-editorial pointer-auto"
        aria-label="Pengantar Platform"
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">
            Biologi SMA/SMK • Laboratorium 3D
          </span>
        </div>

        <h1 className="home-hero-headline">
          Jelajahi Tubuh Manusia dalam 3D.
        </h1>

        <p className="home-hero-subtext">
          Putar, bedah lapisan anatomi, dan pelajari cara kerja organ tubuh
          secara visual dan interaktif.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 2 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setAutoRotate(false);
              navigate('/eksplorasi');
            }}
          >
            Mulai Eksplorasi 3D
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setAutoRotate(false);
              navigate('/simulasi');
            }}
          >
            Mainkan Misi Medis
          </button>
          <button
            type="button"
            className={xrayMode ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
            onClick={() => setXrayMode(!xrayMode)}
            aria-pressed={xrayMode}
          >
            {xrayMode ? 'Sinar-X: Aktif' : 'Mode Sinar-X'}
          </button>
        </div>

        {/* Compact Progress Stats */}
        <div className="home-progress-row">
          <div className="home-stat-pill">
            <span>Struktur 3D</span>
            <strong>
              {exploredStructureIds.length}/{ANATOMICAL_STRUCTURES.length}
            </strong>
          </div>
          <div className="home-stat-pill">
            <span>Materi Selesai</span>
            <strong>
              {completedSubChapters}/{TOTAL_SUB_CHAPTERS}
            </strong>
          </div>
          <div className="home-stat-pill">
            <span>Skor Terbaik</span>
            <strong>{highestQuizScore}%</strong>
          </div>
          {activeSystemFilter !== 'semua' && (
            <button
              type="button"
              className="chip-btn active"
              onClick={() => {
                setSystemFilter('semua');
                resetCamera();
              }}
            >
              Reset Filter
            </button>
          )}
        </div>
      </section>

      {/* Bottom Strip: 3 Clean Side-by-Side System Cards */}
      <section
        className="home-bottom-strip pointer-auto"
        aria-label="Sistem Anatomi Utama"
      >
        <div className="system-switcher-strip">
          {BODY_SYSTEMS.map((sys) => {
            const isActive = activeSystemFilter === sys.id;
            return (
              <article
                key={sys.id}
                className={
                  isActive
                    ? 'system-preview-pill active'
                    : 'system-preview-pill'
                }
                style={{ borderTop: `3px solid ${sys.warnaAksen}` }}
              >
                <div className="system-card-header">
                  <strong className="system-card-title">{sys.namaID}</strong>
                  <span className="system-card-latin">{sys.namaLatin}</span>
                </div>

                <p className="system-card-desc">{sys.ringkasan}</p>

                <div className="system-card-actions">
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ flex: '1 1 115px' }}
                    onClick={() => handleSystemPreview(sys.id)}
                  >
                    Pratinjau 3D
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ flex: '1 1 105px' }}
                    onClick={() => {
                      handleSystemPreview(sys.id);
                      navigate('/eksplorasi');
                    }}
                  >
                    Buka →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
