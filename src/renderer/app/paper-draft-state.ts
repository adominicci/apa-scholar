import {
  applyPaperMetadataUpdateToDraft,
  getPaperMetadataValidationMessages,
} from '@domain/papers/paper-metadata';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type {
  Paper,
  UpdatePaperMetadataInput,
} from '@domain/shared/persistence-models';

export const applyOptimisticPaperMetadataUpdate = (
  draft: PaperDraft,
  input: UpdatePaperMetadataInput,
): PaperDraft => applyPaperMetadataUpdateToDraft(draft, input);

export const getPaperInspectorValidationMessages = (
  draft: PaperDraft | null,
): string[] =>
  draft ? getPaperMetadataValidationMessages(draft.paper, draft.paperMeta) : [];

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
