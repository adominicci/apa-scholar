import type { ReactNode } from 'react';
import type { GhostPageViewModel } from '@domain/papers/ghost-page-view-model';

interface PaperCanvasPageProps {
  children: ReactNode;
  page: GhostPageViewModel;
}

const pageLabelByKind: Record<GhostPageViewModel['kind'], string> = {
  'abstract-page': 'Abstract scaffold',
  'body-page': 'Body draft',
  'references-page': 'References scaffold',
  'title-page': 'Title page scaffold',
};

export const PaperCanvasPage = ({ children, page }: PaperCanvasPageProps) => (
  <article className="mx-auto w-full max-w-[820px] rounded-[var(--radius-panel)] border border-[var(--color-page-line)] bg-[var(--color-page)] px-8 py-10 shadow-[var(--shadow-page)]">
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-page-line)] pb-4 text-xs uppercase tracking-[var(--tracking-caps)] text-[var(--color-page-muted)]">
      <span>{page.header.left ?? ''}</span>
      <span>{page.header.right}</span>
    </div>
    <p className="label-caps mt-5">
      {pageLabelByKind[page.kind]}
    </p>
    {children}
  </article>
);
