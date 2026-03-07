import { buildPaperDraft } from '@application/services/build-paper-draft';
import type {
  CourseRepository,
  PaperRepository,
  SettingsRepository,
} from '@application/contracts/persistence-repositories';
import { createPaperInputSchema } from '@domain/shared/persistence-models';
import { resolveCreatePaperDefaults } from '@application/services/resolve-create-paper-defaults';
import { getTemplateDefinition } from '@domain/papers/template-definitions';

export interface PersistenceServices {
  courses: {
    list: () => ReturnType<CourseRepository['listActive']>;
    create: (input: unknown) => ReturnType<CourseRepository['create']>;
  };
  papers: {
    getById: (paperId: string) => ReturnType<typeof buildPaperDraft> | null;
    listByCourse: (courseId: string) => ReturnType<PaperRepository['listByCourse']>;
    create: (input: unknown) => ReturnType<PaperRepository['create']>;
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
  },
});
