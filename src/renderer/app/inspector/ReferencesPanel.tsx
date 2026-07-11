import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ReferenceEntry,
  ReferenceType,
} from '@domain/references/reference-entry';
import { formatReferenceApa } from '@domain/references/apa-formatter';

interface ReferencesPanelProps {
  references: ReferenceEntry[];
  onAddReference: () => void;
  onEditReference: (referenceId: string) => void;
  onDeleteReference: (referenceId: string) => void;
  onInsertCitation?: (referenceId: string) => void;
}

const typeLabelKeys: Record<ReferenceType, string> = {
  'journal-article': 'references.typeJournal',
  book: 'references.typeBook',
  'edited-book-chapter': 'references.typeChapter',
  website: 'references.typeWebsite',
  'conference-paper': 'references.typeConference',
  report: 'references.typeReport',
};

const getAuthorSummary = (
  fields: Record<string, unknown>,
  unknownLabel: string,
): string => {
  const authors = fields.authors as
    | Array<{ family: string; given: string }>
    | undefined;

  if (!authors || authors.length === 0) {
    return unknownLabel;
  }

  if (authors.length === 1) {
    return authors[0]!.family;
  }

  if (authors.length === 2) {
    return `${authors[0]!.family} & ${authors[1]!.family}`;
  }

  return `${authors[0]!.family} et al.`;
};

const getYearSummary = (
  fields: Record<string, unknown>,
  noDateLabel: string,
): string => {
  const year = fields.year;

  return typeof year === 'string' && year.trim()
    ? ` (${year})`
    : ` (${noDateLabel})`;
};

export const ReferencesPanel = ({
  references,
  onAddReference,
  onEditReference,
  onDeleteReference,
  onInsertCitation,
}: ReferencesPanelProps) => {
  const { t } = useTranslation();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    if (pendingDeleteId === id) {
      onDeleteReference(id);
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="label-caps">{t('references.references')}</p>
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
          {t('references.addReference')}
        </button>
      </div>

      {references.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
          {t('references.noReferencesYet')}
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
                    {(ref.fields.title as string) ?? t('references.untitled')}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {getAuthorSummary(
                      ref.fields,
                      t('references.unknownAuthor'),
                    )}
                    {getYearSummary(ref.fields, t('references.noDate'))}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-[var(--color-panel)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted)]">
                  {t(typeLabelKeys[ref.referenceType])}
                </span>
              </div>
              <p
                className="mt-1.5 text-xs leading-5 text-[var(--color-ink-soft)]"
                style={{ paddingLeft: '1.5em', textIndent: '-1.5em' }}
              >
                {formatReferenceApa(ref).map((seg, i) => (
                  <span key={i} className={seg.italic ? 'italic' : undefined}>
                    {seg.text}
                  </span>
                ))}
              </p>
              <div className="mt-2 flex gap-2">
                {onInsertCitation && (
                  <button
                    className="text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-accent-strong)] transition hover:underline"
                    onClick={() => onInsertCitation(ref.id)}
                    type="button"
                  >
                    {t('references.cite')}
                  </button>
                )}
                <button
                  className="text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-accent-strong)] transition hover:underline"
                  onClick={() => onEditReference(ref.id)}
                  type="button"
                >
                  {t('references.edit')}
                </button>
                <button
                  className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] transition ${
                    pendingDeleteId === ref.id
                      ? 'text-[var(--color-accent-strong)] hover:underline'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink-strong)]'
                  }`}
                  onClick={() => handleDeleteClick(ref.id)}
                  onBlur={() => setPendingDeleteId(null)}
                  type="button"
                >
                  {pendingDeleteId === ref.id
                    ? t('references.confirmDelete')
                    : t('references.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
