const toolbarItems = [
  { icon: 'book', label: 'References', action: 'references' },
  { icon: 'format_quote', label: 'Citation', action: 'citation' },
  { icon: 'add', label: 'Insert', action: 'insert' },
  { icon: 'text_format', label: 'Font', action: 'font' },
  { icon: 'format_indent_increase', label: 'Block quote', action: 'blockquote' },
] as const;

export const PaperCanvasToolbar = () => (
  <div className="sticky top-8 flex flex-col items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] p-1.5 shadow-[var(--shadow-shell)]">
    {toolbarItems.map((item) => (
      <button
        aria-label={item.label}
        className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-muted)] hover:text-[var(--color-accent-strong)]"
        key={item.action}
        title={item.label}
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          {item.icon}
        </span>
      </button>
    ))}
  </div>
);
