import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createPersistenceContext } from '@infrastructure/persistence/create-persistence-context';

const tempDirs: string[] = [];

const createTempDbPath = (): string => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apa-scholar-db-'));
  tempDirs.push(tempDir);

  return path.join(tempDir, 'workspace.sqlite');
};

afterEach(() => {
  while (tempDirs.length > 0) {
    const tempDir = tempDirs.pop();

    if (tempDir) {
      fs.rmSync(tempDir, { force: true, recursive: true });
    }
  }
});

describe('createPersistenceContext', () => {
  it('runs migrations idempotently and round-trips settings', () => {
    const dbPath = createTempDbPath();

    const firstContext = createPersistenceContext({ dbPath });
    firstContext.settingsRepository.save({
      debug: true,
      language: 'es',
    });
    const firstSettings = firstContext.settingsRepository.get();
    firstContext.close();

    const secondContext = createPersistenceContext({ dbPath });
    const secondSettings = secondContext.settingsRepository.get();
    const appliedMigrations = secondContext.database
      .prepare('SELECT id FROM migrations ORDER BY id ASC')
      .all() as Array<{ id: string }>;

    secondContext.close();

    expect(firstSettings?.language).toBe('es');
    expect(secondSettings?.debug).toBe(true);
    expect(appliedMigrations).toHaveLength(1);
  });

  it('supports course CRUD through the repository with archive-first listing', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const createdCourse = context.courseRepository.create({
      code: 'PSY-500',
      defaultLanguage: 'en',
      defaultPaperTemplate: 'apa-student',
      institution: 'APA University',
      name: 'Research Methods',
      professorName: 'Dr. Rivera',
      semester: 'Spring 2026',
    });

    const updatedCourse = context.courseRepository.update(createdCourse.id, {
      semester: 'Fall 2026',
    });
    const fetchedCourse = context.courseRepository.getById(createdCourse.id);
    const archivedCourse = context.courseRepository.archive(createdCourse.id);
    const activeCourses = context.courseRepository.listActive();

    context.close();

    expect(updatedCourse.semester).toBe('Fall 2026');
    expect(fetchedCourse?.name).toBe('Research Methods');
    expect(archivedCourse.archivedAt).not.toBeNull();
    expect(activeCourses).toHaveLength(0);
  });

  it('creates a paper aggregate and scopes active papers by course', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const course = context.courseRepository.create({
      name: 'Capstone Seminar',
    });

    context.settingsRepository.save({
      debug: false,
      language: 'es',
    });

    const createdPaper = context.paperService.create({
      courseId: course.id,
      title: 'Literature Review',
    });
    const paperMetaRow = context.database
      .prepare('SELECT paper_id AS paperId, title FROM paper_meta WHERE paper_id = ?')
      .get(createdPaper.id) as { paperId: string; title: string } | undefined;
    const paperContentRow = context.database
      .prepare(
        'SELECT paper_id AS paperId, abstract_doc AS abstractDoc, body_doc AS bodyDoc FROM paper_content WHERE paper_id = ?',
      )
      .get(createdPaper.id) as
      | { paperId: string; abstractDoc: string; bodyDoc: string }
      | undefined;

    const activePapers = context.paperRepository.listByCourse(course.id);
    const archivedPaper = context.paperRepository.archive(createdPaper.id);
    const activePapersAfterArchive = context.paperRepository.listByCourse(
      course.id,
    );

    context.close();

    expect(createdPaper.language).toBe('en');
    expect(createdPaper.paperType).toBe('student');
    expect(paperMetaRow).toEqual({
      paperId: createdPaper.id,
      title: 'Literature Review',
    });
    expect(paperContentRow?.paperId).toBe(createdPaper.id);
    expect(activePapers).toHaveLength(1);
    expect(archivedPaper.archivedAt).not.toBeNull();
    expect(activePapersAfterArchive).toHaveLength(0);
  });
});
