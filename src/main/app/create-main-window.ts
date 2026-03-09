import path from 'node:path';
import { BrowserWindow } from 'electron';
import { resolvePreloadEntryPath } from '@main/app/preload-entry-path';
import { buildMainWindowOptions } from '@main/app/window-options';

const getMainWindowName = (): string =>
  typeof MAIN_WINDOW_VITE_NAME !== 'undefined'
    ? MAIN_WINDOW_VITE_NAME
    : 'main_window';

const getMainWindowDevServerUrl = (): string | undefined =>
  typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined'
    ? MAIN_WINDOW_VITE_DEV_SERVER_URL
    : undefined;

const loadMainWindow = async (mainWindow: BrowserWindow): Promise<void> => {
  const devServerUrl = getMainWindowDevServerUrl();

  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  await mainWindow.loadFile(
    path.join(__dirname, `../renderer/${getMainWindowName()}/index.html`),
  );
};

export const createMainWindow = async (): Promise<BrowserWindow> => {
  const preloadPath = resolvePreloadEntryPath(__dirname);
  const mainWindow = new BrowserWindow(buildMainWindowOptions(preloadPath));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  await loadMainWindow(mainWindow);

  return mainWindow;
};
