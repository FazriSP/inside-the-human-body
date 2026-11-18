import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

const memoryFallback = new Map<string, string>();
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(name);
    }
    return memoryFallback.get(name) ?? null;
  },
  setItem: (name, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(name, value);
      return;
    }
    memoryFallback.set(name, value);
  },
  removeItem: (name) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(name);
      return;
    }
    memoryFallback.delete(name);
  },
};

function detectInitialReducedMotion(): boolean {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

export type QualityTier = 'rendah' | 'sedang' | 'tinggi';
export type QualityPreference = 'otomatis' | QualityTier;

export interface SettingsState {
  qualityPreference: QualityPreference;
  detectedTier: QualityTier;
  effectiveTier: QualityTier;
  dpr: number;
  shadowsEnabled: boolean;
  gpuName: string;
  kurangiGerakan: boolean;
  tampilkanLabel3D: boolean;

  setQualityPreference: (pref: QualityPreference) => void;
  applyDetectedHardware: (tier: QualityTier, gpuName: string) => void;
  degradePerformanceStep: () => void;
  setKurangiGerakan: (value: boolean) => void;
  setTampilkanLabel3D: (value: boolean) => void;
}

function tierParams(tier: QualityTier): { dpr: number; shadowsEnabled: boolean } {
  switch (tier) {
    case 'rendah':
      return { dpr: 1, shadowsEnabled: false };
    case 'sedang':
      return { dpr: Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1.25), shadowsEnabled: false };
    case 'tinggi':
      return { dpr: Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1.5 : 1.5), shadowsEnabled: true };
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      qualityPreference: 'otomatis',
      detectedTier: 'sedang',
      effectiveTier: 'sedang',
      dpr: 1.25,
      shadowsEnabled: false,
      gpuName: 'Mendeteksi perangkat...',
      kurangiGerakan: detectInitialReducedMotion(),
      tampilkanLabel3D: true,

      setQualityPreference: (pref) => {
        const resolved = pref === 'otomatis' ? get().detectedTier : pref;
        const params = tierParams(resolved);
        set({
          qualityPreference: pref,
          effectiveTier: resolved,
          ...params,
        });
      },

      applyDetectedHardware: (tier, gpuName) => {
        const pref = get().qualityPreference;
        const resolved = pref === 'otomatis' ? tier : pref;
        const params = tierParams(resolved);
        set({
          detectedTier: tier,
          effectiveTier: resolved,
          gpuName,
          ...params,
        });
      },

      degradePerformanceStep: () => {
        const current = get().effectiveTier;
        if (get().qualityPreference !== 'otomatis') return;
        const nextTier: QualityTier =
          current === 'tinggi' ? 'sedang' : 'rendah';
        const params = tierParams(nextTier);
        set({
          effectiveTier: nextTier,
          ...params,
        });
      },

      setKurangiGerakan: (value) => set({ kurangiGerakan: value }),
      setTampilkanLabel3D: (value) => set({ tampilkanLabel3D: value }),
    }),
    {
      name: 'ithb-settings-v1',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        qualityPreference: state.qualityPreference,
        kurangiGerakan: state.kurangiGerakan,
        tampilkanLabel3D: state.tampilkanLabel3D,
      }),
    },
  ),
);
