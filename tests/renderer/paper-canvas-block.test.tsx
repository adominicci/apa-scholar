// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { PaperCanvasBlock } from '@renderer/app/paper-canvas/PaperCanvasBlock';

describe('PaperCanvasBlock', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the body editor block as a semantic editing surface', () => {
    render(
      <PaperCanvasBlock
        block={{
          document: createEmptyBodyEditorDocument(),
          id: 'body-editor',
          kind: 'body-editor',
          text: 'Start your introduction here.',
        }}
        bodyDocument={createEmptyBodyEditorDocument()}
        onBodyDocumentChange={vi.fn()}
        pageKind="body-page"
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Paper body draft' })).toBeVisible();
    expect(screen.queryByRole('textbox', { name: 'Paper body draft' })).toHaveAttribute(
      'contenteditable',
      'true',
    );
  });

  it('focuses the body editor when the field label is clicked', () => {
    render(
      <PaperCanvasBlock
        block={{
          document: createEmptyBodyEditorDocument(),
          id: 'body-editor',
          kind: 'body-editor',
          text: 'Start your introduction here.',
        }}
        bodyDocument={createEmptyBodyEditorDocument()}
        onBodyDocumentChange={vi.fn()}
        pageKind="body-page"
      />,
    );

    const editor = screen.getByRole('textbox', { name: 'Paper body draft' });
    const focusSpy = vi.spyOn(editor, 'focus');

    fireEvent.click(screen.getByText('Paper body draft'));

    expect(focusSpy).toHaveBeenCalled();
  });

  it('exposes the body-page section heading with heading semantics', () => {
    render(
      <PaperCanvasBlock
        block={{ id: 'body-heading', kind: 'section-heading', text: 'Capstone Draft' }}
        bodyDocument={createEmptyBodyEditorDocument()}
        onBodyDocumentChange={vi.fn()}
        pageKind="body-page"
      />,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Capstone Draft' }),
    ).toBeInTheDocument();
  });

  it('renders non-body textarea blocks as read-only placeholders', () => {
    render(
      <PaperCanvasBlock
        block={{
          id: 'abstract-textarea',
          kind: 'textarea',
          text: 'Summarize the paper in one concise paragraph once the abstract workflow lands.',
        }}
        bodyDocument={createEmptyBodyEditorDocument()}
        onBodyDocumentChange={vi.fn()}
        pageKind="abstract-page"
      />,
    );

    expect(
      screen.getByText(
        'Summarize the paper in one concise paragraph once the abstract workflow lands.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
