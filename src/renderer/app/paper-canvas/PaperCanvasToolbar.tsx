import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedBodyEditorHeadingLevels } from '@domain/papers/body-editor-schema';
import type { PaperDraft } from '@domain/papers/paper-draft';

/** APA 7th Edition accepted fonts with their required sizes. */
const apaFonts = [
  {
    id: 'times',
    label: 'Times New Roman',
    family: "'Times New Roman', Times, serif",
    size: '12pt',
  },
  {
    id: 'calibri',
    label: 'Calibri',
    family: "Calibri, 'Gill Sans', sans-serif",
    size: '11pt',
  },
  {
    id: 'arial',
    label: 'Arial',
    family: 'Arial, Helvetica, sans-serif',
    size: '11pt',
  },
  {
    id: 'georgia',
    label: 'Georgia',
    family: "Georgia, 'Palatino Linotype', serif",
    size: '11pt',
  },
  {
    id: 'lucida',
    label: 'Lucida Sans',
    family: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
    size: '10pt',
  },
] as const;

export type ApaFontId = (typeof apaFonts)[number]['id'];

interface PaperCanvasToolbarProps {
  collapsed: boolean;
  selectedFont: ApaFontId;
  onCollapsedChange: (collapsed: boolean) => void;
  onFontChange?: (fontId: ApaFontId) => void;
  onToggleBulletList?: () => void;
  onToggleBlockquote?: () => void;
  onOpenReferences?: () => void;
  onOpenCitation?: () => void;
  onSetHeadingLevel?: (
    level: (typeof supportedBodyEditorHeadingLevels)[number],
  ) => void;
  onSetPaperType?: (paperType: PaperDraft['paper']['paperType']) => void;
  onSetParagraph?: () => void;
  onToggleOrderedList?: () => void;
  paperType: PaperDraft['paper']['paperType'];
}

const sectionButtonClass =
  'rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-[13px] text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]';

export const PaperCanvasToolbar = ({
  collapsed,
  selectedFont,
  onCollapsedChange,
  onFontChange,
  onToggleBulletList,
  onToggleBlockquote,
  onOpenReferences,
  onOpenCitation,
  onSetHeadingLevel,
  onSetPaperType,
  onSetParagraph,
  onToggleOrderedList,
  paperType,
}: PaperCanvasToolbarProps) => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(
    'paperSetup',
  );

  const toggleSection = (section: string) =>
    setExpandedSection((current) => (current === section ? null : section));

  if (collapsed) {
    return (
      <div className="flex w-10 flex-col items-center border-r border-[var(--color-line)] bg-[var(--color-panel)] py-4">
        <button
          aria-label={t('toolbar.showPanel')}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          onClick={() => onCollapsedChange(false)}
          title={t('toolbar.showPanel')}
          type="button"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px' }}
          >
            chevron_right
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-panel)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
        <p className="label-caps text-[var(--color-accent-strong)]">
          {t('toolbar.apaFormat')}
        </p>
        <button
          aria-label={t('toolbar.hidePanel')}
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          onClick={() => onCollapsedChange(true)}
          type="button"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px' }}
          >
            chevron_left
          </span>
        </button>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Paper Setup */}
        <div className="border-b border-[var(--color-line)]">
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => toggleSection('paperSetup')}
            type="button"
          >
            <span className="label-caps text-[var(--color-muted-strong)]">
              {t('toolbar.paperSetup')}
            </span>
            <span
              className="material-symbols-outlined text-[var(--color-muted)]"
              style={{ fontSize: '16px' }}
            >
              {expandedSection === 'paperSetup' ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {expandedSection === 'paperSetup' && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  aria-pressed={paperType === 'student'}
                  className={`rounded-[var(--radius-card)] border px-3 py-2 text-[13px] transition-colors ${
                    paperType === 'student'
                      ? 'border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]'
                      : 'border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]'
                  }`}
                  onClick={() => onSetPaperType?.('student')}
                  type="button"
                >
                  {t('toolbar.apaBasic')}
                </button>
                <button
                  aria-pressed={paperType === 'professional'}
                  className={`rounded-[var(--radius-card)] border px-3 py-2 text-[13px] transition-colors ${
                    paperType === 'professional'
                      ? 'border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]'
                      : 'border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]'
                  }`}
                  onClick={() => onSetPaperType?.('professional')}
                  type="button"
                >
                  {t('toolbar.apaProfessional')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Font */}
        <div className="border-b border-[var(--color-line)]">
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => toggleSection('font')}
            type="button"
          >
            <span className="label-caps text-[var(--color-muted-strong)]">
              {t('toolbar.font')}
            </span>
            <span
              className="material-symbols-outlined text-[var(--color-muted)]"
              style={{ fontSize: '16px' }}
            >
              {expandedSection === 'font' ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {expandedSection === 'font' && (
            <div className="px-4 pb-4 space-y-1.5">
              {apaFonts.map((font) => (
                <button
                  aria-pressed={selectedFont === font.id}
                  className={`flex w-full items-center justify-between rounded-[var(--radius-card)] border px-3 py-2 text-left transition-colors ${
                    selectedFont === font.id
                      ? 'border-[var(--color-accent-soft)] bg-[var(--color-selection)] text-[var(--color-ink-strong)]'
                      : 'border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)] hover:border-[var(--color-accent-soft)]'
                  }`}
                  key={font.id}
                  onClick={() => onFontChange?.(font.id)}
                  type="button"
                >
                  <span
                    className="text-[13px]"
                    style={{ fontFamily: font.family }}
                  >
                    {font.label}
                  </span>
                  <span className="text-[11px] text-[var(--color-muted)]">
                    {font.size}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Structure */}
        <div className="border-b border-[var(--color-line)]">
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => toggleSection('textStructure')}
            type="button"
          >
            <span className="label-caps text-[var(--color-muted-strong)]">
              {t('toolbar.textStructure')}
            </span>
            <span
              className="material-symbols-outlined text-[var(--color-muted)]"
              style={{ fontSize: '16px' }}
            >
              {expandedSection === 'textStructure'
                ? 'expand_less'
                : 'expand_more'}
            </span>
          </button>
          {expandedSection === 'textStructure' && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={sectionButtonClass}
                  onClick={onSetParagraph}
                  type="button"
                >
                  {t('toolbar.bodyText')}
                </button>
                {supportedBodyEditorHeadingLevels.map((level) => (
                  <button
                    className={sectionButtonClass}
                    key={level}
                    onClick={() => onSetHeadingLevel?.(level)}
                    type="button"
                  >
                    {t('toolbar.headingLevel', { level })}
                  </button>
                ))}
                <button
                  className={sectionButtonClass}
                  onClick={onToggleBulletList}
                  type="button"
                >
                  {t('toolbar.bulletedList')}
                </button>
                <button
                  className={sectionButtonClass}
                  onClick={onToggleOrderedList}
                  type="button"
                >
                  {t('toolbar.numberedList')}
                </button>
                <button
                  className={sectionButtonClass}
                  onClick={onToggleBlockquote}
                  type="button"
                >
                  {t('toolbar.blockQuote')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* APA Workflow */}
        <div>
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => toggleSection('apaWorkflow')}
            type="button"
          >
            <span className="label-caps text-[var(--color-muted-strong)]">
              {t('toolbar.apaWorkflow')}
            </span>
            <span
              className="material-symbols-outlined text-[var(--color-muted)]"
              style={{ fontSize: '16px' }}
            >
              {expandedSection === 'apaWorkflow'
                ? 'expand_less'
                : 'expand_more'}
            </span>
          </button>
          {expandedSection === 'apaWorkflow' && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={sectionButtonClass}
                  onClick={onOpenReferences}
                  type="button"
                >
                  {t('toolbar.references')}
                </button>
                <button
                  className={sectionButtonClass}
                  onClick={onOpenCitation}
                  type="button"
                >
                  {t('toolbar.citation')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { apaFonts };
