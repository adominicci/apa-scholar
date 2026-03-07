import type { PaperRepository } from '@application/contracts/persistence-repositories';
import type { StoredPaperAggregate } from '@domain/papers/paper-draft';
import {
  createEntityId,
  createIsoTimestamp,
} from '@domain/shared/entity-helpers';
import { abstractEnabledTemplates } from '@domain/shared/contracts';
import {
  createStoredPaperInputSchema,
  paperContentSchema,
  paperMetaSchema,
  paperSchema,
  updatePaperInputSchema,
} from '@domain/shared/persistence-models';
import type {
  CreateStoredPaperInput,
  Paper,
  UpdatePaperInput,
} from '@domain/shared/persistence-models';
import type { TemplateSeedResult } from '@domain/papers/template-definitions';
import type { SqliteDatabase } from '@infrastructure/persistence/database';
import { createRowParser } from '@infrastructure/persistence/row-parsers';
import { parseJsonRecord, toNullableString } from '@infrastructure/persistence/sql-helpers';

const parsePaperRow = createRowParser(paperSchema);
const parsePaperMetaRow = createRowParser(paperMetaSchema);
const parsePaperContentRow = createRowParser(paperContentSchema);

const selectPaperColumns = `
  SELECT
    id,
    course_id AS courseId,
    title,
    template_id AS templateId,
    paper_type AS paperType,
    language,
    status,
    created_at AS createdAt,
    updated_at AS updatedAt,
    archived_at AS archivedAt
  FROM papers
`;

const selectPaperMetaColumns = `
  SELECT
    paper_id AS paperId,
    title,
    short_title AS shortTitle,
    author_name AS authorName,
    institution,
    course_name AS courseName,
    course_code AS courseCode,
    professor_name AS professorName,
    due_date AS dueDate,
    running_head AS runningHead,
    author_note AS authorNote,
    abstract_enabled AS abstractEnabled,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM paper_meta
`;

const selectPaperContentColumns = `
  SELECT
    paper_id AS paperId,
    abstract_doc AS abstractDoc,
    body_doc AS bodyDoc,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM paper_content
`;

export const createPaperRepository = (
  database: SqliteDatabase,
): PaperRepository => {
  const insertPaperStatement = database.prepare<
    [
      string,
      string | null,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ]
  >(
    `
      INSERT INTO papers (
        id,
        course_id,
        title,
        template_id,
        paper_type,
        language,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  );
  const insertPaperMetaStatement = database.prepare<
    [
      string,
      string,
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
      number,
      string,
      string,
    ]
  >(
    `
      INSERT INTO paper_meta (
        paper_id,
        title,
        short_title,
        author_name,
        institution,
        course_name,
        course_code,
        professor_name,
        due_date,
        running_head,
        author_note,
        abstract_enabled,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  );
  const insertPaperContentStatement = database.prepare<
    [string, string, string, string, string]
  >(
    `
      INSERT INTO paper_content (
        paper_id,
        abstract_doc,
        body_doc,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?)
    `,
  );
  const getPaperByIdStatement = database.prepare<[string], Paper>(
    `${selectPaperColumns} WHERE id = ? LIMIT 1`,
  );
  const getPaperMetaByIdStatement = database.prepare<[string]>(
    `${selectPaperMetaColumns} WHERE paper_id = ? LIMIT 1`,
  );
  const getPaperContentByIdStatement = database.prepare<[string]>(
    `${selectPaperContentColumns} WHERE paper_id = ? LIMIT 1`,
  );
  const listPapersByCourseStatement = database.prepare<[string], Paper>(
    `${selectPaperColumns} WHERE course_id = ? AND archived_at IS NULL ORDER BY updated_at DESC, title ASC`,
  );
  const updatePaperStatement = database.prepare<
    [string, string, string, string, string, string, string]
  >(
    `
      UPDATE papers
      SET
        title = ?,
        template_id = ?,
        paper_type = ?,
        language = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `,
  );
  const archivePaperStatement = database.prepare<[string, string, string]>(
    `
      UPDATE papers
      SET archived_at = ?, updated_at = ?
      WHERE id = ?
    `,
  );

  const getById = (id: string): Paper | null => {
    const row = getPaperByIdStatement.get(id);

    return row ? parsePaperRow(row) : null;
  };

  const getAggregateById = (id: string): StoredPaperAggregate | null => {
    const paper = getById(id);
    const paperMetaRow = getPaperMetaByIdStatement.get(id);
    const paperContentRow = getPaperContentByIdStatement.get(id);

    if (!paper || !paperMetaRow || !paperContentRow) {
      return null;
    }

    return {
      paper,
      paperContent: parsePaperContentRow({
        ...paperContentRow,
        abstractDoc: parseJsonRecord(
          (paperContentRow as { abstractDoc: string }).abstractDoc,
        ),
        bodyDoc: parseJsonRecord((paperContentRow as { bodyDoc: string }).bodyDoc),
      }),
      paperMeta: parsePaperMetaRow(paperMetaRow),
    };
  };

  const insertPaperAggregate = database.transaction(
    (
      id: string,
      input: CreateStoredPaperInput,
      seed: TemplateSeedResult,
      timestamp: string,
    ) => {
      insertPaperStatement.run(
        id,
        input.courseId,
        input.title,
        input.templateId,
        input.paperType,
        input.language,
        input.status,
        timestamp,
        timestamp,
      );
      insertPaperMetaStatement.run(
        id,
        seed.paperMeta.title,
        toNullableString(seed.paperMeta.shortTitle),
        toNullableString(seed.paperMeta.authorName),
        toNullableString(seed.paperMeta.institution),
        toNullableString(seed.paperMeta.courseName),
        toNullableString(seed.paperMeta.courseCode),
        toNullableString(seed.paperMeta.professorName),
        toNullableString(seed.paperMeta.dueDate),
        toNullableString(seed.paperMeta.runningHead),
        toNullableString(seed.paperMeta.authorNote),
        seed.paperMeta.abstractEnabled ||
        abstractEnabledTemplates.has(input.templateId)
          ? 1
          : 0,
        timestamp,
        timestamp,
      );
      insertPaperContentStatement.run(
        id,
        JSON.stringify(seed.paperContent.abstractDoc),
        JSON.stringify(seed.paperContent.bodyDoc),
        timestamp,
        timestamp,
      );
    },
  );

  return {
    create: (input: CreateStoredPaperInput, seed: TemplateSeedResult): Paper => {
      const parsedInput = createStoredPaperInputSchema.parse(input);
      const id = createEntityId();
      const timestamp = createIsoTimestamp();

      insertPaperAggregate(id, parsedInput, seed, timestamp);

      return getById(id) ?? (() => {
        throw new Error(`Created paper "${id}" could not be reloaded.`);
      })();
    },
    getAggregateById,
    listByCourse: (courseId: string): Paper[] =>
      listPapersByCourseStatement.all(courseId).map(parsePaperRow),
    getById,
    update: (id: string, input: UpdatePaperInput): Paper => {
      const existingPaper = getById(id);

      if (!existingPaper) {
        throw new Error(`Paper "${id}" was not found.`);
      }

      const parsedInput = updatePaperInputSchema.parse(input);
      const updatedPaper = {
        ...existingPaper,
        ...parsedInput,
        updatedAt: createIsoTimestamp(),
      };

      updatePaperStatement.run(
        updatedPaper.title,
        updatedPaper.templateId,
        updatedPaper.paperType,
        updatedPaper.language,
        updatedPaper.status,
        updatedPaper.updatedAt,
        id,
      );

      return getById(id) ?? (() => {
        throw new Error(`Updated paper "${id}" could not be reloaded.`);
      })();
    },
    archive: (id: string): Paper => {
      const existingPaper = getById(id);

      if (!existingPaper) {
        throw new Error(`Paper "${id}" was not found.`);
      }

      const timestamp = createIsoTimestamp();
      archivePaperStatement.run(timestamp, timestamp, id);

      return getById(id) ?? (() => {
        throw new Error(`Archived paper "${id}" could not be reloaded.`);
      })();
    },
  };
};
