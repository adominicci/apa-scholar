import { describe, expect, it } from 'vitest';
import { bodyEditorDocumentToHtml } from '@domain/papers/body-editor-to-html';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';

const emptyDoc: BodyEditorDocument = { type: 'doc', content: [] };

describe('bodyEditorDocumentToHtml', () => {
  it('returns empty string for empty document', () => {
    expect(bodyEditorDocumentToHtml(emptyDoc)).toBe('');
  });

  it('renders a paragraph', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] },
      ],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<p>Hello world</p>');
  });

  it('renders bold and italic marks', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' and ' },
            { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
          ],
        },
      ],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe(
      '<p><strong>bold</strong> and <em>italic</em></p>',
    );
  });

  it('renders heading levels 1-5', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'H1' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'H3' }],
        },
      ],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<h1>H1</h1><h3>H3</h3>');
  });

  it('renders blockquotes with nested paragraphs', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Quoted' }] },
          ],
        },
      ],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe(
      '<blockquote><p>Quoted</p></blockquote>',
    );
  });

  it('renders bullet and ordered lists', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Bullet item' }],
                },
              ],
            },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Numbered item' }],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(bodyEditorDocumentToHtml(doc)).toBe(
      '<ul><li><p>Bullet item</p></li></ul><ol><li><p>Numbered item</p></li></ol>',
    );
  });

  it('renders hard breaks as <br>', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Line 1' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Line 2' },
          ],
        },
      ],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<p>Line 1<br>Line 2</p>');
  });

  it('renders citation marks as plain text', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '(Smith, 2020)',
              marks: [{ type: 'citation', attrs: { referenceId: 'ref-1' } }],
            },
          ],
        },
      ],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<p>(Smith, 2020)</p>');
  });

  it('escapes HTML entities in text', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '5 < 10 & 10 > 5' }],
        },
      ],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe(
      '<p>5 &lt; 10 &amp; 10 &gt; 5</p>',
    );
  });
});
