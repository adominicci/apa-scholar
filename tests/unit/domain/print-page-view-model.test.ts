import { describe, expect, it } from 'vitest';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { createEmptyRichTextDocument } from '@domain/shared/entity-helpers';
import type {
  Paper,
  PaperContent,
  PaperMeta,
} from '@domain/shared/persistence-models';
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

describe('buildPrintPageViewModels', () => {
  it('builds title, body, and references pages for a student paper', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta(),
    });

    expect(pages.map((p) => p.kind)).toEqual([
      'title-page',
      'body-page',
      'references-page',
    ]);
  });

  it('includes abstract page when enabled', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper({ templateId: 'apa-student-abstract' }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({ abstractEnabled: true }),
    });

    expect(pages.map((p) => p.kind)).toEqual([
      'title-page',
      'abstract-page',
      'body-page',
      'references-page',
    ]);
  });

  it('uses body-html kind instead of body-editor', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent({
        bodyDoc: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
          ],
        },
      }),
      paperMeta: createPaperMeta(),
    });

    const bodyPage = pages.find((p) => p.kind === 'body-page')!;
    const bodyBlock = bodyPage.blocks.find((b) => b.kind === 'body-html');
    expect(bodyBlock).toBeDefined();
    expect(bodyBlock!.html).toContain('<p>Hello</p>');
  });

  it('uses reference-entry kind with HTML containing italic segments', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta(),
      references: [createReference()],
    });

    const refsPage = pages.find((p) => p.kind === 'references-page')!;
    const refBlock = refsPage.blocks.find((b) => b.kind === 'reference-entry');
    expect(refBlock).toBeDefined();
    expect(refBlock!.html).toContain('<em>');
  });

  it('adds running head for professional papers', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper({ paperType: 'professional' }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({ runningHead: 'SHORT TITLE' }),
    });

    expect(pages[0]!.header.left).toBe('SHORT TITLE');
  });

  it('numbers pages sequentially', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper({ templateId: 'apa-student-abstract' }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({ abstractEnabled: true }),
    });

    expect(pages.map((p) => p.header.right)).toEqual(['1', '2', '3', '4']);
  });

  it('omits empty-state and textarea blocks', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta(),
    });

    const allBlocks = pages.flatMap((p) => p.blocks);
    expect(
      allBlocks.some(
        (b) =>
          (b as { kind: string }).kind === 'empty-state' ||
          (b as { kind: string }).kind === 'textarea',
      ),
    ).toBe(false);
  });
});
