import path from 'node:path';
import { app, ipcMain } from 'electron';
import { exportIpcChannels } from '@application/contracts/export-ipc';
import type { SettingsIpcChannel } from '@application/contracts/settings-ipc';
import { createExportPdfHandler } from '@main/ipc/create-export-ipc-handlers';
import type { WorkspaceSearchPlaceholderResult } from '@preload/api/contracts';
import { createPersistenceContext } from '@infrastructure/persistence/create-persistence-context';
import { createPersistenceIpcHandlers } from '@main/ipc/create-persistence-ipc-handlers';
import { createSettingsIpcHandlers } from '@main/ipc/create-settings-ipc-handlers';
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
      references: persistenceContext.referenceService,
      search: {
        query: (): WorkspaceSearchPlaceholderResult => ({
          courses: [],
          papers: [],
          status: 'placeholder',
        }),
      },
    }),
  );

  const settingsHandlers = createSettingsIpcHandlers(
    persistenceContext.settingsRepository,
  );

  for (const [channel, handler] of Object.entries(settingsHandlers) as Array<
    [SettingsIpcChannel, (payload?: unknown) => unknown]
  >) {
    ipcMain.handle(channel, (_event, payload) => handler(payload));
  }

  const printPreloadPath = path.join(__dirname, 'print-preload.js');
  const exportPdfHandler = createExportPdfHandler({
    getAggregate: (paperId) =>
      persistenceContext.paperRepository.getAggregateById(paperId),
    getReferences: (paperId) =>
      persistenceContext.referenceRepository.listByPaper(paperId),
    printPreloadPath,
  });

  ipcMain.handle(exportIpcChannels.exportPdf, (_event, payload) =>
    exportPdfHandler(payload),
  );

  return persistenceContext;
};
