// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaperCanvasToolbar } from '@renderer/app/paper-canvas/PaperCanvasToolbar';

describe('PaperCanvasToolbar', () => {
  afterEach(() => {
    cleanup();
  });

  it('opens the APA command center and routes paper setup and formatting actions', () => {
    const onOpenCitation = vi.fn();
    const onOpenDetails = vi.fn();
    const onOpenReferences = vi.fn();
    const onSetHeadingLevel = vi.fn();
    const onSetPaperType = vi.fn();
    const onSetParagraph = vi.fn();
    const onToggleAbstract = vi.fn();
    const onToggleBulletList = vi.fn();
    const onToggleBlockquote = vi.fn();
    const onToggleOrderedList = vi.fn();

    render(
      <PaperCanvasToolbar
        abstractEnabled={false}
        onOpenCitation={onOpenCitation}
        onOpenDetails={onOpenDetails}
        onOpenReferences={onOpenReferences}
        onSetHeadingLevel={onSetHeadingLevel}
        onSetPaperType={onSetPaperType}
        onSetParagraph={onSetParagraph}
        onToggleAbstract={onToggleAbstract}
        onToggleBulletList={onToggleBulletList}
        onToggleBlockquote={onToggleBlockquote}
        onToggleOrderedList={onToggleOrderedList}
        paperType="student"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Font' }));

    const dialog = screen.getByRole('dialog', { name: 'APA format' });

    expect(dialog).toBeVisible();
    expect(dialog).toHaveClass('top-0');
    expect(dialog).toHaveClass('translate-y-0');
    expect(within(dialog).getByRole('button', { name: 'APA Basic' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(within(dialog).getByRole('button', { name: 'APA Professional' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Include abstract' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Heading 2' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Bulleted list' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Numbered list' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Body text' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Block quote' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Paper details' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'References' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Citation' }));

    expect(onSetPaperType).toHaveBeenCalledWith('professional');
    expect(onToggleAbstract).toHaveBeenCalledTimes(1);
    expect(onSetHeadingLevel).toHaveBeenCalledWith(2);
    expect(onToggleBulletList).toHaveBeenCalledTimes(1);
    expect(onToggleOrderedList).toHaveBeenCalledTimes(1);
    expect(onSetParagraph).toHaveBeenCalledTimes(1);
    expect(onToggleBlockquote).toHaveBeenCalledTimes(1);
    expect(onOpenDetails).toHaveBeenCalledTimes(1);
    expect(onOpenReferences).toHaveBeenCalledTimes(1);
    expect(onOpenCitation).toHaveBeenCalledTimes(1);
  });

  it('keeps the APA command center above the paper stack', () => {
    render(
      <PaperCanvasToolbar
        abstractEnabled={false}
        onSetPaperType={vi.fn()}
        onToggleBulletList={vi.fn()}
        onToggleOrderedList={vi.fn()}
        paperType="student"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Font' }));

    const dialog = screen.getByRole('dialog', { name: 'APA format' });
    const toolbarLayer = dialog.parentElement;

    expect(toolbarLayer).toHaveClass('z-20');
    expect(dialog).toHaveClass('z-30');
  });
});
