import { createPersistenceServices } from '@application/services/persistence-services';
import { openDatabase } from '@infrastructure/persistence/database';
import type { SqliteDatabase } from '@infrastructure/persistence/database';
import { createCourseRepository } from '@infrastructure/persistence/course-repository';
import { runMigrations } from '@infrastructure/persistence/migrations';
import { createPaperRepository } from '@infrastructure/persistence/paper-repository';
import { createSettingsRepository } from '@infrastructure/persistence/settings-repository';

export interface PersistenceContext {
  database: SqliteDatabase;
  courseRepository: ReturnType<typeof createCourseRepository>;
  paperRepository: ReturnType<typeof createPaperRepository>;
  settingsRepository: ReturnType<typeof createSettingsRepository>;
  courseService: ReturnType<typeof createPersistenceServices>['courses'];
  paperService: ReturnType<typeof createPersistenceServices>['papers'];
  close: () => void;
}

export const createPersistenceContext = (options: {
  dbPath: string;
}): PersistenceContext => {
  const database = openDatabase(options.dbPath);
  runMigrations(database);

  const courseRepository = createCourseRepository(database);
  const paperRepository = createPaperRepository(database);
  const settingsRepository = createSettingsRepository(database);
  const services = createPersistenceServices({
    courseRepository,
    paperRepository,
    settingsRepository,
  });

  return {
    database,
    courseRepository,
    paperRepository,
    settingsRepository,
    courseService: services.courses,
    paperService: services.papers,
    close: () => {
      database.close();
    },
  };
};
