import type { Ref } from 'react';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { GhostPageBlockViewModel, GhostPageViewModel } from '@domain/papers/ghost-page-view-model';
import { BodyEditor, type BodyEditorHandle } from '@renderer/app/paper-canvas/body-editor/BodyEditor';

interface PaperCanvasBlockProps {
  block: GhostPageBlockViewModel;
  bodyDocument: BodyEditorDocument;
  bodyEditorRef?: Ref<BodyEditorHandle>;
  onBodyDocumentChange: (document: BodyEditorDocument) => void;
  onPasteWarningsChange: (warnings: string[]) => void;
  pageKind: GhostPageViewModel['kind'];
}

export const PaperCanvasBlock = ({
  block,
  bodyDocument,
  bodyEditorRef,
  onBodyDocumentChange,
  onPasteWarningsChange,
  pageKind,
}: PaperCanvasBlockProps) => {
  if (block.kind === 'title') {
    return (
      <p
        className="font-[var(--font-display)] font-bold leading-[2] text-[var(--color-page-ink)]"
        style={{ fontSize: 'var(--apa-font-size)' }}
      >
        {block.text}
      </p>
    );
  }

  if (block.kind === 'line') {
    return (
      <p
        className={`font-[var(--font-display)] leading-[2] text-[var(--color-page-ink)] ${
          block.align === 'center' ? 'text-center' : ''
        }`}
        style={{ fontSize: 'var(--apa-font-size)' }}
      >
        {block.text}
      </p>
    );
  }

  if (block.kind === 'section-heading') {
    return (
      <p
        aria-level={pageKind === 'body-page' ? 3 : undefined}
        className="font-[var(--font-display)] font-bold leading-[2] text-center text-[var(--color-page-ink)]"
        role={pageKind === 'body-page' ? 'heading' : undefined}
        style={{ fontSize: 'var(--apa-font-size)' }}
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

  if (block.kind === 'reference-line') {
    return (
      <p
        className="font-[var(--font-display)] leading-[2] text-[var(--color-page-ink)]"
        style={{ paddingLeft: '2em', textIndent: '-2em', fontSize: 'var(--apa-font-size)' }}
      >
        {block.text}
      </p>
    );
  }

  if (block.kind === 'body-editor') {
    return (
      <BodyEditor
        ref={bodyEditorRef}
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
