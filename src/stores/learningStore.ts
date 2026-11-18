import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

const memoryFallbackMap = new Map<string, string>();
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(name);
      }
    } catch {
      // fallback to memory
    }
    return memoryFallbackMap.get(name) ?? null;
  },
  setItem: (name, value) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(name, value);
        return;
      }
    } catch {
      // fallback to memory
    }
    memoryFallbackMap.set(name, value);
  },
  removeItem: (name) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(name);
        return;
      }
    } catch {
      // fallback to memory
    }
    memoryFallbackMap.delete(name);
  },
};

export interface LearningBadgeDefinition {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: 'eksplorasi' | 'materi' | 'kuis';
}

export const LEARNING_BADGES: readonly LearningBadgeDefinition[] = [
  {
    id: 'penjelajah-anatomi',
    nama: 'Penjelajah Anatomi 3D',
    deskripsi: 'Menjelajahi minimal 8 struktur anatomi pada kanvas 3D.',
    kategori: 'eksplorasi',
  },
  {
    id: 'pembelajar-tekun',
    nama: 'Pembelajar Tekun Fase F',
    deskripsi: 'Menyelesaikan minimal 3 sub-bab materi pembelajaran.',
    kategori: 'materi',
  },
  {
    id: 'tuntas-kurikulum',
    nama: 'Master Kurikulum Biologi',
    deskripsi: 'Menyelesaikan seluruh 9 sub-bab materi pada ketiga sistem organ.',
    kategori: 'materi',
  },
  {
    id: 'penembak-jitu-3d',
    nama: 'Penunjuk Akurat 3D',
    deskripsi: 'Menjawab benar minimal 3 tantangan Tunjuk pada Model 3D.',
    kategori: 'kuis',
  },
  {
    id: 'beruntun-5',
    nama: 'Konsentrasi Beruntun 5x',
    deskripsi: 'Mencapai 5 jawaban benar berturut-turut dalam kuis.',
    kategori: 'kuis',
  },
  {
    id: 'juara-anatomi',
    nama: 'Juara Evaluasi Anatomi',
    deskripsi: 'Meraih skor akhir evaluasi kuis minimal 80%.',
    kategori: 'kuis',
  },
];

export interface QuizAttemptPayload {
  quizId: string;
  scorePercent: number;
  maxStreak: number;
  point3DCorrectCount: number;
}

export interface LearningState {
  exploredStructureIds: string[];
  completedMateriIds: string[];
  bestQuizScore: Record<string, number>;
  bestStreak: number;
  totalPoint3DCorrect: number;
  totalQuizAttempts: number;
  earnedBadges: string[];

  markStructureExplored: (id: string) => void;
  markMateriCompleted: (id: string) => void;
  toggleMateriCompleted: (id: string) => void;
  recordQuizScore: (quizId: string, scorePercent: number) => void;
  recordQuizSession: (payload: QuizAttemptPayload) => void;
  resetLearningProgress: () => void;
}

function evaluateBadges(state: {
  exploredStructureIds: string[];
  completedMateriIds: string[];
  bestQuizScore: Record<string, number>;
  bestStreak: number;
  totalPoint3DCorrect: number;
  earnedBadges: string[];
}): string[] {
  const badges = new Set<string>(state.earnedBadges);

  if (state.exploredStructureIds.length >= 8) {
    badges.add('penjelajah-anatomi');
  }

  const subBabCount = state.completedMateriIds.filter((id) =>
    id.startsWith('bab-'),
  ).length;
  if (subBabCount >= 3 || state.completedMateriIds.length >= 3) {
    badges.add('pembelajar-tekun');
  }
  if (subBabCount >= 9) {
    badges.add('tuntas-kurikulum');
  }

  if (state.totalPoint3DCorrect >= 3) {
    badges.add('penembak-jitu-3d');
  }
  if (state.bestStreak >= 5) {
    badges.add('beruntun-5');
  }

  const maxScore = Math.max(0, ...Object.values(state.bestQuizScore));
  if (maxScore >= 80) {
    badges.add('juara-anatomi');
  }

  return Array.from(badges);
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      exploredStructureIds: [],
      completedMateriIds: [],
      bestQuizScore: {},
      bestStreak: 0,
      totalPoint3DCorrect: 0,
      totalQuizAttempts: 0,
      earnedBadges: [],

      markStructureExplored: (id) =>
        set((state) => {
          if (state.exploredStructureIds.includes(id)) return state;
          const exploredStructureIds = [...state.exploredStructureIds, id];
          return {
            exploredStructureIds,
            earnedBadges: evaluateBadges({ ...state, exploredStructureIds }),
          };
        }),

      markMateriCompleted: (id) =>
        set((state) => {
          if (state.completedMateriIds.includes(id)) return state;
          const completedMateriIds = [...state.completedMateriIds, id];
          return {
            completedMateriIds,
            earnedBadges: evaluateBadges({ ...state, completedMateriIds }),
          };
        }),

      toggleMateriCompleted: (id) =>
        set((state) => {
          const exists = state.completedMateriIds.includes(id);
          const completedMateriIds = exists
            ? state.completedMateriIds.filter((item) => item !== id)
            : [...state.completedMateriIds, id];
          return {
            completedMateriIds,
            earnedBadges: evaluateBadges({ ...state, completedMateriIds }),
          };
        }),

      recordQuizScore: (quizId, scorePercent) =>
        set((state) => {
          const bestQuizScore = {
            ...state.bestQuizScore,
            [quizId]: Math.max(state.bestQuizScore[quizId] ?? 0, scorePercent),
          };
          return {
            bestQuizScore,
            totalQuizAttempts: state.totalQuizAttempts + 1,
            earnedBadges: evaluateBadges({ ...state, bestQuizScore }),
          };
        }),

      recordQuizSession: ({
        quizId,
        scorePercent,
        maxStreak,
        point3DCorrectCount,
      }) =>
        set((state) => {
          const bestQuizScore = {
            ...state.bestQuizScore,
            [quizId]: Math.max(state.bestQuizScore[quizId] ?? 0, scorePercent),
          };
          const bestStreak = Math.max(state.bestStreak, maxStreak);
          const totalPoint3DCorrect =
            state.totalPoint3DCorrect + point3DCorrectCount;

          return {
            bestQuizScore,
            bestStreak,
            totalPoint3DCorrect,
            totalQuizAttempts: state.totalQuizAttempts + 1,
            earnedBadges: evaluateBadges({
              ...state,
              bestQuizScore,
              bestStreak,
              totalPoint3DCorrect,
            }),
          };
        }),

      resetLearningProgress: () =>
        set({
          exploredStructureIds: [],
          completedMateriIds: [],
          bestQuizScore: {},
          bestStreak: 0,
          totalPoint3DCorrect: 0,
          totalQuizAttempts: 0,
          earnedBadges: [],
        }),
    }),
    {
      name: 'ithb-learning-progress-v1',
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);
