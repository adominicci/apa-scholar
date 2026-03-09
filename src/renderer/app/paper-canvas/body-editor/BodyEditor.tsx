import { useEffect, useRef, useState } from 'react';
import type { BodyEditorPasteResult } from '@application/services/paste-engine';
import {
  sanitizeBodyEditorClipboardPayload,
  transformBodyEditorPastedHtml,
  transformBodyEditorPastedText,
} from '@application/services/paste-engine';
import { EditorContent, useEditor } from '@tiptap/react';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import { deserializeBodyEditorDocument } from '@domain/papers/body-editor-serialization';
import { createBodyEditorExtensions } from '@renderer/app/paper-canvas/body-editor/create-body-editor-extensions';
import { PasteReviewModal } from '@renderer/app/paper-canvas/body-editor/PasteReviewModal';

interface BodyEditorProps {
  document: BodyEditorDocument;
  onChange: (document: BodyEditorDocument) => void;
  placeholder: string;
}

export const BodyEditor = ({
  document,
  onChange,
  placeholder,
}: BodyEditorProps) => {
  const editorRootRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  const [pendingPaste, setPendingPaste] = useState<BodyEditorPasteResult | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    content: deserializeBodyEditorDocument(document),
    editorProps: {
      attributes: {
        'aria-label': 'Paper body draft',
        'aria-multiline': 'true',
        class:
          'min-h-[260px] rounded-[var(--radius-card)] border border-[var(--color-page-line)] bg-[var(--color-page-muted-surface)] px-5 py-4 text-base leading-8 text-[var(--color-page-ink)] outline-none transition focus:border-[var(--color-accent-soft)]',
        role: 'textbox',
        spellcheck: 'false',
      },
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData;

        if (!clipboardData) {
          return false;
        }

        const result = sanitizeBodyEditorClipboardPayload({
          html: clipboardData.getData('text/html'),
          text: clipboardData.getData('text/plain'),
        });

        if (!result.requiresReview) {
          return false;
        }

        setPendingPaste(result);
        return true;
      },
      transformPastedHTML: transformBodyEditorPastedHtml,
      transformPastedText: transformBodyEditorPastedText,
    },
    extensions: createBodyEditorExtensions(),
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(deserializeBodyEditorDocument(currentEditor.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextDocument = deserializeBodyEditorDocument(document);
    const currentDocument = deserializeBodyEditorDocument(editor.getJSON());

    if (JSON.stringify(currentDocument) === JSON.stringify(nextDocument)) {
      return;
    }

    editor.commands.setContent(nextDocument, { emitUpdate: false });
  }, [document, editor]);

  return (
    <div className="mt-6">
      <label
        className="block text-sm font-medium text-[var(--color-page-ink)]"
        onClick={() => {
          editorRootRef.current
            ?.querySelector<HTMLElement>('[contenteditable="true"]')
            ?.focus();
        }}
      >
        Paper body draft
      </label>
      <div className="mt-3" ref={editorRootRef}>
        <EditorContent editor={editor} />
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--color-page-muted)]">
        {placeholder}
      </p>
      <PasteReviewModal
        isOpen={pendingPaste !== null}
        onCancel={() => setPendingPaste(null)}
        onConfirm={() => {
          if (editor && pendingPaste) {
            editor.commands.insertContent(pendingPaste.document.content);
          }

          setPendingPaste(null);
        }}
        previewText={pendingPaste?.previewText ?? ''}
        warnings={pendingPaste?.warnings ?? []}
      />
    </div>
  );
};
