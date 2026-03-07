import type { SqliteDatabase } from '@infrastructure/persistence/database';

interface Migration {
  id: string;
  sql: string;
}

const migrations: Migration[] = [
  {
    id: '001_initial_persistence',
    sql: `
      CREATE TABLE courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        professor_name TEXT,
        institution TEXT,
        semester TEXT,
        default_language TEXT NOT NULL,
        default_paper_template TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        archived_at TEXT
      );

      CREATE TABLE papers (
        id TEXT PRIMARY KEY,
        course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        template_id TEXT NOT NULL,
        paper_type TEXT NOT NULL,
        language TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        archived_at TEXT
      );

      CREATE TABLE paper_meta (
        paper_id TEXT PRIMARY KEY REFERENCES papers(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        short_title TEXT,
        author_name TEXT,
        institution TEXT,
        course_name TEXT,
        course_code TEXT,
        professor_name TEXT,
        due_date TEXT,
        running_head TEXT,
        author_note TEXT,
        abstract_enabled INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE paper_content (
        paper_id TEXT PRIMARY KEY REFERENCES papers(id) ON DELETE CASCADE,
        abstract_doc TEXT NOT NULL,
        body_doc TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        language TEXT NOT NULL,
        debug INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX idx_courses_active_lookup
      ON courses(name)
      WHERE archived_at IS NULL;

      CREATE INDEX idx_papers_course_id
      ON papers(course_id);

      CREATE INDEX idx_papers_updated_at
      ON papers(updated_at DESC);

      CREATE INDEX idx_papers_active_course_lookup
      ON papers(course_id, updated_at DESC)
      WHERE archived_at IS NULL;
    `,
  },
];

const ensureMigrationsTable = (database: SqliteDatabase): void => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      run_at TEXT NOT NULL
    );
  `);
};

export const runMigrations = (database: SqliteDatabase): void => {
  ensureMigrationsTable(database);

  const hasMigration = database.prepare<[string], { id: string }>(
    'SELECT id FROM migrations WHERE id = ?',
  );
  const insertMigration = database.prepare<[string, string]>(
    'INSERT INTO migrations (id, run_at) VALUES (?, ?)',
  );

  for (const migration of migrations) {
    const alreadyApplied = hasMigration.get(migration.id);

    if (alreadyApplied) {
      continue;
    }

    database.transaction(() => {
      database.exec(migration.sql);
      insertMigration.run(migration.id, new Date().toISOString());
    })();
  }
};
