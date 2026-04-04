import { describe, expect, it } from 'vitest';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { createEmptyRichTextDocument } from '@domain/shared/entity-helpers';
import type { Paper, PaperContent, PaperMeta } from '@domain/shared/persistence-models';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { buildPrintPageViewModels } from '@domain/papers/print-page-view-model';

const createPaper = (overrides: Partial<Paper> = {}): Paper => ({
  archivedAt: null,
  courseId: 'course-1',
  createdAt: '2026-03-07T14:00:00.000Z',
  id: 'paper-1',
  language: 'en',
  paperType: 'student',
  status: 'draft',
  templateId: 'apa-student',
  title: 'Capstone Draft',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperMeta = (overrides: Partial<PaperMeta> = {}): PaperMeta => ({
  abstractEnabled: false,
  authorName: null,
  authorNote: null,
  courseCode: null,
  courseName: null,
  createdAt: '2026-03-07T14:00:00.000Z',
  dueDate: null,
  institution: null,
  paperId: 'paper-1',
  professorName: null,
  runningHead: null,
  shortTitle: null,
  title: 'Capstone Draft',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperContent = (
  overrides: Partial<PaperContent> = {},
): PaperContent => ({
  abstractDoc: createEmptyRichTextDocument(),
  bodyDoc: createEmptyBodyEditorDocument(),
  createdAt: '2026-03-07T14:00:00.000Z',
  paperId: 'paper-1',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createReference = (
  overrides: Partial<ReferenceEntry> = {},
): ReferenceEntry => ({
  id: 'ref-1',
  paperId: 'paper-1',
  referenceType: 'journal-article',
  fields: {
    authors: [{ family: 'Smith', given: 'John' }],
    year: '2020',
    title: 'Test Article',
    journalName: 'Test Journal',
  },
  sortKey: 'smith|2020|test article',
  createdAt: '2026-03-07T14:00:00.000Z',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

describe('print page view model snapshots', () => {
  it('matches student paper snapshot', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent({
        bodyDoc: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Introduction paragraph.' }],
            },
          ],
        },
      }),
      paperMeta: createPaperMeta({
        title: 'Test Paper',
        authorName: 'Jane Doe',
        institution: 'MIT',
      }),
      references: [createReference()],
    });

    expect(pages).toMatchSnapshot();
  });

  it('matches professional paper with abstract snapshot', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper({
        paperType: 'professional',
        templateId: 'apa-professional',
      }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({
        abstractEnabled: true,
        runningHead: 'SHORT',
        title: 'Pro Paper',
      }),
      references: [],
    });

    expect(pages).toMatchSnapshot();
  });
});
