export const toNullableString = (value?: string | null): string | null =>
  value ?? null;

export const parseJsonRecord = (value: string): Record<string, unknown> => {
  const parsed = JSON.parse(value) as unknown;

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Expected a JSON object record.');
  }

  return parsed as Record<string, unknown>;
};
