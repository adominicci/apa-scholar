import type { ApaScholarApi } from '@preload/api/contracts';

export const createApaScholarApi = (): ApaScholarApi => ({
  meta: {
    bridgeVersion: 1,
    platform: 'desktop',
    runtime: 'electron',
  },
  workspace: {
    status: 'placeholder',
  },
});
