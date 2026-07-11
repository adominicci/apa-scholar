import { Mark, mergeAttributes } from '@tiptap/core';

export interface CitationMarkAttributes {
  referenceId: string;
}

export const CitationMark = Mark.create<{
  HTMLAttributes: Record<string, unknown>;
}>({
  name: 'citation',

  addAttributes() {
    return {
      referenceId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-reference-id'),
        renderHTML: (attributes) => ({
          'data-reference-id': attributes.referenceId as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-reference-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'apa-citation',
        style:
          'color: var(--color-accent-strong); cursor: default; font-weight: 500;',
      }),
      0,
    ];
  },
});
