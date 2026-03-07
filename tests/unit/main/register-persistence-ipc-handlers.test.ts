import { describe, expect, it, vi } from 'vitest';
import { persistenceIpcChannels } from '@application/contracts/persistence-ipc';
import { registerPersistenceIpcHandlers } from '@main/ipc/register-persistence-ipc-handlers';

describe('registerPersistenceIpcHandlers', () => {
  it('registers every persistence handler with ipcMain.handle', () => {
    const handle = vi.fn();

    registerPersistenceIpcHandlers(
      { handle },
      {
        [persistenceIpcChannels.coursesList]: () => [],
        [persistenceIpcChannels.coursesCreate]: () => ({ id: 'course-1' }),
        [persistenceIpcChannels.papersListByCourse]: () => [],
        [persistenceIpcChannels.papersCreate]: () => ({ id: 'paper-1' }),
      },
    );

    expect(handle).toHaveBeenCalledTimes(4);
    expect(handle).toHaveBeenCalledWith(
      persistenceIpcChannels.coursesList,
      expect.any(Function),
    );
    expect(handle).toHaveBeenCalledWith(
      persistenceIpcChannels.coursesCreate,
      expect.any(Function),
    );
    expect(handle).toHaveBeenCalledWith(
      persistenceIpcChannels.papersListByCourse,
      expect.any(Function),
    );
    expect(handle).toHaveBeenCalledWith(
      persistenceIpcChannels.papersCreate,
      expect.any(Function),
    );
  });
});
