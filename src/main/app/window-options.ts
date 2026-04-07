import path from 'node:path';
import type { BrowserWindowConstructorOptions } from 'electron';

export const buildMainWindowOptions = (
  preloadPath: string,
): BrowserWindowConstructorOptions => ({
  icon: path.join(__dirname, '../../assets/icon.png'),
  width: 1440,
  height: 960,
  minWidth: 1100,
  minHeight: 720,
  show: false,
  backgroundColor: '#f3efe5',
  titleBarStyle: 'hiddenInset',
  webPreferences: {
    preload: preloadPath,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    webviewTag: false,
    spellcheck: true,
  },
});
