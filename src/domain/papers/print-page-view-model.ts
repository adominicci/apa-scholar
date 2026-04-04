import { bodyEditorDocumentToHtml } from '@domain/papers/body-editor-to-html';
import { deserializeBodyEditorDocument } from '@domain/papers/body-editor-serialization';
import { getGhostPageStrings } from '@domain/papers/ghost-page-strings';
import { formatReferenceApa } from '@domain/references/apa-formatter';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { abstractEnabledTemplates } from '@domain/shared/contracts';
import type { Language } from '@domain/shared/contracts';
import type { Paper, PaperContent, PaperMeta } from '@domain/shared/persistence-models';

export interface PrintPageBlock {
  kind: 'title' | 'line' | 'section-heading' | 'body-html' | 'reference-entry';
  html: string;
  align?: 'center' | 'left';
}

export interface PrintPageViewModel {
  kind: 'title-page' | 'abstract-page' | 'body-page' | 'references-page';
  header: { left?: string; right: string };
  blocks: PrintPageBlock[];
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const getDisplayValue = (value: string | null, fallback: string): string =>
  value?.trim() ? value : fallback;

const formatReferenceHtml = (entry: ReferenceEntry): string =>
  formatReferenceApa(entry)
    .map((seg) => (seg.italic ? `<em>${escapeHtml(seg.text)}</em>` : escapeHtml(seg.text)))
    .join('');

export const buildPrintPageViewModels = (input: {
  language?: Language;
  paper: Paper;
  paperContent: PaperContent;
  paperMeta: PaperMeta;
  references?: ReferenceEntry[];
}): PrintPageViewModel[] => {
  const lang = input.language ?? 'en';
  const s = getGhostPageStrings(lang);

  const getHeader = (pageNumber: number): PrintPageViewModel['header'] => ({
    left: input.paper.paperType === 'professional'
      ? getDisplayValue(input.paperMeta.runningHead, s.runningHead)
      : undefined,
    right: `${pageNumber}`,
  });

  const titleBlocks: PrintPageBlock[] =
    input.paper.paperType === 'professional'
      ? [
          { kind: 'line', html: escapeHtml(`${s.runningHeadPrefix} ${getDisplayValue(input.paperMeta.runningHead, s.runningHead)}`) },
          { kind: 'title', html: escapeHtml(input.paperMeta.title), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.authorName, s.authorName)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.institution, s.institution)), align: 'center' },
          { kind: 'line', html: escapeHtml(s.authorNote), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.authorNote, s.authorNotePlaceholder)), align: 'center' },
        ]
      : [
          { kind: 'title', html: escapeHtml(input.paperMeta.title), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.authorName, s.studentName)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.institution, s.institution)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.courseName, s.courseName)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.professorName, s.professorName)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.dueDate, s.dueDate)), align: 'center' },
        ];

  const pages: PrintPageViewModel[] = [
    { kind: 'title-page', header: getHeader(1), blocks: titleBlocks },
  ];

  const hasAbstract = input.paperMeta.abstractEnabled || abstractEnabledTemplates.has(input.paper.templateId);

  if (hasAbstract) {
    pages.push({
      kind: 'abstract-page',
      header: getHeader(pages.length + 1),
      blocks: [
        { kind: 'section-heading', html: escapeHtml(s.abstract), align: 'center' },
      ],
    });
  }

  const bodyDoc = deserializeBodyEditorDocument(input.paperContent.bodyDoc);
  const bodyHtml = bodyEditorDocumentToHtml(bodyDoc);

  pages.push({
    kind: 'body-page',
    header: getHeader(pages.length + 1),
    blocks: [
      { kind: 'section-heading', html: escapeHtml(input.paperMeta.title), align: 'center' },
      { kind: 'body-html', html: bodyHtml },
    ],
  });

  const references = input.references ?? [];
  const sorted = [...references].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  pages.push({
    kind: 'references-page',
    header: getHeader(pages.length + 1),
    blocks: [
      { kind: 'section-heading', html: escapeHtml(s.references), align: 'center' },
      ...sorted.map((ref) => ({
        kind: 'reference-entry' as const,
        html: formatReferenceHtml(ref),
      })),
    ],
  });

  return pages;
};
