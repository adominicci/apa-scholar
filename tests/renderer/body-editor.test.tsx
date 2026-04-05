// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import * as pasteEngine from '@application/services/paste-engine';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import {
  BodyEditor,
  type BodyEditorHandle,
} from '@renderer/app/paper-canvas/body-editor/BodyEditor';
import {
  createSuspiciousPasteHtmlFixture,
  createWordPasteHtmlFixture,
  createWrappedPlainTextPasteFixture,
} from '@tests/helpers/paste-engine-fixtures';

const editorInstance = {
  chain: vi.fn(),
  commands: {
    insertContent: vi.fn(),
    setContent: vi.fn(),
  },
  getJSON: vi.fn(() => createEmptyBodyEditorDocument()),
};

const chainableEditor = {
  focus: vi.fn(),
  run: vi.fn(() => true),
  setParagraph: vi.fn(),
  toggleBulletList: vi.fn(),
  toggleBlockquote: vi.fn(),
  toggleHeading: vi.fn(),
  toggleOrderedList: vi.fn(),
};

interface MockedEditorConfig {
  editorProps?: {
    attributes?: {
      spellcheck?: string;
    };
    handlePaste?: (view: unknown, event: ClipboardEvent) => boolean | undefined;
    transformPastedHTML?: (html: string) => string;
    transformPastedText?: (text: string) => string;
  };
  onUpdate?: (payload: { editor: { getJSON: () => ReturnType<typeof createEmptyBodyEditorDocument> } }) => void;
}

let initialEditorConfig: MockedEditorConfig | null = null;
let renderEditorSurfaceWithoutContentEditable = false;

vi.mock('@tiptap/react', () => ({
  EditorContent: () =>
    React.createElement('div', {
      'aria-label': 'Paper body draft',
      'data-editor-surface': 'true',
      contentEditable: renderEditorSurfaceWithoutContentEditable ? undefined : true,
      role: 'textbox',
      tabIndex: 0,
    }),
  useEditor: (config: MockedEditorConfig) => {
    if (!initialEditorConfig) {
      initialEditorConfig = config;
    }

    return editorInstance;
  },
}));

describe('BodyEditor', () => {
  beforeEach(() => {
    initialEditorConfig = null;
    renderEditorSurfaceWithoutContentEditable = false;
    chainableEditor.focus.mockReturnValue(chainableEditor);
    chainableEditor.setParagraph.mockReturnValue(chainableEditor);
    chainableEditor.toggleBulletList.mockReturnValue(chainableEditor);
    chainableEditor.toggleBlockquote.mockReturnValue(chainableEditor);
    chainableEditor.toggleHeading.mockReturnValue(chainableEditor);
    chainableEditor.toggleOrderedList.mockReturnValue(chainableEditor);
    chainableEditor.run.mockReturnValue(true);
    editorInstance.chain.mockReset();
    editorInstance.chain.mockReturnValue(chainableEditor);
    editorInstance.commands.insertContent.mockReset();
    editorInstance.commands.setContent.mockReset();
    editorInstance.getJSON.mockReset();
    editorInstance.getJSON.mockReturnValue(createEmptyBodyEditorDocument());
  });

  afterEach(() => {
    cleanup();
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

  it('exposes paragraph, heading, and list commands through the imperative handle', () => {
    const ref = React.createRef<BodyEditorHandle>();

    render(
      <BodyEditor
        ref={ref}
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    ref.current?.setParagraph();
    ref.current?.setHeadingLevel(3);
    ref.current?.toggleBulletList();
    ref.current?.toggleOrderedList();

    expect(editorInstance.chain).toHaveBeenCalledTimes(4);
    expect(chainableEditor.focus).toHaveBeenCalledTimes(4);
    expect(chainableEditor.setParagraph).toHaveBeenCalledTimes(1);
    expect(chainableEditor.toggleHeading).toHaveBeenCalledWith({ level: 3 });
    expect(chainableEditor.toggleBulletList).toHaveBeenCalledTimes(1);
    expect(chainableEditor.toggleOrderedList).toHaveBeenCalledTimes(1);
    expect(chainableEditor.run).toHaveBeenCalledTimes(4);
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
    const onPasteWarningsChange = vi.fn();

    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        onPasteWarningsChange={onPasteWarningsChange}
        placeholder="Body placeholder"
      />,
    );

    const suspiciousText = 'Tabular content\n\nParagraph after the table.';
    const expectedInsert = pasteEngine.sanitizeBodyEditorClipboardPayload({
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
    expect(onPasteWarningsChange).toHaveBeenCalledWith([
      'Complex table structure was flattened and should be reviewed before insertion.',
      'Embedded media was removed from the pasted content.',
      'Potentially unsafe embedded content was removed before insertion.',
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Insert cleaned copy' }));

    expect(editorInstance.commands.insertContent).toHaveBeenCalledWith(expectedInsert);
    expect(onPasteWarningsChange).toHaveBeenLastCalledWith([]);
  });

  it('lets safe paste continue through the normal editor pipeline', () => {
    const sanitizeSpy = vi.spyOn(
      pasteEngine,
      'sanitizeBodyEditorClipboardPayload',
    );

    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        onPasteWarningsChange={vi.fn()}
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
    expect(sanitizeSpy).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('heading', { name: 'Review cleaned paste' }),
    ).not.toBeInTheDocument();
  });

  it('announces the review surface as an accessible dialog and closes on Escape', () => {
    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    act(() => {
      initialEditorConfig?.editorProps?.handlePaste?.(
        {} as never,
        {
          clipboardData: {
            getData: (type: string) => {
              if (type === 'text/html') {
                return createSuspiciousPasteHtmlFixture();
              }

              return 'Tabular content\n\nParagraph after the table.';
            },
          },
        } as ClipboardEvent,
      );
    });

    const dialog = screen.getByRole('dialog', { name: 'Review cleaned paste' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'paste-review-title');

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(
      screen.queryByRole('dialog', { name: 'Review cleaned paste' }),
    ).not.toBeInTheDocument();
  });

  it('does not steal focus back to the close button when the editor rerenders while the modal is open', () => {
    const { rerender } = render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    act(() => {
      initialEditorConfig?.editorProps?.handlePaste?.(
        {} as never,
        {
          clipboardData: {
            getData: (type: string) => {
              if (type === 'text/html') {
                return createSuspiciousPasteHtmlFixture();
              }

              return 'Tabular content\n\nParagraph after the table.';
            },
          },
        } as ClipboardEvent,
      );
    });

    const insertButton = screen.getByRole('button', { name: 'Insert cleaned copy' });
    insertButton.focus();

    rerender(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    expect(insertButton).toHaveFocus();
  });

  it('keeps keyboard focus trapped inside the review dialog', () => {
    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    act(() => {
      initialEditorConfig?.editorProps?.handlePaste?.(
        {} as never,
        {
          clipboardData: {
            getData: (type: string) => {
              if (type === 'text/html') {
                return createSuspiciousPasteHtmlFixture();
              }

              return 'Tabular content\n\nParagraph after the table.';
            },
          },
        } as ClipboardEvent,
      );
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const insertButton = screen.getByRole('button', { name: 'Insert cleaned copy' });

    expect(closeButton).toHaveFocus();

    insertButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(insertButton).toHaveFocus();

    cancelButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(cancelButton).toHaveFocus();
  });

  it('restores focus to the dedicated editor surface fallback when the modal closes', () => {
    renderEditorSurfaceWithoutContentEditable = true;
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      });

    render(
      <BodyEditor
        document={createEmptyBodyEditorDocument()}
        onChange={vi.fn()}
        placeholder="Body placeholder"
      />,
    );

    const editorSurface = screen.getByRole('textbox', { name: 'Paper body draft' });
    const focusSpy = vi.spyOn(editorSurface, 'focus');

    act(() => {
      initialEditorConfig?.editorProps?.handlePaste?.(
        {} as never,
        {
          clipboardData: {
            getData: (type: string) => {
              if (type === 'text/html') {
                return createSuspiciousPasteHtmlFixture();
              }

              return 'Tabular content\n\nParagraph after the table.';
            },
          },
        } as ClipboardEvent,
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(focusSpy).toHaveBeenCalled();
    rafSpy.mockRestore();
  });

});
