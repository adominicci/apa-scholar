import {
  listPapersByCoursePayloadSchema,
  persistenceIpcChannels,
  searchQueryPayloadSchema,
} from '@application/contracts/persistence-ipc';

export interface PersistenceIpcServices {
  courses: {
    list: () => unknown;
    create: (input: unknown) => unknown;
  };
  papers: {
    listByCourse: (courseId: string) => unknown;
    create: (input: unknown) => unknown;
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
  [persistenceIpcChannels.papersListByCourse]: (input: unknown) =>
    services.papers.listByCourse(
      listPapersByCoursePayloadSchema.parse(input).courseId,
    ),
  [persistenceIpcChannels.papersCreate]: (input: unknown) =>
    services.papers.create(input),
  [persistenceIpcChannels.searchQuery]: (input: unknown) =>
    services.search.query(searchQueryPayloadSchema.parse(input).query),
});
