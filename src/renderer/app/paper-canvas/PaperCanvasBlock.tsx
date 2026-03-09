import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { GhostPageBlockViewModel, GhostPageViewModel } from '@domain/papers/ghost-page-view-model';
import { BodyEditor } from '@renderer/app/paper-canvas/body-editor/BodyEditor';

interface PaperCanvasBlockProps {
  block: GhostPageBlockViewModel;
  bodyDocument: BodyEditorDocument;
  onBodyDocumentChange: (document: BodyEditorDocument) => void;
  onPasteWarningsChange: (warnings: string[]) => void;
  pageKind: GhostPageViewModel['kind'];
}

export const PaperCanvasBlock = ({
  block,
  bodyDocument,
  onBodyDocumentChange,
  onPasteWarningsChange,
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
        <p
          aria-level={3}
          className="font-[var(--font-display)] text-3xl text-[var(--color-page-ink)]"
          role="heading"
        >
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

  if (block.kind === 'body-editor') {
    return (
      <BodyEditor
        document={block.document ?? bodyDocument}
        onChange={onBodyDocumentChange}
        onPasteWarningsChange={onPasteWarningsChange}
        placeholder={block.text}
      />
    );
  }

  if (block.kind === 'textarea') {
    return (
      <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--color-page-line)] px-6 py-8">
        <p className="text-sm leading-7 text-[var(--color-page-muted)]">
          {block.text}
        </p>
      </div>
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
