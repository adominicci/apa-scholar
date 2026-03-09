// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import * as pasteEngine from '@application/services/paste-engine';
import {
  createGoogleDocsPasteDocumentFixture,
  createGoogleDocsPasteHtmlFixture,
  createSuspiciousPasteHtmlFixture,
  createWordPasteDocumentFixture,
  createWordPasteHtmlFixture,
  createWrappedPlainTextDocumentFixture,
  createWrappedPlainTextPasteFixture,
} from '@tests/helpers/paste-engine-fixtures';

describe('paste-engine', () => {
  it('sanitizes Word and Google Docs HTML into supported body-editor content', () => {
    expect(
      pasteEngine.sanitizeBodyEditorClipboardPayload({
        html: createWordPasteHtmlFixture(),
      }).document,
    ).toEqual(createWordPasteDocumentFixture());

    expect(
      pasteEngine.sanitizeBodyEditorClipboardPayload({
        html: createGoogleDocsPasteHtmlFixture(),
      }).document,
    ).toEqual(createGoogleDocsPasteDocumentFixture());
  });

  it('normalizes broken plain-text wraps while preserving paragraph breaks', () => {
    expect(
      pasteEngine.sanitizeBodyEditorClipboardPayload({
        text: createWrappedPlainTextPasteFixture(),
      }).document,
    ).toEqual(createWrappedPlainTextDocumentFixture());
  });

  it('flags risky clipboard payloads for review before insertion', () => {
    const result = pasteEngine.sanitizeBodyEditorClipboardPayload({
      html: createSuspiciousPasteHtmlFixture(),
      text: 'Tabular content\n\nParagraph after the table.',
    });

    expect(result.requiresReview).toBe(true);
    expect(result.warnings).toEqual([
      pasteEngine.suspiciousPastePatternMessages.tableStructure,
      pasteEngine.suspiciousPastePatternMessages.embeddedMedia,
      pasteEngine.suspiciousPastePatternMessages.executableContent,
    ]);
    expect(result.previewText).toContain('Paragraph after the table.');
  });

  it('warns about figure containers without claiming preserved text was removed as media', () => {
    const result = pasteEngine.sanitizeBodyEditorClipboardPayload({
      html: `
        <figure>
          <figcaption>Some cited text</figcaption>
        </figure>
      `,
    });

    expect(result.requiresReview).toBe(true);
    expect(result.warnings).toEqual([
      pasteEngine.suspiciousPastePatternMessages.figureStructure,
    ]);
    expect(result.warnings).not.toContain(
      pasteEngine.suspiciousPastePatternMessages.embeddedMedia,
    );
    expect(result.previewText).toBe('Some cited text');
  });

  it('renders the plain-text preview once and reuses it for previewText and sanitizedText', () => {
    const result = pasteEngine.sanitizeBodyEditorClipboardPayload({
      html: createWordPasteHtmlFixture(),
    });

    expect(result.previewText).toBe(result.sanitizedText);
  });
});
