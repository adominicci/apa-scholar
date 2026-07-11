import { z } from 'zod';

export const supportedBodyEditorHeadingLevels = [1, 2, 3, 4, 5] as const;
export const supportedBodyEditorMarks = ['bold', 'italic', 'citation'] as const;
type SupportedBodyEditorHeadingLevel =
  (typeof supportedBodyEditorHeadingLevels)[number];

const bodyEditorSimpleMarkSchema = z.object({
  type: z.enum(['bold', 'italic']),
});

const bodyEditorCitationMarkSchema = z.object({
  attrs: z.object({
    referenceId: z.string().min(1),
  }),
  type: z.literal('citation'),
});

const bodyEditorMarkSchema = z.union([
  bodyEditorSimpleMarkSchema,
  bodyEditorCitationMarkSchema,
]);

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
    level: z
      .number()
      .int()
      .refine(
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

export interface BodyEditorListItem {
  content: BodyEditorListItemContentNode[];
  type: 'listItem';
}

export interface BodyEditorBulletList {
  content: BodyEditorListItem[];
  type: 'bulletList';
}

export interface BodyEditorOrderedList {
  content: BodyEditorListItem[];
  type: 'orderedList';
}

export type BodyEditorListNode = BodyEditorBulletList | BodyEditorOrderedList;
export type BodyEditorListItemContentNode =
  | BodyEditorParagraphNode
  | BodyEditorListNode;

const bodyEditorBlockquoteSchema: z.ZodType<BodyEditorBlockquote> = z.object({
  content: z.array(bodyEditorParagraphSchema).default([]),
  type: z.literal('blockquote'),
});

const bodyEditorListItemContentSchema: z.ZodType<BodyEditorListItemContentNode> =
  z.lazy(() =>
    z.union([
      bodyEditorParagraphSchema,
      bodyEditorBulletListSchema,
      bodyEditorOrderedListSchema,
    ]),
  );

const bodyEditorListItemSchema: z.ZodType<BodyEditorListItem> = z.lazy(() =>
  z.object({
    content: z.array(bodyEditorListItemContentSchema).default([]),
    type: z.literal('listItem'),
  }),
);

const bodyEditorBulletListSchema: z.ZodType<BodyEditorBulletList> = z.lazy(() =>
  z.object({
    content: z.array(bodyEditorListItemSchema).default([]),
    type: z.literal('bulletList'),
  }),
);

const bodyEditorOrderedListSchema: z.ZodType<BodyEditorOrderedList> = z.lazy(
  () =>
    z.object({
      content: z.array(bodyEditorListItemSchema).default([]),
      type: z.literal('orderedList'),
    }),
);

const bodyEditorBlockSchema: z.ZodType<BodyEditorBlockNode> = z.lazy(() =>
  z.union([
    bodyEditorParagraphSchema,
    bodyEditorHeadingSchema,
    bodyEditorBlockquoteSchema,
    bodyEditorBulletListSchema,
    bodyEditorOrderedListSchema,
  ]),
);

export const bodyEditorDocumentSchema = z.object({
  content: z.array(bodyEditorBlockSchema).default([]),
  type: z.literal('doc'),
});

export type BodyEditorBlockNode =
  | BodyEditorParagraphNode
  | BodyEditorHeadingNode
  | BodyEditorBlockquote
  | BodyEditorListNode;
export type BodyEditorDocument = z.infer<typeof bodyEditorDocumentSchema>;

const normalizeMarks = (value: unknown): BodyEditorMark[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const marks = value
    .map((raw) => {
      const candidate = raw as { type?: unknown; attrs?: unknown };
      if (candidate.type === 'citation') {
        return bodyEditorCitationMarkSchema.safeParse(candidate);
      }
      return bodyEditorSimpleMarkSchema.safeParse(candidate);
    })
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
    const marks = normalizeMarks(candidate.marks);

    return [
      {
        ...(marks ? { marks } : {}),
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
  supportedBodyEditorHeadingLevels.includes(
    value as SupportedBodyEditorHeadingLevel,
  );

const normalizeListNode = (value: {
  content?: unknown;
  type?: unknown;
}): BodyEditorListNode | null => {
  const content = normalizeListItems(value.content);

  if (content.length === 0) {
    return null;
  }

  return {
    content,
    type: value.type === 'orderedList' ? 'orderedList' : 'bulletList',
  };
};

const normalizeListItemContentNode = (
  value: unknown,
): BodyEditorListItemContentNode[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const candidate = value as {
    content?: unknown;
    type?: unknown;
  };

  if (candidate.type === 'paragraph') {
    return [normalizeParagraphNode(candidate)];
  }

  if (candidate.type === 'bulletList' || candidate.type === 'orderedList') {
    const listNode = normalizeListNode(candidate);
    return listNode ? [listNode] : [];
  }

  const fallbackParagraph = normalizeParagraphNode(candidate);

  return fallbackParagraph.content && fallbackParagraph.content.length > 0
    ? [fallbackParagraph]
    : [];
};

const normalizeListItemContentNodes = (
  value: unknown,
): BodyEditorListItemContentNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(normalizeListItemContentNode);
};

const normalizeListItem = (value: unknown): BodyEditorListItem[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const content = normalizeListItemContentNodes(
    (value as { content?: unknown } | undefined)?.content,
  );

  return content.length > 0
    ? [
        {
          content,
          type: 'listItem',
        },
      ]
    : [];
};

const normalizeListItems = (value: unknown): BodyEditorListItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(normalizeListItem);
};

const flattenListNodeToParagraphs = (
  listNode: BodyEditorListNode,
): BodyEditorParagraphNode[] =>
  listNode.content.flatMap((item) =>
    item.content.flatMap((node) =>
      node.type === 'paragraph' ? [node] : flattenListNodeToParagraphs(node),
    ),
  );

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

    if (isSupportedHeadingLevel(level)) {
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
    const paragraphs = normalizeBlockNodes(candidate.content).flatMap(
      (node) => {
        if (node.type === 'paragraph') {
          return [node];
        }

        if (node.type === 'heading') {
          return [
            {
              content: node.content,
              type: 'paragraph' as const,
            },
          ];
        }

        if (node.type === 'blockquote') {
          return node.content;
        }

        return flattenListNodeToParagraphs(node);
      },
    );

    return [
      {
        content: paragraphs,
        type: 'blockquote',
      },
    ];
  }

  if (candidate.type === 'bulletList' || candidate.type === 'orderedList') {
    const listNode = normalizeListNode(candidate);
    return listNode ? [listNode] : [];
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

export const normalizeBodyEditorDocument = (
  value: unknown,
): BodyEditorDocument =>
  bodyEditorDocumentSchema.parse({
    content: normalizeBlockNodes(
      (value as { content?: unknown } | undefined)?.content,
    ),
    type: 'doc',
  });
