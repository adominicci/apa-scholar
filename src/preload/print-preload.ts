import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronPrintBridge', {
  onExportData: (handler: (event: unknown, data: unknown) => void) => {
    ipcRenderer.on('export:data', handler);
  },
  removeExportDataListener: (
    handler: (event: unknown, data: unknown) => void,
  ) => {
    ipcRenderer.removeListener('export:data', handler);
  },
  signalReady: () => {
    ipcRenderer.send('export:ready');
  },
  signalRendered: () => {
    ipcRenderer.send('export:rendered');
  },
});
