import { contextBridge, ipcRenderer } from 'electron';
import { createApaScholarApi } from '@preload/api/create-apa-scholar-api';

contextBridge.exposeInMainWorld(
  'apaScholar',
  createApaScholarApi((channel, payload) => ipcRenderer.invoke(channel, payload)),
);
