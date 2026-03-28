import type { ReferenceEntry, ReferenceType } from '@domain/references/reference-entry';

interface ReferencesPanelProps {
  references: ReferenceEntry[];
  onAddReference: () => void;
  onEditReference: (referenceId: string) => void;
  onDeleteReference: (referenceId: string) => void;
}

const typeLabels: Record<ReferenceType, string> = {
  'journal-article': 'Journal',
  'book': 'Book',
  'edited-book-chapter': 'Chapter',
  'website': 'Website',
  'conference-paper': 'Conference',
  'report': 'Report',
};

const getAuthorSummary = (fields: Record<string, unknown>): string => {
  const authors = fields.authors as Array<{ family: string; given: string }> | undefined;

  if (!authors || authors.length === 0) {
    return 'Unknown';
  }

  if (authors.length === 1) {
    return authors[0]!.family;
  }

  if (authors.length === 2) {
    return `${authors[0]!.family} & ${authors[1]!.family}`;
  }

  return `${authors[0]!.family} et al.`;
};

export const ReferencesPanel = ({
  references,
  onAddReference,
  onEditReference,
  onDeleteReference,
}: ReferencesPanelProps) => (
  <div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="label-caps">References</p>
        {references.length > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent-soft)] px-1.5 text-[10px] font-bold text-[var(--color-accent-strong)]">
            {references.length}
          </span>
        )}
      </div>
      <button
        className="rounded-[var(--radius-button)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-ink-strong)] transition hover:border-[var(--color-accent-soft)]"
        onClick={onAddReference}
        type="button"
      >
        Add reference
      </button>
    </div>

    {references.length === 0 ? (
      <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
        No references yet. Add your first reference to start building your
        reference list.
      </p>
    ) : (
      <div className="mt-4 space-y-2">
        {references.map((ref) => (
          <div
            className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] p-3"
            key={ref.id}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-ink-strong)] truncate">
                  {(ref.fields.title as string) ?? 'Untitled'}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  {getAuthorSummary(ref.fields)}
                  {ref.fields.year ? ` (${ref.fields.year})` : ' (n.d.)'}
                </p>
              </div>
              <span className="shrink-0 rounded bg-[var(--color-panel)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted)]">
                {typeLabels[ref.referenceType]}
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                className="text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-accent-strong)] transition hover:underline"
                onClick={() => onEditReference(ref.id)}
                type="button"
              >
                Edit
              </button>
              <button
                className="text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted)] transition hover:text-[var(--color-ink-strong)]"
                onClick={() => onDeleteReference(ref.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
