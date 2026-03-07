import type {
  AppSettings,
  Course,
  CreateCourseInput,
  CreateStoredPaperInput,
  Paper,
  UpdateCourseInput,
  UpdatePaperInput,
} from '@domain/shared/persistence-models';

export interface CourseRepository {
  create(input: CreateCourseInput): Course;
  listActive(): Course[];
  getById(id: string): Course | null;
  update(id: string, input: UpdateCourseInput): Course;
  archive(id: string): Course;
}

export interface PaperRepository {
  create(input: CreateStoredPaperInput): Paper;
  listByCourse(courseId: string): Paper[];
  getById(id: string): Paper | null;
  update(id: string, input: UpdatePaperInput): Paper;
  archive(id: string): Paper;
}

export interface SettingsRepository {
  get(): AppSettings | null;
  save(input: Pick<AppSettings, 'debug' | 'language'>): AppSettings;
}
