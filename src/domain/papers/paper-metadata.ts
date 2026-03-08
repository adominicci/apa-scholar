import type { PaperDraft, StoredPaperAggregate } from '@domain/papers/paper-draft';
import { buildGhostPageViewModels } from '@domain/papers/ghost-page-view-model';
import type {
  Paper,
  PaperMeta,
  UpdatePaperMetadataInput,
} from '@domain/shared/persistence-models';

const hasText = (value: string | null | undefined): boolean =>
  typeof value === 'string' ? value.trim().length > 0 : false;

export const resolvePaperStructure = (input: {
  abstractEnabled: boolean;
  paperType: Paper['paperType'];
}) => {
  if (input.paperType === 'professional') {
    return {
      abstractEnabled: input.abstractEnabled,
      paperType: 'professional' as const,
      templateId: 'apa-professional' as const,
    };
  }

  return {
    abstractEnabled: input.abstractEnabled,
    paperType: 'student' as const,
    templateId: input.abstractEnabled ? ('apa-student-abstract' as const) : ('apa-student' as const),
  };
};

export const getPaperMetadataValidationMessages = (
  paper: Paper,
  paperMeta: PaperMeta,
): string[] => {
  const messages: string[] = [];

  if (!hasText(paperMeta.title)) {
    messages.push('Title is required.');
  }

  if (!hasText(paperMeta.authorName)) {
    messages.push('Author name is required.');
  }

  if (!hasText(paperMeta.institution)) {
    messages.push('Institution is required.');
  }

  if (paper.paperType === 'professional') {
    if (!hasText(paperMeta.runningHead)) {
      messages.push('Running head is required.');
    }

    return messages;
  }

  if (!hasText(paperMeta.courseName)) {
    messages.push('Course name is required.');
  }

  if (!hasText(paperMeta.professorName)) {
    messages.push('Professor name is required.');
  }

  if (!hasText(paperMeta.dueDate)) {
    messages.push('Due date is required.');
  }

  return messages;
};

export const applyPaperMetadataUpdate = (
  aggregate: StoredPaperAggregate,
  input: UpdatePaperMetadataInput,
): StoredPaperAggregate => {
  const nextPaperType = input.paperType ?? aggregate.paper.paperType;
  const nextAbstractEnabled = input.abstractEnabled ?? aggregate.paperMeta.abstractEnabled;
  const nextStructure = resolvePaperStructure({
    abstractEnabled: nextAbstractEnabled,
    paperType: nextPaperType,
  });
  const nextTitle = input.title ?? aggregate.paperMeta.title;

  return {
    ...aggregate,
    paper: {
      ...aggregate.paper,
      paperType: nextStructure.paperType,
      templateId: nextStructure.templateId,
      title: nextTitle,
    },
    paperMeta: {
      ...aggregate.paperMeta,
      ...input,
      abstractEnabled: nextStructure.abstractEnabled,
      title: nextTitle,
    },
  };
};

export const applyPaperMetadataUpdateToDraft = (
  draft: PaperDraft,
  input: UpdatePaperMetadataInput,
): PaperDraft => {
  const updatedAggregate = applyPaperMetadataUpdate(draft, input);

  return {
    ...updatedAggregate,
    ghostPages: buildGhostPageViewModels(updatedAggregate),
  };
};
