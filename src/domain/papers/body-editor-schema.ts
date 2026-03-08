import { z } from 'zod';

export const supportedBodyEditorHeadingLevels = [1, 2, 3, 4, 5] as const;
export const supportedBodyEditorMarks = ['bold', 'italic'] as const;
type SupportedBodyEditorHeadingLevel =
  (typeof supportedBodyEditorHeadingLevels)[number];

const bodyEditorMarkSchema = z.object({
  type: z.enum(supportedBodyEditorMarks),
});

const bodyEditorHardBreakSchema = z.object({
  type: z.literal('hardBreak'),
});

const bodyEditorTextNodeSchema = z.object({
  marks: z.array(bodyEditorMarkSchema).optional(),
  text: z.string(),
  type: z.literal('text'),
});

const bodyEditorInlineNodeSchema = z.union([
  bodyEditorHardBreakSchema,
  bodyEditorTextNodeSchema,
]);

const bodyEditorParagraphSchema = z.object({
  content: z.array(bodyEditorInlineNodeSchema).optional(),
  type: z.literal('paragraph'),
});

const bodyEditorHeadingSchema = z.object({
  attrs: z.object({
    level: z.number().int().refine(
      (level): level is SupportedBodyEditorHeadingLevel =>
        supportedBodyEditorHeadingLevels.includes(
          level as SupportedBodyEditorHeadingLevel,
        ),
      'Heading level must be between 1 and 5.',
    ),
  }),
  content: z.array(bodyEditorInlineNodeSchema).optional(),
  type: z.literal('heading'),
});

type BodyEditorParagraph = z.infer<typeof bodyEditorParagraphSchema>;
type BodyEditorHeading = z.infer<typeof bodyEditorHeadingSchema>;

const bodyEditorBlockSchema: z.ZodType<
  BodyEditorParagraph | BodyEditorHeading | BodyEditorBlockquote
> = z.lazy(() =>
  z.union([
    bodyEditorParagraphSchema,
    bodyEditorHeadingSchema,
    bodyEditorBlockquoteSchema,
  ]),
);

const bodyEditorBlockquoteSchema: z.ZodType<BodyEditorBlockquote> = z.object({
  content: z.array(bodyEditorParagraphSchema).default([]),
  type: z.literal('blockquote'),
});

export const bodyEditorDocumentSchema = z.object({
  content: z.array(bodyEditorBlockSchema).default([]),
  type: z.literal('doc'),
});

export type BodyEditorMark = z.infer<typeof bodyEditorMarkSchema>;
export type BodyEditorHardBreakNode = z.infer<typeof bodyEditorHardBreakSchema>;
export type BodyEditorTextNode = z.infer<typeof bodyEditorTextNodeSchema>;
export type BodyEditorInlineNode = z.infer<typeof bodyEditorInlineNodeSchema>;
export type BodyEditorParagraphNode = BodyEditorParagraph;
export type BodyEditorHeadingNode = BodyEditorHeading;
export interface BodyEditorBlockquote {
  content: BodyEditorParagraphNode[];
  type: 'blockquote';
}
export type BodyEditorBlockNode =
  | BodyEditorParagraphNode
  | BodyEditorHeadingNode
  | BodyEditorBlockquote;
export type BodyEditorDocument = z.infer<typeof bodyEditorDocumentSchema>;

const normalizeMarks = (value: unknown): BodyEditorMark[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const marks = value
    .map((mark) => bodyEditorMarkSchema.safeParse(mark))
    .filter((result) => result.success)
    .map((result) => result.data);

  return marks.length > 0 ? marks : undefined;
};

const normalizeInlineNode = (value: unknown): BodyEditorInlineNode[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const candidate = value as {
    content?: unknown;
    marks?: unknown;
    text?: unknown;
    type?: unknown;
  };

  if (candidate.type === 'hardBreak') {
    return [{ type: 'hardBreak' }];
  }

  if (candidate.type === 'text' && typeof candidate.text === 'string') {
    return [
      {
        marks: normalizeMarks(candidate.marks),
        text: candidate.text,
        type: 'text',
      },
    ];
  }

  return normalizeInlineNodes(candidate.content);
};

const normalizeInlineNodes = (value: unknown): BodyEditorInlineNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(normalizeInlineNode);
};

const normalizeParagraphNode = (value: unknown): BodyEditorParagraphNode => ({
  content: normalizeInlineNodes(
    (value as { content?: unknown } | undefined)?.content,
  ),
  type: 'paragraph',
});

const isSupportedHeadingLevel = (
  value: unknown,
): value is SupportedBodyEditorHeadingLevel =>
  typeof value === 'number' &&
  supportedBodyEditorHeadingLevels.includes(value as SupportedBodyEditorHeadingLevel);

const normalizeBlockNode = (value: unknown): BodyEditorBlockNode[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const candidate = value as {
    attrs?: { level?: unknown } | undefined;
    content?: unknown;
    type?: unknown;
  };

  if (candidate.type === 'paragraph') {
    return [normalizeParagraphNode(candidate)];
  }

  if (candidate.type === 'heading') {
    const level = candidate.attrs?.level;

    if (
      isSupportedHeadingLevel(level)
    ) {
      return [
        {
          attrs: {
            level,
          },
          content: normalizeInlineNodes(candidate.content),
          type: 'heading',
        },
      ];
    }

    return [normalizeParagraphNode(candidate)];
  }

  if (candidate.type === 'blockquote') {
    const paragraphs = normalizeBlockNodes(candidate.content).flatMap((node) =>
      node.type === 'paragraph'
        ? [node]
        : node.type === 'heading'
          ? [
            {
              content: node.content,
              type: 'paragraph' as const,
            },
            ]
          : node.content,
    );

    return [
      {
        content: paragraphs,
        type: 'blockquote',
      },
    ];
  }

  const fallbackParagraph = normalizeParagraphNode(candidate);

  return fallbackParagraph.content && fallbackParagraph.content.length > 0
    ? [fallbackParagraph]
    : [];
};

const normalizeBlockNodes = (value: unknown): BodyEditorBlockNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(normalizeBlockNode);
};

export const normalizeBodyEditorDocument = (value: unknown): BodyEditorDocument =>
  bodyEditorDocumentSchema.parse({
    content: normalizeBlockNodes(
      (value as { content?: unknown } | undefined)?.content,
    ),
    type: 'doc',
  });
