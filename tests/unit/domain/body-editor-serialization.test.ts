import { describe, expect, it } from 'vitest';
import {
  createEmptyBodyEditorFixture,
  createListBodyEditorFixture,
  createUnsupportedFormattingFixture,
} from '@tests/helpers/body-editor-fixtures';
import {
  deserializeBodyEditorDocument,
  serializeBodyEditorDocument,
} from '@domain/papers/body-editor-serialization';

describe('body-editor-serialization', () => {
  it('falls back to an empty starter document when persisted JSON is missing', () => {
    expect(deserializeBodyEditorDocument(null)).toEqual(
      createEmptyBodyEditorFixture(),
    );
  });

  it('serializes normalized body content for persistence', () => {
    expect(serializeBodyEditorDocument(createUnsupportedFormattingFixture())).toEqual(
      {
        content: [
          {
            content: [
              {
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: 'Imported heading',
                type: 'text',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'doc',
      },
    );
  });

  it('preserves supported list content during serialization', () => {
    expect(serializeBodyEditorDocument({ content: [createListBodyEditorFixture()], type: 'doc' })).toEqual({
      content: [createListBodyEditorFixture()],
      type: 'doc',
    });
  });
});
