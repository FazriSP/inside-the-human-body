import { create } from 'zustand';
import type { CameraBookmark, Vec3Tuple } from '@/content/schema/anatomy.schema';

export type CameraMode = 'orbit' | 'free-fly' | 'journey' | 'organ-focus';

export type JourneySpeed = 0.5 | 1 | 1.5 | 2;

export interface JourneyPlaybackState {
  activeJourneyId: string | null;
  isPlaying: boolean;
  progress: number; // 0..1
  chapterIndex: number;
  speed: JourneySpeed;
  followCamera: boolean;
}

export interface CameraState {
  mode: CameraMode;
  position: Vec3Tuple;
  target: Vec3Tuple;
  autoRotate: boolean;
  transitionTick: number;
  journey: JourneyPlaybackState;

  setCameraMode: (mode: CameraMode) => void;
  setAutoRotate: (enabled: boolean) => void;
  flyTo: (bookmark: CameraBookmark, mode?: CameraMode) => void;
  resetCamera: () => void;
  setJourneyPlayback: (patch: Partial<JourneyPlaybackState>) => void;
  startJourney: (journeyId: string) => void;
  stopJourney: () => void;
}

export const DEFAULT_CAMERA_BOOKMARK: CameraBookmark = {
  position: [0, 1.08, 2.15],
  target: [0, 0.96, 0],
};

export const useCameraStore = create<CameraState>((set) => ({
  mode: 'orbit',
  position: DEFAULT_CAMERA_BOOKMARK.position,
  target: DEFAULT_CAMERA_BOOKMARK.target,
  autoRotate: true,
  transitionTick: 0,
  journey: {
    activeJourneyId: null,
    isPlaying: false,
    progress: 0,
    chapterIndex: 0,
    speed: 1,
    followCamera: true,
  },

  setCameraMode: (mode) => set({ mode }),
  setAutoRotate: (enabled) => set({ autoRotate: enabled }),
  flyTo: (bookmark, mode) =>
    set((state) => ({
      position: bookmark.position,
      target: bookmark.target,
      mode: mode ?? state.mode,
      autoRotate: mode === 'organ-focus' ? false : state.autoRotate,
      transitionTick: state.transitionTick + 1,
    })),
  resetCamera: () =>
    set((state) => ({
      mode: 'orbit',
      position: DEFAULT_CAMERA_BOOKMARK.position,
      target: DEFAULT_CAMERA_BOOKMARK.target,
      transitionTick: state.transitionTick + 1,
    })),
  setJourneyPlayback: (patch) =>
    set((state) => ({
      journey: {
        ...state.journey,
        ...patch,
        progress:
          patch.progress !== undefined
            ? Math.max(0, Math.min(1, patch.progress))
            : state.journey.progress,
      },
    })),
  startJourney: (journeyId) =>
    set((state) => ({
      mode: 'journey',
      autoRotate: false,
      journey: {
        ...state.journey,
        activeJourneyId: journeyId,
        isPlaying: true,
        progress: 0,
        chapterIndex: 0,
        followCamera: true,
      },
    })),
  stopJourney: () =>
    set((state) => ({
      mode: 'orbit',
      journey: {
        ...state.journey,
        activeJourneyId: null,
        isPlaying: false,
      },
    })),
}));
