import type { ExportResult } from '@application/contracts/export-ipc';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type {
  CreateReferenceInput,
  ReferenceEntry,
  UpdateReferenceInput,
} from '@domain/references/reference-entry';
import type {
  AppSettings,
  Course,
  CreateCourseInput,
  CreatePaperInput,
  Paper,
  UpdateCourseInput,
  UpdatePaperMetadataInput,
} from '@domain/shared/persistence-models';
import type { Language } from '@domain/shared/contracts';

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
    update: (courseId: string, input: UpdateCourseInput) => Promise<Course>;
  };
  papers: {
    listByCourse: (courseId: string) => Promise<Paper[]>;
    listRecent: (limit?: number) => Promise<Paper[]>;
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
  references: {
    listByPaper: (paperId: string) => Promise<ReferenceEntry[]>;
    create: (input: CreateReferenceInput) => Promise<ReferenceEntry>;
    getById: (referenceId: string) => Promise<ReferenceEntry | null>;
    update: (referenceId: string, input: UpdateReferenceInput) => Promise<ReferenceEntry>;
    delete: (referenceId: string) => Promise<void>;
  };
  search: {
    query: (query: string) => Promise<WorkspaceSearchPlaceholderResult>;
  };
  settings: {
    get: () => Promise<AppSettings | null>;
    save: (input: { language: Language; debug?: boolean }) => Promise<AppSettings>;
  };
  export: {
    pdf: (paperId: string) => Promise<ExportResult>;
  };
}
