import type {
  BodyEditorBlockNode,
  BodyEditorDocument,
  BodyEditorInlineNode,
  BodyEditorMark,
} from '@domain/papers/body-editor-schema';

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderMarks = (text: string, marks?: BodyEditorMark[]): string => {
  if (!marks || marks.length === 0) return escapeHtml(text);

  let result = escapeHtml(text);

  for (const mark of marks) {
    if (mark.type === 'bold') result = `<strong>${result}</strong>`;
    if (mark.type === 'italic') result = `<em>${result}</em>`;
    // citation marks render as plain text in print
  }

  return result;
};

const renderInlineNode = (node: BodyEditorInlineNode): string => {
  if (node.type === 'hardBreak') return '<br>';
  return renderMarks(node.text, node.marks);
};

const renderInlineContent = (content?: BodyEditorInlineNode[]): string =>
  (content ?? []).map(renderInlineNode).join('');

const renderBlockNode = (node: BodyEditorBlockNode): string => {
  switch (node.type) {
    case 'paragraph':
      return `<p>${renderInlineContent(node.content)}</p>`;
    case 'heading':
      return `<h${node.attrs.level}>${renderInlineContent(node.content)}</h${node.attrs.level}>`;
    case 'blockquote':
      return `<blockquote>${node.content.map(renderBlockNode).join('')}</blockquote>`;
  }
};

export const bodyEditorDocumentToHtml = (doc: BodyEditorDocument): string =>
  (doc.content ?? []).map(renderBlockNode).join('');
