import { BrowserWindow } from 'electron';

export interface PersistenceBootstrapResult {
  close: () => void;
}

export interface HandleAppReadyDependencies {
  bootstrapPersistence: () => PersistenceBootstrapResult;
  createMainWindow: () => Promise<BrowserWindow>;
  onActivate: (listener: () => void) => void;
  onBeforeQuit: (listener: () => void) => void;
  quit: () => void;
  showErrorBox: (title: string, content: string) => void;
}

export const handleAppReady = async ({
  bootstrapPersistence,
  createMainWindow,
  onActivate,
  onBeforeQuit,
  quit,
  showErrorBox,
}: HandleAppReadyDependencies): Promise<void> => {
  let persistenceContext: PersistenceBootstrapResult;

  try {
    persistenceContext = bootstrapPersistence();
  } catch (error) {
    showErrorBox('Startup error', String(error));
    quit();
    return;
  }

  await createMainWindow();

  onActivate(() => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });

  onBeforeQuit(() => {
    persistenceContext.close();
  });
};
