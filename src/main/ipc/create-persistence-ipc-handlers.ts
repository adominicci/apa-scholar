import {
  deleteReferencePayloadSchema,
  getPaperByIdPayloadSchema,
  getReferenceByIdPayloadSchema,
  listPapersByCoursePayloadSchema,
  listRecentPapersPayloadSchema,
  listReferencesByPaperPayloadSchema,
  persistenceIpcChannels,
  searchQueryPayloadSchema,
  updateCoursePayloadSchema,
  updatePaperBodyContentPayloadSchema,
  updatePaperMetadataPayloadSchema,
  updateReferencePayloadSchema,
} from '@application/contracts/persistence-ipc';

export interface PersistenceIpcServices {
  courses: {
    list: () => unknown;
    create: (input: unknown) => unknown;
    update: (courseId: string, input: unknown) => unknown;
  };
  papers: {
    getById: (paperId: string) => unknown;
    listByCourse: (courseId: string) => unknown;
    listRecent: (limit: number) => unknown;
    create: (input: unknown) => unknown;
    updateBodyContent: (paperId: string, bodyDoc: unknown) => unknown;
    updateMetadata: (paperId: string, input: unknown) => unknown;
  };
  references: {
    listByPaper: (paperId: string) => unknown;
    create: (input: unknown) => unknown;
    getById: (referenceId: string) => unknown;
    update: (referenceId: string, input: unknown) => unknown;
    delete: (referenceId: string) => unknown;
  };
  search: {
    query: (query: string) => unknown;
  };
}

export const createPersistenceIpcHandlers = (
  services: PersistenceIpcServices,
) => ({
  [persistenceIpcChannels.coursesList]: () => services.courses.list(),
  [persistenceIpcChannels.coursesCreate]: (input: unknown) =>
    services.courses.create(input),
  [persistenceIpcChannels.coursesUpdate]: (input: unknown) => {
    const payload = updateCoursePayloadSchema.parse(input);
    return services.courses.update(payload.courseId, payload.input);
  },
  [persistenceIpcChannels.papersListByCourse]: (input: unknown) =>
    services.papers.listByCourse(
      listPapersByCoursePayloadSchema.parse(input).courseId,
    ),
  [persistenceIpcChannels.papersListRecent]: (input: unknown) =>
    services.papers.listRecent(
      listRecentPapersPayloadSchema.parse(input ?? {}).limit,
    ),
  [persistenceIpcChannels.papersGetById]: (input: unknown) =>
    services.papers.getById(getPaperByIdPayloadSchema.parse(input).paperId),
  [persistenceIpcChannels.papersCreate]: (input: unknown) =>
    services.papers.create(input),
  [persistenceIpcChannels.papersUpdateBodyContent]: (input: unknown) => {
    const payload = updatePaperBodyContentPayloadSchema.parse(input);

    return services.papers.updateBodyContent(payload.paperId, payload.bodyDoc);
  },
  [persistenceIpcChannels.papersUpdateMetadata]: (input: unknown) => {
    const payload = updatePaperMetadataPayloadSchema.parse(input);

    return services.papers.updateMetadata(payload.paperId, payload.input);
  },
  [persistenceIpcChannels.referencesListByPaper]: (input: unknown) =>
    services.references.listByPaper(
      listReferencesByPaperPayloadSchema.parse(input).paperId,
    ),
  [persistenceIpcChannels.referencesCreate]: (input: unknown) =>
    services.references.create(input),
  [persistenceIpcChannels.referencesGetById]: (input: unknown) =>
    services.references.getById(
      getReferenceByIdPayloadSchema.parse(input).referenceId,
    ),
  [persistenceIpcChannels.referencesUpdate]: (input: unknown) => {
    const payload = updateReferencePayloadSchema.parse(input);
    return services.references.update(payload.referenceId, payload.input);
  },
  [persistenceIpcChannels.referencesDelete]: (input: unknown) =>
    services.references.delete(
      deleteReferencePayloadSchema.parse(input).referenceId,
    ),
  [persistenceIpcChannels.searchQuery]: (input: unknown) =>
    services.search.query(searchQueryPayloadSchema.parse(input).query),
});
