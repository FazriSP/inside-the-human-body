import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CINEMATIC_JOURNEYS,
  getActiveChapterForProgress,
  getActiveSubtitleForProgress,
  getDetailedOrganForStructureId,
  getStructureById,
} from '@/content/anatomy';
import {
  useCameraStore,
  type JourneySpeed,
} from '@/stores/cameraStore';
import { useSceneStore } from '@/stores/sceneStore';
import { useSettingsStore } from '@/stores/settingsStore';

const SPEED_OPTIONS: JourneySpeed[] = [0.5, 1, 1.5, 2];

function formatSeconds(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PerjalananPage() {
  const navigate = useNavigate();
  const journeyData = CINEMATIC_JOURNEYS[0];

  const journeyState = useCameraStore((s) => s.journey);
  const startJourney = useCameraStore((s) => s.startJourney);
  const stopJourney = useCameraStore((s) => s.stopJourney);
  const setJourneyPlayback = useCameraStore((s) => s.setJourneyPlayback);
  const flyTo = useCameraStore((s) => s.flyTo);

  const xrayMode = useSceneStore((s) => s.xrayMode);
  const setXrayMode = useSceneStore((s) => s.setXrayMode);
  const setLayerVisible = useSceneStore((s) => s.setLayerVisible);
  const setLayerOpacity = useSceneStore((s) => s.setLayerOpacity);

  const tampilkanLabel3D = useSettingsStore((s) => s.tampilkanLabel3D);
  const setTampilkanLabel3D = useSettingsStore((s) => s.setTampilkanLabel3D);

  // Configure optimal translucent cardiopulmonary layers on mount
  useEffect(() => {
    setLayerVisible('kulit', false);
    setLayerVisible('rangka', true);
    setLayerVisible('peredaran-darah', true);
    setLayerVisible('pernapasan', true);
    setLayerOpacity('rangka', 0.25);
    setLayerOpacity('peredaran-darah', 0.78);
    setLayerOpacity('pernapasan', 0.58);
    setXrayMode(true);

    startJourney(journeyData.id);

    return () => {
      stopJourney();
      setLayerOpacity('rangka', 1.0);
      setLayerOpacity('peredaran-darah', 1.0);
      setLayerOpacity('pernapasan', 1.0);
      setXrayMode(false);
    };
  }, [
    journeyData.id,
    setLayerOpacity,
    setLayerVisible,
    setXrayMode,
    startJourney,
    stopJourney,
  ]);

  const progress = journeyState.progress;
  const activeChapter = getActiveChapterForProgress(journeyData, progress);
  const activeSubtitle = getActiveSubtitleForProgress(journeyData, progress);
  const activeStructure = getStructureById(activeChapter.structureId);
  const linkedDetailedOrgan = getDetailedOrganForStructureId(
    activeChapter.structureId,
  );

  const elapsedSec = progress * journeyData.durasiDetikDefault;
  const totalSec = journeyData.durasiDetikDefault;
  const progressPct = Math.round(progress * 100);

  const handleJumpChapter = (chapterIndex: number) => {
    const targetChap = journeyData.chapters[chapterIndex];
    if (!targetChap) return;
    setJourneyPlayback({
      progress: targetChap.tStart + 0.002,
      chapterIndex,
    });
  };

  const handlePrevChapter = () => {
    const prevIdx = Math.max(0, activeChapter.nomor - 2);
    handleJumpChapter(prevIdx);
  };

  const handleNextChapter = () => {
    const nextIdx = Math.min(
      journeyData.chapters.length - 1,
      activeChapter.nomor,
    );
    handleJumpChapter(nextIdx);
  };

  const bloodBadgeColor =
    activeChapter.statusDarah === 'oksigenasi'
      ? '#ef4444'
      : activeChapter.statusDarah === 'transisi-alveolus'
        ? '#a855f7'
        : '#3b82f6';

  const bloodStatusLabel =
    activeChapter.statusDarah === 'oksigenasi'
      ? 'Darah Arteri Kaya O₂ (Oksihemoglobin)'
      : activeChapter.statusDarah === 'transisi-alveolus'
        ? 'Pertukaran Gas Alveolus (Difusi CO₂ → O₂)'
        : 'Darah Vena Miskin O₂ (Kaya CO₂)';

  return (
    <div className="hud-split-layout">
      {/* LEFT HUD COLUMN: Ringkasan Perjalanan & Navigasi 6 Bab */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Panel Bab Perjalanan Sinematik"
      >
        <section className="glass-panel section-card">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-cyan">Perjalanan Sinematik 3D</span>
            <span className="badge badge-skematis">Ilustrasi Skematis</span>
          </div>

          <div>
            <h1 style={{ fontSize: 16.5 }}>{journeyData.judul}</h1>
            <p
              style={{
                fontSize: 11.5,
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                marginTop: 2,
              }}
            >
              {journeyData.subjudulLatin}
            </p>
          </div>

          <p className="muted-text" style={{ fontSize: 12 }}>
            {journeyData.ringkasan}
          </p>
        </section>

        <section
          className="glass-panel section-card"
          style={{ flex: 1, minHeight: 240 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <h2 style={{ fontSize: 14.5 }}>
              Tahapan Perjalanan ({journeyData.chapters.length} Bab)
            </h2>
            <span style={{ fontSize: 11, color: 'var(--accent-cyan)' }}>
              Bab {activeChapter.nomor}/{journeyData.chapters.length}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              overflowY: 'auto',
              maxHeight: 320,
              paddingRight: 2,
            }}
          >
            {journeyData.chapters.map((chap, idx) => {
              const isCurrent = chap.id === activeChapter.id;
              const dotColor =
                chap.statusDarah === 'oksigenasi'
                  ? '#ef4444'
                  : chap.statusDarah === 'transisi-alveolus'
                    ? '#a855f7'
                    : '#3b82f6';

              return (
                <button
                  key={chap.id}
                  type="button"
                  className={isCurrent ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    gap: 3,
                    padding: '8px 11px',
                    borderLeft: `3px solid ${dotColor}`,
                  }}
                  onClick={() => handleJumpChapter(idx)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 12 }}>
                      Bab {chap.nomor}: {chap.judul}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        opacity: 0.85,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {chap.kadarO2Persen}% O₂
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.78,
                      fontStyle: 'italic',
                    }}
                  >
                    {chap.subjudulLatin}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </aside>

      {/* CENTER VIEWPORT HUD: Top Camera Mode Toggle & Bottom Subtitle + Timeline Player */}
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
          <button
            type="button"
            className={
              journeyState.followCamera
                ? 'btn btn-primary btn-sm pointer-auto'
                : 'btn btn-sm pointer-auto'
            }
            onClick={() => {
              const nextFollow = !journeyState.followCamera;
              setJourneyPlayback({ followCamera: nextFollow });
              if (!nextFollow) {
                flyTo(
                  {
                    position: [0, 1.32, 0.56],
                    target: [0, 1.29, 0.01],
                  },
                  'orbit',
                );
              }
            }}
          >
            {journeyState.followCamera
              ? 'Kamera: Mengikuti Eritrosit (Rel 3D)'
              : 'Kamera: Pengamat Orbit Bebas'}
          </button>

          <button
            type="button"
            className={
              xrayMode
                ? 'btn btn-primary btn-sm pointer-auto'
                : 'btn btn-sm pointer-auto'
            }
            onClick={() => setXrayMode(!xrayMode)}
          >
            {xrayMode ? 'Sinar-X Organ: Aktif' : 'Sinar-X Organ: Nonaktif'}
          </button>

          <button
            type="button"
            className={
              tampilkanLabel3D
                ? 'btn btn-primary btn-sm pointer-auto'
                : 'btn btn-sm pointer-auto'
            }
            onClick={() => setTampilkanLabel3D(!tampilkanLabel3D)}
          >
            {tampilkanLabel3D ? 'Label 3D: Aktif' : 'Label 3D: Nonaktif'}
          </button>
        </div>

        {/* Bottom Subtitle Box & Timeline Scrubber Control Bar */}
        <section
          className="glass-panel-strong pointer-auto"
          aria-label="Pemutar Linimasa dan Takarir Perjalanan Sinematik"
          style={{
            width: '100%',
            maxWidth: 680,
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Subtitle Narrative Display */}
          <div
            role="status"
            aria-live="polite"
            style={{
              background: 'rgba(6, 12, 24, 0.85)',
              border: '1px solid var(--glass-border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
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
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Narasi Bab {activeChapter.nomor} — {activeChapter.judul}
              </span>
              <span
                className={
                  activeChapter.accuracyBadge === 'skematis'
                    ? 'badge badge-skematis'
                    : 'badge badge-anatomis'
                }
              >
                {activeChapter.accuracyBadge === 'skematis'
                  ? 'Ilustrasi Skematis (Skala Mikro Alveolus)'
                  : 'Konteks Organ Terukur + Jalur Skematis'}
              </span>
            </div>

            <p
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: 'var(--text-primary)',
                fontWeight: 500,
              }}
            >
              “{activeSubtitle.teks}”
            </p>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {activeSubtitle.istilahPenting.map((term) => (
                <span
                  key={term}
                  style={{
                    fontSize: 10.5,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(56, 189, 248, 0.14)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span>
                Waktu: <strong>{formatSeconds(elapsedSec)}</strong> /{' '}
                {formatSeconds(totalSec)}
              </span>
              <span>
                Progres Lintasan: <strong>{progressPct}%</strong>
              </span>
            </div>

            <input
              type="range"
              className="opacity-slider"
              aria-label="Geser Linimasa Perjalanan Sel Darah Merah"
              min={0}
              max={1000}
              step={1}
              value={Math.round(progress * 1000)}
              onChange={(e) => {
                const nextP = Number(e.target.value) / 1000;
                const chap = getActiveChapterForProgress(journeyData, nextP);
                setJourneyPlayback({
                  progress: nextP,
                  chapterIndex: Math.max(0, chap.nomor - 1),
                });
              }}
            />
          </div>

          {/* Transport Buttons & Speed Selector */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() =>
                  setJourneyPlayback({
                    progress: 0,
                    chapterIndex: 0,
                    isPlaying: true,
                  })
                }
              >
                ⏮ Ulangi
              </button>

              <button
                type="button"
                className="btn btn-sm"
                onClick={handlePrevChapter}
                disabled={activeChapter.nomor <= 1}
              >
                ◀ Bab Sebelumnya
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (progress >= 0.995 && !journeyState.isPlaying) {
                    setJourneyPlayback({
                      progress: 0,
                      chapterIndex: 0,
                      isPlaying: true,
                    });
                  } else {
                    setJourneyPlayback({ isPlaying: !journeyState.isPlaying });
                  }
                }}
              >
                {journeyState.isPlaying ? '⏸ Jeda' : '▶ Putar Perjalanan'}
              </button>

              <button
                type="button"
                className="btn btn-sm"
                onClick={handleNextChapter}
                disabled={activeChapter.nomor >= journeyData.chapters.length}
              >
                Bab Berikutnya ▶
              </button>
            </div>

            {/* Speed Selector */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              role="group"
              aria-label="Kecepatan Putar"
            >
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  marginRight: 2,
                }}
              >
                Kecepatan:
              </span>
              {SPEED_OPTIONS.map((spd) => (
                <button
                  key={spd}
                  type="button"
                  className={
                    journeyState.speed === spd ? 'chip-btn active' : 'chip-btn'
                  }
                  onClick={() => setJourneyPlayback({ speed: spd })}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT HUD COLUMN: Telemetri Sel Darah Merah & Penjelasan Bab Aktif */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Panel Telemetri Fisiologis dan Penjelasan Bab"
      >
        <section className="glass-panel-strong section-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <span className="badge badge-cyan">Telemetri Eritrosit Hidup</span>
            <span
              className="badge"
              style={{
                background: 'rgba(15, 28, 52, 0.9)',
                border: `1px solid ${bloodBadgeColor}`,
                color: bloodBadgeColor,
              }}
            >
              {bloodStatusLabel}
            </span>
          </div>

          {/* Oxygen & CO2 Gauges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}
          >
            <div
              style={{
                padding: 10,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--glass-bg-subtle)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Saturasi Oksigen (HbO₂)
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: bloodBadgeColor,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {activeChapter.kadarO2Persen}%
              </div>
            </div>

            <div
              style={{
                padding: 10,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--glass-bg-subtle)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Tekanan Parsial CO₂
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#f59e0b',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {activeChapter.kadarCO2MmHg} <small style={{ fontSize: 11 }}>mmHg</small>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--glass-bg-subtle)',
              fontSize: 12,
            }}
          >
            <strong>Tekanan Hidrostasis Lokal:</strong>{' '}
            <span style={{ color: 'var(--accent-cyan)' }}>
              {activeChapter.tekananLokal}
            </span>
          </div>

          <div>
            <h2 style={{ fontSize: 17 }}>
              Bab {activeChapter.nomor}: {activeChapter.judul}
            </h2>
            <p
              style={{
                fontSize: 12.5,
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                marginTop: 2,
              }}
            >
              {activeChapter.subjudulLatin}
            </p>
          </div>

          <p className="muted-text" style={{ lineHeight: 1.6 }}>
            {activeChapter.ringkasanFisiologi}
          </p>

          {activeStructure && (
            <div
              style={{
                background: 'var(--glass-bg-subtle)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 10,
                fontSize: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <strong>Lokasi Struktur 3D Saat Ini:</strong>
              <span>
                {activeStructure.namaID} <em>({activeStructure.namaLatin})</em>
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                {activeStructure.faktaKlinis}
              </span>
            </div>
          )}

          {linkedDetailedOrgan && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/organ/${linkedDetailedOrgan.id}`)}
            >
              Buka Isolasi &amp; Sayatan {linkedDetailedOrgan.namaID.split(' (')[0]} →
            </button>
          )}

          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: 8,
            }}
          >
            <strong>Catatan Transparansi Visual:</strong>{' '}
            {journeyData.catatanTransparansiSkematis}
          </div>
        </section>
      </aside>
    </div>
  );
}
