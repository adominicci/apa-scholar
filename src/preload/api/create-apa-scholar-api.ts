import { exportIpcChannels } from '@application/contracts/export-ipc';
import { persistenceIpcChannels } from '@application/contracts/persistence-ipc';
import { settingsIpcChannels } from '@application/contracts/settings-ipc';
import type { ApaScholarApi } from '@preload/api/contracts';

type Invoke = <TResult>(channel: string, payload?: unknown) => Promise<TResult>;

const createUnboundInvokeError = (channel: string): Promise<never> =>
  Promise.reject(
    new Error(`No preload invoke implementation was bound for "${channel}".`),
  );

export const createApaScholarApi = (
  invoke: Invoke = (channel) => createUnboundInvokeError(channel),
): ApaScholarApi => ({
  meta: {
    bridgeVersion: 1,
    platform: 'desktop',
    runtime: 'electron',
  },
  courses: {
    list: () => invoke(persistenceIpcChannels.coursesList),
    create: (input) => invoke(persistenceIpcChannels.coursesCreate, input),
    update: (courseId, input) =>
      invoke(persistenceIpcChannels.coursesUpdate, { courseId, input }),
  },
  papers: {
    listByCourse: (courseId) =>
      invoke(persistenceIpcChannels.papersListByCourse, { courseId }),
    listRecent: (limit) =>
      invoke(persistenceIpcChannels.papersListRecent, { limit }),
    getById: (paperId) =>
      invoke(persistenceIpcChannels.papersGetById, { paperId }),
    create: (input) => invoke(persistenceIpcChannels.papersCreate, input),
    updateBodyContent: (paperId, bodyDoc) =>
      invoke(persistenceIpcChannels.papersUpdateBodyContent, {
        bodyDoc,
        paperId,
      }),
    updateMetadata: (paperId, input) =>
      invoke(persistenceIpcChannels.papersUpdateMetadata, { input, paperId }),
  },
  references: {
    listByPaper: (paperId) =>
      invoke(persistenceIpcChannels.referencesListByPaper, { paperId }),
    create: (input) => invoke(persistenceIpcChannels.referencesCreate, input),
    getById: (referenceId) =>
      invoke(persistenceIpcChannels.referencesGetById, { referenceId }),
    update: (referenceId, input) =>
      invoke(persistenceIpcChannels.referencesUpdate, { referenceId, input }),
    delete: (referenceId) =>
      invoke(persistenceIpcChannels.referencesDelete, { referenceId }),
  },
  search: {
    query: (query) => invoke(persistenceIpcChannels.searchQuery, { query }),
  },
  settings: {
    get: () => invoke(settingsIpcChannels.settingsGet),
    save: (input) => invoke(settingsIpcChannels.settingsSave, input),
  },
  export: {
    pdf: (paperId) => invoke(exportIpcChannels.exportPdf, { paperId }),
  },
});
