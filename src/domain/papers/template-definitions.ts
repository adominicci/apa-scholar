import { createEmptyRichTextDocument } from '@domain/shared/entity-helpers';
import type { PaperType, TemplateId } from '@domain/shared/contracts';

export type TemplateDefinitionId = Extract<
  TemplateId,
  'apa-student' | 'apa-student-abstract'
>;

export interface TemplateSeedResult {
  paperMeta: {
    abstractEnabled: boolean;
    authorName: string | null;
    authorNote: string | null;
    courseCode: string | null;
    courseName: string | null;
    dueDate: string | null;
    institution: string | null;
    professorName: string | null;
    runningHead: string | null;
    shortTitle: string | null;
    title: string;
  };
  paperContent: {
    abstractDoc: Record<string, unknown>;
    bodyDoc: Record<string, unknown>;
  };
}

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  paperType: PaperType;
  createSeed: (input: {
    courseCode?: string | null;
    courseName?: string | null;
    institution?: string | null;
    professorName?: string | null;
    title: string;
  }) => TemplateSeedResult;
}

const createStudentSeed = (
  input: {
    courseCode?: string | null;
    courseName?: string | null;
    institution?: string | null;
    professorName?: string | null;
    title: string;
  },
  abstractEnabled: boolean,
): TemplateSeedResult => ({
  paperContent: {
    abstractDoc: createEmptyRichTextDocument(),
    bodyDoc: createEmptyRichTextDocument(),
  },
  paperMeta: {
    abstractEnabled,
    authorName: null,
    authorNote: null,
    courseCode: input.courseCode ?? null,
    courseName: input.courseName ?? null,
    dueDate: null,
    institution: input.institution ?? null,
    professorName: input.professorName ?? null,
    runningHead: null,
    shortTitle: null,
    title: input.title,
  },
});

const templateDefinitions: readonly TemplateDefinition[] = [
  {
    createSeed: (input) => createStudentSeed(input, false),
    id: 'apa-student',
    label: 'APA Student Paper',
    paperType: 'student',
  },
  {
    createSeed: (input) => createStudentSeed(input, true),
    id: 'apa-student-abstract',
    label: 'APA Student Paper with Abstract',
    paperType: 'student',
  },
  {
    createSeed: (input) => createStudentSeed(input, false),
    id: 'apa-professional',
    label: 'APA Professional Paper',
    paperType: 'professional',
  },
] as const;

const templateDefinitionMap = new Map(
  templateDefinitions.map((definition) => [definition.id, definition]),
);

export const isTemplateDefinitionId = (
  templateId?: TemplateId | null,
): templateId is TemplateDefinitionId =>
  templateId === 'apa-student' || templateId === 'apa-student-abstract';

export const resolveTemplateDefinitionId = (
  templateId?: TemplateId | null,
): TemplateDefinitionId =>
  isTemplateDefinitionId(templateId) ? templateId : 'apa-student';

export const getTemplateDefinition = (templateId: TemplateId): TemplateDefinition => {
  const definition = templateDefinitionMap.get(templateId);

  if (!definition) {
    throw new Error(`Unsupported template definition "${templateId}".`);
  }

  return definition;
};

export const listTemplateDefinitions = (): Array<{
  id: TemplateDefinitionId;
  label: string;
}> =>
  templateDefinitions
    .filter(
      (definition): definition is TemplateDefinition & { id: TemplateDefinitionId } =>
        definition.id === 'apa-student' || definition.id === 'apa-student-abstract',
    )
    .map((definition) => ({
      id: definition.id,
      label: definition.label,
    }));
