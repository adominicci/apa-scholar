import type { ReactNode } from 'react';
import {
  paperIssueSeverityOrder,
  type PaperIssue,
  type PaperIssueSeverity,
} from '@domain/papers/paper-issues';

interface InspectorSectionProps {
  children: ReactNode;
  title: string;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface SelectFieldProps {
  label: string;
  onChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
  }>;
  value: string;
}

interface ToggleFieldProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

const fieldClassName =
  'mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm text-[var(--color-ink-strong)] outline-none transition focus:border-[var(--color-accent-soft)]';

export const InspectorSection = ({
  children,
  title,
}: InspectorSectionProps) => (
  <section className="border-b border-[var(--color-line)] p-4 last:border-b-0">
    <p className="label-caps">
      {title}
    </p>
    <div className="mt-4 space-y-4">
      {children}
    </div>
  </section>
);

export const InspectorTextField = ({
  label,
  onChange,
  placeholder,
  value,
}: FieldProps) => (
  <label className="block text-sm text-[var(--color-ink-strong)]">
    {label}
    <input
      className={fieldClassName}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  </label>
);

export const InspectorTextAreaField = ({
  label,
  onChange,
  placeholder,
  value,
}: FieldProps) => (
  <label className="block text-sm text-[var(--color-ink-strong)]">
    {label}
    <textarea
      className={`${fieldClassName} min-h-[104px] resize-y`}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  </label>
);

export const InspectorSelectField = ({
  label,
  onChange,
  options,
  value,
}: SelectFieldProps) => (
  <label className="block text-sm text-[var(--color-ink-strong)]">
    {label}
    <select
      className={fieldClassName}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export const InspectorToggleField = ({
  checked,
  label,
  onChange,
}: ToggleFieldProps) => (
  <label className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-4 py-3 text-sm text-[var(--color-ink-strong)]">
    <span>{label}</span>
    <input
      checked={checked}
      className="h-4 w-4 accent-[var(--color-accent)]"
      onChange={(event) => onChange(event.target.checked)}
      type="checkbox"
    />
  </label>
);

export const InspectorValidationList = ({
  messages,
}: {
  messages: string[];
}) => (
  <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-4 py-3">
    {messages.length > 0 ? (
      <ul className="space-y-2 text-sm text-[var(--color-ink-strong)]">
        {messages.map((message) => (
          <li key={message}>
            {message}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm leading-6 text-[var(--color-muted)]">
        Required title-page fields are complete for the current paper type.
      </p>
    )}
  </div>
);

const issueSeverityLabels: Record<PaperIssueSeverity, string> = {
  high: 'High priority',
  low: 'Low priority',
  medium: 'Medium priority',
};

const issueSeverityClasses: Record<PaperIssueSeverity, string> = {
  high: 'border-[rgba(197,89,64,0.38)] bg-[rgba(197,89,64,0.08)] text-[var(--color-ink-strong)]',
  low: 'border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]',
  medium: 'border-[rgba(190,132,82,0.38)] bg-[rgba(190,132,82,0.08)] text-[var(--color-ink-strong)]',
};

const issueScopeLabels: Record<PaperIssue['scope'], string> = {
  abstract: 'Abstract',
  body: 'Body',
  references: 'References',
  'title-page': 'Title page',
};

export const InspectorIssuesList = ({
  issues,
  onAutofix,
}: {
  issues: PaperIssue[];
  onAutofix: (issue: PaperIssue) => void;
}) => {
  if (issues.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-4 py-3">
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          All tracked APA checks look good for this paper.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paperIssueSeverityOrder.map((severity) => {
        const groupedIssues = issues.filter((issue) => issue.severity === severity);

        if (groupedIssues.length === 0) {
          return null;
        }

        return (
          <section className="space-y-3" key={severity}>
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted-strong)]">
                {issueSeverityLabels[severity]}
              </p>
              <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--color-muted-strong)]">
                {groupedIssues.length}
              </span>
            </div>

            <ul className="space-y-3">
              {groupedIssues.map((issue) => (
                <li
                  className={`rounded-[var(--radius-card)] border px-4 py-3 ${issueSeverityClasses[severity]}`}
                  key={issue.code}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink-strong)]">
                        {issue.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted-strong)]">
                        <span className="rounded-full border border-[var(--color-line)] px-2 py-1">
                          {issueScopeLabels[issue.scope]}
                        </span>
                        <span>{issue.category}</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-strong)]">
                    {issue.description}
                  </p>

                  {issue.suggestedFix ? (
                    <p className="mt-3 text-xs font-medium text-[var(--color-ink-strong)]">
                      Next: {issue.suggestedFix}
                    </p>
                  ) : null}

                  {issue.autofix ? (
                    <button
                      className="mt-3 inline-flex items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-accent-soft)] bg-[var(--color-panel)] px-3 py-2 text-xs font-semibold text-[var(--color-ink-strong)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      onClick={() => onAutofix(issue)}
                      type="button"
                    >
                      {issue.autofix.label}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
