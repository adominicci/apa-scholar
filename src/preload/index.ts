import { contextBridge } from 'electron';
import { createApaScholarApi } from '@preload/api/create-apa-scholar-api';

contextBridge.exposeInMainWorld('apaScholar', createApaScholarApi());
