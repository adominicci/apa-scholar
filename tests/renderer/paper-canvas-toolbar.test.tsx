// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaperCanvasToolbar } from '@renderer/app/paper-canvas/PaperCanvasToolbar';

const defaultProps = {
  abstractEnabled: false,
  collapsed: false,
  selectedFont: 'times' as const,
  onCollapsedChange: vi.fn(),
  onFontChange: vi.fn(),
  onOpenCitation: vi.fn(),
  onOpenDetails: vi.fn(),
  onOpenReferences: vi.fn(),
  onSetHeadingLevel: vi.fn(),
  onSetPaperType: vi.fn(),
  onSetParagraph: vi.fn(),
  onToggleAbstract: vi.fn(),
  onToggleBulletList: vi.fn(),
  onToggleBlockquote: vi.fn(),
  onToggleOrderedList: vi.fn(),
  paperType: 'student' as const,
};

describe('PaperCanvasToolbar', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders paper setup actions in the expanded panel', () => {
    render(<PaperCanvasToolbar {...defaultProps} />);

    // Paper setup section is expanded by default
    expect(screen.getByRole('button', { name: 'APA Basic' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'APA Professional' }));
    expect(defaultProps.onSetPaperType).toHaveBeenCalledWith('professional');

    fireEvent.click(screen.getByRole('button', { name: 'Include abstract' }));
    expect(defaultProps.onToggleAbstract).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Paper details' }));
    expect(defaultProps.onOpenDetails).toHaveBeenCalledTimes(1);
  });

  it('expands text structure section and routes formatting actions', () => {
    render(<PaperCanvasToolbar {...defaultProps} />);

    // Open Text Structure section
    fireEvent.click(screen.getByText('Text structure'));

    fireEvent.click(screen.getByRole('button', { name: 'Body text' }));
    fireEvent.click(screen.getByRole('button', { name: 'Heading 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bulleted list' }));
    fireEvent.click(screen.getByRole('button', { name: 'Numbered list' }));
    fireEvent.click(screen.getByRole('button', { name: 'Block quote' }));

    expect(defaultProps.onSetParagraph).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSetHeadingLevel).toHaveBeenCalledWith(2);
    expect(defaultProps.onToggleBulletList).toHaveBeenCalledTimes(1);
    expect(defaultProps.onToggleOrderedList).toHaveBeenCalledTimes(1);
    expect(defaultProps.onToggleBlockquote).toHaveBeenCalledTimes(1);
  });

  it('renders collapsed state with expand button', () => {
    const onCollapsedChange = vi.fn();
    render(
      <PaperCanvasToolbar
        {...defaultProps}
        collapsed={true}
        onCollapsedChange={onCollapsedChange}
      />,
    );

    const expandButton = screen.getByRole('button', { name: 'Show format panel' });
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it('renders font options in the font section', () => {
    render(<PaperCanvasToolbar {...defaultProps} />);

    // Open Font section
    fireEvent.click(screen.getByText('Font'));

    expect(screen.getByRole('button', { name: /Times New Roman/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Calibri/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Arial/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Georgia/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lucida Sans/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Calibri/i }));
    expect(defaultProps.onFontChange).toHaveBeenCalledWith('calibri');
  });
});
