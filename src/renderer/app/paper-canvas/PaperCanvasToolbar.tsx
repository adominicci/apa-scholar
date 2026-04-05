import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedBodyEditorHeadingLevels } from '@domain/papers/body-editor-schema';
import type { PaperDraft } from '@domain/papers/paper-draft';

interface PaperCanvasToolbarProps {
  abstractEnabled: boolean;
  onOpenDetails?: () => void;
  onToggleBulletList?: () => void;
  onToggleBlockquote?: () => void;
  onToggleAbstract?: () => void;
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

export const PaperCanvasToolbar = ({
  abstractEnabled,
  onOpenDetails,
  onToggleBulletList,
  onToggleBlockquote,
  onToggleAbstract,
  onOpenReferences,
  onOpenCitation,
  onSetHeadingLevel,
  onSetPaperType,
  onSetParagraph,
  onToggleOrderedList,
  paperType,
}: PaperCanvasToolbarProps) => {
  const { t } = useTranslation();
  const [isApaMenuOpen, setIsApaMenuOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const items = [
    { icon: 'book', labelKey: 'toolbar.references', onClick: onOpenReferences },
    { icon: 'format_quote', labelKey: 'toolbar.citation', onClick: onOpenCitation },
    { icon: 'add', labelKey: 'toolbar.insert', onClick: () => setIsApaMenuOpen((open) => !open) },
    { icon: 'text_format', labelKey: 'toolbar.font', onClick: () => setIsApaMenuOpen((open) => !open) },
    { icon: 'format_indent_increase', labelKey: 'toolbar.blockQuote', onClick: onToggleBlockquote },
  ];

  useEffect(() => {
    if (!isApaMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!toolbarRef.current?.contains(event.target as Node)) {
        setIsApaMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsApaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isApaMenuOpen]);

  return (
    <div className="sticky top-8 z-20" ref={toolbarRef}>
      {isApaMenuOpen ? (
        <div
          aria-label={t('toolbar.apaFormat')}
          className="absolute left-full top-0 z-30 ml-3 flex max-h-[80vh] w-72 translate-y-0 flex-col gap-4 overflow-y-auto rounded-[var(--radius-panel)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4 shadow-[var(--shadow-shell)]"
          role="dialog"
        >
          <div>
            <p className="label-caps text-[var(--color-accent-strong)]">
              {t('toolbar.apaFormat')}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {t('toolbar.apaFormatDescription')}
            </p>
          </div>

          <section>
            <p className="label-caps text-[var(--color-muted-strong)]">
              {t('toolbar.paperSetup')}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                aria-pressed={paperType === 'student'}
                className={`rounded-[var(--radius-card)] border px-3 py-2 text-sm transition-colors ${
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
                className={`rounded-[var(--radius-card)] border px-3 py-2 text-sm transition-colors ${
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
            <div className="mt-3 flex flex-col gap-2">
              <button
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-left text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                onClick={onToggleAbstract}
                type="button"
              >
                {abstractEnabled ? t('toolbar.removeAbstract') : t('toolbar.includeAbstract')}
              </button>
              <button
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-left text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                onClick={onOpenDetails}
                type="button"
              >
                {t('toolbar.paperDetails')}
              </button>
            </div>
          </section>

          <section>
            <p className="label-caps text-[var(--color-muted-strong)]">
              {t('toolbar.textStructure')}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                onClick={onSetParagraph}
                type="button"
              >
                {t('toolbar.bodyText')}
              </button>
              {supportedBodyEditorHeadingLevels.map((level) => (
                <button
                  className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                  key={level}
                  onClick={() => onSetHeadingLevel?.(level)}
                  type="button"
                >
                  {t('toolbar.headingLevel', { level })}
                </button>
              ))}
              <button
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                onClick={onToggleBulletList}
                type="button"
              >
                {t('toolbar.bulletedList')}
              </button>
              <button
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                onClick={onToggleOrderedList}
                type="button"
              >
                {t('toolbar.numberedList')}
              </button>
              <button
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                onClick={onToggleBlockquote}
                type="button"
              >
                {t('toolbar.blockQuote')}
              </button>
            </div>
          </section>

          <section>
            <p className="label-caps text-[var(--color-muted-strong)]">
              {t('toolbar.apaWorkflow')}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                onClick={onOpenReferences}
                type="button"
              >
                {t('toolbar.references')}
              </button>
              <button
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-sm text-[var(--color-ink-strong)] transition-colors hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
                onClick={onOpenCitation}
                type="button"
              >
                {t('toolbar.citation')}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] p-1.5 shadow-[var(--shadow-shell)]">
      {items.map((item) => {
        const label = t(item.labelKey);

        return (
          <button
            aria-label={label}
            aria-expanded={
              (item.labelKey === 'toolbar.insert' || item.labelKey === 'toolbar.font') && isApaMenuOpen
                ? true
                : undefined
            }
            aria-haspopup={
              item.labelKey === 'toolbar.insert' || item.labelKey === 'toolbar.font'
                ? 'dialog'
                : undefined
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-muted)] hover:text-[var(--color-accent-strong)]"
            key={item.labelKey}
            onClick={item.onClick}
            title={label}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {item.icon}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
};
