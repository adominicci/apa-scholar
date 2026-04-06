import type { Ref } from 'react';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type { GhostPageViewModel } from '@domain/papers/ghost-page-view-model';
import type { BodyEditorHandle } from '@renderer/app/paper-canvas/body-editor/BodyEditor';
import { PaperCanvasBlock } from '@renderer/app/paper-canvas/PaperCanvasBlock';
import { PaperCanvasPage } from '@renderer/app/paper-canvas/PaperCanvasPage';
import { PaperCanvasToolbar, apaFonts, type ApaFontId } from '@renderer/app/paper-canvas/PaperCanvasToolbar';

interface PaperCanvasProps {
  bodyDocument: BodyEditorDocument;
  bodyEditorRef?: Ref<BodyEditorHandle>;
  formatPanelCollapsed: boolean;
  selectedFont: ApaFontId;
  onFormatPanelCollapsedChange: (collapsed: boolean) => void;
  onFontChange?: (fontId: ApaFontId) => void;
  onOpenDetails?: () => void;
  paperDraft: PaperDraft;
  onBodyDocumentChange: (document: BodyEditorDocument) => void;
  onOpenCitation?: () => void;
  onOpenReferences?: () => void;
  onPasteWarningsChange: (warnings: string[]) => void;
  onSetHeadingLevel?: (level: 1 | 2 | 3 | 4 | 5) => void;
  onSetPaperType?: (paperType: PaperDraft['paper']['paperType']) => void;
  onSetParagraph?: () => void;
  onToggleBulletList?: () => void;
  onToggleBlockquote?: () => void;
  onToggleAbstract?: () => void;
  onToggleOrderedList?: () => void;
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
  formatPanelCollapsed,
  selectedFont,
  onFormatPanelCollapsedChange,
  onFontChange,
  onOpenDetails,
  paperDraft,
  onBodyDocumentChange,
  onOpenCitation,
  onOpenReferences,
  onPasteWarningsChange,
  onSetHeadingLevel,
  onSetPaperType,
  onSetParagraph,
  onToggleBulletList,
  onToggleBlockquote,
  onToggleAbstract,
  onToggleOrderedList,
}: PaperCanvasProps) => (
  <div className="flex flex-1 overflow-hidden">
    <PaperCanvasToolbar
      abstractEnabled={paperDraft.paperMeta.abstractEnabled}
      collapsed={formatPanelCollapsed}
      selectedFont={selectedFont}
      onCollapsedChange={onFormatPanelCollapsedChange}
      onFontChange={onFontChange}
      onOpenCitation={onOpenCitation}
      onOpenDetails={onOpenDetails}
      onOpenReferences={onOpenReferences}
      onSetHeadingLevel={onSetHeadingLevel}
      onSetPaperType={onSetPaperType}
      onSetParagraph={onSetParagraph}
      onToggleBulletList={onToggleBulletList}
      onToggleBlockquote={onToggleBlockquote}
      onToggleAbstract={onToggleAbstract}
      onToggleOrderedList={onToggleOrderedList}
      paperType={paperDraft.paper.paperType}
    />
    <div
      className="flex-1 overflow-y-auto"
      style={{
        '--font-display': apaFonts.find((f) => f.id === selectedFont)?.family ?? apaFonts[0].family,
      } as React.CSSProperties}
    >
      <div className="flex flex-col items-center gap-[var(--page-gap)] py-8">
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
  </div>
);
