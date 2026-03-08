import { deserializeBodyEditorDocument } from '@domain/papers/body-editor-serialization';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import { abstractEnabledTemplates } from '@domain/shared/contracts';
import type {
  Paper,
  PaperContent,
  PaperMeta,
} from '@domain/shared/persistence-models';

export interface GhostPageBlockViewModel {
  align?: 'center' | 'left';
  document?: BodyEditorDocument;
  id: string;
  kind: 'body-editor' | 'empty-state' | 'line' | 'section-heading' | 'textarea' | 'title';
  text: string;
}

export interface GhostPageViewModel {
  blocks: GhostPageBlockViewModel[];
  header: {
    left?: string;
    right: string;
  };
  id: string;
  kind: 'abstract-page' | 'body-page' | 'references-page' | 'title-page';
  title: string;
}

const getDisplayValue = (value: string | null, fallback: string): string =>
  value?.trim() ? value : fallback;

const hasAbstractPage = (paper: Paper, paperMeta: PaperMeta): boolean =>
  paperMeta.abstractEnabled || abstractEnabledTemplates.has(paper.templateId);

const getPageHeader = (
  paper: Paper,
  paperMeta: PaperMeta,
  pageNumber: number,
): GhostPageViewModel['header'] => ({
  left:
    paper.paperType === 'professional'
      ? getDisplayValue(paperMeta.runningHead, 'Short title')
      : undefined,
  right: `${pageNumber}`,
});

export const buildGhostPageViewModels = (input: {
  paper: Paper;
  paperContent: PaperContent;
  paperMeta: PaperMeta;
}): GhostPageViewModel[] => {
  const titlePageBlocks =
    input.paper.paperType === 'professional'
      ? [
          {
            id: 'running-head',
            kind: 'line' as const,
            text: `Running head: ${getDisplayValue(input.paperMeta.runningHead, 'Short title')}`,
          },
          {
            align: 'center' as const,
            id: 'paper-title',
            kind: 'title' as const,
            text: input.paperMeta.title,
          },
          {
            align: 'center' as const,
            id: 'author-name',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.authorName, 'Author Name'),
          },
          {
            align: 'center' as const,
            id: 'institution',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.institution, 'Institution'),
          },
          {
            align: 'center' as const,
            id: 'author-note-label',
            kind: 'line' as const,
            text: 'Author note',
          },
          {
            align: 'center' as const,
            id: 'author-note',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.authorNote, 'Add department or acknowledgment details'),
          },
        ]
      : [
          {
            align: 'center' as const,
            id: 'paper-title',
            kind: 'title' as const,
            text: input.paperMeta.title,
          },
          {
            align: 'center' as const,
            id: 'author-name',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.authorName, 'Student Name'),
          },
          {
            align: 'center' as const,
            id: 'institution',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.institution, 'Institution'),
          },
          {
            align: 'center' as const,
            id: 'course-name',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.courseName, 'Course Name'),
          },
          {
            align: 'center' as const,
            id: 'professor-name',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.professorName, 'Professor name'),
          },
          {
            align: 'center' as const,
            id: 'due-date',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.dueDate, 'Due date'),
          },
        ];

  const pages: GhostPageViewModel[] = [
    {
      blocks: titlePageBlocks,
      header: getPageHeader(input.paper, input.paperMeta, 1),
      id: `${input.paper.id}-title-page`,
      kind: 'title-page',
      title: 'Title Page',
    },
  ];

  if (hasAbstractPage(input.paper, input.paperMeta)) {
    pages.push({
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
      header: getPageHeader(input.paper, input.paperMeta, pages.length + 1),
      id: `${input.paper.id}-abstract-page`,
      kind: 'abstract-page',
      title: 'Abstract',
    });
  }

  pages.push(
    {
      blocks: [
        {
          id: 'body-heading',
          kind: 'section-heading',
          text: input.paperMeta.title,
        },
        {
          document: deserializeBodyEditorDocument(input.paperContent.bodyDoc),
          id: 'body-editor',
          kind: 'body-editor',
          text: 'Start your introduction here.',
        },
      ],
      header: getPageHeader(input.paper, input.paperMeta, pages.length + 1),
      id: `${input.paper.id}-body-page`,
      kind: 'body-page',
      title: 'Body Draft',
    },
    {
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
      header: getPageHeader(input.paper, input.paperMeta, pages.length + 2),
      id: `${input.paper.id}-references-page`,
      kind: 'references-page',
      title: 'References',
    },
  );

  return pages;
};
