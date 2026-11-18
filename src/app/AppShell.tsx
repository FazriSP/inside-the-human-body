import { useEffect, type WheelEvent } from 'react';
import { Outlet } from 'react-router-dom';
import { SceneRoot } from '@/scene/SceneRoot';
import { Navbar } from '@/ui/Navbar';
import { StatusBar } from '@/ui/StatusBar';
import { useSettingsStore } from '@/stores/settingsStore';

export function AppShell() {
  const kurangiGerakan = useSettingsStore((s) => s.kurangiGerakan);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-reduced-motion',
      kurangiGerakan ? 'true' : 'false',
    );
  }, [kurangiGerakan]);

  /**
   * Ensures wheel events over `.pointer-auto` UI cards scroll `.app-foreground`
   * normally even though `.app-foreground` has `pointer-events: none` to let
   * empty viewport regions pass pointer drags through to the 3D Canvas.
   */
  const handleForegroundWheel = (e: WheelEvent<HTMLElement>) => {
    const mainEl = e.currentTarget;
    if (mainEl.scrollHeight <= mainEl.clientHeight) return;

    let node = e.target as HTMLElement | null;
    while (node && node !== mainEl) {
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        node.scrollHeight > node.clientHeight
      ) {
        const canScrollDown =
          e.deltaY > 0 &&
          node.scrollTop + node.clientHeight < node.scrollHeight - 1;
        const canScrollUp = e.deltaY < 0 && node.scrollTop > 0;
        if (canScrollDown || canScrollUp) {
          return;
        }
      }
      node = node.parentElement;
    }

    mainEl.scrollTop += e.deltaY;
  };

  return (
    <div className="app-shell">
      <a href="#konten-utama" className="skip-link pointer-auto">
        Lewati ke Konten Utama
      </a>

      {/* Persistent WebGL Canvas mounted once across all routes */}
      <SceneRoot />

      {/* Top Navigation & Global Controls */}
      <Navbar />

      {/* Route Views */}
      <main
        id="konten-utama"
        className="app-foreground"
        tabIndex={-1}
        aria-label="Konten utama platform pembelajaran anatomi 3D"
        onWheel={handleForegroundWheel}
      >
        <Outlet />
      </main>

      {/* Bottom 3D Telemetry & Structure Status Bar */}
      <StatusBar />
    </div>
  );
}
