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
        [persistenceIpcChannels.papersGetById]: () => ({ id: 'paper-1' }),
        [persistenceIpcChannels.papersCreate]: () => ({ id: 'paper-1' }),
        [persistenceIpcChannels.papersUpdateBodyContent]: () => ({ id: 'paper-1' }),
        [persistenceIpcChannels.papersUpdateMetadata]: () => ({ id: 'paper-1' }),
        [persistenceIpcChannels.searchQuery]: () => ({
          courses: [],
          papers: [],
          status: 'placeholder',
        }),
      },
    );

    expect(handle).toHaveBeenCalledTimes(8);
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
      persistenceIpcChannels.papersGetById,
      expect.any(Function),
    );
    expect(handle).toHaveBeenCalledWith(
      persistenceIpcChannels.papersCreate,
      expect.any(Function),
    );
    expect(handle).toHaveBeenCalledWith(
      persistenceIpcChannels.papersUpdateBodyContent,
      expect.any(Function),
    );
    expect(handle).toHaveBeenCalledWith(
      persistenceIpcChannels.papersUpdateMetadata,
      expect.any(Function),
    );
    expect(handle).toHaveBeenCalledWith(
      persistenceIpcChannels.searchQuery,
      expect.any(Function),
    );
  });
});
