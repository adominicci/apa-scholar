// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { BodyEditor } from '@renderer/app/paper-canvas/body-editor/BodyEditor';

const editorInstance = {
  commands: {
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
});
