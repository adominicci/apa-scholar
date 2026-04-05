import type { BodyEditorBlockNode, BodyEditorDocument } from './body-editor-schema';

const getInlineText = (node: { type: string; text?: string }): string =>
  node.type === 'text' && node.text ? node.text : '';

const getParagraphText = (node: { content?: { type: string; text?: string }[] }): string =>
  (node.content ?? []).map(getInlineText).join('');

const getBlockText = (node: BodyEditorBlockNode): string => {
  if (node.type === 'blockquote') {
    return node.content.map(getParagraphText).join(' ');
  }
  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return node.content
      .flatMap((item) =>
        item.content.map((child) =>
          child.type === 'paragraph' ? getParagraphText(child) : ''))
      .join(' ');
  }
  return getParagraphText(node);
};

/** Count words in the body editor document (excludes title page, abstract, references). */
export const countBodyWords = (doc: BodyEditorDocument): number => {
  const text = doc.content.map(getBlockText).join(' ').trim();
  if (text.length === 0) return 0;
  return text.split(/\s+/).length;
};
