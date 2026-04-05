import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReferenceAuthor, ReferenceType } from '@domain/references/reference-entry';
import type { ReferenceFormState } from '@renderer/app/inspector/reference-form-helpers';
import {
  emptyAuthor,
  getFieldsForType,
  supportedReferenceTypes,
  typeLabelKeys,
} from '@renderer/app/inspector/reference-form-helpers';

const fetchDOIMetadata = async (input: string): Promise<Partial<ReferenceFormState> | null> => {
  const doiMatch = input.match(/10\.\d{4,}[^\s]*/);
  if (!doiMatch) return null;
  const doi = doiMatch[0];
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.message;
  return {
    referenceType: 'journal-article' as ReferenceType,
    title: item.title?.[0] ?? '',
    authors: (item.author ?? []).map((a: { family?: string; given?: string }) => ({
      family: a.family ?? '',
      given: a.given ?? '',
    })),
    year: item.published?.['date-parts']?.[0]?.[0]?.toString() ?? '',
    journalName: item['container-title']?.[0] ?? '',
    volume: item.volume ?? '',
    issue: item.issue ?? '',
    pages: item.page ?? '',
    doi: `https://doi.org/${doi}`,
  };
};

interface ReferenceFormModalProps {
  isOpen: boolean;
  form: ReferenceFormState;
  editingReferenceId: string | null;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onFormChange: (updater: (current: ReferenceFormState) => ReferenceFormState) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const shellButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius-button)] border px-3 py-2 text-xs font-semibold uppercase tracking-[var(--tracking-caps)] transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]';

const inputClass =
  'mt-1 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent-soft)]';

const AuthorRows = ({
  authors,
  label,
  onChange,
}: {
  authors: ReferenceAuthor[];
  label: string;
  onChange: (authors: ReferenceAuthor[]) => void;
}) => {
  const { t } = useTranslation();

  return (
  <div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-ink-strong)]">{label}</span>
      <button
        className="text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-accent-strong)] transition hover:underline"
        onClick={() => onChange([...authors, emptyAuthor()])}
        type="button"
      >
        {t('common.add')}
      </button>
    </div>
    <div className="mt-1 space-y-2">
      {authors.map((author, index) => (
        <div className="flex gap-2" key={index}>
          <input
            aria-label={`${label} ${index + 1} family name`}
            className={inputClass}
            onChange={(event) => {
              const next = [...authors];
              next[index] = { ...author, family: event.target.value };
              onChange(next);
            }}
            placeholder={t('referenceForm.familyName')}
            value={author.family}
          />
          <input
            aria-label={`${label} ${index + 1} given name`}
            className={inputClass}
            onChange={(event) => {
              const next = [...authors];
              next[index] = { ...author, given: event.target.value };
              onChange(next);
            }}
            placeholder={t('referenceForm.givenName')}
            value={author.given}
          />
          {authors.length > 1 && (
            <button
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
              className="shrink-0 rounded-[var(--radius-button)] border border-[var(--color-line)] px-2 py-1 text-xs text-[var(--color-muted)] transition hover:text-[var(--color-ink-strong)]"
              onClick={() => onChange(authors.filter((_, i) => i !== index))}
              type="button"
            >
              {t('common.remove')}
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
  );
};

export const ReferenceFormModal = ({
  isOpen,
  form,
  editingReferenceId,
  errorMessage,
  isSubmitting = false,
  onFormChange,
  onSubmit,
  onClose,
}: ReferenceFormModalProps) => {
  const { t } = useTranslation();
  const [doiInput, setDoiInput] = useState('');
  const [doiLooking, setDoiLooking] = useState(false);
  const [doiError, setDoiError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const isEditing = editingReferenceId !== null;
  const typeFields = getFieldsForType(form.referenceType);

  const handleDoiLookup = async () => {
    if (!doiInput.trim()) return;
    setDoiLooking(true);
    setDoiError(null);
    try {
      const metadata = await fetchDOIMetadata(doiInput.trim());
      if (metadata) {
        onFormChange((current) => ({ ...current, ...metadata }));
        setDoiInput('');
      } else {
        setDoiError(t('referenceForm.lookupFailed'));
      }
    } catch {
      setDoiError(t('referenceForm.lookupFailed'));
    } finally {
      setDoiLooking(false);
    }
  };

  const updateField = (key: keyof ReferenceFormState, value: string | boolean) => {
    onFormChange((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(7,9,14,0.62)] px-4 backdrop-blur-sm">
      <div
        className="glass-panel flex max-h-[85vh] w-full max-w-xl flex-col rounded-[var(--radius-panel)] border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[var(--shadow-shell)]"
        role="dialog"
        aria-labelledby="reference-form-title"
        aria-modal="true"
      >
        <div className="shrink-0 p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps">
                {isEditing ? t('referenceForm.editReference') : t('referenceForm.newReference')}
              </p>
              <h2
                className="mt-3 font-[var(--font-display)] text-2xl text-[var(--color-ink-strong)]"
                id="reference-form-title"
              >
                {isEditing ? t('referenceForm.editHeading') : t('referenceForm.addHeading')}
              </h2>
            </div>
            <button
              className="rounded-[var(--radius-button)] border border-[var(--color-line)] px-3 py-2 text-xs uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted)] transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]"
              onClick={onClose}
              type="button"
            >
              {t('common.close')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="space-y-4">
            {/* DOI / URL lookup */}
            {!isEditing && (
              <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-accent-soft)] bg-[var(--color-glow)] p-4">
                <label className="block text-[13px] font-medium text-[var(--color-ink-strong)]">
                  {t('referenceForm.pasteDoiUrl')}
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    className={inputClass}
                    onChange={(event) => setDoiInput(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') void handleDoiLookup(); }}
                    placeholder="https://doi.org/10.xxxx/..."
                    value={doiInput}
                  />
                  <button
                    className={`${shellButtonClass} shrink-0 border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]`}
                    disabled={doiLooking || !doiInput.trim()}
                    onClick={() => void handleDoiLookup()}
                    type="button"
                  >
                    {doiLooking ? t('common.loading') : t('referenceForm.lookup')}
                  </button>
                </div>
                {doiError && (
                  <p className="mt-2 text-xs text-[var(--color-accent-strong)]">{doiError}</p>
                )}
              </div>
            )}

            {/* Reference type selector */}
            <label className="block text-sm text-[var(--color-ink-strong)]">
              {t('referenceForm.referenceType')}
              <select
                className={inputClass}
                onChange={(event) =>
                  updateField('referenceType', event.target.value as ReferenceType)
                }
                value={form.referenceType}
              >
                {supportedReferenceTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(typeLabelKeys[type])}
                  </option>
                ))}
              </select>
            </label>

            {/* Authors */}
            <AuthorRows
              authors={form.authors}
              label={t('referenceForm.authors')}
              onChange={(authors) => onFormChange((current) => ({ ...current, authors }))}
            />

            {/* Year with unknown checkbox */}
            <div>
              <label className="block text-sm text-[var(--color-ink-strong)]">
                {t('referenceForm.year')}
                <input
                  className={inputClass}
                  disabled={form.yearUnknown}
                  onChange={(event) => updateField('year', event.target.value)}
                  placeholder={t('referenceForm.yearPlaceholder')}
                  value={form.yearUnknown ? '' : form.year}
                />
              </label>
              <label className="mt-1.5 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <input
                  checked={form.yearUnknown}
                  onChange={(event) => updateField('yearUnknown', event.target.checked)}
                  type="checkbox"
                />
                {t('referenceForm.noDateLabel')}
              </label>
            </div>

            {/* Type-specific fields */}
            {typeFields.map((field) => (
              <label
                className="block text-sm text-[var(--color-ink-strong)]"
                key={field.key}
              >
                {t(field.label)}
                {field.required && (
                  <span className="ml-1 text-[var(--color-accent-strong)]">*</span>
                )}
                <input
                  className={inputClass}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  value={form[field.key] as string}
                />
              </label>
            ))}

            {/* Editors for edited book chapter */}
            {form.referenceType === 'edited-book-chapter' && (
              <AuthorRows
                authors={form.editors}
                label={t('referenceForm.editors')}
                onChange={(editors) =>
                  onFormChange((current) => ({ ...current, editors }))
                }
              />
            )}
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-accent-soft)] bg-[var(--color-panel-muted)] px-4 py-3 text-sm text-[var(--color-ink-strong)]">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-[var(--color-line)] p-6 pt-4">
          <div className="flex justify-end gap-3">
            <button
              className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
              onClick={onClose}
              type="button"
            >
              {t('common.cancel')}
            </button>
            <button
              className={`${shellButtonClass} border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]`}
              disabled={isSubmitting}
              onClick={onSubmit}
              type="button"
            >
              {isSubmitting
                ? isEditing
                  ? t('referenceForm.saving')
                  : t('referenceForm.adding')
                : isEditing
                  ? t('referenceForm.saveChanges')
                  : t('referenceForm.addReference')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
