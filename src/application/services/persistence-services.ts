import { buildPaperDraft } from '@application/services/build-paper-draft';
import type {
  CourseRepository,
  PaperRepository,
  SettingsRepository,
} from '@application/contracts/persistence-repositories';
import {
  createPaperInputSchema,
  updatePaperMetadataInputSchema,
} from '@domain/shared/persistence-models';
import { resolveCreatePaperDefaults } from '@application/services/resolve-create-paper-defaults';
import { getTemplateDefinition } from '@domain/papers/template-definitions';
import { applyPaperMetadataUpdate } from '@domain/papers/paper-metadata';

export interface PersistenceServices {
  courses: {
    list: () => ReturnType<CourseRepository['listActive']>;
    create: (input: unknown) => ReturnType<CourseRepository['create']>;
  };
  papers: {
    getById: (paperId: string) => ReturnType<typeof buildPaperDraft> | null;
    listByCourse: (courseId: string) => ReturnType<PaperRepository['listByCourse']>;
    create: (input: unknown) => ReturnType<PaperRepository['create']>;
    updateMetadata: (
      paperId: string,
      input: unknown,
    ) => ReturnType<typeof buildPaperDraft>;
  };
}

export const createPersistenceServices = (repositories: {
  courseRepository: CourseRepository;
  paperRepository: PaperRepository;
  settingsRepository: SettingsRepository;
}): PersistenceServices => ({
  courses: {
    list: () => repositories.courseRepository.listActive(),
    create: (input) =>
      repositories.courseRepository.create(
        input as Parameters<CourseRepository['create']>[0],
      ),
  },
  papers: {
    getById: (paperId) => {
      const aggregate = repositories.paperRepository.getAggregateById(paperId);

      return aggregate ? buildPaperDraft(aggregate) : null;
    },
    listByCourse: (courseId) => repositories.paperRepository.listByCourse(courseId),
    create: (input) => {
      const parsedInput = createPaperInputSchema.parse(input);
      const course = repositories.courseRepository.getById(parsedInput.courseId);

      if (!course || course.archivedAt) {
        throw new Error(`Cannot create a paper for missing course "${parsedInput.courseId}".`);
      }

      const resolvedInput = resolveCreatePaperDefaults(
        parsedInput,
        course,
        repositories.settingsRepository.get() ?? undefined,
      );
      const templateDefinition = getTemplateDefinition(resolvedInput.templateId);
      const seed = templateDefinition.createSeed({
        courseCode: course.code,
        courseName: course.name,
        institution: course.institution,
        professorName: course.professorName,
        title: resolvedInput.title,
      });

      return repositories.paperRepository.create(resolvedInput, seed);
    },
    updateMetadata: (paperId, input) => {
      const existingAggregate = repositories.paperRepository.getAggregateById(paperId);

      if (!existingAggregate) {
        throw new Error(`Paper "${paperId}" was not found.`);
      }

      const parsedInput = updatePaperMetadataInputSchema.parse(input);
      const normalizedAggregate = applyPaperMetadataUpdate(existingAggregate, parsedInput);
      const updatedAggregate = repositories.paperRepository.updateMetadata(paperId, {
        ...parsedInput,
        abstractEnabled: normalizedAggregate.paperMeta.abstractEnabled,
        paperType: normalizedAggregate.paper.paperType,
        templateId: normalizedAggregate.paper.templateId,
        title: normalizedAggregate.paper.title,
      });

      return buildPaperDraft(updatedAggregate);
    },
  },
});
