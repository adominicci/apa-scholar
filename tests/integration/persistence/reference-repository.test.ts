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

const journalArticleFields = {
  authors: [{ family: 'Smith', given: 'John' }],
  year: '2020',
  title: 'Cognitive Effects of Sleep Deprivation',
  journalName: 'Journal of Psychology',
  volume: '42',
  issue: '3',
  pages: '100-115',
  doi: '10.1234/example',
};

const bookFields = {
  authors: [{ family: 'Adams', given: 'Alice' }],
  year: '2019',
  title: 'Publication Manual',
  publisher: 'American Psychological Association',
  edition: '7th',
};

const createTestPaper = (
  context: ReturnType<typeof createPersistenceContext>,
) => {
  const course = context.courseRepository.create({
    name: 'Research Methods',
    code: 'PSY-500',
  });

  return context.paperService.create({
    courseId: course.id,
    title: 'Literature Review',
  });
};

describe('referenceRepository', () => {
  it('creates a reference and reloads it by id', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const paper = createTestPaper(context);

    const created = context.referenceRepository.create({
      paperId: paper.id,
      referenceType: 'journal-article',
      fields: journalArticleFields,
    });

    const reloaded = context.referenceRepository.getById(created.id);
    context.close();

    expect(created.referenceType).toBe('journal-article');
    expect(created.paperId).toBe(paper.id);
    expect(created.sortKey).toBe(
      'smith|2020|cognitive effects of sleep deprivation',
    );
    expect(reloaded).not.toBeNull();
    expect(reloaded!.fields).toEqual(
      expect.objectContaining({ journalName: 'Journal of Psychology' }),
    );
  });

  it('lists references for a paper sorted by sort key', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const paper = createTestPaper(context);

    context.referenceRepository.create({
      paperId: paper.id,
      referenceType: 'book',
      fields: {
        authors: [{ family: 'Zimmerman', given: 'Zoe' }],
        year: '2021',
        title: 'Zebra Patterns',
        publisher: 'Nature Press',
      },
    });

    context.referenceRepository.create({
      paperId: paper.id,
      referenceType: 'journal-article',
      fields: journalArticleFields,
    });

    context.referenceRepository.create({
      paperId: paper.id,
      referenceType: 'book',
      fields: bookFields,
    });

    const refs = context.referenceRepository.listByPaper(paper.id);
    context.close();

    expect(refs).toHaveLength(3);
    expect(refs[0]!.sortKey < refs[1]!.sortKey).toBe(true);
    expect(refs[1]!.sortKey < refs[2]!.sortKey).toBe(true);
  });

  it('returns an empty list when paper has no references', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const paper = createTestPaper(context);

    const refs = context.referenceRepository.listByPaper(paper.id);
    context.close();

    expect(refs).toHaveLength(0);
  });

  it('updates a reference and recomputes its sort key', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const paper = createTestPaper(context);

    const created = context.referenceRepository.create({
      paperId: paper.id,
      referenceType: 'journal-article',
      fields: journalArticleFields,
    });

    const updated = context.referenceRepository.update(created.id, {
      fields: {
        ...journalArticleFields,
        authors: [{ family: 'Baker', given: 'Bob' }],
      },
    });

    context.close();

    expect(updated.sortKey).toContain('baker|');
    expect(updated.sortKey).not.toBe(created.sortKey);
  });

  it('changes reference type on update', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const paper = createTestPaper(context);

    const created = context.referenceRepository.create({
      paperId: paper.id,
      referenceType: 'journal-article',
      fields: journalArticleFields,
    });

    const updated = context.referenceRepository.update(created.id, {
      referenceType: 'book',
      fields: bookFields,
    });

    context.close();

    expect(updated.referenceType).toBe('book');
  });

  it('deletes a reference', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const paper = createTestPaper(context);

    const created = context.referenceRepository.create({
      paperId: paper.id,
      referenceType: 'journal-article',
      fields: journalArticleFields,
    });

    context.referenceRepository.delete(created.id);
    const reloaded = context.referenceRepository.getById(created.id);
    context.close();

    expect(reloaded).toBeNull();
  });

  it('cascade deletes references when paper is deleted', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });
    const paper = createTestPaper(context);

    const ref = context.referenceRepository.create({
      paperId: paper.id,
      referenceType: 'book',
      fields: bookFields,
    });

    context.paperRepository.archive(paper.id);
    context.database.prepare('DELETE FROM papers WHERE id = ?').run(paper.id);

    const reloaded = context.referenceRepository.getById(ref.id);
    context.close();

    expect(reloaded).toBeNull();
  });

  it('throws when updating a non-existent reference', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });

    expect(() =>
      context.referenceRepository.update('non-existent', {
        fields: bookFields,
      }),
    ).toThrow(/not found/i);

    context.close();
  });

  it('throws when deleting a non-existent reference', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });

    expect(() => context.referenceRepository.delete('non-existent')).toThrow(
      /not found/i,
    );

    context.close();
  });

  it('applies the 002_references_table migration', () => {
    const context = createPersistenceContext({ dbPath: createTempDbPath() });

    const appliedMigrations = context.database
      .prepare('SELECT id FROM migrations ORDER BY id ASC')
      .all() as Array<{ id: string }>;

    context.close();

    expect(appliedMigrations.map((m) => m.id)).toContain(
      '002_references_table',
    );
  });
});
