import { abstractEnabledTemplates } from '@domain/shared/contracts';
import type {
  Paper,
  PaperContent,
  PaperMeta,
} from '@domain/shared/persistence-models';

export interface GhostPageBlockViewModel {
  align?: 'center' | 'left';
  id: string;
  kind: 'empty-state' | 'line' | 'section-heading' | 'textarea' | 'title';
  text: string;
}

export interface GhostPageViewModel {
  blocks: GhostPageBlockViewModel[];
  id: string;
  kind: 'abstract-page' | 'body-page' | 'references-page' | 'title-page';
  title: string;
}

const getDisplayValue = (value: string | null, fallback: string): string =>
  value?.trim() ? value : fallback;

const hasAbstractPage = (paper: Paper, paperMeta: PaperMeta): boolean =>
  paperMeta.abstractEnabled || abstractEnabledTemplates.has(paper.templateId);

export const buildGhostPageViewModels = (input: {
  paper: Paper;
  paperContent: PaperContent;
  paperMeta: PaperMeta;
}): GhostPageViewModel[] => {
  const titlePage: GhostPageViewModel = {
    blocks: [
      {
        align: 'center',
        id: 'paper-title',
        kind: 'title',
        text: input.paperMeta.title,
      },
      {
        align: 'center',
        id: 'author-name',
        kind: 'line',
        text: getDisplayValue(input.paperMeta.authorName, 'Student Name'),
      },
      {
        align: 'center',
        id: 'institution',
        kind: 'line',
        text: getDisplayValue(input.paperMeta.institution, 'Institution'),
      },
      {
        align: 'center',
        id: 'course-name',
        kind: 'line',
        text: getDisplayValue(input.paperMeta.courseName, 'Course Name'),
      },
      {
        align: 'center',
        id: 'professor-name',
        kind: 'line',
        text: getDisplayValue(input.paperMeta.professorName, 'Professor name'),
      },
      {
        align: 'center',
        id: 'due-date',
        kind: 'line',
        text: getDisplayValue(input.paperMeta.dueDate, 'Due date'),
      },
    ],
    id: `${input.paper.id}-title-page`,
    kind: 'title-page',
    title: 'Title Page',
  };

  const abstractPage: GhostPageViewModel = {
    blocks: [
      {
        id: 'abstract-heading',
        kind: 'section-heading',
        text: 'Abstract',
      },
      {
        id: 'abstract-textarea',
        kind: 'textarea',
        text: 'Summarize the paper in one concise paragraph once the abstract workflow lands.',
      },
    ],
    id: `${input.paper.id}-abstract-page`,
    kind: 'abstract-page',
    title: 'Abstract',
  };

  const bodyPage: GhostPageViewModel = {
    blocks: [
      {
        id: 'body-heading',
        kind: 'section-heading',
        text: input.paper.title,
      },
      {
        id: 'body-textarea',
        kind: 'textarea',
        text: 'Start your introduction here. This local draft area is temporary until the structured body editor arrives.',
      },
    ],
    id: `${input.paper.id}-body-page`,
    kind: 'body-page',
    title: 'Body Draft',
  };

  const referencesPage: GhostPageViewModel = {
    blocks: [
      {
        id: 'references-heading',
        kind: 'section-heading',
        text: 'References',
      },
      {
        id: 'references-empty-state',
        kind: 'empty-state',
        text: 'References will appear here in alphabetical order once the citation and references milestone is connected.',
      },
    ],
    id: `${input.paper.id}-references-page`,
    kind: 'references-page',
    title: 'References',
  };

  return hasAbstractPage(input.paper, input.paperMeta)
    ? [titlePage, abstractPage, bodyPage, referencesPage]
    : [titlePage, bodyPage, referencesPage];
};
