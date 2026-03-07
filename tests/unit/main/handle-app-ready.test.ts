import { describe, expect, it, vi } from 'vitest';
import { handleAppReady } from '@main/app/handle-app-ready';

describe('handleAppReady', () => {
  it('shows a startup error and quits when persistence bootstrap fails', async () => {
    const showErrorBox = vi.fn();
    const quit = vi.fn();
    const createMainWindow = vi.fn();

    await handleAppReady({
      bootstrapPersistence: () => {
        throw new Error('database unavailable');
      },
      createMainWindow,
      onActivate: vi.fn(),
      onBeforeQuit: vi.fn(),
      quit,
      showErrorBox,
    });

    expect(showErrorBox).toHaveBeenCalledWith(
      'Startup error',
      'Error: database unavailable',
    );
    expect(quit).toHaveBeenCalledTimes(1);
    expect(createMainWindow).not.toHaveBeenCalled();
  });

  it('boots persistence, creates the main window, and registers lifecycle hooks', async () => {
    const persistenceContext = {
      close: vi.fn(),
    };
    const createMainWindow = vi.fn();
    const onActivate = vi.fn();
    const onBeforeQuit = vi.fn();

    await handleAppReady({
      bootstrapPersistence: () => persistenceContext,
      createMainWindow,
      onActivate,
      onBeforeQuit,
      quit: vi.fn(),
      showErrorBox: vi.fn(),
    });

    expect(createMainWindow).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onBeforeQuit).toHaveBeenCalledTimes(1);
  });
});
