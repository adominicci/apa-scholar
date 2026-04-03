import { z } from 'zod';
import type { ReferenceRepository } from '@application/contracts/persistence-repositories';
import { createEntityId, createIsoTimestamp } from '@domain/shared/entity-helpers';
import {
  computeReferenceSortKey,
  createReferenceInputSchema,
  referenceEntrySchema,
  updateReferenceInputSchema,
} from '@domain/references/reference-entry';
import type {
  CreateReferenceInput,
  ReferenceEntry,
  UpdateReferenceInput,
} from '@domain/references/reference-entry';
import type { SqliteDatabase } from '@infrastructure/persistence/database';
import { createRowParser } from '@infrastructure/persistence/row-parsers';
import { parseJsonRecord } from '@infrastructure/persistence/sql-helpers';

const referenceRowSchema = referenceEntrySchema.extend({
  fields: z.preprocess(
    (value) => (typeof value === 'string' ? parseJsonRecord(value) : value),
    z.record(z.string(), z.unknown()),
  ),
});

const parseReferenceRow = createRowParser(referenceRowSchema);

const selectReferenceColumns = `
  SELECT
    id,
    paper_id AS paperId,
    reference_type AS referenceType,
    fields,
    sort_key AS sortKey,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM "references"
`;

export const createReferenceRepository = (
  database: SqliteDatabase,
): ReferenceRepository => {
  const insertReference = database.prepare<
    [string, string, string, string, string, string, string]
  >(
    `
      INSERT INTO "references" (
        id,
        paper_id,
        reference_type,
        fields,
        sort_key,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
  );

  const getReferenceByIdStatement = database.prepare<[string], ReferenceEntry>(
    `${selectReferenceColumns} WHERE id = ? LIMIT 1`,
  );

  const listByPaperStatement = database.prepare<[string], ReferenceEntry>(
    `${selectReferenceColumns} WHERE paper_id = ? ORDER BY sort_key ASC`,
  );

  const updateReferenceStatement = database.prepare<
    [string, string, string, string, string]
  >(
    `
      UPDATE "references"
      SET
        reference_type = ?,
        fields = ?,
        sort_key = ?,
        updated_at = ?
      WHERE id = ?
    `,
  );

  const deleteReferenceStatement = database.prepare<[string]>(
    'DELETE FROM "references" WHERE id = ?',
  );

  const getById = (id: string): ReferenceEntry | null => {
    const row = getReferenceByIdStatement.get(id);
    return row ? parseReferenceRow(row) : null;
  };

  return {
    create: (input: CreateReferenceInput): ReferenceEntry => {
      const parsedInput = createReferenceInputSchema.parse(input);
      const timestamp = createIsoTimestamp();
      const id = createEntityId();
      const sortKey = computeReferenceSortKey(
        parsedInput.referenceType,
        parsedInput.fields,
      );

      insertReference.run(
        id,
        parsedInput.paperId,
        parsedInput.referenceType,
        JSON.stringify(parsedInput.fields),
        sortKey,
        timestamp,
        timestamp,
      );

      return getById(id) ?? (() => {
        throw new Error(`Created reference "${id}" could not be reloaded.`);
      })();
    },

    listByPaper: (paperId: string): ReferenceEntry[] =>
      listByPaperStatement.all(paperId).map(parseReferenceRow),

    getById,

    update: (id: string, input: UpdateReferenceInput): ReferenceEntry => {
      const existing = getById(id);
      if (!existing) {
        throw new Error(`Reference "${id}" was not found.`);
      }

      const parsedInput = updateReferenceInputSchema.parse(input);
      const referenceType = parsedInput.referenceType ?? existing.referenceType;
      const fields = parsedInput.fields ?? existing.fields;
      const sortKey = computeReferenceSortKey(referenceType, fields);
      const timestamp = createIsoTimestamp();

      updateReferenceStatement.run(
        referenceType,
        JSON.stringify(fields),
        sortKey,
        timestamp,
        id,
      );

      return getById(id) ?? (() => {
        throw new Error(`Updated reference "${id}" could not be reloaded.`);
      })();
    },

    delete: (id: string): void => {
      const existing = getById(id);
      if (!existing) {
        throw new Error(`Reference "${id}" was not found.`);
      }
      deleteReferenceStatement.run(id);
    },
  };
};
