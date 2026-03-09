import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { resolvePreloadEntryPath } from '@main/app/preload-entry-path';

describe('resolvePreloadEntryPath', () => {
  it('uses preload.js when the production preload bundle exists', () => {
    const fileExists = vi.fn((filePath: string) => filePath.endsWith('preload.js'));

    expect(resolvePreloadEntryPath('/tmp/.vite/build', fileExists)).toBe(
      path.join('/tmp/.vite/build', 'preload.js'),
    );
  });

  it('falls back to index.js when the dev preload bundle uses the forge default name', () => {
    const fileExists = vi.fn((filePath: string) => filePath.endsWith('index.js'));

    expect(resolvePreloadEntryPath('/tmp/.vite/build', fileExists)).toBe(
      path.join('/tmp/.vite/build', 'index.js'),
    );
  });

  it('keeps the production preload path as the default when neither bundle exists yet', () => {
    const fileExists = vi.fn(() => false);

    expect(resolvePreloadEntryPath('/tmp/.vite/build', fileExists)).toBe(
      path.join('/tmp/.vite/build', 'preload.js'),
    );
  });
});
