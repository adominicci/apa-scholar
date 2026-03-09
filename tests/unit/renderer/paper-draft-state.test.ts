import { describe, expect, it } from 'vitest';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { buildGhostPageViewModels } from '@domain/papers/ghost-page-view-model';
import type { PaperDraft } from '@domain/papers/paper-draft';
import { getPaperInspectorIssues } from '@renderer/app/paper-draft-state';

const createDraft = (): PaperDraft => {
  const paper: PaperDraft['paper'] = {
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
  };
  const paperContent: PaperDraft['paperContent'] = {
    abstractDoc: { content: [], type: 'doc' },
    bodyDoc: createEmptyBodyEditorDocument(),
    createdAt: '2026-03-07T14:00:00.000Z',
    paperId: 'paper-1',
    updatedAt: '2026-03-07T14:00:00.000Z',
  };
  const paperMeta: PaperDraft['paperMeta'] = {
    abstractEnabled: false,
    authorName: null,
    authorNote: null,
    courseCode: 'ENG-500',
    courseName: 'Research Writing',
    createdAt: '2026-03-07T14:00:00.000Z',
    dueDate: null,
    institution: 'APA University',
    paperId: 'paper-1',
    professorName: 'Dr. Rivera',
    runningHead: null,
    shortTitle: null,
    title: 'Literature Review',
    updatedAt: '2026-03-07T14:00:00.000Z',
  };

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

describe('paper draft state', () => {
  it('appends supplementary issues like suspicious paste warnings to the inspector issue set', () => {
    const issues = getPaperInspectorIssues(createDraft(), [
      {
        autofix: null,
        category: 'advisory',
        code: 'suspicious-paste-warning-0',
        description: 'Embedded media was removed from the pasted content.',
        scope: 'body',
        severity: 'medium',
        suggestedFix: 'Review the cleaned paste preview before inserting it into the paper.',
        title: 'Suspicious pasted formatting detected.',
      },
    ]);

    expect(issues.map((issue) => issue.code)).toContain('suspicious-paste-warning-0');
    expect(issues.map((issue) => issue.code)).toContain('missing-author-name');
  });
});
