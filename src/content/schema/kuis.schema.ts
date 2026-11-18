import { z } from 'zod';
import {
  CameraBookmarkSchema,
  DetailedOrganIdSchema,
  LayerIdSchema,
  SystemIdSchema,
} from './anatomy.schema';

export const QuizQuestionTypeSchema = z.enum([
  'pilihan-ganda',
  'tunjuk-3d',
  'urutkan-alur',
]);
export type QuizQuestionType = z.infer<typeof QuizQuestionTypeSchema>;

export const QuizDifficultySchema = z.enum([
  'dasar',
  'menengah',
  'analisis-klinis',
]);
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>;

const BaseQuizQuestionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  sistem: SystemIdSchema,
  tingkatKesulitan: QuizDifficultySchema,
  pertanyaan: z.string().min(15),
  targetStructureId: z.string().regex(/^[a-z0-9-]+$/),
  pembahasan: z.string().min(20),
});

export const MultipleChoiceQuestionSchema = BaseQuizQuestionSchema.extend({
  tipe: z.literal('pilihan-ganda'),
  pilihan: z
    .array(
      z.object({
        id: z.string().min(1),
        teks: z.string().min(2),
      }),
    )
    .length(4),
  jawabanBenarId: z.string().min(1),
});
export type MultipleChoiceQuestion = z.infer<
  typeof MultipleChoiceQuestionSchema
>;

export const Point3DQuestionSchema = BaseQuizQuestionSchema.extend({
  tipe: z.literal('tunjuk-3d'),
  modePanggung: z.enum(['tubuh-utuh', 'isolasi-organ']),
  organIsolasiId: DetailedOrganIdSchema.optional(),
  targetSubStructureId: z.string().regex(/^[a-z0-9-]+$/).optional(),
  lapisanAktif: z.array(LayerIdSchema).min(1),
  kameraAwal: CameraBookmarkSchema,
  petunjukVisual: z.string().min(10),
});
export type Point3DQuestion = z.infer<typeof Point3DQuestionSchema>;

export const SequenceOrderQuestionSchema = BaseQuizQuestionSchema.extend({
  tipe: z.literal('urutkan-alur'),
  langkahUrut: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(3),
      }),
    )
    .min(4),
});
export type SequenceOrderQuestion = z.infer<typeof SequenceOrderQuestionSchema>;

export const QuizQuestionSchema = z.discriminatedUnion('tipe', [
  MultipleChoiceQuestionSchema,
  Point3DQuestionSchema,
  SequenceOrderQuestionSchema,
]);
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// ============================================================================
// Structured Learning Center (/materi) Curriculum Schemas
// ============================================================================

export const GlossaryTermSchema = z.object({
  istilahID: z.string().min(2),
  istilahLatin: z.string().min(2),
  definisi: z.string().min(15),
  structureId: z.string().regex(/^[a-z0-9-]+$/).optional(),
});
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;

export const MateriSubChapterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kodeBab: z.string().min(2),
  judul: z.string().min(5),
  subjudulLatin: z.string().min(3),
  ringkasanKonsep: z.string().min(30),
  poinKunci: z.array(z.string().min(10)).min(2),
  aplikasiKlinis: z.string().min(15),
  relatedStructureIds: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
  deepLinkOrganId: DetailedOrganIdSchema.optional(),
  deepLinkSimulasi: z
    .enum(['detak-jantung', 'mekanisme-pernapasan', 'aliran-darah'])
    .optional(),
  deepLinkPerjalanan: z.boolean().optional(),
});
export type MateriSubChapter = z.infer<typeof MateriSubChapterSchema>;

export const CurriculumModuleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  sistem: SystemIdSchema,
  judulModul: z.string().min(5),
  capaianPembelajaran: z.string().min(20),
  estimasiMenit: z.number().int().positive(),
  subChapters: z.array(MateriSubChapterSchema).min(3),
  glosarium: z.array(GlossaryTermSchema).min(3),
});
export type CurriculumModule = z.infer<typeof CurriculumModuleSchema>;
