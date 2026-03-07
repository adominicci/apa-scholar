import { createPaperInputSchema } from '@domain/shared/persistence-models';
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
  const parsedInput = createPaperInputSchema.parse(input);
  const templateId =
    parsedInput.templateId ?? course.defaultPaperTemplate ?? 'apa-student';

  return {
    courseId: parsedInput.courseId,
    title: parsedInput.title,
    templateId,
    paperType:
      parsedInput.paperType ?? resolvePaperTypeFromTemplate(templateId),
    language:
      parsedInput.language ?? course.defaultLanguage ?? settings?.language ?? 'en',
    status: 'draft',
  };
};
