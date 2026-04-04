import { useEffect, useRef, useState } from 'react';

interface InlineRenameInputProps {
  value: string;
  onRename: (newValue: string) => void;
  onCancel: () => void;
  className?: string;
}

export const InlineRenameInput = ({
  value,
  onRename,
  onCancel,
  className = '',
}: InlineRenameInputProps) => {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const commit = () => {
    const trimmed = draft.trim();

    if (trimmed.length > 0 && trimmed !== value) {
      onRename(trimmed);
    } else {
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      className={`rounded border border-[var(--color-accent-soft)] bg-[var(--color-input)] px-2 py-1 text-sm text-[var(--color-ink-strong)] outline-none ${className}`}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit();
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
        }
      }}
      value={draft}
    />
  );
};
