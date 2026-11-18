import { BODY_SYSTEMS } from './systems';
import { BODY_REGIONS } from './regions';
import { ANATOMICAL_STRUCTURES } from './structures';
import { DETAILED_ORGANS } from './organs';
import { CINEMATIC_JOURNEYS } from './journeys';
import { CURRICULUM_MODULES } from '@/content/materi/curriculum';
import { QUIZ_QUESTIONS } from '@/content/kuis/questions';
import type {
  AnatomicalStructure,
  BodyRegion,
  BodySystem,
  CinematicJourney,
  DetailedOrgan,
  JourneyChapter,
  JourneySubtitleCue,
  LayerId,
  OrganSubStructure,
  RegionId,
  SystemId,
} from '@/content/schema/anatomy.schema';

export {
  BODY_SYSTEMS,
  BODY_REGIONS,
  ANATOMICAL_STRUCTURES,
  DETAILED_ORGANS,
  CINEMATIC_JOURNEYS,
  CURRICULUM_MODULES,
  QUIZ_QUESTIONS,
};

const structureByIdMap = new Map<string, AnatomicalStructure>(
  ANATOMICAL_STRUCTURES.map((s) => [s.id, s]),
);

const structureByMeshNodeMap = new Map<string, AnatomicalStructure>();
for (const struct of ANATOMICAL_STRUCTURES) {
  for (const node of struct.meshNodes) {
    structureByMeshNodeMap.set(node, struct);
  }
  if (struct.detailMeshNodes) {
    for (const node of struct.detailMeshNodes) {
      structureByMeshNodeMap.set(node, struct);
    }
  }
}

export function getStructureById(id: string): AnatomicalStructure | undefined {
  return structureByIdMap.get(id);
}

export function getStructureByMeshNode(
  nodeName: string,
): AnatomicalStructure | undefined {
  return structureByMeshNodeMap.get(nodeName);
}

/**
 * Resolves any mesh node in the 3 MVP GLB chunks to its registered AnatomicalStructure,
 * checking explicit node mappings first and then anatomical nomenclature patterns.
 */
export function resolveStructureForMesh(
  nodeName: string,
  layerId?: LayerId,
): AnatomicalStructure | undefined {
  const direct = structureByMeshNodeMap.get(nodeName);
  if (direct) return direct;

  if (layerId === 'rangka') {
    if (/rib|costal/i.test(nodeName)) {
      return structureByIdMap.get('tulang-rusuk-sejati');
    }
    if (/sternum|xiphoid/i.test(nodeName)) {
      return structureByIdMap.get('tulang-dada');
    }
    if (/clavicle|scapula/i.test(nodeName)) {
      return structureByIdMap.get('tulang-selangka-belikat');
    }
    if (
      /humerus|radius|ulna|carpal|metacarpal|scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate|hand/i.test(
        nodeName,
      )
    ) {
      return structureByIdMap.get('tulang-lengan');
    }
    if (/hip bone|ilium|ischium|pubis|sacrum|coccyx|pelvi/i.test(nodeName)) {
      return structureByIdMap.get('gelang-panggul');
    }
    if (
      /femur|patella|tibia|fibula|tarsal|metatarsal|calcaneus|talus|navicular|cuboid|cuneiform|foot|phalanx|phalanges/i.test(
        nodeName,
      )
    ) {
      return structureByIdMap.get('tulang-tungkai-bawah');
    }
    if (/vertebra|atlas|axis|cervical|thoracic|lumbar/i.test(nodeName)) {
      return structureByIdMap.get('ruas-leher-atlas-axis');
    }
    if (
      /mandible|maxilla|tooth|teeth|incisor|canine|premolar|molar|hyoid|zygomatic|nasal|lacrimal|palatine|vomer|concha/i.test(
        nodeName,
      )
    ) {
      return structureByIdMap.get('tulang-rahang-bawah');
    }
    if (
      /parietal|temporal|occipital|sphenoid|ethmoid|malleus|incus|stapes/i.test(
        nodeName,
      )
    ) {
      return structureByIdMap.get('tulang-ubun-ubun');
    }
    return structureByIdMap.get('tulang-dahi');
  }

  if (layerId === 'peredaran-darah') {
    if (/right atrium/i.test(nodeName)) {
      return structureByIdMap.get('serambi-kanan');
    }
    if (/right ventricle/i.test(nodeName)) {
      return structureByIdMap.get('bilik-kanan');
    }
    if (/left atrium/i.test(nodeName)) {
      return structureByIdMap.get('serambi-kiri');
    }
    if (/left ventricle/i.test(nodeName)) {
      return structureByIdMap.get('bilik-kiri');
    }
    if (/valve|leaflet/i.test(nodeName)) {
      return structureByIdMap.get('katup-jantung');
    }
    if (
      /coronary|cardiac vein|interventricular|circumflex artery of heart|marginal/i.test(
        nodeName,
      )
    ) {
      return structureByIdMap.get('arteri-koroner');
    }
    if (/pulmonary/i.test(nodeName)) {
      return structureByIdMap.get('pembuluh-pulmonal');
    }
    if (/vein|vena|jugular|saphenous|azygos|sinus/i.test(nodeName)) {
      return structureByIdMap.get('vena-kava');
    }
    return structureByIdMap.get('aorta');
  }

  if (layerId === 'pernapasan') {
    if (/nasal|nose|sinus/i.test(nodeName)) {
      return structureByIdMap.get('rongga-hidung');
    }
    if (
      /epiglottis|larynx|thyroid|cricoid|arytenoid|corniculate/i.test(nodeName)
    ) {
      return structureByIdMap.get('epiglotis-laring');
    }
    if (/trachea|carina/i.test(nodeName)) {
      return structureByIdMap.get('trakea');
    }
    if (/lobe of right lung/i.test(nodeName)) {
      return structureByIdMap.get('paru-paru-kanan');
    }
    if (/lobe of left lung/i.test(nodeName)) {
      return structureByIdMap.get('paru-paru-kiri');
    }
    return structureByIdMap.get('percabangan-bronkus');
  }

  return undefined;
}

export function getSystemById(id: SystemId): BodySystem | undefined {
  return BODY_SYSTEMS.find((s) => s.id === id);
}

export function getRegionById(id: RegionId): BodyRegion | undefined {
  return BODY_REGIONS.find((r) => r.id === id);
}

export function getStructuresBySystem(
  systemId: SystemId,
): AnatomicalStructure[] {
  return ANATOMICAL_STRUCTURES.filter((s) => s.sistem === systemId);
}

export function getStructuresByRegion(
  regionId: RegionId,
): AnatomicalStructure[] {
  return ANATOMICAL_STRUCTURES.filter((s) => s.wilayah === regionId);
}

const detailedOrganByIdMap = new Map<string, DetailedOrgan>(
  DETAILED_ORGANS.map((o) => [o.id, o]),
);

const detailedOrganByStructureIdMap = new Map<string, DetailedOrgan>();
for (const organ of DETAILED_ORGANS) {
  for (const sid of organ.relatedStructureIds) {
    detailedOrganByStructureIdMap.set(sid, organ);
  }
}

export function getDetailedOrganById(id: string): DetailedOrgan | undefined {
  return detailedOrganByIdMap.get(id);
}

export function getDetailedOrganForStructureId(
  structureId: string,
): DetailedOrgan | undefined {
  return detailedOrganByStructureIdMap.get(structureId);
}

export function resolveSubStructureForOrganMesh(
  organId: string,
  nodeName: string,
): OrganSubStructure | undefined {
  const organ = detailedOrganByIdMap.get(organId);
  if (!organ) return undefined;
  return organ.subStructures.find((sub) => sub.meshNodes.includes(nodeName));
}

const journeyByIdMap = new Map<string, CinematicJourney>(
  CINEMATIC_JOURNEYS.map((j) => [j.id, j]),
);

export function getJourneyById(id: string): CinematicJourney | undefined {
  return journeyByIdMap.get(id);
}

export function getActiveChapterForProgress(
  journey: CinematicJourney,
  progress: number,
): JourneyChapter {
  const clamped = Math.max(0, Math.min(1, progress));
  const found = journey.chapters.find(
    (c, idx) =>
      clamped >= c.tStart &&
      (clamped < c.tEnd || idx === journey.chapters.length - 1),
  );
  return found ?? journey.chapters[0];
}

export function getActiveSubtitleForProgress(
  journey: CinematicJourney,
  progress: number,
): JourneySubtitleCue {
  const clamped = Math.max(0, Math.min(1, progress));
  const found = journey.subtitles.find(
    (s, idx) =>
      clamped >= s.tStart &&
      (clamped < s.tEnd || idx === journey.subtitles.length - 1),
  );
  return found ?? journey.subtitles[0];
}
