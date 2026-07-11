import { describe, expect, it } from 'vitest';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { buildGhostPageViewModels } from '@domain/papers/ghost-page-view-model';
import type { PaperDraft } from '@domain/papers/paper-draft';
import {
  applyOptimisticPaperBodyUpdate,
  applyOptimisticPaperMetadataUpdate,
  getPaperInspectorIssues,
  rebuildGhostPagesWithReferences,
} from '@renderer/app/paper-draft-state';

const spanishStudentTitlePage = [
  'Literature Review',
  'Nombre del Estudiante',
  'Institución',
  'Nombre del Curso',
  'Nombre del profesor',
  'Fecha de entrega',
];

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

const createSpanishDraft = (): PaperDraft => {
  const draft = createDraft();

  return {
    ...draft,
    ghostPages: [],
    paper: {
      ...draft.paper,
      language: 'es',
    },
    paperMeta: {
      ...draft.paperMeta,
      authorName: null,
      courseName: null,
      dueDate: null,
      institution: null,
      professorName: null,
    },
  };
};

const expectSpanishStudentGuidance = (draft: PaperDraft): void => {
  expect(draft.ghostPages[0]?.blocks.map((block) => block.text)).toEqual(
    spanishStudentTitlePage,
  );
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
        suggestedFix:
          'Review the cleaned paste preview before inserting it into the paper.',
        title: 'Suspicious pasted formatting detected.',
      },
    ]);

    expect(issues.map((issue) => issue.code)).toContain(
      'suspicious-paste-warning-0',
    );
    expect(issues.map((issue) => issue.code)).toContain('missing-author-name');
  });

  it('preserves Spanish guidance after an optimistic metadata rebuild', () => {
    const draft = applyOptimisticPaperMetadataUpdate(createSpanishDraft(), {
      shortTitle: 'Borrador',
    });

    expectSpanishStudentGuidance(draft);
  });

  it('preserves Spanish guidance after an optimistic body rebuild', () => {
    const draft = applyOptimisticPaperBodyUpdate(
      createSpanishDraft(),
      createEmptyBodyEditorDocument(),
    );

    expectSpanishStudentGuidance(draft);
  });

  it('preserves Spanish guidance after a reference rebuild', () => {
    const draft = rebuildGhostPagesWithReferences(createSpanishDraft(), []);

    expectSpanishStudentGuidance(draft);
  });
});
