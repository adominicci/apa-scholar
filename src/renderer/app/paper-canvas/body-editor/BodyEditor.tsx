import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import { deserializeBodyEditorDocument } from '@domain/papers/body-editor-serialization';
import { createBodyEditorExtensions } from '@renderer/app/paper-canvas/body-editor/create-body-editor-extensions';

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
  const editor = useEditor({
    content: deserializeBodyEditorDocument(document),
    editorProps: {
      attributes: {
        'aria-label': 'Paper body draft',
        'aria-multiline': 'true',
        class:
          'min-h-[260px] rounded-[var(--radius-card)] border border-[var(--color-page-line)] bg-[var(--color-page-muted-surface)] px-5 py-4 text-base leading-8 text-[var(--color-page-ink)] outline-none transition focus:border-[var(--color-accent-soft)]',
        role: 'textbox',
      },
    },
    extensions: createBodyEditorExtensions(),
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(deserializeBodyEditorDocument(currentEditor.getJSON()));
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
        htmlFor="paper-body-editor"
      >
        Paper body draft
      </label>
      <div className="mt-3">
        <EditorContent editor={editor} id="paper-body-editor" />
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--color-page-muted)]">
        {placeholder}
      </p>
    </div>
  );
};
