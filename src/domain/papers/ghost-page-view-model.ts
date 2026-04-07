import { deserializeBodyEditorDocument } from '@domain/papers/body-editor-serialization';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import { getGhostPageStrings } from '@domain/papers/ghost-page-strings';
import { abstractEnabledTemplates } from '@domain/shared/contracts';
import type { Language } from '@domain/shared/contracts';
import type {
  Paper,
  PaperContent,
  PaperMeta,
} from '@domain/shared/persistence-models';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { formatReferenceApaPlainText } from '@domain/references/apa-formatter';

export interface GhostPageBlockViewModel {
  align?: 'center' | 'left';
  document?: BodyEditorDocument;
  id: string;
  kind: 'body-editor' | 'empty-state' | 'line' | 'reference-line' | 'section-heading' | 'textarea' | 'title';
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
  runningHeadFallback = 'Short title',
): GhostPageViewModel['header'] => ({
  left:
    paper.paperType === 'professional'
      ? getDisplayValue(paperMeta.runningHead, runningHeadFallback)
      : undefined,
  right: `${pageNumber}`,
});

const buildReferencesPageBlocks = (
  references: ReferenceEntry[],
  language: Language = 'en',
): GhostPageBlockViewModel[] => {
  const s = getGhostPageStrings(language);
  const heading: GhostPageBlockViewModel = {
    id: 'references-heading',
    kind: 'section-heading',
    text: s.references,
  };

  if (references.length === 0) {
    return [
      heading,
      {
        id: 'references-empty-state',
        kind: 'empty-state',
        text: s.referencesEmptyState,
      },
    ];
  }

  // Sort alphabetically by sortKey regardless of caller order.
  const sorted = [...references].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  return [
    heading,
    ...sorted.map((ref) => ({
      id: `reference-${ref.id}`,
      kind: 'reference-line' as const,
      text: formatReferenceApaPlainText(ref),
    })),
  ];
};

export const buildGhostPageViewModels = (input: {
  language?: Language;
  paper: Paper;
  paperContent: PaperContent;
  paperMeta: PaperMeta;
  references?: ReferenceEntry[];
}): GhostPageViewModel[] => {
  const lang = input.language ?? 'en';
  const s = getGhostPageStrings(lang);

  const titlePageBlocks =
    input.paper.paperType === 'professional'
      ? [
          {
            id: 'running-head',
            kind: 'line' as const,
            text: `${s.runningHeadPrefix} ${getDisplayValue(input.paperMeta.runningHead, s.runningHead)}`,
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
            text: getDisplayValue(input.paperMeta.authorName, s.authorName),
          },
          {
            align: 'center' as const,
            id: 'institution',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.institution, s.institution),
          },
          {
            align: 'center' as const,
            id: 'author-note-label',
            kind: 'line' as const,
            text: s.authorNote,
          },
          {
            align: 'center' as const,
            id: 'author-note',
            kind: 'line' as const,
            text: getDisplayValue(input.paperMeta.authorNote, s.authorNotePlaceholder),
          },
        ]
      : [
          {
            align: 'center' as const,
            id: 'paper-title',
            kind: 'title' as const,
            text: input.paperMeta.title,
          },
          // Student title page optional lines — only shown when filled in.
          // Missing fields are flagged by the issues panel instead.
          ...(
            [
              { id: 'author-name', value: input.paperMeta.authorName },
              { id: 'institution', value: input.paperMeta.institution },
              { id: 'course-name', value: input.paperMeta.courseName },
              { id: 'professor-name', value: input.paperMeta.professorName },
              { id: 'due-date', value: input.paperMeta.dueDate },
            ] as const
          )
            .filter((field) => field.value?.trim())
            .map((field) => ({
              align: 'center' as const,
              id: field.id,
              kind: 'line' as const,
              text: field.value!.trim(),
            })),
        ];

  const pages: GhostPageViewModel[] = [
    {
      blocks: titlePageBlocks,
      header: getPageHeader(input.paper, input.paperMeta, 1, s.runningHead),
      id: `${input.paper.id}-title-page`,
      kind: 'title-page',
      title: s.titlePage,
    },
  ];

  if (hasAbstractPage(input.paper, input.paperMeta)) {
    pages.push({
      blocks: [
        {
          id: 'abstract-heading',
          kind: 'section-heading',
          text: s.abstract,
        },
        {
          id: 'abstract-textarea',
          kind: 'textarea',
          text: s.abstractPlaceholder,
        },
      ],
      header: getPageHeader(input.paper, input.paperMeta, pages.length + 1, s.runningHead),
      id: `${input.paper.id}-abstract-page`,
      kind: 'abstract-page',
      title: s.abstract,
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
          text: s.bodyPlaceholder,
        },
      ],
      header: getPageHeader(input.paper, input.paperMeta, pages.length + 1, s.runningHead),
      id: `${input.paper.id}-body-page`,
      kind: 'body-page',
      title: s.bodyDraft,
    },
    {
      blocks: buildReferencesPageBlocks(input.references ?? [], lang),
      header: getPageHeader(input.paper, input.paperMeta, pages.length + 2, s.runningHead),
      id: `${input.paper.id}-references-page`,
      kind: 'references-page',
      title: s.references,
    },
  );

  return pages;
};
