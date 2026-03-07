import { describe, expect, it } from 'vitest';
import {
  appSettingsSchema,
  createCourseInputSchema,
  createPaperInputSchema,
  courseSchema,
  paperSchema,
} from '@domain/shared/persistence-models';

describe('persistence schemas', () => {
  it('parses a persisted course with archive metadata', () => {
    const course = courseSchema.parse({
      id: 'course-1',
      name: 'Research Methods',
      code: 'PSY-500',
      professorName: 'Dr. Rivera',
      institution: 'APA University',
      semester: 'Spring 2026',
      defaultLanguage: 'en',
      defaultPaperTemplate: 'apa-student',
      createdAt: '2026-03-07T14:00:00.000Z',
      updatedAt: '2026-03-07T14:00:00.000Z',
      archivedAt: null,
    });

    expect(course.defaultLanguage).toBe('en');
    expect(course.archivedAt).toBeNull();
  });

  it('rejects invalid language and template values', () => {
    expect(() =>
      createCourseInputSchema.parse({
        name: 'Advanced Writing',
        defaultLanguage: 'fr',
      }),
    ).toThrow(/language/i);

    expect(() =>
      createPaperInputSchema.parse({
        courseId: 'course-1',
        title: 'Paper',
        templateId: 'unknown-template',
      }),
    ).toThrow(/template/i);
  });

  it('rejects invalid paper types in persisted papers', () => {
    expect(() =>
      paperSchema.parse({
        id: 'paper-1',
        courseId: 'course-1',
        title: 'Capstone Draft',
        templateId: 'apa-student',
        paperType: 'memo',
        language: 'en',
        status: 'draft',
        createdAt: '2026-03-07T14:00:00.000Z',
        updatedAt: '2026-03-07T14:00:00.000Z',
        archivedAt: null,
      }),
    ).toThrow(/paper/i);
  });

  it('parses application settings as a single typed record', () => {
    const settings = appSettingsSchema.parse({
      language: 'es',
      debug: true,
      updatedAt: '2026-03-07T14:00:00.000Z',
    });

    expect(settings.language).toBe('es');
    expect(settings.debug).toBe(true);
  });
});
