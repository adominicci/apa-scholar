import type { CreateCourseInput } from '@domain/shared/persistence-models';

interface CourseModalProps {
  isOpen: boolean;
  courseForm: CreateCourseInput;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onFormChange: (updater: (current: CreateCourseInput) => CreateCourseInput) => void;
  onSubmit: (form: HTMLFormElement) => void;
  onClose: () => void;
}

const shellButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius-button)] border px-3 py-2 text-xs font-semibold uppercase tracking-[var(--tracking-caps)] transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]';

export const CourseModal = ({
  isOpen,
  courseForm,
  errorMessage,
  isSubmitting = false,
  onFormChange,
  onSubmit,
  onClose,
}: CourseModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(7,9,14,0.62)] px-4 backdrop-blur-sm">
      <form
        className="glass-panel w-full max-w-xl rounded-[var(--radius-panel)] border border-[var(--color-line)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-shell)]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSubmitting) {
            onSubmit(event.currentTarget);
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps">
              New course
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl text-[var(--color-ink-strong)]">
              Build the course container first
            </h2>
          </div>
          <button
            className="rounded-[var(--radius-button)] border border-[var(--color-line)] px-3 py-2 text-xs uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted)] transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-[var(--color-ink-strong)]">
            Course name
            <input
              className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-soft)]"
              name="name"
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              value={courseForm.name}
            />
          </label>
          <label className="block text-sm text-[var(--color-ink-strong)]">
            Professor
            <input
              className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-soft)]"
              name="professorName"
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  professorName: event.target.value || undefined,
                }))
              }
              value={courseForm.professorName ?? ''}
            />
          </label>
          <label className="block text-sm text-[var(--color-ink-strong)]">
            Course code
            <input
              className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-soft)]"
              name="code"
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  code: event.target.value || undefined,
                }))
              }
              value={courseForm.code ?? ''}
            />
          </label>
          <label className="block text-sm text-[var(--color-ink-strong)]">
            Semester
            <input
              className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-soft)]"
              name="semester"
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  semester: event.target.value || undefined,
                }))
              }
              value={courseForm.semester ?? ''}
            />
          </label>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-accent-soft)] bg-[var(--color-panel-muted)] px-4 py-3 text-sm text-[var(--color-ink-strong)]">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`${shellButtonClass} border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]`}
            disabled={isSubmitting}
            onClick={(event) => {
              const form = event.currentTarget.form;

              if (!form) {
                return;
              }

              event.preventDefault();
              onSubmit(form);
            }}
            type="button"
          >
            {isSubmitting ? 'Creating course' : 'Create course'}
          </button>
        </div>
      </form>
    </div>
  );
};
