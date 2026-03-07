import { describe, expect, it } from 'vitest';
import { resolveCreatePaperDefaults } from '@application/services/resolve-create-paper-defaults';

describe('resolveCreatePaperDefaults', () => {
  it('prefers course defaults before app settings and falls back to english', () => {
    const result = resolveCreatePaperDefaults(
      {
        courseId: 'course-1',
        title: 'My APA Draft',
      },
      {
        id: 'course-1',
        name: 'Research Methods',
        code: null,
        professorName: null,
        institution: null,
        semester: null,
        defaultLanguage: 'es',
        defaultPaperTemplate: 'apa-student-abstract',
        createdAt: '2026-03-07T14:00:00.000Z',
        updatedAt: '2026-03-07T14:00:00.000Z',
        archivedAt: null,
      },
      {
        language: 'en',
        debug: false,
        updatedAt: '2026-03-07T14:00:00.000Z',
      },
    );

    expect(result.language).toBe('es');
    expect(result.templateId).toBe('apa-student-abstract');
    expect(result.paperType).toBe('student');
    expect(result.status).toBe('draft');
  });

  it('uses explicit paper input over inherited defaults', () => {
    const result = resolveCreatePaperDefaults(
      {
        courseId: 'course-1',
        title: 'Professional Memo',
        language: 'en',
        templateId: 'apa-professional',
        paperType: 'professional',
      },
      {
        id: 'course-1',
        name: 'Research Methods',
        code: null,
        professorName: null,
        institution: null,
        semester: null,
        defaultLanguage: 'es',
        defaultPaperTemplate: 'apa-student',
        createdAt: '2026-03-07T14:00:00.000Z',
        updatedAt: '2026-03-07T14:00:00.000Z',
        archivedAt: null,
      },
      {
        language: 'es',
        debug: false,
        updatedAt: '2026-03-07T14:00:00.000Z',
      },
    );

    expect(result.language).toBe('en');
    expect(result.templateId).toBe('apa-professional');
    expect(result.paperType).toBe('professional');
  });

  it('falls back to app settings language and default draft student template', () => {
    const result = resolveCreatePaperDefaults(
      {
        courseId: 'course-1',
        title: 'Fallback Draft',
      },
      {
        id: 'course-1',
        name: 'Research Methods',
        code: null,
        professorName: null,
        institution: null,
        semester: null,
        defaultLanguage: 'en',
        defaultPaperTemplate: 'apa-student',
        createdAt: '2026-03-07T14:00:00.000Z',
        updatedAt: '2026-03-07T14:00:00.000Z',
        archivedAt: null,
      },
      undefined,
    );

    expect(result.language).toBe('en');
    expect(result.templateId).toBe('apa-student');
    expect(result.paperType).toBe('student');
    expect(result.status).toBe('draft');
  });
});
