export const createEntityId = (): string => crypto.randomUUID();

export const createIsoTimestamp = (): string => new Date().toISOString();

export const createEmptyRichTextDocument = (): Record<string, unknown> => ({
  content: [],
  type: 'doc',
});
