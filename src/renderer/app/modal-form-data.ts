import { resolveTemplateDefinitionId } from '@domain/papers/template-definitions';
import type {
  CreateCourseInput,
  CreatePaperInput,
} from '@domain/shared/persistence-models';

const readStringEntry = (formData: FormData, name: string): string | null => {
  const value = formData.get(name);

  return typeof value === 'string' ? value : null;
};

const readTrimmedEntry = (formData: FormData, name: string): string | null => {
  const value = readStringEntry(formData, name)?.trim();

  return value ? value : null;
};

const readOptionalTrimmedEntry = (
  formData: FormData,
  name: string,
): string | undefined => {
  const value = readStringEntry(formData, name);

  if (value === null) {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : undefined;
};

export const readSubmittedCourseForm = (
  form: HTMLFormElement,
  fallback: CreateCourseInput,
): CreateCourseInput => {
  const formData = new FormData(form);

  return {
    ...fallback,
    code: readOptionalTrimmedEntry(formData, 'code'),
    institution: readOptionalTrimmedEntry(formData, 'institution'),
    name: readTrimmedEntry(formData, 'name') ?? fallback.name.trim(),
    professorName: readOptionalTrimmedEntry(formData, 'professorName'),
    semester: readOptionalTrimmedEntry(formData, 'semester'),
  };
};

export const readSubmittedPaperForm = (
  form: HTMLFormElement,
  fallback: CreatePaperInput,
): CreatePaperInput => {
  const formData = new FormData(form);
  const submittedTemplateId = readTrimmedEntry(formData, 'templateId');

  return {
    ...fallback,
    courseId: readTrimmedEntry(formData, 'courseId') ?? fallback.courseId,
    templateId: resolveTemplateDefinitionId(
      (submittedTemplateId as CreatePaperInput['templateId'] | undefined) ??
        fallback.templateId,
    ),
    title: readTrimmedEntry(formData, 'title') ?? fallback.title.trim(),
  };
};
