import { create } from 'zustand';

export type SimulationModuleId =
  | 'detak-jantung'
  | 'mekanisme-pernapasan'
  | 'aliran-darah';

export type RespirationMechanicMode =
  | 'kombinasi'
  | 'pernapasan-perut'
  | 'pernapasan-dada';

export type CirculationFilterMode =
  | 'ganda-lengkap'
  | 'pulmonal-kecil'
  | 'sistemik-besar';

export interface SimulationState {
  /** Whether the 3D biological simulation engine is actively mounted (/simulasi route) */
  simulationViewActive: boolean;
  activeModule: SimulationModuleId;
  isPlaying: boolean;

  // 1. Detak Jantung (Cardiac Cycle) Parameters
  heartRateBPM: number; // 40..180 BPM
  strokeVolumeMl: number; // 50..110 mL
  showConductionSystem: boolean;

  // 2. Mekanisme Pernapasan (Respiration) Parameters
  respirationAutoCycle: boolean;
  breathingRateRPM: number; // 8..35 breaths/min
  breathingMechanic: RespirationMechanicMode;
  /** Manual inhalation/exhalation slider (-1 = max expiration, 0 = rest, +1 = max inspiration) */
  manualBreathPhase: number;
  showAirflowParticles: boolean;

  // 3. Aliran Darah (Blood Flow) Parameters
  flowSpeedMultiplier: number; // 0.25..2.5
  particleCount: number; // 40..160
  circulationFilter: CirculationFilterMode;
  showVesselGuides: boolean;

  setSimulationViewActive: (active: boolean) => void;
  setActiveModule: (module: SimulationModuleId) => void;
  setIsPlaying: (playing: boolean) => void;
  setHeartRateBPM: (bpm: number) => void;
  setStrokeVolumeMl: (ml: number) => void;
  setShowConductionSystem: (show: boolean) => void;
  setRespirationAutoCycle: (auto: boolean) => void;
  setBreathingRateRPM: (rpm: number) => void;
  setBreathingMechanic: (mode: RespirationMechanicMode) => void;
  setManualBreathPhase: (phase: number) => void;
  setShowAirflowParticles: (show: boolean) => void;
  setFlowSpeedMultiplier: (mult: number) => void;
  setParticleCount: (count: number) => void;
  setCirculationFilter: (filter: CirculationFilterMode) => void;
  setShowVesselGuides: (show: boolean) => void;
  resetSimulationDefaults: () => void;
}

const DEFAULT_SIM_STATE = {
  simulationViewActive: false,
  activeModule: 'detak-jantung' as SimulationModuleId,
  isPlaying: true,
  heartRateBPM: 72,
  strokeVolumeMl: 70,
  showConductionSystem: true,
  respirationAutoCycle: true,
  breathingRateRPM: 15,
  breathingMechanic: 'kombinasi' as RespirationMechanicMode,
  manualBreathPhase: 0,
  showAirflowParticles: true,
  flowSpeedMultiplier: 1.0,
  particleCount: 90,
  circulationFilter: 'ganda-lengkap' as CirculationFilterMode,
  showVesselGuides: true,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  ...DEFAULT_SIM_STATE,

  setSimulationViewActive: (active) => set({ simulationViewActive: active }),
  setActiveModule: (module) => set({ activeModule: module }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setHeartRateBPM: (bpm) =>
    set({ heartRateBPM: Math.max(40, Math.min(180, Math.round(bpm))) }),
  setStrokeVolumeMl: (ml) =>
    set({ strokeVolumeMl: Math.max(40, Math.min(120, Math.round(ml))) }),
  setShowConductionSystem: (show) => set({ showConductionSystem: show }),
  setRespirationAutoCycle: (auto) => set({ respirationAutoCycle: auto }),
  setBreathingRateRPM: (rpm) =>
    set({ breathingRateRPM: Math.max(6, Math.min(40, Math.round(rpm))) }),
  setBreathingMechanic: (mode) => set({ breathingMechanic: mode }),
  setManualBreathPhase: (phase) =>
    set({
      respirationAutoCycle: false,
      manualBreathPhase: Math.max(-1, Math.min(1, phase)),
    }),
  setShowAirflowParticles: (show) => set({ showAirflowParticles: show }),
  setFlowSpeedMultiplier: (mult) =>
    set({ flowSpeedMultiplier: Math.max(0.25, Math.min(2.5, mult)) }),
  setParticleCount: (count) =>
    set({ particleCount: Math.max(20, Math.min(180, Math.round(count))) }),
  setCirculationFilter: (filter) => set({ circulationFilter: filter }),
  setShowVesselGuides: (show) => set({ showVesselGuides: show }),
  resetSimulationDefaults: () =>
    set((state) => ({
      ...DEFAULT_SIM_STATE,
      simulationViewActive: state.simulationViewActive,
      activeModule: state.activeModule,
    })),
}));
