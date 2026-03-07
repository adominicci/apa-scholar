import { persistenceIpcChannels } from '@application/contracts/persistence-ipc';
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
  },
  papers: {
    listByCourse: (courseId) =>
      invoke(persistenceIpcChannels.papersListByCourse, { courseId }),
    create: (input) => invoke(persistenceIpcChannels.papersCreate, input),
  },
});
