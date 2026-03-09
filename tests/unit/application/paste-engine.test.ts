// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import {
  sanitizeBodyEditorClipboardPayload,
  suspiciousPastePatternMessages,
} from '@application/services/paste-engine';
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
      sanitizeBodyEditorClipboardPayload({
        html: createWordPasteHtmlFixture(),
      }).document,
    ).toEqual(createWordPasteDocumentFixture());

    expect(
      sanitizeBodyEditorClipboardPayload({
        html: createGoogleDocsPasteHtmlFixture(),
      }).document,
    ).toEqual(createGoogleDocsPasteDocumentFixture());
  });

  it('normalizes broken plain-text wraps while preserving paragraph breaks', () => {
    expect(
      sanitizeBodyEditorClipboardPayload({
        text: createWrappedPlainTextPasteFixture(),
      }).document,
    ).toEqual(createWrappedPlainTextDocumentFixture());
  });

  it('flags risky clipboard payloads for review before insertion', () => {
    const result = sanitizeBodyEditorClipboardPayload({
      html: createSuspiciousPasteHtmlFixture(),
      text: 'Tabular content\n\nParagraph after the table.',
    });

    expect(result.requiresReview).toBe(true);
    expect(result.warnings).toEqual([
      suspiciousPastePatternMessages.tableStructure,
      suspiciousPastePatternMessages.embeddedMedia,
      suspiciousPastePatternMessages.executableContent,
    ]);
    expect(result.previewText).toContain('Paragraph after the table.');
  });
});
