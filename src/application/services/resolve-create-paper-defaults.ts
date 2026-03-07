import {
  resolvePaperTypeFromTemplate,
} from '@domain/shared/contracts';
import type {
  AppSettings,
  Course,
  CreatePaperInput,
  CreateStoredPaperInput,
} from '@domain/shared/persistence-models';

export type ResolvedCreatePaperDefaults = CreateStoredPaperInput;

export const resolveCreatePaperDefaults = <
  TCourse extends Pick<Course, 'defaultLanguage' | 'defaultPaperTemplate'>,
  TSettings extends Pick<AppSettings, 'language'>,
>(
  input: CreatePaperInput,
  course: TCourse,
  settings?: TSettings,
): ResolvedCreatePaperDefaults => {
  const templateId = input.templateId ?? course.defaultPaperTemplate ?? 'apa-student';

  return {
    courseId: input.courseId,
    title: input.title,
    templateId,
    paperType: input.paperType ?? resolvePaperTypeFromTemplate(templateId),
    language: input.language ?? course.defaultLanguage ?? settings?.language ?? 'en',
    status: 'draft',
  };
};
