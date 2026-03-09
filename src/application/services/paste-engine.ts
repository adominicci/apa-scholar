import {
  createEmptyBodyEditorDocument,
  type BodyEditorDocument,
} from '@domain/papers/body-editor-document';
import {
  normalizeBodyEditorDocument,
  type BodyEditorBlockNode,
  type BodyEditorInlineNode,
  type BodyEditorMark,
  type BodyEditorParagraphNode,
  type BodyEditorTextNode,
} from '@domain/papers/body-editor-schema';

export const suspiciousPastePatternMessages = {
  embeddedMedia: 'Embedded media was removed from the pasted content.',
  executableContent: 'Potentially unsafe embedded content was removed before insertion.',
  tableStructure: 'Complex table structure was flattened and should be reviewed before insertion.',
} as const;

type ClipboardPayload = {
  html?: string | null;
  text?: string | null;
};

type SupportedMarkType = BodyEditorMark['type'];

export interface BodyEditorPasteResult {
  document: BodyEditorDocument;
  previewText: string;
  requiresReview: boolean;
  sanitizedHtml: string;
  sanitizedText: string;
  warnings: string[];
}

export const detectBodyEditorClipboardWarnings = ({
  html,
}: ClipboardPayload): string[] => {
  if (!html) {
    return [];
  }

  return markupReviewRules
    .filter((rule) => rule.pattern.test(html))
    .map((rule) => rule.message);
};

const blockElementNames = new Set([
  'article',
  'aside',
  'blockquote',
  'figcaption',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'li',
  'main',
  'nav',
  'p',
  'section',
  'td',
  'th',
]);

const markupReviewRules = [
  {
    message: suspiciousPastePatternMessages.tableStructure,
    pattern: /<table\b/i,
  },
  {
    message: suspiciousPastePatternMessages.embeddedMedia,
    pattern: /<(?:audio|canvas|figure|img|svg|video)\b/i,
  },
  {
    message: suspiciousPastePatternMessages.executableContent,
    pattern: /<(?:iframe|object|script|style|embed)\b/i,
  },
] as const;

const uniqueMarks = (marks: BodyEditorMark[]): BodyEditorMark[] => {
  const seen = new Set<SupportedMarkType>();

  return marks.filter((mark) => {
    if (seen.has(mark.type)) {
      return false;
    }

    seen.add(mark.type);
    return true;
  });
};

const appendMark = (
  marks: BodyEditorMark[],
  type: SupportedMarkType,
): BodyEditorMark[] => uniqueMarks([...marks, { type }]);

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const cleanTextFragment = (value: string): string =>
  value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ');

const normalizeParagraphInlineNodes = (
  inlineNodes: BodyEditorInlineNode[],
): BodyEditorInlineNode[] => {
  const normalized: BodyEditorInlineNode[] = [];

  for (const node of inlineNodes) {
    if (node.type === 'hardBreak') {
      if (normalized.at(-1)?.type === 'hardBreak') {
        continue;
      }

      const previousNode = normalized.at(-1);

      if (previousNode?.type === 'text') {
        previousNode.text = previousNode.text.replace(/\s+$/g, '');
      }

      normalized.push({ type: 'hardBreak' });
      continue;
    }

    const cleanedText = cleanTextFragment(node.text);

    if (!cleanedText.trim()) {
      continue;
    }

    const previousNode = normalized.at(-1);
    const nextText = normalized.length === 0
      ? cleanedText.trimStart()
      : previousNode?.type === 'hardBreak'
        ? cleanedText.trimStart()
        : cleanedText;

    const nextNode: BodyEditorTextNode = {
      marks: node.marks,
      text: nextText,
      type: 'text',
    };

    if (
      previousNode?.type === 'text'
      && JSON.stringify(previousNode.marks ?? []) === JSON.stringify(nextNode.marks ?? [])
    ) {
      previousNode.text += nextNode.text;
      continue;
    }

    normalized.push(nextNode);
  }

  const trailingNode = normalized.at(-1);

  if (trailingNode?.type === 'text') {
    trailingNode.text = trailingNode.text.replace(/\s+$/g, '');

    if (!trailingNode.text) {
      normalized.pop();
    }
  }

  return normalized;
};

const createParagraphNode = (inlineNodes: BodyEditorInlineNode[]): BodyEditorParagraphNode => ({
  content: normalizeParagraphInlineNodes(inlineNodes),
  type: 'paragraph',
});

const hasNestedBlockElement = (element: HTMLElement): boolean =>
  Array.from(element.children).some((child) =>
    child instanceof HTMLElement
    && (blockElementNames.has(child.tagName.toLowerCase()) || child.matches('div')),
  );

const collectInlineNodes = (
  node: Node,
  marks: BodyEditorMark[] = [],
): BodyEditorInlineNode[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';

    if (!text) {
      return [];
    }

    return [
      marks.length > 0
        ? { marks, text, type: 'text' }
        : { text, type: 'text' },
    ];
  }

  if (!(node instanceof HTMLElement)) {
    return [];
  }

  if (node.tagName === 'BR') {
    return [{ type: 'hardBreak' }];
  }

  const nextMarks = [...marks];
  const style = node.getAttribute('style')?.toLowerCase() ?? '';

  if (node.matches('b, strong') || /font-weight:\s*(bold|[6-9]00)/.test(style)) {
    nextMarks.splice(0, nextMarks.length, ...appendMark(nextMarks, 'bold'));
  }

  if (node.matches('em, i') || /font-style:\s*italic/.test(style)) {
    nextMarks.splice(0, nextMarks.length, ...appendMark(nextMarks, 'italic'));
  }

  return Array.from(node.childNodes).flatMap((childNode) =>
    collectInlineNodes(childNode, nextMarks),
  );
};

const collectBlockNodes = (node: Node): BodyEditorBlockNode[] => {
  if (!(node instanceof HTMLElement)) {
    return [];
  }

  if (node.matches('blockquote')) {
    const childBlocks = Array.from(node.childNodes).flatMap(collectBlockNodes);
    const paragraphs = childBlocks.flatMap((childBlock) => {
      if (childBlock.type === 'paragraph') {
        return [childBlock];
      }

      if (childBlock.type === 'blockquote') {
        return childBlock.content;
      }

      return [];
    });

    return paragraphs.length > 0
      ? [
          {
            content: paragraphs,
            type: 'blockquote',
          },
        ]
      : [];
  }

  if (node.matches('div') || node.matches('section') || node.matches('article')) {
    if (hasNestedBlockElement(node)) {
      return Array.from(node.childNodes).flatMap(collectBlockNodes);
    }

    const paragraph = createParagraphNode(collectInlineNodes(node));

    return paragraph.content && paragraph.content.length > 0 ? [paragraph] : [];
  }

  if (blockElementNames.has(node.tagName.toLowerCase())) {
    const paragraph = createParagraphNode(collectInlineNodes(node));

    return paragraph.content && paragraph.content.length > 0 ? [paragraph] : [];
  }

  return Array.from(node.childNodes).flatMap(collectBlockNodes);
};

const createDocumentFromBlocks = (blocks: BodyEditorBlockNode[]): BodyEditorDocument => {
  const document = normalizeBodyEditorDocument({
    content: blocks,
    type: 'doc',
  });

  return document.content.length > 0 ? document : createEmptyBodyEditorDocument();
};

const sanitizePlainText = (text: string): BodyEditorDocument => {
  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n+/)
    .map((paragraph) =>
      paragraph
        .split('\n')
        .map((line) => cleanTextFragment(line).trim())
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
    .map((paragraphText) => ({
      content: [{ text: paragraphText, type: 'text' as const }],
      type: 'paragraph' as const,
    }));

  return createDocumentFromBlocks(paragraphs);
};

const sanitizeHtml = (html: string): BodyEditorDocument => {
  const parsedDocument = new DOMParser().parseFromString(html, 'text/html');
  const blocks = Array.from(parsedDocument.body.childNodes).flatMap(collectBlockNodes);

  if (blocks.length === 0) {
    return sanitizePlainText(parsedDocument.body.textContent ?? '');
  }

  return createDocumentFromBlocks(blocks);
};

const renderTextNode = (node: BodyEditorTextNode): string => {
  let value = escapeHtml(node.text);

  for (const mark of node.marks ?? []) {
    value = mark.type === 'bold'
      ? `<strong>${value}</strong>`
      : `<em>${value}</em>`;
  }

  return value;
};

const renderInlineNodesAsHtml = (inlineNodes: BodyEditorInlineNode[] | undefined): string =>
  (inlineNodes ?? [])
    .map((node) => (node.type === 'hardBreak' ? '<br>' : renderTextNode(node)))
    .join('');

const renderDocumentAsHtml = (document: BodyEditorDocument): string =>
  document.content
    .map((block) => {
      if (block.type === 'blockquote') {
        return `<blockquote>${block.content
          .map((paragraph) => `<p>${renderInlineNodesAsHtml(paragraph.content)}</p>`)
          .join('')}</blockquote>`;
      }

      return `<p>${renderInlineNodesAsHtml(block.content)}</p>`;
    })
    .join('');

const renderDocumentAsText = (document: BodyEditorDocument): string =>
  document.content
    .map((block) => {
      if (block.type === 'blockquote') {
        return block.content
          .map((paragraph) =>
            (paragraph.content ?? [])
              .map((node) => (node.type === 'hardBreak' ? '\n' : node.text))
              .join(''),
          )
          .join('\n\n');
      }

      return (block.content ?? [])
        .map((node) => (node.type === 'hardBreak' ? '\n' : node.text))
        .join('');
    })
    .join('\n\n');

export const sanitizeBodyEditorClipboardPayload = (
  payload: ClipboardPayload,
): BodyEditorPasteResult => {
  const html = payload.html?.trim();
  const text = payload.text?.trim();
  const document = html ? sanitizeHtml(html) : sanitizePlainText(text ?? '');
  const warnings = detectBodyEditorClipboardWarnings(payload);

  return {
    document,
    previewText: renderDocumentAsText(document),
    requiresReview: warnings.length > 0,
    sanitizedHtml: renderDocumentAsHtml(document),
    sanitizedText: renderDocumentAsText(document),
    warnings,
  };
};

export const transformBodyEditorPastedHtml = (html: string): string =>
  sanitizeBodyEditorClipboardPayload({ html }).sanitizedHtml;

export const transformBodyEditorPastedText = (text: string): string =>
  sanitizeBodyEditorClipboardPayload({ text }).sanitizedText;
