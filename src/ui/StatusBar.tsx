import { usePwaStore } from '@/stores/pwaStore';

/**
 * Unobtrusive connection / update toast notification.
 * Renders nothing during normal online operation so the bottom of the
 * viewport stays completely clean and free of debug telemetry clutter.
 */
export function StatusBar() {
  const isOnline = usePwaStore((s) => s.isOnline);
  const updateAvailable = usePwaStore((s) => s.updateAvailable);
  const applySwUpdate = usePwaStore((s) => s.applySwUpdate);

  if (isOnline && !updateAvailable) {
    return null;
  }

  return (
    <aside
      className="pwa-toast-pill glass-panel pointer-auto"
      aria-label="Status Koneksi dan Pembaruan Aplikasi"
    >
      {!isOnline && (
        <span
          className="badge"
          style={{
            background: 'rgba(245, 158, 11, 0.18)',
            border: '1px solid rgba(251, 191, 36, 0.5)',
            color: '#fbbf24',
          }}
        >
          ● Mode Luring (Offline Cache Aktif)
        </span>
      )}

      {updateAvailable && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ padding: '4px 12px', fontSize: 11.5 }}
          onClick={applySwUpdate}
        >
          Pembaruan Tersedia — Muat Ulang
        </button>
      )}
    </aside>
  );
}
