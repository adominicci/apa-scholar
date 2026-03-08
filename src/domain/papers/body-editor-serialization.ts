import {
  createEmptyBodyEditorDocument,
  type BodyEditorDocument,
} from '@domain/papers/body-editor-document';
import { normalizeBodyEditorDocument } from '@domain/papers/body-editor-schema';

export const deserializeBodyEditorDocument = (
  value: unknown,
): BodyEditorDocument => {
  if (!value) {
    return createEmptyBodyEditorDocument();
  }

  const normalizedDocument = normalizeBodyEditorDocument(value);

  return normalizedDocument.content.length > 0
    ? normalizedDocument
    : createEmptyBodyEditorDocument();
};

export const serializeBodyEditorDocument = (
  value: unknown,
): BodyEditorDocument => normalizeBodyEditorDocument(value);
