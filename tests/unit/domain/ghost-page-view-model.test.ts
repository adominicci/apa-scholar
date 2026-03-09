import { describe, expect, it } from 'vitest';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { createEmptyRichTextDocument } from '@domain/shared/entity-helpers';
import type {
  Paper,
  PaperContent,
  PaperMeta,
} from '@domain/shared/persistence-models';
import { buildGhostPageViewModels } from '@domain/papers/ghost-page-view-model';

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

describe('buildGhostPageViewModels', () => {
  it('creates stable empty ghost pages for a student paper without abstract', () => {
    const pages = buildGhostPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta(),
    });

    expect(pages.map((page) => page.kind)).toEqual([
      'title-page',
      'body-page',
      'references-page',
    ]);
    expect(pages[0]?.blocks.map((block) => block.text)).toContain('Student Name');
    expect(pages[0]?.blocks.map((block) => block.text)).toContain('Due date');
    expect(pages[2]?.blocks.map((block) => block.text)).toContain('References');
  });

  it('inserts the abstract page between title and body for abstract templates', () => {
    const pages = buildGhostPageViewModels({
      paper: createPaper({
        templateId: 'apa-student-abstract',
      }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({
        abstractEnabled: true,
      }),
    });

    expect(pages.map((page) => page.kind)).toEqual([
      'title-page',
      'abstract-page',
      'body-page',
      'references-page',
    ]);
    expect(pages[1]).toMatchObject({
      kind: 'abstract-page',
      title: 'Abstract',
    });
  });

  it('uses metadata titles and professional title-page cues for professional papers', () => {
    const pages = buildGhostPageViewModels({
      paper: createPaper({
        paperType: 'professional',
        templateId: 'apa-professional',
        title: 'Old Draft Title',
      }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({
        abstractEnabled: true,
        authorName: 'Avery Rivera',
        authorNote: 'Department of Psychology',
        institution: 'APA University',
        runningHead: 'FACULTY DRAFT',
        title: 'Faculty Draft',
      }),
    });

    expect(pages.map((page) => page.kind)).toEqual([
      'title-page',
      'abstract-page',
      'body-page',
      'references-page',
    ]);
    expect(pages[0]).toMatchObject({
      header: {
        left: 'FACULTY DRAFT',
        right: '1',
      },
    });
    expect(pages[0]?.blocks.map((block) => block.text)).toEqual([
      'Running head: FACULTY DRAFT',
      'Faculty Draft',
      'Avery Rivera',
      'APA University',
      'Author note',
      'Department of Psychology',
    ]);
    expect(pages[2]?.blocks[0]?.text).toBe('Faculty Draft');
  });
});
