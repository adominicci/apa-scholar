import { describe, expect, it } from 'vitest';
import { createEmptyRichTextDocument } from '@domain/shared/entity-helpers';
import type {
  Paper,
  PaperContent,
  PaperMeta,
} from '@domain/shared/persistence-models';
import { buildPaperDraft } from '@application/services/build-paper-draft';

const createPaper = (overrides: Partial<Paper> = {}): Paper => ({
  archivedAt: null,
  courseId: 'course-1',
  createdAt: '2026-03-07T14:00:00.000Z',
  id: 'paper-1',
  language: 'en',
  paperType: 'student',
  status: 'draft',
  templateId: 'apa-student-abstract',
  title: 'Capstone Draft',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperMeta = (overrides: Partial<PaperMeta> = {}): PaperMeta => ({
  abstractEnabled: true,
  authorName: null,
  authorNote: null,
  courseCode: 'PSY-500',
  courseName: 'Research Methods',
  createdAt: '2026-03-07T14:00:00.000Z',
  dueDate: null,
  institution: 'APA University',
  paperId: 'paper-1',
  professorName: 'Dr. Rivera',
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
  bodyDoc: createEmptyRichTextDocument(),
  createdAt: '2026-03-07T14:00:00.000Z',
  paperId: 'paper-1',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

describe('buildPaperDraft', () => {
  it('bundles paper records with derived ghost pages for renderer consumption', () => {
    const draft = buildPaperDraft({
      paper: createPaper(),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta(),
    });

    expect(draft.paper.title).toBe('Capstone Draft');
    expect(draft.paperMeta.courseName).toBe('Research Methods');
    expect(draft.paperContent.bodyDoc).toEqual(createEmptyRichTextDocument());
    expect(draft.ghostPages.map((page) => page.kind)).toEqual([
      'title-page',
      'abstract-page',
      'body-page',
      'references-page',
    ]);
  });
});
