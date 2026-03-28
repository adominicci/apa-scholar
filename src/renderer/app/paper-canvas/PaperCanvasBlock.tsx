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
      <p className="font-[var(--font-display)] text-base font-bold leading-[2] text-[var(--color-page-ink)]">
        {block.text}
      </p>
    );
  }

  if (block.kind === 'line') {
    return (
      <p
        className={`font-[var(--font-display)] text-base leading-[2] text-[var(--color-page-ink)] ${
          block.align === 'center' ? 'text-center' : ''
        }`}
      >
        {block.text}
      </p>
    );
  }

  if (block.kind === 'section-heading') {
    return (
      <p
        aria-level={pageKind === 'body-page' ? 3 : undefined}
        className="font-[var(--font-display)] text-base font-bold leading-[2] text-center text-[var(--color-page-ink)]"
        role={pageKind === 'body-page' ? 'heading' : undefined}
      >
        {block.text}
      </p>
    );
  }

  if (block.kind === 'empty-state') {
    return (
      <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[var(--color-page-line)] px-6 py-6 text-center">
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
      <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[var(--color-page-line)] px-6 py-6">
        <p className="text-sm leading-7 text-[var(--color-page-muted)]">
          {block.text}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[var(--color-page-line)] px-6 py-6">
      <p className="text-sm leading-7 text-[var(--color-page-muted)]">
        {block.text}
      </p>
    </div>
  );
};
