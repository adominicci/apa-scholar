import { z } from 'zod';
import { bodyEditorDocumentSchema } from '@domain/papers/body-editor-document';
import {
  supportedLanguages,
  supportedPaperStatuses,
  supportedPaperTypes,
  supportedTemplateIds,
} from '@domain/shared/contracts';

const entityIdSchema = z.string().trim().min(1, 'Entity id is required.');
const isoTimestampSchema = z.string().datetime({ offset: true });
const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .min(1)
  .nullable();

export const languageSchema = z.enum(supportedLanguages, {
  error: (issue) =>
    issue.input === undefined
      ? 'Language is required.'
      : 'Language must be one of the supported values.',
});

export const templateIdSchema = z.enum(supportedTemplateIds, {
  error: (issue) =>
    issue.input === undefined
      ? 'Template is required.'
      : 'Template must be one of the supported values.',
});

export const paperTypeSchema = z.enum(supportedPaperTypes, {
  error: (issue) =>
    issue.input === undefined
      ? 'Paper type is required.'
      : 'Paper type must be one of the supported values.',
});

export const paperStatusSchema = z.enum(supportedPaperStatuses);

export const courseSchema = z.object({
  id: entityIdSchema,
  name: z.string().trim().min(1, 'Course name is required.'),
  code: nullableTrimmedStringSchema,
  professorName: nullableTrimmedStringSchema,
  institution: nullableTrimmedStringSchema,
  semester: nullableTrimmedStringSchema,
  defaultLanguage: languageSchema,
  defaultPaperTemplate: templateIdSchema,
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
  archivedAt: isoTimestampSchema.nullable(),
});

export const createCourseInputSchema = z.object({
  name: z.string().trim().min(1, 'Course name is required.'),
  code: nullableTrimmedStringSchema.optional(),
  professorName: nullableTrimmedStringSchema.optional(),
  institution: nullableTrimmedStringSchema.optional(),
  semester: nullableTrimmedStringSchema.optional(),
  defaultLanguage: languageSchema.optional(),
  defaultPaperTemplate: templateIdSchema.optional(),
});

export const updateCourseInputSchema = createCourseInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one course field must be provided.',
  });

export const paperSchema = z.object({
  id: entityIdSchema,
  courseId: entityIdSchema.nullable(),
  title: z.string().trim().min(1, 'Paper title is required.'),
  templateId: templateIdSchema,
  paperType: paperTypeSchema,
  language: languageSchema,
  status: paperStatusSchema,
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
  archivedAt: isoTimestampSchema.nullable(),
});

export const createPaperInputSchema = z.object({
  courseId: entityIdSchema,
  title: z.string().trim().min(1, 'Paper title is required.'),
  templateId: templateIdSchema.optional(),
  paperType: paperTypeSchema.optional(),
  language: languageSchema.optional(),
});

export const createStoredPaperInputSchema = createPaperInputSchema.extend({
  paperType: paperTypeSchema,
  templateId: templateIdSchema,
  language: languageSchema,
  status: paperStatusSchema,
});

export const updatePaperInputSchema = z
  .object({
    title: z.string().trim().min(1, 'Paper title is required.').optional(),
    language: languageSchema.optional(),
    templateId: templateIdSchema.optional(),
    paperType: paperTypeSchema.optional(),
    status: paperStatusSchema.optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one paper field must be provided.',
  });

export const updatePaperMetadataInputSchema = z
  .object({
    abstractEnabled: z.preprocess((value) => value === 1 || value === true, z.boolean()).optional(),
    authorName: nullableTrimmedStringSchema.optional(),
    authorNote: nullableTrimmedStringSchema.optional(),
    courseCode: nullableTrimmedStringSchema.optional(),
    courseName: nullableTrimmedStringSchema.optional(),
    dueDate: nullableTrimmedStringSchema.optional(),
    institution: nullableTrimmedStringSchema.optional(),
    paperType: paperTypeSchema.optional(),
    professorName: nullableTrimmedStringSchema.optional(),
    runningHead: nullableTrimmedStringSchema.optional(),
    shortTitle: nullableTrimmedStringSchema.optional(),
    title: z.string().trim().min(1, 'Paper title is required.').optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one paper metadata field must be provided.',
  });

export const paperMetaSchema = z.object({
  paperId: entityIdSchema,
  title: z.string().trim().min(1, 'Paper title is required.'),
  shortTitle: nullableTrimmedStringSchema,
  authorName: nullableTrimmedStringSchema,
  institution: nullableTrimmedStringSchema,
  courseName: nullableTrimmedStringSchema,
  courseCode: nullableTrimmedStringSchema,
  professorName: nullableTrimmedStringSchema,
  dueDate: nullableTrimmedStringSchema,
  runningHead: nullableTrimmedStringSchema,
  authorNote: nullableTrimmedStringSchema,
  abstractEnabled: z.preprocess((value) => value === 1 || value === true, z.boolean()),
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
});

export const paperContentSchema = z.object({
  paperId: entityIdSchema,
  abstractDoc: z.record(z.string(), z.unknown()),
  bodyDoc: bodyEditorDocumentSchema,
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
});

export const appSettingsSchema = z.object({
  language: languageSchema,
  debug: z.preprocess((value) => value === 1 || value === true, z.boolean()),
  updatedAt: isoTimestampSchema,
});

export type Course = z.infer<typeof courseSchema>;
export type CreateCourseInput = z.infer<typeof createCourseInputSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseInputSchema>;
export type Paper = z.infer<typeof paperSchema>;
export type CreatePaperInput = z.infer<typeof createPaperInputSchema>;
export type CreateStoredPaperInput = z.infer<typeof createStoredPaperInputSchema>;
export type UpdatePaperInput = z.infer<typeof updatePaperInputSchema>;
export type UpdatePaperMetadataInput = z.infer<typeof updatePaperMetadataInputSchema>;
export type PaperMeta = z.infer<typeof paperMetaSchema>;
export type PaperContent = z.infer<typeof paperContentSchema>;
export type AppSettings = z.infer<typeof appSettingsSchema>;
