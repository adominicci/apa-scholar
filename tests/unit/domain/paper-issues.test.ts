import { describe, expect, it } from 'vitest';
import { buildGhostPageViewModels } from '@domain/papers/ghost-page-view-model';
import type { PaperDraft } from '@domain/papers/paper-draft';
import {
  evaluatePaperIssues,
  paperIssueSchema,
} from '@domain/papers/paper-issues';
import type {
  Paper,
  PaperContent,
  PaperMeta,
} from '@domain/shared/persistence-models';

const createPaper = (overrides: Partial<Paper> = {}): Paper => ({
  archivedAt: null,
  courseId: 'course-1',
  createdAt: '2026-03-07T14:00:00.000Z',
  id: 'paper-1',
  language: 'en',
  paperType: 'student',
  status: 'draft',
  templateId: 'apa-student',
  title: 'Literature Review',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createBodyDocument = (content: PaperContent['bodyDoc']['content']): PaperContent['bodyDoc'] => ({
  content,
  type: 'doc',
});

const createPaperMeta = (overrides: Partial<PaperMeta> = {}): PaperMeta => ({
  abstractEnabled: false,
  authorName: 'Andres Dominicci',
  authorNote: null,
  courseCode: 'ENG-500',
  courseName: 'Research Writing',
  createdAt: '2026-03-07T14:00:00.000Z',
  dueDate: 'March 9, 2026',
  institution: 'APA University',
  paperId: 'paper-1',
  professorName: 'Dr. Rivera',
  runningHead: null,
  shortTitle: null,
  title: 'Literature Review',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperContent = (overrides: Partial<PaperContent> = {}): PaperContent => ({
  abstractDoc: { content: [], type: 'doc' },
  bodyDoc: createBodyDocument([
    {
      content: [
        {
          text: 'A grounded first paragraph keeps the body requirement satisfied.',
          type: 'text',
        },
      ],
      type: 'paragraph',
    },
  ]),
  createdAt: '2026-03-07T14:00:00.000Z',
  paperId: 'paper-1',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperDraft = (overrides?: {
  paper?: Partial<Paper>;
  paperContent?: Partial<PaperContent>;
  paperMeta?: Partial<PaperMeta>;
}): PaperDraft => {
  const paper = createPaper(overrides?.paper);
  const paperContent = createPaperContent(overrides?.paperContent);
  const paperMeta = createPaperMeta(overrides?.paperMeta);

  return {
    ghostPages: buildGhostPageViewModels({
      paper,
      paperContent,
      paperMeta,
    }),
    paper,
    paperContent,
    paperMeta,
  };
};

describe('paper issues', () => {
  it('builds high-severity title-page issues for missing required student metadata', () => {
    const issues = evaluatePaperIssues(
      createPaperDraft({
        paperMeta: {
          authorName: ' ',
          courseName: null,
          dueDate: '',
          institution: null,
          professorName: '  ',
        },
      }),
    );

    expect(issues.map((issue) => issue.code)).toEqual([
      'missing-author-name',
      'missing-institution',
      'missing-course-name',
      'missing-professor-name',
      'missing-due-date',
    ]);
    expect(issues.every((issue) => issue.severity === 'high')).toBe(true);
    expect(issues.every((issue) => issue.scope === 'title-page')).toBe(true);
    expect(() => paperIssueSchema.array().parse(issues)).not.toThrow();
  });

  it('flags required ghost-page scaffolds when the draft structure drifts out of sync', () => {
    const draft = createPaperDraft({
      paper: {
        templateId: 'apa-student-abstract',
      },
      paperMeta: {
        abstractEnabled: true,
      },
    });

    const issues = evaluatePaperIssues({
      ...draft,
      ghostPages: draft.ghostPages.filter(
        (page) => page.kind !== 'abstract-page' && page.kind !== 'references-page',
      ),
    });

    expect(issues.map((issue) => issue.code)).toContain('missing-abstract-section');
    expect(issues.map((issue) => issue.code)).toContain('missing-references-section');
  });

  it('adds safe autofixes for professional-only metadata that lingers on student papers', () => {
    const issues = evaluatePaperIssues(
      createPaperDraft({
        paperMeta: {
          authorNote: 'Funded by the writing center.',
          runningHead: 'FACULTY DRAFT',
        },
      }),
    );

    expect(
      issues
        .filter((issue) => issue.autofix !== null)
        .map((issue) => ({
          code: issue.code,
          input: issue.autofix?.input,
          kind: issue.autofix?.kind,
        })),
    ).toEqual([
      {
        code: 'student-paper-running-head',
        input: { runningHead: null },
        kind: 'update-paper-metadata',
      },
      {
        code: 'student-paper-author-note',
        input: { authorNote: null },
        kind: 'update-paper-metadata',
      },
    ]);
  });

  it('surfaces advisory body issues for manual line breaks and skipped heading levels', () => {
    const issues = evaluatePaperIssues(
      createPaperDraft({
        paperContent: {
          bodyDoc: createBodyDocument([
            {
              attrs: {
                level: 1,
              },
              content: [
                {
                  text: 'Methods',
                  type: 'text',
                },
              ],
              type: 'heading',
            },
            {
              attrs: {
                level: 3,
              },
              content: [
                {
                  text: 'Participants',
                  type: 'text',
                },
              ],
              type: 'heading',
            },
            {
              content: [
                {
                  text: 'Line one',
                  type: 'text',
                },
                {
                  type: 'hardBreak',
                },
                {
                  text: 'Line two',
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ]),
        },
      }),
    );

    expect(issues.map((issue) => issue.code)).toContain('manual-line-breaks');
    expect(issues.map((issue) => issue.code)).toContain('heading-level-gap');
    expect(
      issues
        .filter((issue) =>
          issue.code === 'manual-line-breaks' || issue.code === 'heading-level-gap',
        )
        .every((issue) => issue.severity === 'low' && issue.scope === 'body'),
    ).toBe(true);
  });
});
