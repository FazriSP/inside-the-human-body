import { create } from 'zustand';
import type {
  DetailedOrganId,
  LayerId,
  RegionId,
  SystemId,
} from '@/content/schema/anatomy.schema';

export type ClippingAxis = 'x' | 'y' | 'z';

export interface ClippingConfig {
  enabled: boolean;
  axis: ClippingAxis;
  /** Normalized slice position across the organ bounding box: -1 (-100%) to +1 (+100%) */
  offset: number;
  inverted: boolean;
  showGuidePlane: boolean;
}

export interface SceneState {
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  hoveredMeshName: string | null;
  activeSystemFilter: SystemId | 'semua';
  activeRegionFilter: RegionId | 'semua';
  visibleLayers: Record<LayerId, boolean>;
  layerOpacity: Record<LayerId, number>;
  xrayMode: boolean;
  crossSectionEnabled: boolean;
  crossSectionHeight: number;
  isolatedOrganId: DetailedOrganId | null;
  selectedSubStructureId: string | null;
  hoveredSubStructureId: string | null;
  clipping: ClippingConfig;
  loadingChunks: string[];
  loadedChunks: string[];

  selectStructure: (id: string | null) => void;
  hoverStructure: (id: string | null, meshName?: string | null) => void;
  setSystemFilter: (sistem: SystemId | 'semua') => void;
  setRegionFilter: (wilayah: RegionId | 'semua') => void;
  toggleLayer: (layer: LayerId) => void;
  setLayerVisible: (layer: LayerId, visible: boolean) => void;
  setLayerOpacity: (layer: LayerId, opacity: number) => void;
  setXrayMode: (enabled: boolean) => void;
  setCrossSection: (enabled: boolean, height?: number) => void;
  enterIsolatedOrgan: (organId: DetailedOrganId) => void;
  exitIsolatedOrgan: () => void;
  selectSubStructure: (id: string | null) => void;
  hoverSubStructure: (id: string | null, meshName?: string | null) => void;
  setClipping: (patch: Partial<ClippingConfig>) => void;
  resetClipping: () => void;
  markChunkLoading: (chunkKey: string) => void;
  markChunkLoaded: (chunkKey: string) => void;
  resetSceneState: () => void;
}

const DEFAULT_VISIBLE_LAYERS: Record<LayerId, boolean> = {
  kulit: false,
  rangka: true,
  'peredaran-darah': true,
  pernapasan: true,
};

const DEFAULT_LAYER_OPACITY: Record<LayerId, number> = {
  kulit: 0.25,
  rangka: 1.0,
  'peredaran-darah': 1.0,
  pernapasan: 1.0,
};

const DEFAULT_CLIPPING: ClippingConfig = {
  enabled: false,
  axis: 'z',
  offset: 0,
  inverted: false,
  showGuidePlane: true,
};

export const useSceneStore = create<SceneState>((set) => ({
  selectedStructureId: null,
  hoveredStructureId: null,
  hoveredMeshName: null,
  activeSystemFilter: 'semua',
  activeRegionFilter: 'semua',
  visibleLayers: { ...DEFAULT_VISIBLE_LAYERS },
  layerOpacity: { ...DEFAULT_LAYER_OPACITY },
  xrayMode: false,
  crossSectionEnabled: false,
  crossSectionHeight: 1.25,
  isolatedOrganId: null,
  selectedSubStructureId: null,
  hoveredSubStructureId: null,
  clipping: { ...DEFAULT_CLIPPING },
  loadingChunks: [],
  loadedChunks: [],

  selectStructure: (id) => set({ selectedStructureId: id }),
  hoverStructure: (id, meshName = null) =>
    set({ hoveredStructureId: id, hoveredMeshName: meshName }),
  setSystemFilter: (sistem) =>
    set((state) => {
      if (sistem === 'semua') {
        return {
          activeSystemFilter: 'semua',
          visibleLayers: {
            ...state.visibleLayers,
            rangka: true,
            'peredaran-darah': true,
            pernapasan: true,
          },
        };
      }
      return {
        activeSystemFilter: sistem,
        visibleLayers: {
          kulit: state.visibleLayers.kulit,
          rangka: sistem === 'rangka',
          'peredaran-darah': sistem === 'peredaran-darah',
          pernapasan: sistem === 'pernapasan',
        },
      };
    }),
  setRegionFilter: (wilayah) => set({ activeRegionFilter: wilayah }),
  toggleLayer: (layer) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layer]: !state.visibleLayers[layer],
      },
    })),
  setLayerVisible: (layer, visible) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layer]: visible,
      },
    })),
  setLayerOpacity: (layer, opacity) =>
    set((state) => ({
      layerOpacity: {
        ...state.layerOpacity,
        [layer]: Math.max(0.05, Math.min(1, opacity)),
      },
    })),
  setXrayMode: (enabled) => set({ xrayMode: enabled }),
  setCrossSection: (enabled, height) =>
    set((state) => ({
      crossSectionEnabled: enabled,
      crossSectionHeight: height ?? state.crossSectionHeight,
    })),
  enterIsolatedOrgan: (organId) =>
    set({
      isolatedOrganId: organId,
      selectedSubStructureId: null,
      hoveredSubStructureId: null,
      hoveredMeshName: null,
      clipping: { ...DEFAULT_CLIPPING },
    }),
  exitIsolatedOrgan: () =>
    set({
      isolatedOrganId: null,
      selectedSubStructureId: null,
      hoveredSubStructureId: null,
      hoveredMeshName: null,
      clipping: { ...DEFAULT_CLIPPING },
    }),
  selectSubStructure: (id) => set({ selectedSubStructureId: id }),
  hoverSubStructure: (id, meshName = null) =>
    set({ hoveredSubStructureId: id, hoveredMeshName: meshName }),
  setClipping: (patch) =>
    set((state) => ({
      clipping: {
        ...state.clipping,
        ...patch,
        offset:
          patch.offset !== undefined
            ? Math.max(-1, Math.min(1, patch.offset))
            : state.clipping.offset,
      },
    })),
  resetClipping: () =>
    set({
      clipping: { ...DEFAULT_CLIPPING },
    }),
  markChunkLoading: (chunkKey) =>
    set((state) =>
      state.loadingChunks.includes(chunkKey)
        ? state
        : { loadingChunks: [...state.loadingChunks, chunkKey] },
    ),
  markChunkLoaded: (chunkKey) =>
    set((state) => ({
      loadingChunks: state.loadingChunks.filter((k) => k !== chunkKey),
      loadedChunks: state.loadedChunks.includes(chunkKey)
        ? state.loadedChunks
        : [...state.loadedChunks, chunkKey],
    })),
  resetSceneState: () =>
    set((state) => ({
      selectedStructureId: null,
      hoveredStructureId: null,
      hoveredMeshName: null,
      activeSystemFilter: 'semua',
      activeRegionFilter: 'semua',
      visibleLayers: { ...DEFAULT_VISIBLE_LAYERS },
      layerOpacity: { ...DEFAULT_LAYER_OPACITY },
      xrayMode: false,
      crossSectionEnabled: false,
      crossSectionHeight: 1.25,
      isolatedOrganId: null,
      selectedSubStructureId: null,
      hoveredSubStructureId: null,
      clipping: { ...DEFAULT_CLIPPING },
      loadingChunks: state.loadingChunks,
      loadedChunks: state.loadedChunks,
    })),
}));
