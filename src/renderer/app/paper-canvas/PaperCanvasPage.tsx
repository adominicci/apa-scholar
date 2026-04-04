import type { ReactNode } from 'react';
import type { GhostPageViewModel } from '@domain/papers/ghost-page-view-model';

interface PaperCanvasPageProps {
  children: ReactNode;
  page: GhostPageViewModel;
}

export const PaperCanvasPage = ({ children, page }: PaperCanvasPageProps) => (
  <article className="relative mx-auto flex w-[var(--page-width)] min-h-[var(--page-height)] flex-col rounded-sm border border-[var(--color-page-line)] bg-[var(--color-page)] px-[var(--page-margin)] pb-[var(--page-margin)] pt-[var(--page-margin)] shadow-[var(--shadow-page)]">
    <div className="absolute top-[var(--page-header-top)] left-[var(--page-margin)] right-[var(--page-margin)] flex items-center justify-between font-[var(--font-display)] text-base leading-[2] text-[var(--color-page-ink)]">
      <span>{page.header.left ?? ''}</span>
      <span>{page.header.right}</span>
    </div>
    {children}
  </article>
);
