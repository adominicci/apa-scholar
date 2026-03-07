import type { GhostPageBlockViewModel, GhostPageViewModel } from '@domain/papers/ghost-page-view-model';

interface PaperCanvasBlockProps {
  block: GhostPageBlockViewModel;
  bodyDraftValue: string;
  onBodyDraftChange: (value: string) => void;
  pageKind: GhostPageViewModel['kind'];
}

export const PaperCanvasBlock = ({
  block,
  bodyDraftValue,
  onBodyDraftChange,
  pageKind,
}: PaperCanvasBlockProps) => {
  if (block.kind === 'title') {
    return (
      <p className="font-[var(--font-display)] text-4xl leading-tight text-[var(--color-page-ink)]">
        {block.text}
      </p>
    );
  }

  if (block.kind === 'line') {
    return (
      <p
        className={`text-base text-[var(--color-page-muted)] ${
          block.align === 'center' ? 'text-center' : ''
        }`}
      >
        {block.text}
      </p>
    );
  }

  if (block.kind === 'section-heading') {
    if (pageKind === 'body-page') {
      return (
        <p className="font-[var(--font-display)] text-3xl text-[var(--color-page-ink)]">
          {block.text}
        </p>
      );
    }

    const centered = pageKind === 'abstract-page' || pageKind === 'references-page';

    return (
      <h3
        className={`font-[var(--font-display)] text-3xl text-[var(--color-page-ink)] ${
          centered ? 'text-center' : ''
        }`}
      >
        {block.text}
      </h3>
    );
  }

  if (block.kind === 'empty-state') {
    return (
      <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--color-page-line)] px-6 py-8 text-center">
        <p className="text-sm leading-7 text-[var(--color-page-muted)]">
          {block.text}
        </p>
      </div>
    );
  }

  if (pageKind === 'body-page') {
    return (
      <>
        <label
          className="mt-6 block text-sm font-medium text-[var(--color-page-ink)]"
          htmlFor="paper-body-draft"
        >
          Paper body draft
        </label>
        <textarea
          aria-label="Paper body draft"
          className="mt-3 min-h-[260px] w-full resize-y rounded-[var(--radius-card)] border border-[var(--color-page-line)] bg-[var(--color-page-muted-surface)] px-5 py-4 text-base leading-8 text-[var(--color-page-ink)] outline-none transition focus:border-[var(--color-accent-soft)]"
          id="paper-body-draft"
          onChange={(event) => onBodyDraftChange(event.target.value)}
          placeholder={block.text}
          value={bodyDraftValue}
        />
      </>
    );
  }

  return (
    <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--color-page-line)] px-6 py-8">
      <p className="text-sm leading-7 text-[var(--color-page-muted)]">
        {block.text}
      </p>
    </div>
  );
};
