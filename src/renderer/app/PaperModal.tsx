import {
  listTemplateDefinitions,
  resolveTemplateDefinitionId,
} from '@domain/papers/template-definitions';
import type { TemplateId } from '@domain/shared/contracts';
import type { Course, CreatePaperInput } from '@domain/shared/persistence-models';

interface PaperModalProps {
  isOpen: boolean;
  paperForm: CreatePaperInput;
  courses: Course[];
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onFormChange: (updater: (current: CreatePaperInput) => CreatePaperInput) => void;
  onSubmit: (form: HTMLFormElement) => void;
  onClose: () => void;
}

const shellButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius-button)] border px-3 py-2 text-xs font-semibold uppercase tracking-[var(--tracking-caps)] transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]';

export const PaperModal = ({
  isOpen,
  paperForm,
  courses,
  errorMessage,
  isSubmitting = false,
  onFormChange,
  onSubmit,
  onClose,
}: PaperModalProps) => {
  const templateOptions = listTemplateDefinitions();

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
              New paper
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl text-[var(--color-ink-strong)]">
              Open a fresh APA shell
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

        <div className="mt-6 grid gap-4">
          <label className="block text-sm text-[var(--color-ink-strong)]">
            Paper title
            <input
              className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-soft)]"
              name="title"
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              value={paperForm.title}
            />
          </label>

          <label className="block text-sm text-[var(--color-ink-strong)]">
            Course
            <select
              className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-soft)]"
              name="courseId"
              onChange={(event) =>
                onFormChange((current) => {
                  const selectedCourse = courses.find(
                    (course) => course.id === event.target.value,
                  );

                  return {
                    ...current,
                    courseId: event.target.value,
                    templateId: resolveTemplateDefinitionId(
                      selectedCourse?.defaultPaperTemplate ?? current.templateId,
                    ),
                  };
                })
              }
              value={paperForm.courseId}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-[var(--color-ink-strong)]">
            Template
            <select
              className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent-soft)]"
              name="templateId"
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  templateId: resolveTemplateDefinitionId(
                    event.target.value as TemplateId,
                  ),
                }))
              }
              value={resolveTemplateDefinitionId(paperForm.templateId)}
            >
              {templateOptions.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
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
            disabled={!paperForm.courseId || isSubmitting}
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
            {isSubmitting ? 'Creating paper' : 'Create paper'}
          </button>
        </div>
      </form>
    </div>
  );
};
