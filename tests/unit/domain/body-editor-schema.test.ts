import { describe, expect, it } from 'vitest';
import {
  createBlockquoteBodyEditorFixture,
  createHeadingBodyEditorFixture,
  createUnsupportedFormattingFixture,
} from '@tests/helpers/body-editor-fixtures';
import {
  normalizeBodyEditorDocument,
  supportedBodyEditorHeadingLevels,
  supportedBodyEditorMarks,
} from '@domain/papers/body-editor-schema';

describe('body-editor-schema', () => {
  it('exports the supported heading levels and inline marks from one place', () => {
    expect(supportedBodyEditorHeadingLevels).toEqual([1, 2, 3, 4, 5]);
    expect(supportedBodyEditorMarks).toEqual(['bold', 'italic']);
  });

  it('preserves supported heading and blockquote structures', () => {
    expect(normalizeBodyEditorDocument(createHeadingBodyEditorFixture())).toEqual(
      createHeadingBodyEditorFixture(),
    );
    expect(normalizeBodyEditorDocument(createBlockquoteBodyEditorFixture())).toEqual(
      createBlockquoteBodyEditorFixture(),
    );
  });

  it('downgrades unsupported structure to supported body-editor content', () => {
    expect(normalizeBodyEditorDocument(createUnsupportedFormattingFixture())).toEqual({
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
        {
          content: [
            {
              text: 'Bullet that should flatten',
              type: 'text',
            },
          ],
          type: 'paragraph',
        },
      ],
      type: 'doc',
    });
  });
});
