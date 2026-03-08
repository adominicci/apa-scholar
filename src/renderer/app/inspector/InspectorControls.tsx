import type { ReactNode } from 'react';

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
