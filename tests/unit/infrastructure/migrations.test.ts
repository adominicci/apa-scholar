import { describe, expect, it, vi } from 'vitest';
import { runMigrations } from '@infrastructure/persistence/migrations';
import type { SqliteDatabase } from '@infrastructure/persistence/database';

describe('runMigrations', () => {
  it('applies migration SQL without wrapping exec in a transaction callback', () => {
    const get = vi.fn().mockReturnValue(undefined);
    const run = vi.fn();
    const prepare = vi.fn((sql: string) => {
      if (sql.includes('SELECT id FROM migrations')) {
        return { get };
      }

      return { run };
    });
    const exec = vi.fn();
    const transaction = vi.fn(() => {
      throw new Error('transaction() should not be used for db.exec migrations');
    });

    runMigrations({
      exec,
      prepare,
      transaction,
    } as unknown as SqliteDatabase);

    expect(transaction).not.toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
    expect(run).toHaveBeenCalledWith(
      '001_initial_persistence',
      expect.any(String),
    );
  });

  it('wraps migration DDL and record insertion in one explicit SQLite transaction', () => {
    const get = vi.fn().mockReturnValue(undefined);
    const run = vi.fn();
    const prepare = vi.fn((sql: string) => {
      if (sql.includes('SELECT id FROM migrations')) {
        return { get };
      }

      return { run };
    });
    const exec = vi.fn();

    runMigrations({
      exec,
      prepare,
      transaction: vi.fn(),
    } as unknown as SqliteDatabase);

    expect(exec).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations'),
    );
    expect(exec).toHaveBeenNthCalledWith(2, 'BEGIN');
    expect(exec).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('CREATE TABLE courses'),
    );
    expect(exec).toHaveBeenNthCalledWith(4, 'COMMIT');
    expect(run).toHaveBeenCalledWith(
      '001_initial_persistence',
      expect.any(String),
    );
  });
});
