import type {
  CourseRepository,
  PaperRepository,
  SettingsRepository,
} from '@application/contracts/persistence-repositories';
import {
  createCourseInputSchema,
  createPaperInputSchema,
} from '@domain/shared/persistence-models';
import { resolveCreatePaperDefaults } from '@application/services/resolve-create-paper-defaults';

export interface PersistenceServices {
  courses: {
    list: () => ReturnType<CourseRepository['listActive']>;
    create: (input: unknown) => ReturnType<CourseRepository['create']>;
  };
  papers: {
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
      repositories.courseRepository.create(createCourseInputSchema.parse(input)),
  },
  papers: {
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

      return repositories.paperRepository.create(resolvedInput);
    },
  },
});
