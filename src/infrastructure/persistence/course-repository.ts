import type { CourseRepository } from '@application/contracts/persistence-repositories';
import { createEntityId, createIsoTimestamp } from '@domain/shared/entity-helpers';
import {
  createCourseInputSchema,
  courseSchema,
  updateCourseInputSchema,
} from '@domain/shared/persistence-models';
import type {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
} from '@domain/shared/persistence-models';
import type { SqliteDatabase } from '@infrastructure/persistence/database';
import { createRowParser } from '@infrastructure/persistence/row-parsers';
import { toNullableString } from '@infrastructure/persistence/sql-helpers';

const parseCourseRow = createRowParser(courseSchema);

const selectCourseColumns = `
  SELECT
    id,
    name,
    code,
    professor_name AS professorName,
    institution,
    semester,
    default_language AS defaultLanguage,
    default_paper_template AS defaultPaperTemplate,
    created_at AS createdAt,
    updated_at AS updatedAt,
    archived_at AS archivedAt
  FROM courses
`;

export const createCourseRepository = (
  database: SqliteDatabase,
): CourseRepository => {
  const insertCourse = database.prepare<
    [
      string,
      string,
      string | null,
      string | null,
      string | null,
      string | null,
      string,
      string,
      string,
      string,
    ]
  >(
    `
      INSERT INTO courses (
        id,
        name,
        code,
        professor_name,
        institution,
        semester,
        default_language,
        default_paper_template,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  );
  const getCourseByIdStatement = database.prepare<[string], Course>(
    `${selectCourseColumns} WHERE id = ? LIMIT 1`,
  );
  const listActiveCoursesStatement = database.prepare<[], Course>(
    `${selectCourseColumns} WHERE archived_at IS NULL ORDER BY updated_at DESC, name ASC`,
  );
  const updateCourseStatement = database.prepare<
    [
      string,
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
      string,
      string,
      string,
    ]
  >(
    `
      UPDATE courses
      SET
        name = ?,
        code = ?,
        professor_name = ?,
        institution = ?,
        semester = ?,
        default_language = ?,
        default_paper_template = ?,
        updated_at = ?
      WHERE id = ?
    `,
  );
  const archiveCourseStatement = database.prepare<[string, string, string]>(
    `
      UPDATE courses
      SET archived_at = ?, updated_at = ?
      WHERE id = ?
    `,
  );

  const getById = (id: string): Course | null => {
    const row = getCourseByIdStatement.get(id);

    return row ? parseCourseRow(row) : null;
  };

  return {
    create: (input: CreateCourseInput): Course => {
      const parsedInput = createCourseInputSchema.parse(input);
      const timestamp = createIsoTimestamp();
      const id = createEntityId();

      insertCourse.run(
        id,
        parsedInput.name,
        toNullableString(parsedInput.code),
        toNullableString(parsedInput.professorName),
        toNullableString(parsedInput.institution),
        toNullableString(parsedInput.semester),
        parsedInput.defaultLanguage ?? 'en',
        parsedInput.defaultPaperTemplate ?? 'apa-student',
        timestamp,
        timestamp,
      );

      return getById(id) ?? (() => {
        throw new Error(`Created course "${id}" could not be reloaded.`);
      })();
    },
    listActive: (): Course[] => listActiveCoursesStatement.all().map(parseCourseRow),
    getById,
    update: (id: string, input: UpdateCourseInput): Course => {
      const existingCourse = getById(id);

      if (!existingCourse) {
        throw new Error(`Course "${id}" was not found.`);
      }

      const parsedInput = updateCourseInputSchema.parse(input);
      const updatedCourse = {
        ...existingCourse,
        ...parsedInput,
        updatedAt: createIsoTimestamp(),
      };

      updateCourseStatement.run(
        updatedCourse.name,
        toNullableString(updatedCourse.code),
        toNullableString(updatedCourse.professorName),
        toNullableString(updatedCourse.institution),
        toNullableString(updatedCourse.semester),
        updatedCourse.defaultLanguage,
        updatedCourse.defaultPaperTemplate,
        updatedCourse.updatedAt,
        id,
      );

      return getById(id) ?? (() => {
        throw new Error(`Updated course "${id}" could not be reloaded.`);
      })();
    },
    archive: (id: string): Course => {
      const existingCourse = getById(id);

      if (!existingCourse) {
        throw new Error(`Course "${id}" was not found.`);
      }

      const timestamp = createIsoTimestamp();
      archiveCourseStatement.run(timestamp, timestamp, id);

      return getById(id) ?? (() => {
        throw new Error(`Archived course "${id}" could not be reloaded.`);
      })();
    },
  };
};
