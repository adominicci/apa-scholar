// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { sanitizeBodyEditorClipboardPayload } from '@application/services/paste-engine';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { BodyEditor } from '@renderer/app/paper-canvas/body-editor/BodyEditor';
import {
  createSuspiciousPasteHtmlFixture,
  createWordPasteHtmlFixture,
  createWrappedPlainTextPasteFixture,
} from '@tests/helpers/paste-engine-fixtures';

const editorInstance = {
  commands: {
    insertContent: vi.fn(),
    setContent: vi.fn(),
  },
  getJSON: vi.fn(() => createEmptyBodyEditorDocument()),
};

let initialEditorConfig: Record<string, any> | null = null;

vi.mock('@tiptap/react', () => ({
  EditorContent: () => React.createElement('div', { 'data-testid': 'editor-content' }),
  useEditor: (config: Record<string, any>) => {
    if (!initialEditorConfig) {
      initialEditorConfig = config;
    }

    return editorInstance;
  },
}));

describe('BodyEditor', () => {
  beforeEach(() => {
    initialEditorConfig = null;
    editorInstance.commands.insertContent.mockReset();
    editorInstance.commands.setContent.mockReset();
    editorInstance.getJSON.mockReset();
    editorInstance.getJSON.mockReturnValue(createEmptyBodyEditorDocument());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('forwards the latest onChange callback through the editor update hook', () => {
    const firstOnChange = vi.fn();
    const secondOnChange = vi.fn();
    const document = createEmptyBodyEditorDocument();
    const { rerender } = render(
      <BodyEditor
        document={document}
        onChange={firstOnChange}
        placeholder="Body placeholder"
      />,
    );

    rerender(
      <BodyEditor
        document={document}
        onChange={secondOnChange}
        placeholder="Body placeholder"
      />,
    );

    if (!initialEditorConfig?.onUpdate) {
      throw new Error('Expected the TipTap onUpdate handler to be configured.');
    }

    initialEditorConfig.onUpdate({
      editor: {
        getJSON: () => createEmptyBodyEditorDocument(),
      },
    });

    expect(firstOnChange).not.toHaveBeenCalled();
    expect(secondOnChange).toHaveBeenCalledTimes(1);
  });

  it('opts the TipTap editing surface out of spellcheck without affecting the whole window', () => {
    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    expect(initialEditorConfig?.editorProps?.attributes?.spellcheck).toBe('false');
  });

  it('sanitizes both HTML and plain-text paste before insertion', () => {
    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    expect(
      initialEditorConfig?.editorProps?.transformPastedHTML?.(
        createWordPasteHtmlFixture(),
      ),
    ).toContain('<p>The <strong>first</strong> sentence from Word.</p>');
    expect(
      initialEditorConfig?.editorProps?.transformPastedHTML?.(
        createWordPasteHtmlFixture(),
      ),
    ).not.toContain('MsoNormal');
    expect(
      initialEditorConfig?.editorProps?.transformPastedText?.(
        createWrappedPlainTextPasteFixture(),
      ),
    ).toBe(
      'This paragraph was copied from a PDF and the hard wraps should collapse into a single readable paragraph.\n\nThis second paragraph should stay separate even after cleanup.',
    );
  });

  it('routes suspicious paste payloads through review before manual insertion', () => {
    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    const suspiciousText = 'Tabular content\n\nParagraph after the table.';
    const expectedInsert = sanitizeBodyEditorClipboardPayload({
      html: createSuspiciousPasteHtmlFixture(),
      text: suspiciousText,
    }).document.content;

    let handled = false;

    act(() => {
      handled = initialEditorConfig?.editorProps?.handlePaste?.(
        {} as never,
        {
          clipboardData: {
            getData: (type: string) => {
              if (type === 'text/html') {
                return createSuspiciousPasteHtmlFixture();
              }

              if (type === 'text/plain') {
                return suspiciousText;
              }

              return '';
            },
          },
        } as ClipboardEvent,
      ) ?? false;
    });

    expect(handled).toBe(true);
    expect(
      screen.getByRole('heading', { name: 'Review cleaned paste' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Complex table structure was flattened and should be reviewed before insertion.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Insert cleaned copy' }));

    expect(editorInstance.commands.insertContent).toHaveBeenCalledWith(expectedInsert);
  });

  it('lets safe paste continue through the normal editor pipeline', () => {
    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    const handled = initialEditorConfig?.editorProps?.handlePaste?.(
      {} as never,
      {
        clipboardData: {
          getData: (type: string) => (type === 'text/html' ? createWordPasteHtmlFixture() : ''),
        },
      } as ClipboardEvent,
    );

    expect(handled).toBe(false);
    expect(
      screen.queryByRole('heading', { name: 'Review cleaned paste' }),
    ).not.toBeInTheDocument();
  });
});
