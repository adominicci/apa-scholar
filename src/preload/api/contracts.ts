import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type {
  Course,
  CreateCourseInput,
  CreatePaperInput,
  Paper,
  UpdatePaperMetadataInput,
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
    getById: (paperId: string) => Promise<PaperDraft | null>;
    create: (input: CreatePaperInput) => Promise<Paper>;
    updateBodyContent: (
      paperId: string,
      bodyDoc: BodyEditorDocument,
    ) => Promise<PaperDraft>;
    updateMetadata: (
      paperId: string,
      input: UpdatePaperMetadataInput,
    ) => Promise<PaperDraft>;
  };
  search: {
    query: (query: string) => Promise<WorkspaceSearchPlaceholderResult>;
  };
}
