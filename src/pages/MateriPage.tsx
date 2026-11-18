import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BODY_SYSTEMS,
  CURRICULUM_MODULES,
  getDetailedOrganById,
  getStructureById,
  getSystemById,
} from '@/content/anatomy';
import type { SystemId } from '@/content/schema/anatomy.schema';
import { computeStructureFocusBookmark } from '@/scene/body/glbLoader';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { useLearningStore } from '@/stores/learningStore';

const TOTAL_SUB_CHAPTERS = CURRICULUM_MODULES.reduce(
  (acc, m) => acc + m.subChapters.length,
  0,
);

export function MateriPage() {
  const navigate = useNavigate();

  const [activeSystemId, setActiveSystemId] = useState<SystemId>('rangka');
  const [activeSubChapterId, setActiveSubChapterId] = useState<string>(
    CURRICULUM_MODULES[0].subChapters[0].id,
  );

  const selectedStructureId = useSceneStore((s) => s.selectedStructureId);
  const xrayMode = useSceneStore((s) => s.xrayMode);
  const selectStructure = useSceneStore((s) => s.selectStructure);
  const setSystemFilter = useSceneStore((s) => s.setSystemFilter);
  const setXrayMode = useSceneStore((s) => s.setXrayMode);

  const flyTo = useCameraStore((s) => s.flyTo);
  const setAutoRotate = useCameraStore((s) => s.setAutoRotate);

  const setActiveSimulationModule = useSimulationStore(
    (s) => s.setActiveModule,
  );

  const completedMateriIds = useLearningStore((s) => s.completedMateriIds);
  const markStructureExplored = useLearningStore(
    (s) => s.markStructureExplored,
  );
  const toggleMateriCompleted = useLearningStore(
    (s) => s.toggleMateriCompleted,
  );
  const markMateriCompleted = useLearningStore((s) => s.markMateriCompleted);

  useEffect(() => {
    setAutoRotate(false);
  }, [setAutoRotate]);

  const activeModule =
    CURRICULUM_MODULES.find((m) => m.sistem === activeSystemId) ??
    CURRICULUM_MODULES[0];
  const activeSystem = getSystemById(activeModule.sistem);
  const activeSubIndex = activeModule.subChapters.findIndex(
    (s) => s.id === activeSubChapterId,
  );
  const activeSubChapter =
    activeModule.subChapters[activeSubIndex] ?? activeModule.subChapters[0];
  const nextSubChapter = activeModule.subChapters[activeSubIndex + 1];

  const completedSubChaptersCount = CURRICULUM_MODULES.reduce(
    (acc, mod) =>
      acc +
      mod.subChapters.filter((sub) => completedMateriIds.includes(sub.id))
        .length,
    0,
  );
  const progressPct = Math.round(
    (completedSubChaptersCount / TOTAL_SUB_CHAPTERS) * 100,
  );

  const handleSelectModule = (sistem: SystemId) => {
    setActiveSystemId(sistem);
    setSystemFilter(sistem);
    const mod = CURRICULUM_MODULES.find((m) => m.sistem === sistem);
    if (mod && mod.subChapters[0]) {
      setActiveSubChapterId(mod.subChapters[0].id);
      const firstStructId = mod.subChapters[0].relatedStructureIds[0];
      if (firstStructId) {
        handleFocusStructureOnCanvas(firstStructId);
      }
    }
  };

  const handleSelectSubChapter = (subId: string) => {
    setActiveSubChapterId(subId);
    const sub = activeModule.subChapters.find((s) => s.id === subId);
    if (sub && sub.relatedStructureIds[0]) {
      handleFocusStructureOnCanvas(sub.relatedStructureIds[0]);
    }
  };

  const handleFocusStructureOnCanvas = (structureId: string) => {
    const st = getStructureById(structureId);
    if (!st) return;
    setSystemFilter(st.sistem);
    selectStructure(st.id);
    markStructureExplored(st.id);
    const bookmark = computeStructureFocusBookmark(st.id) ?? st.kameraFokus;
    flyTo(bookmark, 'organ-focus');
  };

  const isSubCompleted = completedMateriIds.includes(activeSubChapter.id);
  const deepLinkOrgan = activeSubChapter.deepLinkOrganId
    ? getDetailedOrganById(activeSubChapter.deepLinkOrganId)
    : undefined;
  const activeStructure = getStructureById(selectedStructureId ?? '');

  return (
    <div className="hud-split-layout">
      {/* LEFT HUD COLUMN: Modul, Daftar Bab & Glosarium Ringkas */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Navigasi Materi Biologi"
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
            <span className="badge badge-cyan">Pusat Materi</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-light)',
              }}
            >
              {progressPct}% Selesai
            </span>
          </div>

          <div
            style={{
              height: 6,
              borderRadius: 999,
              background: 'rgba(148, 163, 184, 0.16)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'var(--accent-primary)',
                transition: 'width 240ms ease',
              }}
            />
          </div>

          <div className="chip-row" role="tablist" aria-label="Pilih Sistem">
            {BODY_SYSTEMS.map((sys) => (
              <button
                key={sys.id}
                type="button"
                role="tab"
                aria-selected={activeSystemId === sys.id}
                className={
                  activeSystemId === sys.id ? 'chip-btn active' : 'chip-btn'
                }
                onClick={() => handleSelectModule(sys.id)}
              >
                {sys.namaID.replace('Sistem ', '')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeModule.subChapters.map((sub) => {
              const isSelected = sub.id === activeSubChapter.id;
              const isDone = completedMateriIds.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  className={isSelected ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
                  style={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    borderLeft: `3px solid ${
                      isDone
                        ? '#34d399'
                        : activeSystem?.warnaAksen ?? '#14b8a6'
                    }`,
                  }}
                  onClick={() => handleSelectSubChapter(sub.id)}
                >
                  <span style={{ fontWeight: 600, fontSize: 12 }}>
                    {sub.kodeBab} • {sub.judul}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDone ? '#34d399' : 'var(--text-muted)',
                      marginLeft: 6,
                    }}
                  >
                    {isDone ? '✓' : '○'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Compact Glossary */}
        <section
          className="glass-panel section-card"
          style={{ flex: 1, minHeight: 200 }}
        >
          <h2 style={{ fontSize: 14.5 }}>Istilah Penting</h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              overflowY: 'auto',
              maxHeight: 260,
              paddingRight: 2,
            }}
          >
            {activeModule.glosarium.map((term) => (
              <div
                key={term.istilahID}
                style={{
                  padding: 10,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg-subtle)',
                  border: '1px solid var(--glass-border)',
                  fontSize: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <strong>{term.istilahID}</strong>
                  <em style={{ fontSize: 11, color: 'var(--accent-light)' }}>
                    {term.istilahLatin}
                  </em>
                </div>
                <p className="muted-text" style={{ fontSize: 11.5 }}>
                  {term.definisi}
                </p>
                {term.structureId && (
                  <button
                    type="button"
                    className="chip-btn"
                    style={{ alignSelf: 'flex-start', marginTop: 2 }}
                    onClick={() =>
                      handleFocusStructureOnCanvas(term.structureId!)
                    }
                  >
                    Lihat di 3D →
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* CENTER VIEWPORT HUD */}
      <div className="hud-center-column">
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {activeStructure && (
            <div
              className="glass-panel pointer-auto"
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              <strong>{activeStructure.namaID}</strong>{' '}
              <em style={{ opacity: 0.78 }}>({activeStructure.namaLatin})</em>
            </div>
          )}

          <button
            type="button"
            className={
              xrayMode
                ? 'btn btn-primary btn-sm pointer-auto'
                : 'btn btn-sm pointer-auto'
            }
            onClick={() => setXrayMode(!xrayMode)}
          >
            {xrayMode ? 'Sinar-X: Aktif' : 'Mode Sinar-X'}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm pointer-auto"
            onClick={() => navigate('/kuis')}
          >
            Uji di Kuis 3D →
          </button>
        </div>
      </div>

      {/* RIGHT HUD COLUMN: Clean Reading Card */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Ringkasan Materi Pembelajaran"
      >
        <section
          className="glass-panel-strong section-card"
          style={{ gap: 14, padding: 20 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span className="badge badge-anatomis">
              Bab {activeSubChapter.kodeBab} • ~{activeModule.estimasiMenit} mnt
            </span>

            <button
              type="button"
              className={
                isSubCompleted ? 'btn btn-primary btn-sm' : 'btn btn-sm'
              }
              onClick={() => {
                toggleMateriCompleted(activeSubChapter.id);
                markMateriCompleted(`materi-${activeModule.sistem}`);
              }}
            >
              {isSubCompleted ? 'Selesai ✓' : 'Tandai Selesai'}
            </button>
          </div>

          <div>
            <h1 style={{ fontSize: 19 }}>{activeSubChapter.judul}</h1>
            <p
              style={{
                fontSize: 12.5,
                fontStyle: 'italic',
                color: 'var(--accent-light)',
                marginTop: 2,
              }}
            >
              {activeSubChapter.subjudulLatin}
            </p>
          </div>

          <p className="muted-text" style={{ lineHeight: 1.6 }}>
            {activeSubChapter.ringkasanKonsep}
          </p>

          <div>
            <h2 style={{ fontSize: 13.5, marginBottom: 8 }}>Poin Utama</h2>
            <ul
              style={{
                paddingLeft: 18,
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                lineHeight: 1.55,
              }}
            >
              {activeSubChapter.poinKunci.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>

          <div
            style={{
              background: 'var(--glass-bg-subtle)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 12,
              fontSize: 12,
            }}
          >
            <strong>Catatan Medis</strong>
            <p className="muted-text" style={{ marginTop: 4, fontSize: 12 }}>
              {activeSubChapter.aplikasiKlinis}
            </p>
          </div>

          {/* Interactive 3D Jump Chips */}
          <div>
            <h3 style={{ fontSize: 12.5, marginBottom: 6 }}>
              Sorot Organ di Model 3D
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {activeSubChapter.relatedStructureIds.map((sid) => {
                const st = getStructureById(sid);
                if (!st) return null;
                const isFocused = selectedStructureId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={isFocused ? 'chip-btn active' : 'chip-btn'}
                    onClick={() => handleFocusStructureOnCanvas(st.id)}
                  >
                    {st.namaID}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Quick Navigation Bar */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: 12,
            }}
          >
            {deepLinkOrgan && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate(`/organ/${deepLinkOrgan.id}`)}
              >
                Bedah {deepLinkOrgan.namaID.split(' (')[0]}
              </button>
            )}

            {activeSubChapter.deepLinkSimulasi && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setActiveSimulationModule(activeSubChapter.deepLinkSimulasi!);
                  navigate('/simulasi');
                }}
              >
                Buka Misi Medis
              </button>
            )}

            {nextSubChapter && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={() => handleSelectSubChapter(nextSubChapter.id)}
              >
                Bab Berikutnya →
              </button>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
