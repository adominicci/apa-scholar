import type { ApaScholarApi } from '@preload/api/contracts';

declare global {
  interface Window {
    apaScholar?: ApaScholarApi;
  }
}

export {};
