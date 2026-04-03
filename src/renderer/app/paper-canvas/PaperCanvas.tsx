import type { Ref } from 'react';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type { GhostPageViewModel } from '@domain/papers/ghost-page-view-model';
import type { BodyEditorHandle } from '@renderer/app/paper-canvas/body-editor/BodyEditor';
import { PaperCanvasBlock } from '@renderer/app/paper-canvas/PaperCanvasBlock';
import { PaperCanvasPage } from '@renderer/app/paper-canvas/PaperCanvasPage';
import { PaperCanvasToolbar } from '@renderer/app/paper-canvas/PaperCanvasToolbar';

interface PaperCanvasProps {
  bodyDocument: BodyEditorDocument;
  bodyEditorRef?: Ref<BodyEditorHandle>;
  paperDraft: PaperDraft;
  onBodyDocumentChange: (document: BodyEditorDocument) => void;
  onPasteWarningsChange: (warnings: string[]) => void;
}

const getBlocksWrapperClass = (kind: GhostPageViewModel['kind']): string => {
  if (kind === 'title-page') {
    return 'flex flex-1 flex-col items-center justify-center text-center';
  }
  return 'mt-[var(--page-margin)]';
};

export const PaperCanvas = ({
  bodyDocument,
  bodyEditorRef,
  paperDraft,
  onBodyDocumentChange,
  onPasteWarningsChange,
}: PaperCanvasProps) => (
  <div className="flex items-start justify-center gap-4 py-8">
    <PaperCanvasToolbar />
    <div className="flex flex-col items-center gap-[var(--page-gap)]">
      {paperDraft.ghostPages.map((page) => (
        <PaperCanvasPage key={page.id} page={page}>
          <div className={getBlocksWrapperClass(page.kind)}>
            {page.blocks.map((block) => (
              <PaperCanvasBlock
                block={block}
                bodyDocument={bodyDocument}
                bodyEditorRef={block.kind === 'body-editor' ? bodyEditorRef : undefined}
                key={block.id}
                onBodyDocumentChange={onBodyDocumentChange}
                onPasteWarningsChange={onPasteWarningsChange}
                pageKind={page.kind}
              />
            ))}
          </div>
        </PaperCanvasPage>
      ))}
    </div>
  </div>
);
