import { z } from 'zod';
import type {
  ReferenceAuthor,
  ReferenceType,
} from '@domain/references/reference-entry';

const crossRefContributorSchema = z
  .union([
    z.object({
      family: z.string().trim().min(1),
      given: z.string().trim().optional(),
    }),
    z.object({
      name: z.string().trim().min(1),
    }),
  ])
  .transform((contributor): ReferenceAuthor => {
    if ('family' in contributor) {
      return {
        family: contributor.family,
        given: contributor.given ?? '',
      };
    }

    return {
      family: contributor.name,
      given: '',
      isGroup: true,
    };
  });

const crossRefWorkEnvelopeSchema = z.object({
  message: z.object({
    DOI: z.string().trim().min(1),
    author: z.array(crossRefContributorSchema).min(1),
    'container-title': z.array(z.string().trim().min(1)).optional(),
    edition: z.string().optional(),
    editor: z.array(crossRefContributorSchema).optional(),
    issue: z.string().optional(),
    page: z.string().optional(),
    published: z
      .object({
        'date-parts': z.array(z.array(z.number().int()).min(1)).min(1),
      })
      .optional(),
    publisher: z.string().optional(),
    title: z.array(z.string().trim().min(1)).min(1),
    type: z.string().trim().min(1),
    volume: z.string().optional(),
  }),
});

const crossRefTypeMap: Record<string, ReferenceType> = {
  book: 'book',
  'book-chapter': 'edited-book-chapter',
  'book-part': 'edited-book-chapter',
  'book-section': 'edited-book-chapter',
  'edited-book': 'book',
  'journal-article': 'journal-article',
  monograph: 'book',
  proceedings: 'conference-paper',
  'proceedings-article': 'conference-paper',
  'reference-book': 'book',
  'reference-entry': 'edited-book-chapter',
  report: 'report',
  'report-component': 'report',
};

export interface CrossRefReferenceMetadata {
  authors: ReferenceAuthor[];
  bookTitle?: string;
  conferenceName?: string;
  doi: string;
  edition?: string;
  editors?: ReferenceAuthor[];
  institution?: string;
  issue?: string;
  journalName?: string;
  pages?: string;
  publisher?: string;
  referenceType: ReferenceType;
  title: string;
  volume?: string;
  year: string;
}

export type CrossRefWorkMapResult =
  | { ok: false; reason: 'invalid-response' | 'unsupported-type' }
  | { metadata: CrossRefReferenceMetadata; ok: true };

const invalidResponse = (): CrossRefWorkMapResult => ({
  ok: false,
  reason: 'invalid-response',
});

export const mapCrossRefWork = (input: unknown): CrossRefWorkMapResult => {
  const parsed = crossRefWorkEnvelopeSchema.safeParse(input);

  if (!parsed.success) {
    return invalidResponse();
  }

  const work = parsed.data.message;
  const referenceType = crossRefTypeMap[work.type];

  if (!referenceType) {
    return { ok: false, reason: 'unsupported-type' };
  }

  const containerTitle = work['container-title']?.[0]?.trim() ?? '';
  const publisher = work.publisher?.trim() ?? '';
  const base = {
    authors: work.author,
    doi: `https://doi.org/${work.DOI.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')}`,
    referenceType,
    title: work.title[0]!,
    year: work.published?.['date-parts'][0]?.[0]?.toString() ?? '',
  };

  switch (referenceType) {
    case 'journal-article':
      return containerTitle
        ? {
            metadata: {
              ...base,
              issue: work.issue ?? '',
              journalName: containerTitle,
              pages: work.page ?? '',
              volume: work.volume ?? '',
            },
            ok: true,
          }
        : invalidResponse();
    case 'book':
      return publisher
        ? {
            metadata: {
              ...base,
              edition: work.edition ?? '',
              publisher,
            },
            ok: true,
          }
        : invalidResponse();
    case 'edited-book-chapter': {
      const editors = work.editor ?? [];

      return containerTitle && publisher && editors.length > 0
        ? {
            metadata: {
              ...base,
              bookTitle: containerTitle,
              editors,
              pages: work.page ?? '',
              publisher,
            },
            ok: true,
          }
        : invalidResponse();
    }
    case 'conference-paper':
      return containerTitle
        ? {
            metadata: {
              ...base,
              conferenceName: containerTitle,
            },
            ok: true,
          }
        : invalidResponse();
    case 'report':
      return publisher
        ? {
            metadata: {
              ...base,
              institution: publisher,
            },
            ok: true,
          }
        : invalidResponse();
    case 'website':
      return { ok: false, reason: 'unsupported-type' };
  }
};
