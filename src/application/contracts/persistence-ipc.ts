import { z } from 'zod';
import {
  createCourseInputSchema,
  createPaperInputSchema,
} from '@domain/shared/persistence-models';

export const persistenceIpcChannels = {
  coursesList: 'courses:list',
  coursesCreate: 'courses:create',
  papersListByCourse: 'papers:listByCourse',
  papersGetById: 'papers:getById',
  papersCreate: 'papers:create',
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

export const searchQueryPayloadSchema = z.object({
  query: z.string(),
});

export type ListPapersByCoursePayload = z.infer<
  typeof listPapersByCoursePayloadSchema
>;

export type GetPaperByIdPayload = z.infer<typeof getPaperByIdPayloadSchema>;

export type SearchQueryPayload = z.infer<typeof searchQueryPayloadSchema>;

export { createCourseInputSchema, createPaperInputSchema };
