import { describe, expect, it } from 'vitest';
import { createEmptyBodyEditorFixture } from '@tests/helpers/body-editor-fixtures';
import {
  bodyEditorDocumentSchema,
  createEmptyBodyEditorDocument,
} from '@domain/papers/body-editor-document';

describe('body-editor-document', () => {
  it('creates a valid empty body editor document with a starter paragraph', () => {
    expect(createEmptyBodyEditorDocument()).toEqual(createEmptyBodyEditorFixture());
    expect(() =>
      bodyEditorDocumentSchema.parse(createEmptyBodyEditorDocument()),
    ).not.toThrow();
  });
});
