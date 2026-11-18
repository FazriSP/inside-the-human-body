import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ANATOMICAL_STRUCTURES,
  BODY_REGIONS,
  BODY_SYSTEMS,
  CINEMATIC_JOURNEYS,
  CURRICULUM_MODULES,
  DETAILED_ORGANS,
  QUIZ_QUESTIONS,
  getActiveChapterForProgress,
  getActiveSubtitleForProgress,
  getDetailedOrganById,
  getDetailedOrganForStructureId,
  getJourneyById,
  getStructureById,
  getStructureByMeshNode,
  resolveStructureForMesh,
  resolveSubStructureForOrganMesh,
} from '@/content/anatomy';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { useLearningStore } from '@/stores/learningStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePwaStore } from '@/stores/pwaStore';
import type { GlbChunkId } from '@/content/schema/anatomy.schema';

const REPORT_FILE_BY_CHUNK: Record<GlbChunkId, string> = {
  'za-skeletal-full': 'za_skeletal.json',
  'za-cardiovascular-core': 'za_cardiovascular.json',
  'za-respiratory': 'za_visceral.json',
  'za-regions-skin': 'za_regions.json',
  'hra-heart': 'hra_heart.json',
  'hra-lung': 'hra_lung.json',
  'hra-trachea': 'hra_trachea.json',
  'hra-larynx': 'hra_larynx.json',
};

function loadNodeNamesForChunk(chunkId: GlbChunkId): Set<string> {
  const reportPath = resolve(
    'assets-src/reports',
    REPORT_FILE_BY_CHUNK[chunkId],
  );
  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
    meshes: { name: string }[];
  };
  return new Set(report.meshes.map((m) => m.name));
}

describe('Phase 1 Anatomy Registry & GLB Node Mapping', () => {
  const nodeSets = new Map<GlbChunkId, Set<string>>();
  for (const chunkId of Object.keys(REPORT_FILE_BY_CHUNK) as GlbChunkId[]) {
    nodeSets.set(chunkId, loadNodeNamesForChunk(chunkId));
  }

  it('registers all 3 MVP body systems', () => {
    expect(BODY_SYSTEMS.map((s) => s.id)).toEqual([
      'rangka',
      'peredaran-darah',
      'pernapasan',
    ]);
  });

  it('maps every region meshNode to an existing node in za-regions-skin', () => {
    for (const region of BODY_REGIONS) {
      const validNodes = nodeSets.get(region.glbChunkId)!;
      for (const nodeName of region.meshNodes) {
        expect(
          validNodes.has(nodeName),
          `Region ${region.id} references missing mesh node "${nodeName}" in ${region.glbChunkId}`,
        ).toBe(true);
      }
    }
  });

  it('maps every structure meshNode and detailMeshNode to an existing GLB node from Phase 0', () => {
    expect(ANATOMICAL_STRUCTURES.length).toBeGreaterThanOrEqual(20);
    for (const struct of ANATOMICAL_STRUCTURES) {
      expect(getStructureById(struct.id)?.namaID).toBe(struct.namaID);
      const primaryNodes = nodeSets.get(struct.glbChunkId)!;
      for (const nodeName of struct.meshNodes) {
        expect(
          primaryNodes.has(nodeName),
          `Structure ${struct.id} references missing mesh node "${nodeName}" in ${struct.glbChunkId}`,
        ).toBe(true);
        expect(getStructureByMeshNode(nodeName)?.id).toBe(struct.id);
      }

      if (struct.detailGlbChunkId && struct.detailMeshNodes) {
        const detailNodes = nodeSets.get(struct.detailGlbChunkId)!;
        for (const detailNode of struct.detailMeshNodes) {
          expect(
            detailNodes.has(detailNode),
            `Structure ${struct.id} references missing detail node "${detailNode}" in ${struct.detailGlbChunkId}`,
          ).toBe(true);
        }
      }
    }
  });

  it('resolves non-primary anatomical meshes in all 3 MVP systems to valid structures', () => {
    expect(resolveStructureForMesh('Third rib.r', 'rangka')?.id).toBe(
      'tulang-rusuk-sejati',
    );
    expect(resolveStructureForMesh('Calcaneus.l', 'rangka')?.id).toBe(
      'tulang-tungkai-bawah',
    );
    expect(
      resolveStructureForMesh('Circumflex artery of heart', 'peredaran-darah')
        ?.id,
    ).toBe('arteri-koroner');
    expect(
      resolveStructureForMesh(
        'Apical segmental bronchus of right lung (BI)',
        'pernapasan',
      )?.id,
    ).toBe('percabangan-bronkus');
  });

  it('synchronizes sceneStore and cameraStore state transitions for Phase 2 explorer', () => {
    const scene = useSceneStore.getState();
    scene.setXrayMode(true);
    scene.setLayerOpacity('rangka', 0.45);
    scene.selectStructure('serambi-kanan');
    expect(useSceneStore.getState().xrayMode).toBe(true);
    expect(useSceneStore.getState().layerOpacity.rangka).toBe(0.45);
    expect(useSceneStore.getState().selectedStructureId).toBe('serambi-kanan');

    const cam = useCameraStore.getState();
    const targetStruct = getStructureById('serambi-kanan')!;
    cam.flyTo(targetStruct.kameraFokus, 'organ-focus');
    expect(useCameraStore.getState().mode).toBe('organ-focus');
    expect(useCameraStore.getState().autoRotate).toBe(false);

    scene.resetSceneState();
    cam.resetCamera();
    expect(useSceneStore.getState().selectedStructureId).toBeNull();
    expect(useCameraStore.getState().mode).toBe('orbit');
  });

  it('maps 100% of HuBMAP HRA organ sub-structure meshNodes for Phase 3 isolated organ viewer', () => {
    expect(DETAILED_ORGANS.map((o) => o.id)).toEqual([
      'jantung',
      'paru-paru',
      'trakea',
      'laring',
    ]);

    for (const organ of DETAILED_ORGANS) {
      expect(getDetailedOrganById(organ.id)?.namaID).toBe(organ.namaID);
      const validNodes = nodeSets.get(organ.glbChunkId)!;
      const coveredNodes = new Set<string>();

      for (const relId of organ.relatedStructureIds) {
        expect(getStructureById(relId)).toBeDefined();
        expect(getDetailedOrganForStructureId(relId)?.id).toBe(organ.id);
      }

      for (const sub of organ.subStructures) {
        for (const nodeName of sub.meshNodes) {
          expect(
            validNodes.has(nodeName),
            `Organ ${organ.id} sub-structure ${sub.id} references missing mesh node "${nodeName}" in ${organ.glbChunkId}`,
          ).toBe(true);
          expect(resolveSubStructureForOrganMesh(organ.id, nodeName)?.id).toBe(
            sub.id,
          );
          coveredNodes.add(nodeName);
        }
      }

      // Verify 100% of meshes in the HRA organ GLB are mapped to an interactive sub-structure
      for (const rawNode of validNodes) {
        expect(
          coveredNodes.has(rawNode),
          `Unmapped mesh node "${rawNode}" in ${organ.glbChunkId}`,
        ).toBe(true);
      }
    }
  });

  it('manages Phase 3 isolated organ mode and X/Y/Z cross-section clipping state', () => {
    const scene = useSceneStore.getState();
    scene.enterIsolatedOrgan('jantung');
    expect(useSceneStore.getState().isolatedOrganId).toBe('jantung');
    expect(useSceneStore.getState().clipping.enabled).toBe(false);

    scene.selectSubStructure('jantung-katup-mitral');
    expect(useSceneStore.getState().selectedSubStructureId).toBe(
      'jantung-katup-mitral',
    );

    scene.setClipping({
      enabled: true,
      axis: 'x',
      offset: -0.45,
      inverted: true,
    });
    expect(useSceneStore.getState().clipping).toEqual({
      enabled: true,
      axis: 'x',
      offset: -0.45,
      inverted: true,
      showGuidePlane: true,
    });

    // Clamps out-of-range offset values to [-1, 1]
    scene.setClipping({ offset: 3.5 });
    expect(useSceneStore.getState().clipping.offset).toBe(1);

    scene.resetClipping();
    expect(useSceneStore.getState().clipping.enabled).toBe(false);
    expect(useSceneStore.getState().clipping.offset).toBe(0);

    scene.exitIsolatedOrgan();
    expect(useSceneStore.getState().isolatedOrganId).toBeNull();
    expect(useSceneStore.getState().selectedSubStructureId).toBeNull();
  });

  it('validates Phase 4 cinematic journey chapters, subtitles, and playback controls', () => {
    const journey = getJourneyById('perjalanan-sel-darah-merah');
    expect(journey).toBeDefined();
    expect(CINEMATIC_JOURNEYS.length).toBeGreaterThanOrEqual(1);
    expect(journey!.chapters.length).toBe(6);
    expect(journey!.subtitles.length).toBe(12);
    expect(journey!.controlPoints.length).toBeGreaterThanOrEqual(10);

    // Every chapter references a valid registered anatomical structure
    for (const chap of journey!.chapters) {
      expect(getStructureById(chap.structureId)).toBeDefined();
      expect(chap.tEnd).toBeGreaterThan(chap.tStart);
    }

    // Verify alveolar gas-exchange chapter (Bab 5) is explicitly badged 'skematis'
    const chap5 = getActiveChapterForProgress(journey!, 0.72);
    expect(chap5.nomor).toBe(5);
    expect(chap5.accuracyBadge).toBe('skematis');
    expect(chap5.statusDarah).toBe('transisi-alveolus');

    const subAtMid = getActiveSubtitleForProgress(journey!, 0.7);
    expect(subAtMid.teks).toContain('Ilustrasi Skematis');

    // Verify cameraStore journey lifecycle
    const cam = useCameraStore.getState();
    cam.startJourney('perjalanan-sel-darah-merah');
    expect(useCameraStore.getState().mode).toBe('journey');
    expect(useCameraStore.getState().journey.isPlaying).toBe(true);

    cam.setJourneyPlayback({ progress: 1.4, speed: 2 });
    expect(useCameraStore.getState().journey.progress).toBe(1);
    expect(useCameraStore.getState().journey.speed).toBe(2);

    cam.stopJourney();
    expect(useCameraStore.getState().mode).toBe('orbit');
    expect(useCameraStore.getState().journey.activeJourneyId).toBeNull();
  });

  it('validates Phase 4 biological process simulation store parameters and clamping', () => {
    const sim = useSimulationStore.getState();
    sim.setSimulationViewActive(true);
    sim.setActiveModule('mekanisme-pernapasan');
    sim.setHeartRateBPM(220); // clamps to 180
    sim.setBreathingRateRPM(24);
    sim.setManualBreathPhase(0.65);

    const state = useSimulationStore.getState();
    expect(state.simulationViewActive).toBe(true);
    expect(state.activeModule).toBe('mekanisme-pernapasan');
    expect(state.heartRateBPM).toBe(180);
    expect(state.breathingRateRPM).toBe(24);
    expect(state.respirationAutoCycle).toBe(false);
    expect(state.manualBreathPhase).toBe(0.65);

    sim.resetSimulationDefaults();
    sim.setSimulationViewActive(false);
    expect(useSimulationStore.getState().heartRateBPM).toBe(72);
    expect(useSimulationStore.getState().respirationAutoCycle).toBe(true);
  });

  it('validates Phase 5 curriculum modules, sub-chapters, glossary, and 3D deep-links', () => {
    expect(CURRICULUM_MODULES.length).toBe(3);

    for (const mod of CURRICULUM_MODULES) {
      expect(mod.subChapters.length).toBeGreaterThanOrEqual(3);
      expect(mod.glosarium.length).toBeGreaterThanOrEqual(3);

      for (const sub of mod.subChapters) {
        for (const sid of sub.relatedStructureIds) {
          expect(
            getStructureById(sid),
            `Sub-chapter ${sub.id} references missing structure "${sid}"`,
          ).toBeDefined();
        }
        if (sub.deepLinkOrganId) {
          expect(getDetailedOrganById(sub.deepLinkOrganId)).toBeDefined();
        }
      }

      for (const term of mod.glosarium) {
        if (term.structureId) {
          expect(getStructureById(term.structureId)).toBeDefined();
        }
      }
    }
  });

  it('validates Phase 5 multi-format quiz questions (Pilihan Ganda, Tunjuk 3D, Urutkan Alur) & learningStore badges', () => {
    expect(QUIZ_QUESTIONS.length).toBe(15);

    const mcQuestions = QUIZ_QUESTIONS.filter(
      (q) => q.tipe === 'pilihan-ganda',
    );
    const point3DQuestions = QUIZ_QUESTIONS.filter(
      (q) => q.tipe === 'tunjuk-3d',
    );
    const seqQuestions = QUIZ_QUESTIONS.filter(
      (q) => q.tipe === 'urutkan-alur',
    );

    expect(mcQuestions.length).toBe(6);
    expect(point3DQuestions.length).toBe(6);
    expect(seqQuestions.length).toBe(3);

    for (const q of QUIZ_QUESTIONS) {
      expect(getStructureById(q.targetStructureId)).toBeDefined();
      if (q.tipe === 'pilihan-ganda') {
        expect(q.pilihan.some((p) => p.id === q.jawabanBenarId)).toBe(true);
      } else if (q.tipe === 'tunjuk-3d') {
        if (q.modePanggung === 'isolasi-organ') {
          expect(q.organIsolasiId).toBeDefined();
          const organ = getDetailedOrganById(q.organIsolasiId!);
          expect(organ).toBeDefined();
          expect(
            organ!.subStructures.some((s) => s.id === q.targetSubStructureId),
          ).toBe(true);
        }
      } else if (q.tipe === 'urutkan-alur') {
        expect(q.langkahUrut.length).toBeGreaterThanOrEqual(4);
      }
    }

    // Verify learningStore badge calculation & session persistence
    const learning = useLearningStore.getState();
    learning.resetLearningProgress();

    for (const st of ANATOMICAL_STRUCTURES.slice(0, 8)) {
      useLearningStore.getState().markStructureExplored(st.id);
    }
    expect(
      useLearningStore.getState().earnedBadges.includes('penjelajah-anatomi'),
    ).toBe(true);

    for (const mod of CURRICULUM_MODULES) {
      for (const sub of mod.subChapters) {
        useLearningStore.getState().markMateriCompleted(sub.id);
      }
    }
    expect(
      useLearningStore.getState().earnedBadges.includes('pembelajar-tekun'),
    ).toBe(true);
    expect(
      useLearningStore.getState().earnedBadges.includes('tuntas-kurikulum'),
    ).toBe(true);

    useLearningStore.getState().recordQuizSession({
      quizId: 'kuis-semua',
      scorePercent: 93,
      maxStreak: 6,
      point3DCorrectCount: 4,
    });

    const finalState = useLearningStore.getState();
    expect(finalState.bestQuizScore['kuis-semua']).toBe(93);
    expect(finalState.bestStreak).toBe(6);
    expect(finalState.earnedBadges).toEqual(
      expect.arrayContaining([
        'penjelajah-anatomi',
        'pembelajar-tekun',
        'tuntas-kurikulum',
        'penembak-jitu-3d',
        'beruntun-5',
        'juara-anatomi',
      ]),
    );
  });

  it('validates Phase 6 PWA offline manifest, Service Worker cache strategies, pwaStore, and settingsStore accessibility', () => {
    // 1. Validate Web App Manifest & Icons exist in public/
    const manifestRaw = readFileSync(
      resolve('public/manifest.webmanifest'),
      'utf8',
    );
    const manifest = JSON.parse(manifestRaw) as {
      name: string;
      lang: string;
      display: string;
      icons: { src: string; sizes: string }[];
    };
    expect(manifest.name).toContain('INSIDE THE HUMAN BODY');
    expect(manifest.lang).toBe('id');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    expect(readFileSync(resolve('public/icons/icon-192.svg'), 'utf8')).toContain(
      '<svg',
    );
    expect(readFileSync(resolve('public/icons/icon-512.svg'), 'utf8')).toContain(
      '<svg',
    );

    // 2. Validate Service Worker implements CacheFirst for /models/*.glb & StaleWhileRevalidate for runtime assets
    const swSource = readFileSync(resolve('public/sw.js'), 'utf8');
    expect(swSource).toContain('ithb-glb-models-cache-v1');
    expect(swSource).toContain('ithb-runtime-cache-v1');
    expect(swSource).toContain('CacheFirst strategy');
    expect(swSource).toContain('StaleWhileRevalidate strategy');
    expect(swSource).toContain('PRECACHE_LITE_MODELS');

    // 3. Validate pwaStore offline & update transitions
    const pwa = usePwaStore.getState();
    pwa.setOnline(false);
    pwa.setSwRegistered(true);
    pwa.setUpdateAvailable(true);
    pwa.setOfflineLiteReady(true);
    expect(usePwaStore.getState().isOnline).toBe(false);
    expect(usePwaStore.getState().swRegistered).toBe(true);
    expect(usePwaStore.getState().updateAvailable).toBe(true);
    expect(usePwaStore.getState().offlineLiteReady).toBe(true);
    pwa.setOnline(true);
    pwa.setUpdateAvailable(false);

    // 4. Validate settingsStore adaptive quality degradation & reduced-motion toggle
    const settings = useSettingsStore.getState();
    settings.setQualityPreference('otomatis');
    settings.applyDetectedHardware('tinggi', 'NVIDIA GeForce RTX 3060');
    expect(useSettingsStore.getState().effectiveTier).toBe('tinggi');
    expect(useSettingsStore.getState().shadowsEnabled).toBe(true);

    settings.degradePerformanceStep();
    expect(useSettingsStore.getState().effectiveTier).toBe('sedang');
    expect(useSettingsStore.getState().shadowsEnabled).toBe(false);

    settings.setKurangiGerakan(true);
    expect(useSettingsStore.getState().kurangiGerakan).toBe(true);
    settings.setKurangiGerakan(false);
  });
});
