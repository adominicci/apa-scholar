import type { PaperDraft } from '@domain/papers/paper-draft';
import { PaperCanvasBlock } from '@renderer/app/paper-canvas/PaperCanvasBlock';
import { PaperCanvasPage } from '@renderer/app/paper-canvas/PaperCanvasPage';

interface PaperCanvasProps {
  bodyDraftValue: string;
  paperDraft: PaperDraft;
  onBodyDraftChange: (value: string) => void;
}

export const PaperCanvas = ({
  bodyDraftValue,
  paperDraft,
  onBodyDraftChange,
}: PaperCanvasProps) => (
  <div className="grid gap-6">
    {paperDraft.ghostPages.map((page) => (
      <PaperCanvasPage key={page.id} page={page}>
        <div className={`mt-8 space-y-5 ${page.kind === 'title-page' ? 'text-center' : ''}`}>
          {page.blocks.map((block) => (
            <PaperCanvasBlock
              block={block}
              bodyDraftValue={bodyDraftValue}
              key={block.id}
              onBodyDraftChange={onBodyDraftChange}
              pageKind={page.kind}
            />
          ))}
        </div>
      </PaperCanvasPage>
    ))}
  </div>
);
