import { describe, expect, it } from 'vitest';
import { createApaScholarApi } from '@preload/api/create-apa-scholar-api';

describe('createApaScholarApi', () => {
  it('creates a typed desktop bridge surface for the renderer shell', () => {
    const api = createApaScholarApi();

    expect(api.meta.bridgeVersion).toBe(1);
    expect(api.meta.platform).toBe('desktop');
    expect(api.meta.runtime).toBe('electron');
    expect(api.workspace.status).toBe('placeholder');
  });
});
