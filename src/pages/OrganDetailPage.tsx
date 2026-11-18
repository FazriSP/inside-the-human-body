import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  DETAILED_ORGANS,
  getDetailedOrganById,
  getRegionById,
  getStructureById,
  getSystemById,
} from '@/content/anatomy';
import type { OrganSubStructure } from '@/content/schema/anatomy.schema';
import { computeStructureFocusBookmark } from '@/scene/body/glbLoader';
import {
  ISOLATED_ORGAN_DEFAULT_BOOKMARK,
  computeSubStructureFocusBookmark,
} from '@/scene/organ/IsolatedOrganViewer';
import {
  useSceneStore,
  type ClippingAxis,
} from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useSettingsStore } from '@/stores/settingsStore';

const AXIS_OPTIONS: {
  axis: ClippingAxis;
  label: string;
  description: string;
}[] = [
  {
    axis: 'z',
    label: 'Depan–Belakang (Z)',
    description: 'Menyayat dari sisi depan ke belakang organ',
  },
  {
    axis: 'x',
    label: 'Kanan–Kiri (X)',
    description: 'Menyayat dari sisi kanan ke kiri organ',
  },
  {
    axis: 'y',
    label: 'Atas–Bawah (Y)',
    description: 'Menyayat secara mendatar dari atas ke bawah',
  },
];

export function OrganDetailPage() {
  const { organId } = useParams<{ organId: string }>();
  const navigate = useNavigate();

  const organ = getDetailedOrganById(organId ?? '');

  const selectedStructureId = useSceneStore((s) => s.selectedStructureId);
  const selectedSubStructureId = useSceneStore((s) => s.selectedSubStructureId);
  const hoveredSubStructureId = useSceneStore((s) => s.hoveredSubStructureId);
  const xrayMode = useSceneStore((s) => s.xrayMode);
  const clipping = useSceneStore((s) => s.clipping);

  const enterIsolatedOrgan = useSceneStore((s) => s.enterIsolatedOrgan);
  const exitIsolatedOrgan = useSceneStore((s) => s.exitIsolatedOrgan);
  const selectSubStructure = useSceneStore((s) => s.selectSubStructure);
  const setXrayMode = useSceneStore((s) => s.setXrayMode);
  const setClipping = useSceneStore((s) => s.setClipping);
  const resetClipping = useSceneStore((s) => s.resetClipping);

  const flyTo = useCameraStore((s) => s.flyTo);
  const resetCamera = useCameraStore((s) => s.resetCamera);
  const setAutoRotate = useCameraStore((s) => s.setAutoRotate);

  const tampilkanLabel3D = useSettingsStore((s) => s.tampilkanLabel3D);
  const setTampilkanLabel3D = useSettingsStore((s) => s.setTampilkanLabel3D);

  useEffect(() => {
    if (!organ) return;
    setAutoRotate(false);
    enterIsolatedOrgan(organ.id);
  }, [organ, enterIsolatedOrgan, setAutoRotate]);

  useEffect(() => {
    return () => {
      exitIsolatedOrgan();
    };
  }, [exitIsolatedOrgan]);

  const groupedSubStructures = useMemo(() => {
    if (!organ) return [];
    const map = new Map<string, OrganSubStructure[]>();
    for (const sub of organ.subStructures) {
      const list = map.get(sub.kategori) ?? [];
      list.push(sub);
      map.set(sub.kategori, list);
    }
    return Array.from(map.entries());
  }, [organ]);

  if (!organ) {
    return <Navigate to="/organ/jantung" replace />;
  }

  const system = getSystemById(organ.sistem);
  const region = getRegionById(organ.wilayah);
  const selectedSub = organ.subStructures.find(
    (s) => s.id === selectedSubStructureId,
  );
  const hoveredSub = organ.subStructures.find(
    (s) => s.id === hoveredSubStructureId,
  );
  const activeAxisMeta =
    AXIS_OPTIONS.find((a) => a.axis === clipping.axis) ?? AXIS_OPTIONS[0];
  const slicePercent = Math.round(clipping.offset * 100);

  const handleSelectSubStructure = (subId: string | null) => {
    selectSubStructure(subId);
    if (!subId) {
      flyTo(ISOLATED_ORGAN_DEFAULT_BOOKMARK, 'organ-focus');
      return;
    }
    const bookmark =
      computeSubStructureFocusBookmark(subId) ?? ISOLATED_ORGAN_DEFAULT_BOOKMARK;
    flyTo(bookmark, 'organ-focus');
  };

  const handleReturnToWholeBody = () => {
    exitIsolatedOrgan();
    if (selectedStructureId) {
      const st = getStructureById(selectedStructureId);
      const bm =
        computeStructureFocusBookmark(selectedStructureId) ?? st?.kameraFokus;
      if (bm) {
        flyTo(bm, 'organ-focus');
      } else {
        resetCamera();
      }
    } else {
      resetCamera();
    }
    navigate('/eksplorasi');
  };

  return (
    <div className="hud-split-layout">
      {/* LEFT HUD COLUMN: Pilih Organ, Sayatan 3D & Daftar Bagian */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Panel Sayatan dan Bagian Organ"
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
            <span className="badge badge-cyan">Bedah Organ 3D</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleReturnToWholeBody}
            >
              ← Kembali
            </button>
          </div>

          <div className="chip-row" role="group" aria-label="Pilih Organ">
            {DETAILED_ORGANS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === organ.id ? 'chip-btn active' : 'chip-btn'}
                onClick={() => navigate(`/organ/${item.id}`)}
              >
                {item.namaID.split(' (')[0].replace(' Manusia', '')}
              </button>
            ))}
          </div>
        </section>

        {/* Cross-Section / Sayatan 3D Controls */}
        <section className="glass-panel section-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <h2 style={{ fontSize: 15 }}>Sayatan Penampang 3D</h2>
            <button
              type="button"
              className="btn btn-sm"
              onClick={resetClipping}
              disabled={
                !clipping.enabled &&
                clipping.offset === 0 &&
                clipping.axis === 'z' &&
                !clipping.inverted
              }
            >
              Reset
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className={
                clipping.enabled ? 'btn btn-primary btn-sm' : 'btn btn-sm'
              }
              style={{ flex: 1 }}
              onClick={() => setClipping({ enabled: !clipping.enabled })}
              aria-pressed={clipping.enabled}
            >
              {clipping.enabled ? 'Sayatan: Aktif' : 'Potong Organ 3D'}
            </button>

            <button
              type="button"
              className={
                clipping.inverted ? 'btn btn-primary btn-sm' : 'btn btn-sm'
              }
              onClick={() =>
                setClipping({
                  enabled: true,
                  inverted: !clipping.inverted,
                })
              }
              aria-pressed={clipping.inverted}
            >
              Balik Sisi
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Arah Potongan
            </span>
            <div className="chip-row" role="group" aria-label="Sumbu Sayatan">
              {AXIS_OPTIONS.map((opt) => (
                <button
                  key={opt.axis}
                  type="button"
                  className={
                    clipping.axis === opt.axis ? 'chip-btn active' : 'chip-btn'
                  }
                  onClick={() =>
                    setClipping({
                      enabled: true,
                      axis: opt.axis,
                    })
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {activeAxisMeta.description}
            </span>
          </div>

          <div className="layer-control-row">
            <div className="layer-control-header">
              <span>Kedalaman Sayatan</span>
              <span
                style={{
                  fontSize: 11.5,
                  color: 'var(--accent-light)',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {slicePercent > 0 ? `+${slicePercent}%` : `${slicePercent}%`}
              </span>
            </div>
            <input
              type="range"
              className="opacity-slider"
              aria-label="Kedalaman Posisi Sayatan"
              min={-100}
              max={100}
              step={2}
              value={slicePercent}
              onChange={(e) =>
                setClipping({
                  enabled: true,
                  offset: Number(e.target.value) / 100,
                })
              }
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
              checked={clipping.showGuidePlane}
              onChange={(e) =>
                setClipping({ showGuidePlane: e.target.checked })
              }
            />
            <span>Tampilkan garis bidang potong</span>
          </label>
        </section>

        {/* Sub-Structure Breakdown List */}
        <section
          className="glass-panel section-card"
          style={{ flex: 1, minHeight: 220 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <h2 style={{ fontSize: 15 }}>
              Bagian Dalam ({organ.subStructures.length})
            </h2>
            {selectedSubStructureId && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleSelectSubStructure(null)}
              >
                Tampilkan Utuh
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              overflowY: 'auto',
              maxHeight: 260,
              paddingRight: 2,
            }}
          >
            {groupedSubStructures.map(([kategori, items]) => (
              <div
                key={kategori}
                style={{ display: 'flex', flexDirection: 'column', gap: 5 }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {kategori}
                </div>
                {items.map((sub) => {
                  const isSelected = sub.id === selectedSubStructureId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      className={
                        isSelected ? 'btn btn-primary btn-sm' : 'btn btn-sm'
                      }
                      style={{
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        borderLeft: `3px solid ${sub.warnaDasar}`,
                      }}
                      onClick={() => handleSelectSubStructure(sub.id)}
                    >
                      <span style={{ fontWeight: 600 }}>{sub.namaID}</span>
                      <span
                        style={{
                          fontSize: 11,
                          opacity: 0.78,
                          fontStyle: 'italic',
                        }}
                      >
                        {sub.namaLatin}
                      </span>
                    </button>
                  );
                })}
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
          <button
            type="button"
            className="btn btn-primary btn-sm pointer-auto"
            onClick={handleReturnToWholeBody}
          >
            ← Tubuh Utuh
          </button>

          <button
            type="button"
            className="btn btn-sm pointer-auto"
            onClick={() => handleSelectSubStructure(null)}
          >
            Reset Posisi
          </button>

          <button
            type="button"
            className={
              xrayMode
                ? 'btn btn-primary btn-sm pointer-auto'
                : 'btn btn-sm pointer-auto'
            }
            onClick={() => setXrayMode(!xrayMode)}
            aria-pressed={xrayMode}
          >
            {xrayMode ? 'Sinar-X: Aktif' : 'Mode Sinar-X'}
          </button>

          <button
            type="button"
            className={
              tampilkanLabel3D
                ? 'btn btn-primary btn-sm pointer-auto'
                : 'btn btn-sm pointer-auto'
            }
            onClick={() => setTampilkanLabel3D(!tampilkanLabel3D)}
            aria-pressed={tampilkanLabel3D}
          >
            {tampilkanLabel3D ? 'Label 3D: Aktif' : 'Label 3D: Mati'}
          </button>
        </div>

        {hoveredSub && (
          <div
            className="glass-panel pointer-auto"
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            <strong>{hoveredSub.namaID}</strong>{' '}
            <em style={{ opacity: 0.78 }}>({hoveredSub.namaLatin})</em>
          </div>
        )}
      </div>

      {/* RIGHT HUD COLUMN: Detail Organ / Sub-Struktur */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Penjelasan Organ dan Bagiannya"
      >
        <section className="glass-panel-strong section-card info-panel-slide">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {system && (
              <span
                className="badge"
                style={{
                  background: 'rgba(12, 23, 38, 0.9)',
                  border: `1px solid ${system.warnaAksen}`,
                  color: system.warnaAksen,
                }}
              >
                {system.namaID}
              </span>
            )}
            <span className="badge badge-anatomis">Model Anatomis 3D</span>
          </div>

          {selectedSub ? (
            <>
              <div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: selectedSub.warnaDasar,
                    marginBottom: 2,
                  }}
                >
                  {organ.namaID} • {selectedSub.kategori}
                </div>
                <h2 style={{ fontSize: 20 }}>{selectedSub.namaID}</h2>
                <p
                  style={{
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: 'var(--accent-light)',
                    marginTop: 2,
                  }}
                >
                  {selectedSub.namaLatin}
                </p>
              </div>

              <p className="muted-text">{selectedSub.ringkasan}</p>

              <div>
                <h3 style={{ fontSize: 13, marginBottom: 5 }}>Fungsi Utama</h3>
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
                  {selectedSub.fungsi.map((fn) => (
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
                  {selectedSub.faktaKlinis}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleSelectSubStructure(selectedSub.id)}
                >
                  Fokus Bagian Ini
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleSelectSubStructure(null)}
                >
                  Organ Utuh
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 style={{ fontSize: 21 }}>{organ.namaID}</h1>
                <p
                  style={{
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: 'var(--accent-light)',
                    marginTop: 2,
                  }}
                >
                  {organ.namaLatin} • {region?.namaID.replace('Wilayah ', '') ?? organ.wilayah}
                </p>
              </div>

              <p className="muted-text">{organ.ringkasan}</p>

              <div>
                <h3 style={{ fontSize: 13, marginBottom: 5 }}>Fungsi Organ</h3>
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
                  {organ.fungsiUtama.map((fn) => (
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
                <strong>Tips Sayatan 3D</strong>
                <p className="muted-text" style={{ marginTop: 4, fontSize: 12 }}>
                  {organ.panduanSayatan}
                </p>
              </div>
            </>
          )}
        </section>
      </aside>
    </div>
  );
}
