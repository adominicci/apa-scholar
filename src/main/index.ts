import { app, dialog } from 'electron';
import { bootstrapPersistence } from '@main/app/bootstrap-persistence';
import { handleAppReady } from '@main/app/handle-app-ready';
import { createMainWindow } from '@main/app/create-main-window';

if (process.platform === 'win32') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    if (require('electron-squirrel-startup')) app.quit();
  } catch {
    // Module not available outside Windows packaging
  }
}

void app.whenReady().then(async () => {
  await handleAppReady({
    bootstrapPersistence,
    createMainWindow,
    onActivate: (listener) => {
      app.on('activate', listener);
    },
    onBeforeQuit: (listener) => {
      app.on('before-quit', listener);
    },
    quit: () => {
      app.quit();
    },
    showErrorBox: (title, content) => {
      dialog.showErrorBox(title, content);
    },
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
