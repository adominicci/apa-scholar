import path from 'node:path';
import { app, ipcMain } from 'electron';
import type { WorkspaceSearchPlaceholderResult } from '@preload/api/contracts';
import { createPersistenceContext } from '@infrastructure/persistence/create-persistence-context';
import { createPersistenceIpcHandlers } from '@main/ipc/create-persistence-ipc-handlers';
import { registerPersistenceIpcHandlers } from '@main/ipc/register-persistence-ipc-handlers';

export const bootstrapPersistence = () => {
  const persistenceContext = createPersistenceContext({
    dbPath: path.join(app.getPath('userData'), 'apa-scholar.sqlite'),
  });

  registerPersistenceIpcHandlers(
    ipcMain,
    createPersistenceIpcHandlers({
      courses: persistenceContext.courseService,
      papers: persistenceContext.paperService,
      search: {
        query: (): WorkspaceSearchPlaceholderResult => ({
          courses: [],
          papers: [],
          status: 'placeholder',
        }),
      },
    }),
  );

  return persistenceContext;
};
