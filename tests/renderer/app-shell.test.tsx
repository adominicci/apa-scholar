// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ApaScholarApi } from '@preload/api/contracts';
import { App } from '@renderer/app/App';

describe('App', () => {
  beforeEach(() => {
    const api: ApaScholarApi = {
      meta: {
        bridgeVersion: 1,
        platform: 'desktop',
        runtime: 'electron',
      },
      workspace: {
        status: 'placeholder',
      },
    };

    window.apaScholar = api;
  });

  it('renders the foundation workspace shell and bridge status', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'APA Scholar' })).toBeVisible();
    expect(screen.getByText('Course workspace foundation')).toBeVisible();
    expect(screen.getByText('Secure desktop bridge ready')).toBeVisible();
    expect(screen.getByText('Project foundation shell')).toBeVisible();
  });
});
