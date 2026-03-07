// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PaperCanvasBlock } from '@renderer/app/paper-canvas/PaperCanvasBlock';

describe('PaperCanvasBlock', () => {
  it('exposes the body-page section heading with heading semantics', () => {
    render(
      <PaperCanvasBlock
        block={{ id: 'body-heading', kind: 'section-heading', text: 'Capstone Draft' }}
        bodyDraftValue=""
        onBodyDraftChange={vi.fn()}
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
        bodyDraftValue=""
        onBodyDraftChange={vi.fn()}
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
