import { BodyRegionSchema, type BodyRegion } from '@/content/schema/anatomy.schema';

const RAW_REGIONS: BodyRegion[] = [
  {
    id: 'kepala',
    namaID: 'Wilayah Kepala',
    namaLatin: 'Regiones capitis',
    ringkasan:
      'Meliputi tempurung kepala (kranium) dan wajah yang melindungi otak serta memuat indra penglihatan, pendengaran, penciuman, dan pengecapan.',
    glbChunkId: 'za-regions-skin',
    meshNodes: [
      'Frontal region.r',
      'Frontal region.l',
      'Parietal region.r',
      'Parietal region.l',
      'Occipital region.r',
      'Occipital region.l',
      'Temporal region.r',
      'Temporal region.l',
    ],
    kameraFokus: {
      position: [0, 1.62, 0.58],
      target: [0, 1.6, 0],
    },
  },
  {
    id: 'leher',
    namaID: 'Wilayah Leher',
    namaLatin: 'Regiones cervicales',
    ringkasan:
      'Penghubung kepala dan batang tubuh yang dilalui ruas tulang leher, laring, trakea atas, kerongkongan, arteri karotis, dan vena jugularis.',
    glbChunkId: 'za-regions-skin',
    meshNodes: [
      'Posterior region of neck.r',
      'Posterior region of neck.l',
      'Lateral region of neck.r',
      'Lateral region of neck.l',
      'Greater supraclavicular fossa.r',
    ],
    kameraFokus: {
      position: [0, 1.44, 0.55],
      target: [0, 1.43, 0],
    },
  },
  {
    id: 'dada',
    namaID: 'Wilayah Dada (Toraks)',
    namaLatin: 'Regiones thoracicae',
    ringkasan:
      'Rongga dada yang dibatasi tulang dada, 12 pasang tulang rusuk, dan tulang belakang torakal; melindungi jantung, paru-paru, serta pembuluh darah besar.',
    glbChunkId: 'za-regions-skin',
    meshNodes: [
      'Pectoral region.r',
      'Lateral region of thorax.r',
      'Lateral region of thorax.l',
      'Inframammary region.r',
      'Mammary region.r',
    ],
    kameraFokus: {
      position: [0, 1.26, 0.85],
      target: [0, 1.25, 0],
    },
  },
  {
    id: 'perut',
    namaID: 'Wilayah Perut (Abdomen)',
    namaLatin: 'Regiones abdominales',
    ringkasan:
      'Rongga antara diafragma dan panggul yang memuat aorta abdominalis, vena kava inferior, serta organ-organ viseral pencernaan dan ekskresi.',
    glbChunkId: 'za-regions-skin',
    meshNodes: [
      'Epigastric region.r',
      'Epigastric region.l',
      'Umbilical region.r',
      'Lumbar region.r',
      'Lumbar region.l',
    ],
    kameraFokus: {
      position: [0, 1.02, 0.88],
      target: [0, 1.0, 0],
    },
  },
  {
    id: 'panggul',
    namaID: 'Wilayah Panggul (Pelvis)',
    namaLatin: 'Regiones pelvicae',
    ringkasan:
      'Gelang panggul yang dibentuk oleh sepasang tulang panggul (koksa), sakrum, dan tulang ekor untuk meneruskan beban tubuh ke tungkai bawah.',
    glbChunkId: 'za-regions-skin',
    meshNodes: [
      'Sacral region.r',
      'Sacral region.l',
      'Hip region.r',
      'Hip region.l',
      'Gluteal region.r',
    ],
    kameraFokus: {
      position: [0, 0.86, 0.88],
      target: [0, 0.85, 0],
    },
  },
  {
    id: 'anggota-gerak-atas',
    namaID: 'Anggota Gerak Atas',
    namaLatin: 'Membrum superius',
    ringkasan:
      'Meliputi gelang bahu (klavikula dan skapula), lengan atas (humerus), lengan bawah (radius dan ulna), hingga pergelangan dan jari tangan.',
    glbChunkId: 'za-regions-skin',
    meshNodes: [
      'Deltoid region.r',
      'Deltoid region.l',
      'Anterior region of arm.r',
      'Lateral bicipital groove.r',
      'Medial bicipital groove.r',
    ],
    kameraFokus: {
      position: [0.35, 1.15, 1.15],
      target: [0.22, 1.12, 0],
    },
  },
  {
    id: 'anggota-gerak-bawah',
    namaID: 'Anggota Gerak Bawah',
    namaLatin: 'Membrum inferius',
    ringkasan:
      'Tungkai penumpu beban tubuh dan lokomosi yang terdiri atas paha (femur), tempurung lutut (patela), tungkai bawah (tibia dan fibula), serta kaki.',
    glbChunkId: 'za-regions-skin',
    meshNodes: [
      'Hip region.r',
      'Hip region.l',
      'Gluteal fold.r',
      'Gluteal fold.l',
      'Gluteal region.r',
    ],
    kameraFokus: {
      position: [0, 0.48, 1.35],
      target: [0, 0.45, 0],
    },
  },
];

export const BODY_REGIONS: readonly BodyRegion[] = RAW_REGIONS.map((reg) =>
  BodyRegionSchema.parse(reg),
);
