import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ANATOMICAL_STRUCTURES,
  BODY_REGIONS,
  BODY_SYSTEMS,
  DETAILED_ORGANS,
  getDetailedOrganForStructureId,
  getRegionById,
  getStructureById,
  getSystemById,
} from '@/content/anatomy';
import type {
  LayerId,
  RegionId,
  SystemId,
} from '@/content/schema/anatomy.schema';
import { computeStructureFocusBookmark } from '@/scene/body/glbLoader';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useLearningStore } from '@/stores/learningStore';

const LAYER_CONFIG: { id: LayerId; label: string; accent: string }[] = [
  { id: 'kulit', label: 'Kulit & Wilayah Tubuh', accent: 'var(--sys-wilayah)' },
  { id: 'rangka', label: 'Sistem Rangka', accent: 'var(--sys-rangka)' },
  {
    id: 'peredaran-darah',
    label: 'Sistem Peredaran Darah',
    accent: 'var(--sys-peredaran)',
  },
  {
    id: 'pernapasan',
    label: 'Sistem Pernapasan',
    accent: 'var(--sys-pernapasan)',
  },
];

const GUIDE_STORAGE_KEY = 'ithb-control-guide-dismissed-v1';

export function EksplorasiPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [guideDismissed, setGuideDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUIDE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const selectedStructureId = useSceneStore((s) => s.selectedStructureId);
  const hoveredStructureId = useSceneStore((s) => s.hoveredStructureId);
  const activeSystemFilter = useSceneStore((s) => s.activeSystemFilter);
  const activeRegionFilter = useSceneStore((s) => s.activeRegionFilter);
  const visibleLayers = useSceneStore((s) => s.visibleLayers);
  const layerOpacity = useSceneStore((s) => s.layerOpacity);
  const xrayMode = useSceneStore((s) => s.xrayMode);

  const selectStructure = useSceneStore((s) => s.selectStructure);
  const setSystemFilter = useSceneStore((s) => s.setSystemFilter);
  const setRegionFilter = useSceneStore((s) => s.setRegionFilter);
  const toggleLayer = useSceneStore((s) => s.toggleLayer);
  const setLayerVisible = useSceneStore((s) => s.setLayerVisible);
  const setLayerOpacity = useSceneStore((s) => s.setLayerOpacity);
  const setXrayMode = useSceneStore((s) => s.setXrayMode);
  const resetSceneState = useSceneStore((s) => s.resetSceneState);

  const flyTo = useCameraStore((s) => s.flyTo);
  const resetCamera = useCameraStore((s) => s.resetCamera);
  const setAutoRotate = useCameraStore((s) => s.setAutoRotate);

  const tampilkanLabel3D = useSettingsStore((s) => s.tampilkanLabel3D);
  const setTampilkanLabel3D = useSettingsStore((s) => s.setTampilkanLabel3D);

  const markStructureExplored = useLearningStore(
    (s) => s.markStructureExplored,
  );

  useEffect(() => {
    setAutoRotate(false);
  }, [setAutoRotate]);

  const filteredStructures = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ANATOMICAL_STRUCTURES.filter((st) => {
      if (
        activeSystemFilter !== 'semua' &&
        st.sistem !== activeSystemFilter
      ) {
        return false;
      }
      if (
        activeRegionFilter !== 'semua' &&
        st.wilayah !== activeRegionFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        st.namaID.toLowerCase().includes(q) ||
        st.namaLatin.toLowerCase().includes(q)
      );
    });
  }, [query, activeSystemFilter, activeRegionFilter]);

  const selectedStructure = getStructureById(selectedStructureId ?? '');
  const hoveredStructure = getStructureById(hoveredStructureId ?? '');
  const selectedSystem = selectedStructure
    ? getSystemById(selectedStructure.sistem)
    : undefined;
  const selectedRegion = selectedStructure
    ? getRegionById(selectedStructure.wilayah)
    : undefined;
  const linkedOrgan = selectedStructure
    ? getDetailedOrganForStructureId(selectedStructure.id)
    : undefined;

  const handleFocusStructure = (structureId: string) => {
    const st = getStructureById(structureId);
    if (!st) return;
    if (!visibleLayers[st.lapisan]) {
      setLayerVisible(st.lapisan, true);
    }
    selectStructure(structureId);
    markStructureExplored(structureId);
    const liveBookmark =
      computeStructureFocusBookmark(structureId) ?? st.kameraFokus;
    flyTo(liveBookmark, 'organ-focus');
  };

  const handleReturnToFullBody = () => {
    selectStructure(null);
    setRegionFilter('semua');
    resetCamera();
  };

  const toggleGuide = (dismiss: boolean) => {
    setGuideDismissed(dismiss);
    try {
      localStorage.setItem(GUIDE_STORAGE_KEY, dismiss ? '1' : '0');
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div className="hud-split-layout">
      {/* LEFT HUD COLUMN: Lapisan, Filter & Pencarian */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Panel Lapisan dan Pencarian Anatomi"
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
            <h2 style={{ fontSize: 15 }}>Lapisan Anatomi</h2>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                resetSceneState();
                resetCamera();
              }}
            >
              Atur Ulang
            </button>
          </div>

          <div className="chip-row" role="group" aria-label="Filter Sistem">
            <button
              type="button"
              className={
                activeSystemFilter === 'semua' ? 'chip-btn active' : 'chip-btn'
              }
              onClick={() => {
                setSystemFilter('semua');
                resetCamera();
              }}
            >
              Semua
            </button>
            {BODY_SYSTEMS.map((sys) => (
              <button
                key={sys.id}
                type="button"
                className={
                  activeSystemFilter === sys.id ? 'chip-btn active' : 'chip-btn'
                }
                onClick={() => {
                  setSystemFilter(sys.id as SystemId);
                  flyTo(sys.kameraFokus, 'orbit');
                }}
              >
                {sys.namaID.replace('Sistem ', '')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {LAYER_CONFIG.map((layer) => {
              const isVisible = visibleLayers[layer.id];
              const pct = Math.round(layerOpacity[layer.id] * 100);
              return (
                <div key={layer.id} className="layer-control-row">
                  <div className="layer-control-header">
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleLayer(layer.id)}
                      />
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: layer.accent,
                          display: 'inline-block',
                        }}
                      />
                      <span>{layer.label}</span>
                    </label>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {isVisible ? `${pct}%` : 'Tersembunyi'}
                    </span>
                  </div>

                  {isVisible && (
                    <input
                      type="range"
                      className="opacity-slider"
                      aria-label={`Transparansi ${layer.label}`}
                      min={15}
                      max={100}
                      step={5}
                      value={pct}
                      onChange={(e) =>
                        setLayerOpacity(layer.id, Number(e.target.value) / 100)
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
            <button
              type="button"
              className={xrayMode ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
              style={{ flex: 1 }}
              onClick={() => setXrayMode(!xrayMode)}
              aria-pressed={xrayMode}
            >
              {xrayMode ? 'Sinar-X: Aktif' : 'Mode Sinar-X'}
            </button>

            <button
              type="button"
              className={
                tampilkanLabel3D ? 'btn btn-primary btn-sm' : 'btn btn-sm'
              }
              style={{ flex: 1 }}
              onClick={() => setTampilkanLabel3D(!tampilkanLabel3D)}
              aria-pressed={tampilkanLabel3D}
            >
              {tampilkanLabel3D ? 'Label 3D: Aktif' : 'Label 3D: Mati'}
            </button>
          </div>
        </section>

        <section
          className="glass-panel section-card"
          style={{ flex: 1, minHeight: 220 }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Fokus Wilayah Tubuh
          </span>
          <div className="chip-row" role="group" aria-label="Filter Wilayah">
            <button
              type="button"
              className={
                activeRegionFilter === 'semua' ? 'chip-btn active' : 'chip-btn'
              }
              onClick={() => {
                setRegionFilter('semua');
                resetCamera();
              }}
            >
              Utuh
            </button>
            {BODY_REGIONS.map((reg) => (
              <button
                key={reg.id}
                type="button"
                className={
                  activeRegionFilter === reg.id
                    ? 'chip-btn active'
                    : 'chip-btn'
                }
                onClick={() => {
                  setRegionFilter(reg.id as RegionId);
                  flyTo(reg.kameraFokus, 'orbit');
                }}
              >
                {reg.namaID
                  .replace('Wilayah ', '')
                  .replace(' (Toraks)', '')
                  .replace(' (Abdomen)', '')
                  .replace(' (Pelvis)', '')}
              </button>
            ))}
          </div>

          <input
            id="search-structure-input"
            type="search"
            aria-label="Cari struktur anatomi"
            placeholder="Cari bagian tubuh (mis. Jantung, Trakea, Femur)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              fontSize: 12.5,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              overflowY: 'auto',
              maxHeight: 240,
              paddingRight: 2,
            }}
          >
            {filteredStructures.map((st) => {
              const isSelected = st.id === selectedStructureId;
              const sys = getSystemById(st.sistem);
              return (
                <button
                  key={st.id}
                  type="button"
                  className={isSelected ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
                  style={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    borderLeft: `3px solid ${sys?.warnaAksen ?? '#14b8a6'}`,
                  }}
                  onClick={() => handleFocusStructure(st.id)}
                >
                  <span style={{ fontWeight: 600 }}>{st.namaID}</span>
                  <span style={{ fontSize: 11, opacity: 0.78, fontStyle: 'italic' }}>
                    {st.namaLatin}
                  </span>
                </button>
              );
            })}
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
          {(selectedStructureId !== null || activeRegionFilter !== 'semua') && (
            <button
              type="button"
              className="btn btn-primary btn-sm pointer-auto"
              onClick={handleReturnToFullBody}
            >
              ← Tubuh Utuh
            </button>
          )}

          {hoveredStructure && !selectedStructure && (
            <div
              className="glass-panel pointer-auto"
              style={{ padding: '5px 12px', fontSize: 12 }}
            >
              <strong>{hoveredStructure.namaID}</strong>{' '}
              <em style={{ opacity: 0.78 }}>({hoveredStructure.namaLatin})</em>
            </div>
          )}
        </div>

        {!guideDismissed ? (
          <div
            className="glass-panel pointer-auto"
            role="region"
            aria-label="Panduan Kontrol 3D"
            style={{
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 11.5,
              flexWrap: 'wrap',
            }}
          >
            <span>
              <strong>Putar:</strong> Klik kiri • <strong>Zoom:</strong> Scroll •{' '}
              <strong>Geser:</strong> Klik kanan • <strong>Pilih:</strong> Klik
              organ
            </span>
            <button
              type="button"
              className="chip-btn"
              onClick={() => toggleGuide(true)}
            >
              Tutup
            </button>
          </div>
        ) : null}
      </div>

      {/* RIGHT HUD COLUMN: Info Struktur atau Bedah Organ */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Panel Informasi Struktur"
      >
        <section className="glass-panel-strong section-card info-panel-slide">
          {selectedStructure ? (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                {selectedSystem && (
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(12, 23, 38, 0.9)',
                      border: `1px solid ${selectedSystem.warnaAksen}`,
                      color: selectedSystem.warnaAksen,
                    }}
                  >
                    {selectedSystem.namaID}
                  </span>
                )}
                <span className="badge badge-cyan">
                  {selectedRegion?.namaID.replace('Wilayah ', '') ??
                    selectedStructure.wilayah}
                </span>
              </div>

              <div>
                <h2 style={{ fontSize: 20 }}>{selectedStructure.namaID}</h2>
                <p
                  style={{
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: 'var(--accent-light)',
                    marginTop: 2,
                  }}
                >
                  {selectedStructure.namaLatin}
                </p>
              </div>

              <p className="muted-text">{selectedStructure.ringkasan}</p>

              <div>
                <h3 style={{ fontSize: 13, marginBottom: 6 }}>Fungsi Utama</h3>
                <ul
                  style={{
                    paddingLeft: 18,
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                  }}
                >
                  {selectedStructure.fungsi.map((fn) => (
                    <li key={fn}>{fn}</li>
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
                <strong>Fakta Medis</strong>
                <p className="muted-text" style={{ marginTop: 4, fontSize: 12 }}>
                  {selectedStructure.faktaKlinis}
                </p>
              </div>

              {linkedOrgan && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/organ/${linkedOrgan.id}`)}
                >
                  Bedah &amp; Sayat {linkedOrgan.namaID.split(' (')[0]} 3D →
                </button>
              )}

              <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleFocusStructure(selectedStructure.id)}
                >
                  Fokus Kamera
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ flex: 1 }}
                  onClick={handleReturnToFullBody}
                >
                  Tubuh Utuh
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="badge badge-cyan">Eksplorasi Interaktif</span>
              <h2 style={{ fontSize: 18 }}>Pilih Bagian Tubuh</h2>
              <p className="muted-text">
                Klik langsung tulang, jantung, pembuluh darah, atau paru-paru di
                layar 3D untuk melihat fungsi dan detail medisnya.
              </p>

              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg-subtle)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <strong style={{ fontSize: 13 }}>
                  Bedah Organ Detail &amp; Sayatan 3D
                </strong>
                <p className="muted-text" style={{ fontSize: 12 }}>
                  Amati bagian dalam organ beresolusi tinggi dan belah penampang
                  3D secara langsung:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {DETAILED_ORGANS.map((organ) => (
                    <button
                      key={organ.id}
                      type="button"
                      className="btn btn-sm"
                      style={{ justifyContent: 'space-between', textAlign: 'left' }}
                      onClick={() => navigate(`/organ/${organ.id}`)}
                    >
                      <span style={{ fontWeight: 600 }}>{organ.namaID}</span>
                      <span style={{ fontSize: 11, color: 'var(--accent-light)' }}>
                        Bedah Organ →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </aside>
    </div>
  );
}
