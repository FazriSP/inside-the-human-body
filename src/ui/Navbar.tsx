import { NavLink } from 'react-router-dom';
import {
  useSettingsStore,
  type QualityPreference,
} from '@/stores/settingsStore';
import { useCameraStore } from '@/stores/cameraStore';

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/eksplorasi', label: 'Eksplorasi 3D', end: false },
  { to: '/materi', label: 'Materi', end: false },
  { to: '/simulasi', label: 'Misi Medis', end: false },
  { to: '/kuis', label: 'Kuis 3D', end: false },
  { to: '/kredit', label: 'Lisensi', end: false },
] as const;

export function Navbar() {
  const qualityPreference = useSettingsStore((s) => s.qualityPreference);
  const effectiveTier = useSettingsStore((s) => s.effectiveTier);
  const setQualityPreference = useSettingsStore((s) => s.setQualityPreference);
  const resetCamera = useCameraStore((s) => s.resetCamera);

  return (
    <header className="top-navbar pointer-auto">
      <div className="brand-group">
        <div className="brand-mark" aria-hidden="true">
          3D
        </div>
        <div>
          <span className="brand-title">INSIDE THE HUMAN BODY</span>
          <span className="brand-subtitle">Laboratorium Anatomi 3D SMA/SMK</span>
        </div>
      </div>

      <nav aria-label="Navigasi Utama">
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="nav-controls">
        <label className="nav-quality-control">
          <span>Kualitas:</span>
          <select
            className="nav-quality-select"
            aria-label="Pilih Kualitas Grafis 3D"
            value={qualityPreference}
            onChange={(e) =>
              setQualityPreference(e.target.value as QualityPreference)
            }
          >
            <option value="otomatis">
              Otomatis ({effectiveTier.toUpperCase()})
            </option>
            <option value="rendah">Rendah (HP)</option>
            <option value="sedang">Sedang (Lab)</option>
            <option value="tinggi">Tinggi (Penuh)</option>
          </select>
        </label>

        <button
          type="button"
          className="btn btn-sm nav-control-btn"
          onClick={resetCamera}
          title="Kembalikan kamera ke posisi awal"
        >
          Reset Kamera
        </button>
      </div>
    </header>
  );
}
