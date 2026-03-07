import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export type SqliteDatabase = Database.Database;

export const openDatabase = (dbPath: string): SqliteDatabase => {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const database = new Database(dbPath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');

  return database;
};
