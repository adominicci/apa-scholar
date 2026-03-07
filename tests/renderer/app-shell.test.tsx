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
      courses: {
        list: () => Promise.resolve([]),
        create: () =>
          Promise.resolve({
          archivedAt: null,
          code: null,
          createdAt: '2026-03-07T14:00:00.000Z',
          defaultLanguage: 'en',
          defaultPaperTemplate: 'apa-student',
          id: 'course-1',
          institution: null,
          name: 'Research Methods',
          professorName: null,
          semester: null,
          updatedAt: '2026-03-07T14:00:00.000Z',
          }),
      },
      papers: {
        listByCourse: () => Promise.resolve([]),
        create: () =>
          Promise.resolve({
          archivedAt: null,
          courseId: 'course-1',
          createdAt: '2026-03-07T14:00:00.000Z',
          id: 'paper-1',
          language: 'en',
          paperType: 'student',
          status: 'draft',
          templateId: 'apa-student',
          title: 'Literature Review',
          updatedAt: '2026-03-07T14:00:00.000Z',
          }),
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
