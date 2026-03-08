import type { TemplateSeedResult } from '@domain/papers/template-definitions';
import type { StoredPaperAggregate } from '@domain/papers/paper-draft';
import type {
  AppSettings,
  Course,
  CreateCourseInput,
  CreateStoredPaperInput,
  Paper,
  UpdateCourseInput,
  UpdatePaperMetadataInput,
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
  create(input: CreateStoredPaperInput, seed: TemplateSeedResult): Paper;
  listByCourse(courseId: string): Paper[];
  getAggregateById(id: string): StoredPaperAggregate | null;
  getById(id: string): Paper | null;
  update(id: string, input: UpdatePaperInput): Paper;
  updateMetadata(id: string, aggregate: StoredPaperAggregate): StoredPaperAggregate;
  archive(id: string): Paper;
}

export interface SettingsRepository {
  get(): AppSettings | null;
  save(input: Pick<AppSettings, 'debug' | 'language'>): AppSettings;
}
