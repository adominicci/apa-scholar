export const supportedLanguages = ['en', 'es'] as const;

export type Language = (typeof supportedLanguages)[number];

export const supportedPaperTypes = ['student', 'professional'] as const;

export type PaperType = (typeof supportedPaperTypes)[number];

export const supportedPaperStatuses = ['draft'] as const;

export type PaperStatus = (typeof supportedPaperStatuses)[number];

export const supportedTemplateIds = [
  'apa-student',
  'apa-student-abstract',
  'apa-professional',
] as const;

export type TemplateId = (typeof supportedTemplateIds)[number];

export const defaultPaperTypeByTemplate: Record<TemplateId, PaperType> = {
  'apa-professional': 'professional',
  'apa-student': 'student',
  'apa-student-abstract': 'student',
};

export const resolvePaperTypeFromTemplate = (
  templateId: TemplateId,
): PaperType => defaultPaperTypeByTemplate[templateId];
