import { BodySystemSchema, type BodySystem } from '@/content/schema/anatomy.schema';

const RAW_SYSTEMS: BodySystem[] = [
  {
    id: 'rangka',
    namaID: 'Sistem Rangka',
    namaLatin: 'Systema skeletale',
    ringkasan:
      'Susunan 206 tulang dan sendi yang menopang postur serta melindungi organ dalam tubuh.',
    fungsiUtama: [
      'Menopang bentuk dan postur tubuh',
      'Melindungi otak, jantung, dan paru-paru',
      'Membentuk sel darah merah di sumsum tulang',
    ],
    warnaAksen: '#e8dfd1',
    glbChunkId: 'za-skeletal-full',
    accuracy: 'anatomis',
    kurikulumFase: 'Biologi SMA/SMK • Fase F',
    kameraFokus: {
      position: [0, 1.0, 2.35],
      target: [0, 0.9, 0],
    },
  },
  {
    id: 'peredaran-darah',
    namaID: 'Sistem Peredaran Darah',
    namaLatin: 'Systema cardiovasculare',
    ringkasan:
      'Jantung dan pembuluh darah yang memompa oksigen serta nutrisi ke seluruh tubuh.',
    fungsiUtama: [
      'Memompa darah ke paru-paru dan seluruh tubuh',
      'Mengedarkan oksigen, nutrisi, dan hormon',
      'Menjaga suhu dan keseimbangan tubuh',
    ],
    warnaAksen: '#fb7185',
    glbChunkId: 'za-cardiovascular-core',
    accuracy: 'anatomis',
    kurikulumFase: 'Biologi SMA/SMK • Fase F',
    kameraFokus: {
      position: [0, 1.25, 1.35],
      target: [0, 1.2, 0],
    },
  },
  {
    id: 'pernapasan',
    namaID: 'Sistem Pernapasan',
    namaLatin: 'Systema respiratorium',
    ringkasan:
      'Saluran napas dan paru-paru untuk menghirup oksigen dan membuang karbon dioksida.',
    fungsiUtama: [
      'Memasukkan oksigen dan membuang CO₂',
      'Menyaring serta melembapkan udara yang masuk',
      'Menghasilkan suara melalui pita suara di laring',
    ],
    warnaAksen: '#14b8a6',
    glbChunkId: 'za-respiratory',
    accuracy: 'anatomis',
    kurikulumFase: 'Biologi SMA/SMK • Fase F',
    kameraFokus: {
      position: [0, 1.32, 0.95],
      target: [0, 1.3, 0],
    },
  },
];

export const BODY_SYSTEMS: readonly BodySystem[] = RAW_SYSTEMS.map((sys) =>
  BodySystemSchema.parse(sys),
);
