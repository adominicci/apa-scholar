import { z } from 'zod';
import type {
  BodyEditorBlockNode,
  BodyEditorInlineNode,
  BodyEditorParagraphNode,
} from '@domain/papers/body-editor-schema';
import type { PaperDraft } from '@domain/papers/paper-draft';
import {
  type Paper,
  type UpdatePaperMetadataInput,
  updatePaperMetadataInputSchema,
} from '@domain/shared/persistence-models';
import { abstractEnabledTemplates } from '@domain/shared/contracts';

export const paperIssueSeveritySchema = z.enum(['high', 'medium', 'low']);
export const paperIssueCategorySchema = z.enum(['structure', 'formatting', 'advisory']);
export const paperIssueScopeSchema = z.enum([
  'title-page',
  'abstract',
  'body',
  'references',
]);

export const paperIssueAutofixSchema = z.object({
  input: updatePaperMetadataInputSchema,
  kind: z.literal('update-paper-metadata'),
  label: z.string().trim().min(1, 'Autofix label is required.'),
});

export const paperIssueSchema = z.object({
  autofix: paperIssueAutofixSchema.nullable(),
  category: paperIssueCategorySchema,
  code: z.string().trim().min(1, 'Issue code is required.'),
  description: z.string().trim().min(1, 'Issue description is required.'),
  scope: paperIssueScopeSchema,
  severity: paperIssueSeveritySchema,
  suggestedFix: z.string().trim().min(1).nullable(),
  title: z.string().trim().min(1, 'Issue title is required.'),
});

export type PaperIssueSeverity = z.infer<typeof paperIssueSeveritySchema>;
export type PaperIssueCategory = z.infer<typeof paperIssueCategorySchema>;
export type PaperIssueScope = z.infer<typeof paperIssueScopeSchema>;
export type PaperIssueAutofix = z.infer<typeof paperIssueAutofixSchema>;
export type PaperIssue = z.infer<typeof paperIssueSchema>;

export const paperIssueSeverityOrder: PaperIssueSeverity[] = ['high', 'medium', 'low'];

const hasText = (value: string | null | undefined): boolean =>
  typeof value === 'string' ? value.trim().length > 0 : false;

const createIssue = (input: PaperIssue): PaperIssue => paperIssueSchema.parse(input);

const createMetadataRequirementIssue = (input: {
  code: string;
  description: string;
  title: string;
}): PaperIssue =>
  createIssue({
    autofix: null,
    category: 'structure',
    code: input.code,
    description: input.description,
    scope: 'title-page',
    severity: 'high',
    suggestedFix: 'Complete the missing title-page field in the inspector.',
    title: input.title,
  });

const getInlineTextContent = (node: BodyEditorInlineNode): string =>
  node.type === 'text' ? node.text : '';

const getParagraphTextContent = (paragraph: BodyEditorParagraphNode): string =>
  (paragraph.content ?? []).map(getInlineTextContent).join('').trim();

const getBlockTextContent = (node: BodyEditorBlockNode): string => {
  if (node.type === 'blockquote') {
    return node.content.map(getParagraphTextContent).join(' ').trim();
  }

  return (node.content ?? []).map(getInlineTextContent).join('').trim();
};

const hasMeaningfulBodyContent = (draft: PaperDraft): boolean =>
  draft.paperContent.bodyDoc.content.some((node) => getBlockTextContent(node).length > 0);

const getHardBreakCount = (draft: PaperDraft): number =>
  draft.paperContent.bodyDoc.content.reduce((count, node) => {
    if (node.type === 'blockquote') {
      return count + node.content.reduce(
        (paragraphCount, paragraph) =>
          paragraphCount +
          (paragraph.content ?? []).filter((inlineNode) => inlineNode.type === 'hardBreak').length,
        0,
      );
    }

    return count + (node.content ?? []).filter((inlineNode) => inlineNode.type === 'hardBreak').length;
  }, 0);

const hasRequiredAbstractPage = (paper: Paper, draft: PaperDraft): boolean => {
  const abstractRequired =
    draft.paperMeta.abstractEnabled || abstractEnabledTemplates.has(paper.templateId);

  return !abstractRequired || draft.ghostPages.some((page) => page.kind === 'abstract-page');
};

const hasRequiredReferencesPage = (draft: PaperDraft): boolean =>
  draft.ghostPages.some((page) => page.kind === 'references-page');

const getHeadingLevelGap = (draft: PaperDraft): number | null => {
  let previousLevel: number | null = null;

  for (const node of draft.paperContent.bodyDoc.content) {
    if (node.type !== 'heading') {
      continue;
    }

    if (previousLevel !== null && node.attrs.level - previousLevel > 1) {
      return previousLevel;
    }

    previousLevel = node.attrs.level;
  }

  return null;
};

const createMetadataConflictIssue = (input: {
  autofix: PaperIssueAutofix;
  code: string;
  description: string;
  severity: PaperIssueSeverity;
  title: string;
}): PaperIssue =>
  createIssue({
    autofix: input.autofix,
    category: 'formatting',
    code: input.code,
    description: input.description,
    scope: 'title-page',
    severity: input.severity,
    suggestedFix: input.autofix.label,
    title: input.title,
  });

export const evaluatePaperIssues = (draft: PaperDraft): PaperIssue[] => {
  const issues: PaperIssue[] = [];

  if (!hasText(draft.paperMeta.title)) {
    issues.push(
      createMetadataRequirementIssue({
        code: 'missing-title',
        description: 'The paper title drives the title page and body heading scaffold.',
        title: 'Title is required.',
      }),
    );
  }

  if (!hasText(draft.paperMeta.authorName)) {
    issues.push(
      createMetadataRequirementIssue({
        code: 'missing-author-name',
        description: 'Add the author name so the title page matches the selected APA paper type.',
        title: 'Author name is required.',
      }),
    );
  }

  if (!hasText(draft.paperMeta.institution)) {
    issues.push(
      createMetadataRequirementIssue({
        code: 'missing-institution',
        description: 'Institution is part of the supported title-page scaffold for this paper.',
        title: 'Institution is required.',
      }),
    );
  }

  if (draft.paper.paperType === 'professional') {
    if (!hasText(draft.paperMeta.runningHead)) {
      issues.push(
        createMetadataRequirementIssue({
          code: 'missing-running-head',
          description: 'Professional papers need a running head value for the page header scaffold.',
          title: 'Running head is required.',
        }),
      );
    }
  } else {
    if (!hasText(draft.paperMeta.courseName)) {
      issues.push(
        createMetadataRequirementIssue({
          code: 'missing-course-name',
          description: 'Student papers should name the course on the title page.',
          title: 'Course name is required.',
        }),
      );
    }

    if (!hasText(draft.paperMeta.professorName)) {
      issues.push(
        createMetadataRequirementIssue({
          code: 'missing-professor-name',
          description: 'Student papers should include the instructor name on the title page.',
          title: 'Professor name is required.',
        }),
      );
    }

    if (!hasText(draft.paperMeta.dueDate)) {
      issues.push(
        createMetadataRequirementIssue({
          code: 'missing-due-date',
          description: 'Student papers should include the due date on the title page.',
          title: 'Due date is required.',
        }),
      );
    }

    if (hasText(draft.paperMeta.runningHead)) {
      issues.push(
        createMetadataConflictIssue({
          autofix: {
            input: { runningHead: null } satisfies UpdatePaperMetadataInput,
            kind: 'update-paper-metadata',
            label: 'Clear the leftover running head',
          },
          code: 'student-paper-running-head',
          description: 'Running heads are reserved for the professional paper workflow in this shell.',
          severity: 'medium',
          title: 'Running head is not used for student papers.',
        }),
      );
    }

    if (hasText(draft.paperMeta.authorNote)) {
      issues.push(
        createMetadataConflictIssue({
          autofix: {
            input: { authorNote: null } satisfies UpdatePaperMetadataInput,
            kind: 'update-paper-metadata',
            label: 'Clear the leftover author note',
          },
          code: 'student-paper-author-note',
          description: 'Author notes belong to the professional title-page flow and can be removed here safely.',
          severity: 'medium',
          title: 'Author note is not used for student papers.',
        }),
      );
    }
  }

  if (!hasRequiredAbstractPage(draft.paper, draft)) {
    issues.push(
      createIssue({
        autofix: null,
        category: 'structure',
        code: 'missing-abstract-section',
        description: 'This paper structure expects an abstract page, but the draft scaffold is missing it.',
        scope: 'abstract',
        severity: 'high',
        suggestedFix: 'Rebuild or resync the paper structure so the abstract page is available.',
        title: 'Abstract page scaffold is missing.',
      }),
    );
  }

  if (!hasRequiredReferencesPage(draft)) {
    issues.push(
      createIssue({
        autofix: null,
        category: 'structure',
        code: 'missing-references-section',
        description: 'Every supported paper shell should keep a references page scaffold available.',
        scope: 'references',
        severity: 'high',
        suggestedFix: 'Rebuild or resync the paper structure so the references page returns.',
        title: 'References scaffold is missing.',
      }),
    );
  }

  if (!hasMeaningfulBodyContent(draft)) {
    issues.push(
      createIssue({
        autofix: null,
        category: 'structure',
        code: 'missing-body-content',
        description: 'Add at least one real paragraph to move beyond the empty body scaffold.',
        scope: 'body',
        severity: 'high',
        suggestedFix: 'Write the opening paragraph in the body draft.',
        title: 'Body draft needs content.',
      }),
    );
  }

  if (getHardBreakCount(draft) > 0) {
    issues.push(
      createIssue({
        autofix: null,
        category: 'advisory',
        code: 'manual-line-breaks',
        description: 'Manual line breaks usually come from copied formatting and can disturb APA paragraph flow.',
        scope: 'body',
        severity: 'low',
        suggestedFix: 'Replace manual line breaks with separate paragraphs when possible.',
        title: 'Manual line breaks found in the body.',
      }),
    );
  }

  const headingLevelGap = getHeadingLevelGap(draft);

  if (headingLevelGap !== null) {
    issues.push(
      createIssue({
        autofix: null,
        category: 'advisory',
        code: 'heading-level-gap',
        description: `Heading levels jump more than one step after level ${headingLevelGap}, which can confuse the paper hierarchy.`,
        scope: 'body',
        severity: 'low',
        suggestedFix: 'Use the next heading level in sequence before moving deeper.',
        title: 'Heading levels skip in the body draft.',
      }),
    );
  }

  return issues;
};
