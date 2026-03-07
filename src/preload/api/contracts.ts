import type {
  Course,
  CreateCourseInput,
  CreatePaperInput,
  Paper,
} from '@domain/shared/persistence-models';

export interface WorkspaceSearchPlaceholderResult {
  status: 'placeholder';
  courses: Course[];
  papers: Paper[];
}

export interface ApaScholarApi {
  meta: {
    bridgeVersion: number;
    platform: 'desktop';
    runtime: 'electron';
  };
  courses: {
    list: () => Promise<Course[]>;
    create: (input: CreateCourseInput) => Promise<Course>;
  };
  papers: {
    listByCourse: (courseId: string) => Promise<Paper[]>;
    create: (input: CreatePaperInput) => Promise<Paper>;
  };
  search: {
    query: (query: string) => Promise<WorkspaceSearchPlaceholderResult>;
  };
}
