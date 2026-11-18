import { z } from 'zod';

export const SystemIdSchema = z.enum([
  'rangka',
  'peredaran-darah',
  'pernapasan',
]);
export type SystemId = z.infer<typeof SystemIdSchema>;

export const RegionIdSchema = z.enum([
  'kepala',
  'leher',
  'dada',
  'perut',
  'panggul',
  'anggota-gerak-atas',
  'anggota-gerak-bawah',
]);
export type RegionId = z.infer<typeof RegionIdSchema>;

export const LayerIdSchema = z.enum([
  'kulit',
  'rangka',
  'peredaran-darah',
  'pernapasan',
]);
export type LayerId = z.infer<typeof LayerIdSchema>;

export const ModelAccuracySchema = z.enum(['anatomis', 'skematis']);
export type ModelAccuracy = z.infer<typeof ModelAccuracySchema>;

export const GlbChunkIdSchema = z.enum([
  'za-skeletal-full',
  'za-cardiovascular-core',
  'za-respiratory',
  'za-regions-skin',
  'hra-heart',
  'hra-lung',
  'hra-trachea',
  'hra-larynx',
]);
export type GlbChunkId = z.infer<typeof GlbChunkIdSchema>;

export const Vec3TupleSchema = z.tuple([z.number(), z.number(), z.number()]);
export type Vec3Tuple = z.infer<typeof Vec3TupleSchema>;

export const CameraBookmarkSchema = z.object({
  position: Vec3TupleSchema,
  target: Vec3TupleSchema,
});
export type CameraBookmark = z.infer<typeof CameraBookmarkSchema>;

export const BodySystemSchema = z.object({
  id: SystemIdSchema,
  namaID: z.string().min(3),
  namaLatin: z.string().min(3),
  ringkasan: z.string().min(20),
  fungsiUtama: z.array(z.string().min(5)).min(2),
  warnaAksen: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  glbChunkId: GlbChunkIdSchema,
  accuracy: ModelAccuracySchema,
  kurikulumFase: z.string().min(4),
  kameraFokus: CameraBookmarkSchema,
});
export type BodySystem = z.infer<typeof BodySystemSchema>;

export const BodyRegionSchema = z.object({
  id: RegionIdSchema,
  namaID: z.string().min(3),
  namaLatin: z.string().min(3),
  ringkasan: z.string().min(15),
  glbChunkId: GlbChunkIdSchema,
  meshNodes: z.array(z.string().min(1)).min(1),
  kameraFokus: CameraBookmarkSchema,
});
export type BodyRegion = z.infer<typeof BodyRegionSchema>;

export const AnatomicalStructureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  namaID: z.string().min(2),
  namaLatin: z.string().min(2),
  sistem: SystemIdSchema,
  wilayah: RegionIdSchema,
  lapisan: LayerIdSchema,
  glbChunkId: GlbChunkIdSchema,
  detailGlbChunkId: GlbChunkIdSchema.optional(),
  meshNodes: z.array(z.string().min(1)).min(1),
  detailMeshNodes: z.array(z.string().min(1)).optional(),
  accuracy: ModelAccuracySchema,
  ringkasan: z.string().min(20),
  fungsi: z.array(z.string().min(5)).min(1),
  faktaKlinis: z.string().min(10),
  kameraFokus: CameraBookmarkSchema,
});
export type AnatomicalStructure = z.infer<typeof AnatomicalStructureSchema>;

export const DetailedOrganIdSchema = z.enum([
  'jantung',
  'paru-paru',
  'trakea',
  'laring',
]);
export type DetailedOrganId = z.infer<typeof DetailedOrganIdSchema>;

export const OrganSubStructureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  namaID: z.string().min(2),
  namaLatin: z.string().min(2),
  kategori: z.string().min(3),
  meshNodes: z.array(z.string().min(1)).min(1),
  warnaDasar: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  ringkasan: z.string().min(20),
  fungsi: z.array(z.string().min(5)).min(1),
  faktaKlinis: z.string().min(10),
});
export type OrganSubStructure = z.infer<typeof OrganSubStructureSchema>;

export const DetailedOrganSchema = z.object({
  id: DetailedOrganIdSchema,
  namaID: z.string().min(3),
  namaLatin: z.string().min(3),
  sistem: SystemIdSchema,
  wilayah: RegionIdSchema,
  glbChunkId: GlbChunkIdSchema,
  accuracy: ModelAccuracySchema,
  ringkasan: z.string().min(20),
  fungsiUtama: z.array(z.string().min(5)).min(2),
  faktaFisiologi: z.string().min(20),
  panduanSayatan: z.string().min(15),
  relatedStructureIds: z.array(z.string().min(1)).min(1),
  subStructures: z.array(OrganSubStructureSchema).min(2),
});
export type DetailedOrgan = z.infer<typeof DetailedOrganSchema>;

export const BloodOxygenStateSchema = z.enum([
  'deoksigenasi',
  'transisi-alveolus',
  'oksigenasi',
]);
export type BloodOxygenState = z.infer<typeof BloodOxygenStateSchema>;

export const JourneySubtitleCueSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  tStart: z.number().min(0).max(1),
  tEnd: z.number().min(0).max(1),
  teks: z.string().min(10),
  istilahPenting: z.array(z.string().min(2)).min(1),
});
export type JourneySubtitleCue = z.infer<typeof JourneySubtitleCueSchema>;

export const JourneyChapterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nomor: z.number().int().min(1),
  judul: z.string().min(3),
  subjudulLatin: z.string().min(3),
  tStart: z.number().min(0).max(1),
  tEnd: z.number().min(0).max(1),
  structureId: z.string().regex(/^[a-z0-9-]+$/),
  accuracyBadge: ModelAccuracySchema,
  statusDarah: BloodOxygenStateSchema,
  kadarO2Persen: z.number().min(0).max(100),
  kadarCO2MmHg: z.number().min(0).max(100),
  tekananLokal: z.string().min(3),
  ringkasanFisiologi: z.string().min(20),
});
export type JourneyChapter = z.infer<typeof JourneyChapterSchema>;

export const CinematicJourneySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  judul: z.string().min(5),
  subjudulLatin: z.string().min(5),
  sistemTerkait: z.array(SystemIdSchema).min(1),
  durasiDetikDefault: z.number().positive(),
  ringkasan: z.string().min(20),
  catatanTransparansiSkematis: z.string().min(20),
  controlPoints: z.array(Vec3TupleSchema).min(6),
  chapters: z.array(JourneyChapterSchema).min(5),
  subtitles: z.array(JourneySubtitleCueSchema).min(6),
});
export type CinematicJourney = z.infer<typeof CinematicJourneySchema>;
