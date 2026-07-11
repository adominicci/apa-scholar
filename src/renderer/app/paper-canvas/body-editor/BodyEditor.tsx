import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { BodyEditorPasteResult } from '@application/services/paste-engine';
import {
  detectBodyEditorClipboardWarnings,
  sanitizeBodyEditorClipboardPayload,
  transformBodyEditorPastedHtml,
  transformBodyEditorPastedText,
} from '@application/services/paste-engine';
import { EditorContent, useEditor } from '@tiptap/react';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import { supportedBodyEditorHeadingLevels } from '@domain/papers/body-editor-schema';
import { deserializeBodyEditorDocument } from '@domain/papers/body-editor-serialization';
import { createBodyEditorExtensions } from '@renderer/app/paper-canvas/body-editor/create-body-editor-extensions';
import { PasteReviewModal } from '@renderer/app/paper-canvas/body-editor/PasteReviewModal';

export interface BodyEditorHandle {
  insertCitation: (referenceId: string, citationText: string) => void;
  setHeadingLevel: (
    level: (typeof supportedBodyEditorHeadingLevels)[number],
  ) => void;
  setParagraph: () => void;
  toggleBulletList: () => void;
  toggleBlockquote: () => void;
  toggleOrderedList: () => void;
}

interface BodyEditorProps {
  document: BodyEditorDocument;
  onChange: (document: BodyEditorDocument) => void;
  onPasteWarningsChange?: (warnings: string[]) => void;
  placeholder: string;
}

export const BodyEditor = forwardRef<BodyEditorHandle, BodyEditorProps>(
  ({ document, onChange, onPasteWarningsChange, placeholder }, ref) => {
    const editorRootRef = useRef<HTMLDivElement | null>(null);
    const onChangeRef = useRef(onChange);
    const [pendingPaste, setPendingPaste] =
      useState<BodyEditorPasteResult | null>(null);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const focusEditorSurface = useCallback(() => {
      const editorSurface = editorRootRef.current?.querySelector<HTMLElement>(
        '[contenteditable="true"]',
      );

      if (editorSurface) {
        editorSurface.focus();
        return;
      }

      editorRootRef.current
        ?.querySelector<HTMLElement>('[data-editor-surface="true"]')
        ?.focus();
    }, []);

    const closePendingPaste = useCallback(() => {
      setPendingPaste(null);
      onPasteWarningsChange?.([]);
      requestAnimationFrame(() => {
        focusEditorSurface();
      });
    }, [focusEditorSurface, onPasteWarningsChange]);

    const editor = useEditor({
      content: deserializeBodyEditorDocument(document),
      editorProps: {
        attributes: {
          'aria-label': 'Paper body draft',
          'aria-multiline': 'true',
          class:
            'min-h-[200px] font-[var(--font-display)] text-base leading-[2] text-[var(--color-page-ink)] outline-none',
          'data-editor-surface': 'true',
          role: 'textbox',
          spellcheck: 'false',
        },
        handlePaste: (_view, event) => {
          const clipboardData = event.clipboardData;

          if (!clipboardData) {
            return false;
          }

          const clipboardPayload = {
            html: clipboardData.getData('text/html'),
            text: clipboardData.getData('text/plain'),
          };
          const warnings = detectBodyEditorClipboardWarnings(clipboardPayload);

          if (warnings.length === 0) {
            onPasteWarningsChange?.([]);
            return false;
          }

          const sanitizedPaste =
            sanitizeBodyEditorClipboardPayload(clipboardPayload);

          setPendingPaste(sanitizedPaste);
          onPasteWarningsChange?.(sanitizedPaste.warnings);
          return true;
        },
        transformPastedHTML: transformBodyEditorPastedHtml,
        transformPastedText: transformBodyEditorPastedText,
      },
      extensions: createBodyEditorExtensions(placeholder),
      immediatelyRender: false,
      onUpdate: ({ editor: currentEditor }) => {
        onChangeRef.current(
          deserializeBodyEditorDocument(currentEditor.getJSON()),
        );
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        insertCitation(referenceId: string, citationText: string) {
          if (!editor) return;
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'text',
              text: citationText,
              marks: [{ type: 'citation', attrs: { referenceId } }],
            })
            .run();
        },
        setHeadingLevel(level) {
          if (!editor) return;
          editor.chain().focus().toggleHeading({ level }).run();
        },
        setParagraph() {
          if (!editor) return;
          editor.chain().focus().setParagraph().run();
        },
        toggleBulletList() {
          if (!editor) return;
          editor.chain().focus().toggleBulletList().run();
        },
        toggleBlockquote() {
          if (!editor) return;
          editor.chain().focus().toggleBlockquote().run();
        },
        toggleOrderedList() {
          if (!editor) return;
          editor.chain().focus().toggleOrderedList().run();
        },
      }),
      [editor],
    );

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
      <div className="apa-body-editor" ref={editorRootRef}>
        <EditorContent editor={editor} />
        <PasteReviewModal
          isOpen={pendingPaste !== null}
          onCancel={closePendingPaste}
          onConfirm={() => {
            if (editor && pendingPaste) {
              editor.commands.insertContent(pendingPaste.document.content);
            }

            closePendingPaste();
          }}
          previewText={pendingPaste?.previewText ?? ''}
          warnings={pendingPaste?.warnings ?? []}
        />
      </div>
    );
  },
);

BodyEditor.displayName = 'BodyEditor';
