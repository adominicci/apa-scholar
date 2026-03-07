import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { bootstrapPersistence } from '@main/app/bootstrap-persistence';
import { createMainWindow } from '@main/app/create-main-window';

if (started) {
  app.quit();
}

let persistenceContext: ReturnType<typeof bootstrapPersistence> | null = null;

void app.whenReady().then(async () => {
  persistenceContext = bootstrapPersistence();
  await createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  persistenceContext?.close();
  persistenceContext = null;
});
