import { describe, expect, it } from 'vitest';
import type {
  Paper,
  PaperMeta,
} from '@domain/shared/persistence-models';
import {
  applyPaperMetadataUpdate,
  getPaperMetadataValidationMessages,
  resolvePaperStructure,
} from '@domain/papers/paper-metadata';

const createPaper = (overrides: Partial<Paper> = {}): Paper => ({
  archivedAt: null,
  courseId: 'course-1',
  createdAt: '2026-03-07T14:00:00.000Z',
  id: 'paper-1',
  language: 'en',
  paperType: 'student',
  status: 'draft',
  templateId: 'apa-student',
  title: 'Capstone Draft',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperMeta = (overrides: Partial<PaperMeta> = {}): PaperMeta => ({
  abstractEnabled: false,
  authorName: null,
  authorNote: null,
  courseCode: 'PSY-500',
  courseName: 'Research Methods',
  createdAt: '2026-03-07T14:00:00.000Z',
  dueDate: 'March 9, 2026',
  institution: 'APA University',
  paperId: 'paper-1',
  professorName: 'Dr. Rivera',
  runningHead: null,
  shortTitle: null,
  title: 'Capstone Draft',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

describe('paper metadata helpers', () => {
  it('resolves the canonical paper structure from paper type and abstract visibility', () => {
    expect(
      resolvePaperStructure({
        abstractEnabled: false,
        paperType: 'student',
      }),
    ).toEqual({
      abstractEnabled: false,
      paperType: 'student',
      templateId: 'apa-student',
    });

    expect(
      resolvePaperStructure({
        abstractEnabled: true,
        paperType: 'student',
      }),
    ).toEqual({
      abstractEnabled: true,
      paperType: 'student',
      templateId: 'apa-student-abstract',
    });

    expect(
      resolvePaperStructure({
        abstractEnabled: true,
        paperType: 'professional',
      }),
    ).toEqual({
      abstractEnabled: true,
      paperType: 'professional',
      templateId: 'apa-professional',
    });
  });

  it('validates required metadata fields by paper type', () => {
    expect(
      getPaperMetadataValidationMessages(
        createPaper(),
        createPaperMeta({
          authorName: '',
          courseName: '   ',
          dueDate: null,
          institution: null,
          professorName: '',
          title: ' ',
        }),
      ),
    ).toEqual([
      'Title is required.',
      'Author name is required.',
      'Institution is required.',
      'Course name is required.',
      'Professor name is required.',
      'Due date is required.',
    ]);

    expect(
      getPaperMetadataValidationMessages(
        createPaper({
          paperType: 'professional',
          templateId: 'apa-professional',
        }),
        createPaperMeta({
          authorName: null,
          runningHead: '  ',
          title: '',
        }),
      ),
    ).toEqual([
      'Title is required.',
      'Author name is required.',
      'Running head is required.',
    ]);
  });

  it('does not leak paper-level fields into paperMeta during aggregate updates', () => {
    const updatedAggregate = applyPaperMetadataUpdate(
      {
        paper: createPaper(),
        paperContent: {
          abstractDoc: { content: [], type: 'doc' },
          bodyDoc: { content: [], type: 'doc' },
          createdAt: '2026-03-07T14:00:00.000Z',
          paperId: 'paper-1',
          updatedAt: '2026-03-07T14:00:00.000Z',
        },
        paperMeta: createPaperMeta(),
      },
      {
        abstractEnabled: true,
        paperType: 'professional',
        title: 'Faculty Draft',
      },
    );

    expect(updatedAggregate.paper.paperType).toBe('professional');
    expect(updatedAggregate.paperMeta.title).toBe('Faculty Draft');
    expect('paperType' in updatedAggregate.paperMeta).toBe(false);
  });
});
