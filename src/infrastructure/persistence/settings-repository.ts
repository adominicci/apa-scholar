import type { SettingsRepository } from '@application/contracts/persistence-repositories';
import { createIsoTimestamp } from '@domain/shared/entity-helpers';
import { appSettingsSchema } from '@domain/shared/persistence-models';
import type { AppSettings } from '@domain/shared/persistence-models';
import type { SqliteDatabase } from '@infrastructure/persistence/database';
import { createRowParser } from '@infrastructure/persistence/row-parsers';

const parseSettingsRow = createRowParser(appSettingsSchema);

export const createSettingsRepository = (
  database: SqliteDatabase,
): SettingsRepository => {
  const getSettingsStatement = database.prepare<
    [],
    Pick<AppSettings, 'debug' | 'language' | 'updatedAt'>
  >(
    `
      SELECT
        language,
        debug,
        updated_at AS updatedAt
      FROM settings
      WHERE id = 1
      LIMIT 1
    `,
  );
  const upsertSettingsStatement = database.prepare<[string, number, string]>(
    `
      INSERT INTO settings (id, language, debug, updated_at)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        language = excluded.language,
        debug = excluded.debug,
        updated_at = excluded.updated_at
    `,
  );

  const get = (): AppSettings | null => {
    const row = getSettingsStatement.get();

    return row ? parseSettingsRow(row) : null;
  };

  return {
    get,
    save: (input) => {
      const timestamp = createIsoTimestamp();
      upsertSettingsStatement.run(input.language, input.debug ? 1 : 0, timestamp);

      return get() ?? (() => {
        throw new Error('Saved settings could not be reloaded.');
      })();
    },
  };
};
