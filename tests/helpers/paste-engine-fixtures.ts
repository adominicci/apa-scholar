import type { BodyEditorDocument } from '@domain/papers/body-editor-document';

export const createWordPasteHtmlFixture = () => `
  <!--[if gte mso 9]><xml><w:WordDocument></w:WordDocument></xml><![endif]-->
  <div class="WordSection1">
    <p class="MsoNormal" style="margin:0;line-height:200%">
      The <b>first</b> sentence from Word.<o:p></o:p>
    </p>
    <p class="MsoNormal" style="margin:0">
      A second paragraph with <i>useful emphasis</i>.
    </p>
  </div>
`;

export const createGoogleDocsPasteHtmlFixture = () => `
  <div id="docs-internal-guid-123">
    <p>
      <span style="font-weight:700">Google Docs heading</span>
    </p>
    <p>
      <span style="font-style:italic">Imported thought</span>
      <span style="color:#ff0000"> with noisy styling.</span>
    </p>
  </div>
`;

export const createWrappedPlainTextPasteFixture = () => `
  This paragraph was copied from a PDF
  and the hard wraps should collapse
  into a single readable paragraph.


  This second paragraph should stay separate
  even after cleanup.
`;

export const createSuspiciousPasteHtmlFixture = () => `
  <div>
    <table>
      <tr><td>Tabular content</td></tr>
    </table>
    <p>Paragraph after the table.</p>
    <img src="chart.png" alt="chart" />
    <script>alert('bad')</script>
  </div>
`;

export const createWordPasteDocumentFixture = (): BodyEditorDocument => ({
  content: [
    {
      content: [
        {
          text: 'The ',
          type: 'text',
        },
        {
          marks: [{ type: 'bold' }],
          text: 'first',
          type: 'text',
        },
        {
          text: ' sentence from Word.',
          type: 'text',
        },
      ],
      type: 'paragraph',
    },
    {
      content: [
        {
          text: 'A second paragraph with ',
          type: 'text',
        },
        {
          marks: [{ type: 'italic' }],
          text: 'useful emphasis',
          type: 'text',
        },
        {
          text: '.',
          type: 'text',
        },
      ],
      type: 'paragraph',
    },
  ],
  type: 'doc',
});

export const createGoogleDocsPasteDocumentFixture = (): BodyEditorDocument => ({
  content: [
    {
      content: [
        {
          marks: [{ type: 'bold' }],
          text: 'Google Docs heading',
          type: 'text',
        },
      ],
      type: 'paragraph',
    },
    {
      content: [
        {
          marks: [{ type: 'italic' }],
          text: 'Imported thought',
          type: 'text',
        },
        {
          text: ' with noisy styling.',
          type: 'text',
        },
      ],
      type: 'paragraph',
    },
  ],
  type: 'doc',
});

export const createWrappedPlainTextDocumentFixture = (): BodyEditorDocument => ({
  content: [
    {
      content: [
        {
          text: 'This paragraph was copied from a PDF and the hard wraps should collapse into a single readable paragraph.',
          type: 'text',
        },
      ],
      type: 'paragraph',
    },
    {
      content: [
        {
          text: 'This second paragraph should stay separate even after cleanup.',
          type: 'text',
        },
      ],
      type: 'paragraph',
    },
  ],
  type: 'doc',
});

