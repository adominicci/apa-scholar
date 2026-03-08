import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { PaperDraft } from '@domain/papers/paper-draft';
import { PaperCanvasBlock } from '@renderer/app/paper-canvas/PaperCanvasBlock';
import { PaperCanvasPage } from '@renderer/app/paper-canvas/PaperCanvasPage';

interface PaperCanvasProps {
  bodyDocument: BodyEditorDocument;
  paperDraft: PaperDraft;
  onBodyDocumentChange: (document: BodyEditorDocument) => void;
}

export const PaperCanvas = ({
  bodyDocument,
  paperDraft,
  onBodyDocumentChange,
}: PaperCanvasProps) => (
  <div className="grid gap-6">
    {paperDraft.ghostPages.map((page) => (
      <PaperCanvasPage key={page.id} page={page}>
        <div className={`mt-8 space-y-5 ${page.kind === 'title-page' ? 'text-center' : ''}`}>
          {page.blocks.map((block) => (
            <PaperCanvasBlock
              block={block}
              bodyDocument={bodyDocument}
              key={block.id}
              onBodyDocumentChange={onBodyDocumentChange}
              pageKind={page.kind}
            />
          ))}
        </div>
      </PaperCanvasPage>
    ))}
  </div>
);
