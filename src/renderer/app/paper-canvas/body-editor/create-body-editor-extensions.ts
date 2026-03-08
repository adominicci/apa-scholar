import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import History from '@tiptap/extension-history';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import type { Extensions } from '@tiptap/react';
import { supportedBodyEditorHeadingLevels } from '@domain/papers/body-editor-schema';

export const createBodyEditorExtensions = (): Extensions => [
  Document,
  Paragraph,
  Text,
  History,
  HardBreak.extend({
    addKeyboardShortcuts() {
      return {
        'Mod-Enter': () => this.editor.commands.setHardBreak(),
        'Shift-Enter': () => this.editor.commands.setHardBreak(),
      };
    },
  }),
  Bold,
  Italic,
  Heading.configure({
    levels: [...supportedBodyEditorHeadingLevels],
  }).extend({
    addKeyboardShortcuts() {
      return Object.fromEntries(
        supportedBodyEditorHeadingLevels.map((level) => [
          `Mod-Alt-${level}`,
          () => this.editor.commands.toggleHeading({ level }),
        ]),
      ) as Record<string, () => boolean>;
    },
  }),
  Blockquote.extend({
    addKeyboardShortcuts() {
      return {
        'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
      };
    },
  }),
];
