import { z } from 'zod';

export const supportedReferenceTypes = [
  'journal-article',
  'book',
  'edited-book-chapter',
  'website',
  'conference-paper',
  'report',
] as const;

export type ReferenceType = (typeof supportedReferenceTypes)[number];

export const referenceTypeSchema = z.enum(supportedReferenceTypes, {
  error: (issue) =>
    issue.input === undefined
      ? 'Reference type is required.'
      : 'Reference type must be one of the supported values.',
});

export const referenceAuthorSchema = z.object({
  family: z.string().trim().min(1, 'Author family name is required.'),
  given: z.string().trim().min(1, 'Author given name is required.'),
  isGroup: z.boolean().optional(),
});

export type ReferenceAuthor = z.infer<typeof referenceAuthorSchema>;

const baseFieldsSchema = z.object({
  authors: z
    .array(referenceAuthorSchema)
    .min(1, 'At least one author is required.'),
  year: z.string().trim().nullable(),
  title: z.string().trim().min(1, 'Title is required.'),
  doi: z.string().trim().nullable().optional(),
  url: z.string().trim().nullable().optional(),
});

const journalArticleFieldsSchema = baseFieldsSchema.extend({
  journalName: z.string().trim().min(1, 'Journal name is required.'),
  volume: z.string().trim().nullable().optional(),
  issue: z.string().trim().nullable().optional(),
  pages: z.string().trim().nullable().optional(),
});

const bookFieldsSchema = baseFieldsSchema.extend({
  publisher: z.string().trim().min(1, 'Publisher is required.'),
  edition: z.string().trim().nullable().optional(),
});

const editedBookChapterFieldsSchema = baseFieldsSchema.extend({
  bookTitle: z.string().trim().min(1, 'Book title is required.'),
  editors: z
    .array(referenceAuthorSchema)
    .min(1, 'At least one editor is required.'),
  publisher: z.string().trim().min(1, 'Publisher is required.'),
  pages: z.string().trim().nullable().optional(),
  edition: z.string().trim().nullable().optional(),
});

const websiteFieldsSchema = baseFieldsSchema.extend({
  siteName: z.string().trim().nullable().optional(),
  retrievalDate: z.string().trim().nullable().optional(),
});

const conferencePaperFieldsSchema = baseFieldsSchema.extend({
  conferenceName: z.string().trim().min(1, 'Conference name is required.'),
  location: z.string().trim().nullable().optional(),
});

const reportFieldsSchema = baseFieldsSchema.extend({
  institution: z.string().trim().min(1, 'Institution is required.'),
  reportNumber: z.string().trim().nullable().optional(),
});

export const referenceFieldsByType = {
  'journal-article': journalArticleFieldsSchema,
  book: bookFieldsSchema,
  'edited-book-chapter': editedBookChapterFieldsSchema,
  website: websiteFieldsSchema,
  'conference-paper': conferencePaperFieldsSchema,
  report: reportFieldsSchema,
} as const;

export type JournalArticleFields = z.infer<typeof journalArticleFieldsSchema>;
export type BookFields = z.infer<typeof bookFieldsSchema>;
export type EditedBookChapterFields = z.infer<
  typeof editedBookChapterFieldsSchema
>;
export type WebsiteFields = z.infer<typeof websiteFieldsSchema>;
export type ConferencePaperFields = z.infer<typeof conferencePaperFieldsSchema>;
export type ReportFields = z.infer<typeof reportFieldsSchema>;

export type ReferenceFields =
  | JournalArticleFields
  | BookFields
  | EditedBookChapterFields
  | WebsiteFields
  | ConferencePaperFields
  | ReportFields;

const isoTimestampSchema = z.string().datetime({ offset: true });

export const referenceEntrySchema = z.object({
  id: z.string().trim().min(1, 'Reference id is required.'),
  paperId: z.string().trim().min(1, 'Paper id is required.'),
  referenceType: referenceTypeSchema,
  fields: z.record(z.string(), z.unknown()),
  sortKey: z.string(),
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
});

export type ReferenceEntry = z.infer<typeof referenceEntrySchema>;

export const createReferenceInputSchema = z.object({
  paperId: z.string().trim().min(1, 'Paper id is required.'),
  referenceType: referenceTypeSchema,
  fields: z.record(z.string(), z.unknown()),
});

export type CreateReferenceInput = z.infer<typeof createReferenceInputSchema>;

export const updateReferenceInputSchema = z
  .object({
    referenceType: referenceTypeSchema.optional(),
    fields: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one reference field must be provided.',
  });

export type UpdateReferenceInput = z.infer<typeof updateReferenceInputSchema>;

export const computeReferenceSortKey = (
  referenceType: ReferenceType,
  fields: Record<string, unknown>,
): string => {
  const fieldSchema = referenceFieldsByType[referenceType];
  const parsed = fieldSchema.parse(fields);

  const firstAuthor = parsed.authors[0]!;
  const authorKey = firstAuthor.family.toLowerCase();
  const year = parsed.year ?? '9999';
  const title = parsed.title.toLowerCase().replace(/^(a |an |the )/, '');

  return `${authorKey}|${year}|${title}`;
};

export const parseReferenceFields = (
  referenceType: ReferenceType,
  fields: Record<string, unknown>,
): ReferenceFields => {
  const schema = referenceFieldsByType[referenceType];
  return schema.parse(fields) as ReferenceFields;
};
