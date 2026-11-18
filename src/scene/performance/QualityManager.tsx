import { useEffect } from 'react';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { getGPUTier } from 'detect-gpu';
import { useSettingsStore, type QualityTier } from '@/stores/settingsStore';

export function QualityManager() {
  const applyDetectedHardware = useSettingsStore(
    (s) => s.applyDetectedHardware,
  );
  const degradePerformanceStep = useSettingsStore(
    (s) => s.degradePerformanceStep,
  );

  useEffect(() => {
    let active = true;
    getGPUTier()
      .then((res) => {
        if (!active) return;
        let mapped: QualityTier = 'sedang';
        if (res.tier <= 1 || res.isMobile) {
          mapped = res.tier >= 3 ? 'sedang' : 'rendah';
        } else if (res.tier >= 3) {
          mapped = 'tinggi';
        }
        const label = res.gpu
          ? `${res.gpu} (Tier ${res.tier})`
          : `GPU Tier ${res.tier}`;
        applyDetectedHardware(mapped, label);
      })
      .catch(() => {
        if (!active) return;
        applyDetectedHardware('sedang', 'WebGL2 Standar');
      });

    return () => {
      active = false;
    };
  }, [applyDetectedHardware]);

  return (
    <>
      <PerformanceMonitor
        onDecline={() => {
          degradePerformanceStep();
        }}
      />
      <AdaptiveDpr pixelated />
    </>
  );
}
