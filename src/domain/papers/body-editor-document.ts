import {
  bodyEditorDocumentSchema,
  type BodyEditorDocument,
} from '@domain/papers/body-editor-schema';

export { bodyEditorDocumentSchema };
export type { BodyEditorDocument };

export const createEmptyBodyEditorDocument = (): BodyEditorDocument => ({
  content: [
    {
      type: 'paragraph',
    },
  ],
  type: 'doc',
});
