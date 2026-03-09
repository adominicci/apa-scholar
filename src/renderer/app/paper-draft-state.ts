import { buildGhostPageViewModels } from '@domain/papers/ghost-page-view-model';
import {
  applyPaperMetadataUpdateToDraft,
} from '@domain/papers/paper-metadata';
import {
  evaluatePaperIssues,
  type PaperIssue,
} from '@domain/papers/paper-issues';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type {
  Paper,
  UpdatePaperMetadataInput,
} from '@domain/shared/persistence-models';

export const applyOptimisticPaperMetadataUpdate = (
  draft: PaperDraft,
  input: UpdatePaperMetadataInput,
): PaperDraft => applyPaperMetadataUpdateToDraft(draft, input);

export const applyOptimisticPaperBodyUpdate = (
  draft: PaperDraft,
  bodyDoc: BodyEditorDocument,
): PaperDraft => {
  const nextDraft: PaperDraft = {
    ...draft,
    paperContent: {
      ...draft.paperContent,
      bodyDoc,
    },
  };

  return {
    ...nextDraft,
    ghostPages: buildGhostPageViewModels(nextDraft),
  };
};

export const getPaperInspectorIssues = (
  draft: PaperDraft | null,
): PaperIssue[] => (draft ? evaluatePaperIssues(draft) : []);

export const upsertPaperInCourseCollections = (
  coursePapers: Record<string, Paper[]>,
  paper: Paper,
): Record<string, Paper[]> => {
  if (!paper.courseId) {
    return coursePapers;
  }

  return {
    ...coursePapers,
    [paper.courseId]: (coursePapers[paper.courseId] ?? []).map((currentPaper) =>
      currentPaper.id === paper.id ? paper : currentPaper,
    ),
  };
};
