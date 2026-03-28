import { z } from 'zod';
import { bodyEditorDocumentSchema } from '@domain/papers/body-editor-document';
import {
  createReferenceInputSchema,
  updateReferenceInputSchema,
} from '@domain/references/reference-entry';
import {
  createCourseInputSchema,
  createPaperInputSchema,
  updatePaperMetadataInputSchema,
} from '@domain/shared/persistence-models';

export const persistenceIpcChannels = {
  coursesList: 'courses:list',
  coursesCreate: 'courses:create',
  papersListByCourse: 'papers:listByCourse',
  papersGetById: 'papers:getById',
  papersCreate: 'papers:create',
  papersUpdateBodyContent: 'papers:updateBodyContent',
  papersUpdateMetadata: 'papers:updateMetadata',
  referencesListByPaper: 'references:listByPaper',
  referencesCreate: 'references:create',
  referencesGetById: 'references:getById',
  referencesUpdate: 'references:update',
  referencesDelete: 'references:delete',
  searchQuery: 'search:query',
} as const;

export type PersistenceIpcChannel =
  (typeof persistenceIpcChannels)[keyof typeof persistenceIpcChannels];

export const listPapersByCoursePayloadSchema = z.object({
  courseId: z.string().trim().min(1, 'Course id is required.'),
});

export const getPaperByIdPayloadSchema = z.object({
  paperId: z.string().trim().min(1, 'Paper id is required.'),
});

export const updatePaperMetadataPayloadSchema = z.object({
  input: updatePaperMetadataInputSchema,
  paperId: z.string().trim().min(1, 'Paper id is required.'),
});

export const updatePaperBodyContentPayloadSchema = z.object({
  bodyDoc: bodyEditorDocumentSchema,
  paperId: z.string().trim().min(1, 'Paper id is required.'),
});

export const listReferencesByPaperPayloadSchema = z.object({
  paperId: z.string().trim().min(1, 'Paper id is required.'),
});

export const getReferenceByIdPayloadSchema = z.object({
  referenceId: z.string().trim().min(1, 'Reference id is required.'),
});

export const updateReferencePayloadSchema = z.object({
  referenceId: z.string().trim().min(1, 'Reference id is required.'),
  input: updateReferenceInputSchema,
});

export const deleteReferencePayloadSchema = z.object({
  referenceId: z.string().trim().min(1, 'Reference id is required.'),
});

export const searchQueryPayloadSchema = z.object({
  query: z.string(),
});

export type ListPapersByCoursePayload = z.infer<
  typeof listPapersByCoursePayloadSchema
>;

export type GetPaperByIdPayload = z.infer<typeof getPaperByIdPayloadSchema>;
export type UpdatePaperMetadataPayload = z.infer<
  typeof updatePaperMetadataPayloadSchema
>;
export type UpdatePaperBodyContentPayload = z.infer<
  typeof updatePaperBodyContentPayloadSchema
>;

export type ListReferencesByPaperPayload = z.infer<typeof listReferencesByPaperPayloadSchema>;
export type GetReferenceByIdPayload = z.infer<typeof getReferenceByIdPayloadSchema>;
export type UpdateReferencePayload = z.infer<typeof updateReferencePayloadSchema>;
export type DeleteReferencePayload = z.infer<typeof deleteReferencePayloadSchema>;
export type SearchQueryPayload = z.infer<typeof searchQueryPayloadSchema>;

export {
  createCourseInputSchema,
  createPaperInputSchema,
  createReferenceInputSchema,
  updatePaperMetadataInputSchema,
};
