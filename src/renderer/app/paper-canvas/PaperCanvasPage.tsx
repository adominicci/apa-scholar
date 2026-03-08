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
    <p className="label-caps">
      {pageLabelByKind[page.kind]}
    </p>
    {children}
  </article>
);
