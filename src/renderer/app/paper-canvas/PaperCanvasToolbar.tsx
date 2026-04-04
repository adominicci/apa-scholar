import { useTranslation } from 'react-i18next';

interface PaperCanvasToolbarProps {
  onToggleBlockquote?: () => void;
  onOpenReferences?: () => void;
  onOpenCitation?: () => void;
}

export const PaperCanvasToolbar = ({
  onToggleBlockquote,
  onOpenReferences,
  onOpenCitation,
}: PaperCanvasToolbarProps) => {
  const { t } = useTranslation();

  const items = [
    { icon: 'book', labelKey: 'toolbar.references', onClick: onOpenReferences },
    { icon: 'format_quote', labelKey: 'toolbar.citation', onClick: onOpenCitation },
    { icon: 'add', labelKey: 'toolbar.insert', onClick: undefined },
    { icon: 'text_format', labelKey: 'toolbar.font', onClick: undefined },
    { icon: 'format_indent_increase', labelKey: 'toolbar.blockQuote', onClick: onToggleBlockquote },
  ];

  return (
    <div className="sticky top-8 flex flex-col items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] p-1.5 shadow-[var(--shadow-shell)]">
      {items.map((item) => {
        const label = t(item.labelKey);
        const disabled = !item.onClick;

        return (
          <button
            aria-label={label}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              disabled
                ? 'text-[var(--color-muted)] cursor-default'
                : 'text-[var(--color-ink)] hover:bg-[var(--color-panel-muted)] hover:text-[var(--color-accent-strong)]'
            }`}
            disabled={disabled}
            key={item.labelKey}
            onClick={item.onClick}
            title={disabled ? `${label} — ${t('toolbar.comingSoon')}` : label}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {item.icon}
            </span>
          </button>
        );
      })}
    </div>
  );
};
