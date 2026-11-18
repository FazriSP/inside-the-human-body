import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { loadManifest, type ManifestEntry, type Variant } from './manifest';
import { buildBvh, disposeBvh, loadGlb, type LoadResult } from './loader';
import { Stage, type BenchResult, type GpuInfo } from './Stage';

export interface SpikeMetrics {
  assetId: string;
  variant: Variant;
  bytes: number;
  gzipBytes: number;
  downloadMs: number;
  parseMs: number;
  bvhMs: number;
  raycastMs: number;
  meshCount: number;
  triangles: number;
  materialCount: number;
  emptyNameCount: number;
  duplicateNameCount: number;
  drawCalls: number;
  renderedTriangles: number;
  sampleNames: string[];
  bench?: BenchResult;
  gpu?: GpuInfo;
}

declare global {
  interface Window {
    __spikeMetrics?: SpikeMetrics;
    __selectAssetVariant?: (assetId: string, variant: Variant, runBench?: boolean) => Promise<void>;
  }
}

export function App() {
  const [manifest, setManifest] = useState<ManifestEntry[]>([]);
  const [assetId, setAssetId] = useState<string>('');
  const [variant, setVariant] = useState<Variant>('opt');
  const [loaded, setLoaded] = useState<LoadResult | null>(null);
  const [loadedKey, setLoadedKey] = useState<string>('');
  const [bvhMs, setBvhMs] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [focusReq, setFocusReq] = useState<number>(0);
  const [benchReq, setBenchReq] = useState<number>(0);
  const [benchResult, setBenchResult] = useState<BenchResult | null>(null);
  const [gpuInfo, setGpuInfo] = useState<GpuInfo | null>(null);
  const [liveCalls, setLiveCalls] = useState<number>(0);
  const [liveTris, setLiveTris] = useState<number>(0);
  const [raycastMs, setRaycastMs] = useState<number>(0);
  const pendingBenchRef = useRef<boolean>(false);

  useEffect(() => {
    loadManifest()
      .then((m) => {
        setManifest(m);
        if (m.length > 0) setAssetId(m[0].id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const currentEntry = useMemo(
    () => manifest.find((m) => m.id === assetId) ?? null,
    [manifest, assetId],
  );
  const currentVariantInfo = useMemo(
    () => currentEntry?.variants.find((v) => v.variant === variant) ?? currentEntry?.variants[0] ?? null,
    [currentEntry, variant],
  );

  useEffect(() => {
    if (!currentEntry || !currentVariantInfo) return;
    let cancelled = false;
    const targetKey = `${currentEntry.id}:${currentVariantInfo.variant}`;
    window.__spikeMetrics = undefined;
    setLoading(true);
    setError(null);
    setBenchResult(null);
    setSelected(null);
    setLiveCalls(0);

    loadGlb(`/models/${currentVariantInfo.file}`)
      .then((res) => {
        if (cancelled) return;
        const bvhTime = buildBvh(res.scene);
        setLoaded((prev) => {
          if (prev) disposeBvh(prev.scene);
          return res;
        });
        setBvhMs(bvhTime);
        setLoadedKey(targetKey);
        setLoading(false);
        if (pendingBenchRef.current) {
          pendingBenchRef.current = false;
          setTimeout(() => setBenchReq((n) => n + 1), 150);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentEntry, currentVariantInfo]);

  useEffect(() => {
    if (!loaded || !currentEntry || !currentVariantInfo) return;
    const expectedKey = `${currentEntry.id}:${currentVariantInfo.variant}`;
    if (loadedKey !== expectedKey) return;
    window.__spikeMetrics = {
      assetId: currentEntry.id,
      variant: currentVariantInfo.variant,
      bytes: loaded.bytes,
      gzipBytes: currentVariantInfo.gzipBytes,
      downloadMs: +loaded.downloadMs.toFixed(2),
      parseMs: +loaded.parseMs.toFixed(2),
      bvhMs: +bvhMs.toFixed(2),
      raycastMs: +raycastMs.toFixed(3),
      meshCount: loaded.meshCount,
      triangles: loaded.triangles,
      materialCount: loaded.materialCount,
      emptyNameCount: loaded.emptyNameCount,
      duplicateNameCount: loaded.duplicateNameCount,
      drawCalls: liveCalls,
      renderedTriangles: liveTris,
      sampleNames: loaded.meshNames.slice(0, 15),
      bench: benchResult ?? undefined,
      gpu: gpuInfo ?? undefined,
    };
  }, [loaded, loadedKey, currentEntry, currentVariantInfo, bvhMs, raycastMs, liveCalls, liveTris, benchResult, gpuInfo]);

  useEffect(() => {
    window.__selectAssetVariant = async (targetAsset: string, targetVariant: Variant, runBench = false) => {
      window.__spikeMetrics = undefined;
      pendingBenchRef.current = runBench;
      setAssetId((prevAsset) => {
        setVariant((prevVar) => {
          if (prevAsset === targetAsset && prevVar === targetVariant && runBench) {
            pendingBenchRef.current = false;
            setTimeout(() => setBenchReq((n) => n + 1), 100);
          }
          return targetVariant;
        });
        return targetAsset;
      });
    };
  }, []);

  const filteredNames = useMemo(() => {
    if (!loaded) return [];
    const q = search.trim().toLowerCase();
    const unique = Array.from(new Set(loaded.meshNames));
    return q ? unique.filter((n) => n.toLowerCase().includes(q)).slice(0, 80) : unique.slice(0, 80);
  }, [loaded, search]);

  return (
    <div className="spike-layout">
      <aside className="spike-sidebar">
        <header className="spike-header">
          <span className="badge-phase">FASE 0 — VALIDASI ASET 3D</span>
          <h1>INSIDE THE HUMAN BODY</h1>
          <p className="subtitle">Pengujian Muat GLB, Pemisahan Struktur, &amp; Performa WebGL</p>
        </header>

        <section className="panel-section">
          <label className="field-label" htmlFor="select-asset">Pilih Model Anatomi</label>
          <select
            id="select-asset"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            disabled={loading}
          >
            {manifest.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>

          <div className="variant-tabs" role="group" aria-label="Varian Optimasi">
            {(['raw', 'opt', 'lite'] as Variant[]).map((v) => (
              <button
                key={v}
                type="button"
                className={variant === v ? 'tab-btn active' : 'tab-btn'}
                onClick={() => setVariant(v)}
                disabled={loading}
              >
                {v === 'raw' ? 'Asli (Raw)' : v === 'opt' ? 'Meshopt (Opt)' : 'Ringan (Lite)'}
              </button>
            ))}
          </div>

          {currentEntry && (
            <div className="meta-box">
              <div><strong>Sumber:</strong> {currentEntry.source}</div>
              <div><strong>Lisensi:</strong> {currentEntry.license}</div>
              <div>
                <strong>Kategori:</strong>{' '}
                <span className={currentEntry.accuracy === 'anatomis' ? 'tag-anatomis' : 'tag-skematis'}>
                  {currentEntry.accuracy === 'anatomis' ? 'Model Anatomis Terukur' : 'Ilustrasi Skematis'}
                </span>
              </div>
            </div>
          )}
        </section>

        {error && <div className="error-banner">Galat: {error}</div>}
        {loading && <div className="loading-banner">Memuat dan mendekode model 3D...</div>}

        {loaded && currentVariantInfo && (
          <section className="panel-section metrics-grid" data-testid="metrics-ready">
            <div className="metric-card">
              <span className="metric-label">Ukuran File (Gzip)</span>
              <span className="metric-val">
                {(loaded.bytes / 1e6).toFixed(2)} MB ({(currentVariantInfo.gzipBytes / 1e6).toFixed(2)} MB)
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Parse / BVH / Raycast</span>
              <span className="metric-val">
                {loaded.parseMs.toFixed(0)} / {bvhMs.toFixed(0)} / {raycastMs.toFixed(2)} ms
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Objek Mesh / Material</span>
              <span className="metric-val">
                {loaded.meshCount.toLocaleString('id-ID')} / {loaded.materialCount}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Total Segitiga</span>
              <span className="metric-val">{loaded.triangles.toLocaleString('id-ID')}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Draw Calls Aktif</span>
              <span className="metric-val">{liveCalls.toLocaleString('id-ID')}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Nama Kosong / Duplikat</span>
              <span className="metric-val">
                {loaded.emptyNameCount} / {loaded.duplicateNameCount}
              </span>
            </div>
          </section>
        )}

        <section className="panel-section">
          <div className="action-row">
            <button
              type="button"
              className="primary-btn"
              onClick={() => setBenchReq((n) => n + 1)}
              disabled={!loaded || loading}
            >
              Jalankan Uji Orbit 2.5 Detik
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setFocusReq((n) => n + 1)}
              disabled={!selected}
            >
              Fokus Struktur
            </button>
          </div>

          {benchResult && (
            <div className="bench-box" data-testid="bench-done">
              <div><strong>Rata-rata FPS:</strong> {benchResult.avgFps.toFixed(1)} FPS</div>
              <div><strong>Frame P95 / Terburuk:</strong> {benchResult.p95FrameMs.toFixed(1)} / {benchResult.worstFrameMs.toFixed(1)} ms</div>
              <div><strong>Draw Calls / Segitiga:</strong> {benchResult.drawCalls} / {benchResult.renderedTriangles.toLocaleString('id-ID')}</div>
            </div>
          )}
        </section>

        <section className="panel-section structure-list-section">
          <div className="pick-status">
            <div><strong>Disorot (Hover):</strong> {hovered ?? '—'}</div>
            <div><strong>Dipilih (Klik):</strong> {selected ?? '—'}</div>
          </div>
          <input
            type="search"
            placeholder="Cari nama struktur anatomi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul className="structure-list">
            {filteredNames.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className={selected === name ? 'struct-item selected' : 'struct-item'}
                  onClick={() => {
                    setSelected(name);
                    setFocusReq((n) => n + 1);
                  }}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <main className="spike-viewport">
        {loaded && (
          <Canvas camera={{ fov: 45, position: [0, 1, 2.2] }} gl={{ antialias: true }}>
            <Stage
              result={loaded}
              selected={selected}
              focusRequest={focusReq}
              benchRequest={benchReq}
              onPick={setSelected}
              onHover={setHovered}
              onBenchDone={setBenchResult}
              onGpuInfo={setGpuInfo}
              onRendererInfo={(calls, tris, rcMs) => {
                setLiveCalls(calls);
                setLiveTris(tris);
                setRaycastMs(rcMs);
              }}
            />
          </Canvas>
        )}
        {gpuInfo && (
          <div className="gpu-footer">
            GPU: {gpuInfo.renderer} | Maks Tekstur: {gpuInfo.maxTextureSize}px
          </div>
        )}
      </main>
    </div>
  );
}
