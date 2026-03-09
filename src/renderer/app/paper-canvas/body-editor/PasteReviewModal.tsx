import { useEffect, useRef } from 'react';

interface PasteReviewModalProps {
  isOpen: boolean;
  previewText: string;
  warnings: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

const shellButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius-button)] border px-3 py-2 text-xs font-semibold uppercase tracking-[var(--tracking-caps)] transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]';

export const PasteReviewModal = ({
  isOpen,
  previewText,
  warnings,
  onCancel,
  onConfirm,
}: PasteReviewModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute('disabled'));

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      const activeElement = document.activeElement;
      const dialogElement = dialogRef.current;
      const focusOutsideDialog = !activeElement || !dialogElement?.contains(activeElement);

      if (focusOutsideDialog) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="paste-review-title"
      aria-modal="true"
      className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(7,9,14,0.62)] px-4 backdrop-blur-sm"
      ref={dialogRef}
      role="dialog"
    >
      <div className="glass-panel w-full max-w-2xl rounded-[var(--radius-panel)] border border-[var(--color-line)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-shell)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps">
              Paste review
            </p>
            <h2
              className="mt-3 font-[var(--font-display)] text-3xl text-[var(--color-ink-strong)]"
              id="paste-review-title"
            >
              Review cleaned paste
            </h2>
          </div>
          <button
            className="rounded-[var(--radius-button)] border border-[var(--color-line)] px-3 py-2 text-xs uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted)] transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]"
            onClick={onCancel}
            ref={closeButtonRef}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {warnings.map((warning) => (
            <p
              className="rounded-[var(--radius-card)] border border-[var(--color-accent-soft)] bg-[var(--color-panel-muted)] px-4 py-3 text-sm leading-7 text-[var(--color-ink-strong)]"
              key={warning}
            >
              {warning}
            </p>
          ))}
        </div>

        <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-page-line)] bg-[var(--color-page-muted-surface)] px-5 py-4">
          <p className="label-caps">
            Clean preview
          </p>
          <pre className="mt-3 whitespace-pre-wrap font-[var(--font-ui)] text-sm leading-7 text-[var(--color-page-ink)]">
            {previewText}
          </pre>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`${shellButtonClass} border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]`}
            onClick={onConfirm}
            type="button"
          >
            Insert cleaned copy
          </button>
        </div>
      </div>
    </div>
  );
};
