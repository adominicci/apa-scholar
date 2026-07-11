import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HandleAppReadyDependencies } from '@main/app/handle-app-ready';

const mocks = vi.hoisted(() => {
  const callOrder: string[] = [];

  return {
    appOn: vi.fn(),
    appQuit: vi.fn(),
    appSetPath: vi.fn((name: string, value: string) => {
      callOrder.push(`setPath:${name}:${value}`);
    }),
    appWhenReady: vi.fn(() => Promise.resolve()),
    bootstrapPersistence: vi.fn(() => {
      callOrder.push('bootstrap');
      return { close: vi.fn() };
    }),
    callOrder,
    createMainWindow: vi.fn(() => Promise.resolve()),
    handleAppReady: vi.fn(),
    showErrorBox: vi.fn(),
  };
});

vi.mock('electron', () => ({
  app: {
    on: mocks.appOn,
    quit: mocks.appQuit,
    setPath: mocks.appSetPath,
    whenReady: mocks.appWhenReady,
  },
  dialog: {
    showErrorBox: mocks.showErrorBox,
  },
}));

vi.mock('@main/app/bootstrap-persistence', () => ({
  bootstrapPersistence: mocks.bootstrapPersistence,
}));

vi.mock('@main/app/create-main-window', () => ({
  createMainWindow: mocks.createMainWindow,
}));

vi.mock('@main/app/handle-app-ready', () => ({
  handleAppReady: mocks.handleAppReady,
}));

const originalUserDataDirectory = process.env.APA_SCHOLAR_USER_DATA_DIR;

describe('main process startup', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.callOrder.length = 0;
    delete process.env.APA_SCHOLAR_USER_DATA_DIR;
    mocks.handleAppReady.mockImplementation(
      (dependencies: HandleAppReadyDependencies) => {
        dependencies.bootstrapPersistence();
        return Promise.resolve();
      },
    );
  });

  afterEach(() => {
    if (originalUserDataDirectory === undefined) {
      delete process.env.APA_SCHOLAR_USER_DATA_DIR;
    } else {
      process.env.APA_SCHOLAR_USER_DATA_DIR = originalUserDataDirectory;
    }
  });

  it('applies an absolute user-data override before persistence bootstrap', async () => {
    const userDataDirectory = path.resolve('/tmp/apa-scholar-main-test');
    process.env.APA_SCHOLAR_USER_DATA_DIR = userDataDirectory;

    await import('@main/index');
    await vi.waitFor(() => expect(mocks.handleAppReady).toHaveBeenCalledOnce());

    expect(mocks.callOrder).toEqual([
      `setPath:userData:${userDataDirectory}`,
      'bootstrap',
    ]);
  });

  it('keeps Electron default user-data behavior when the override is absent', async () => {
    await import('@main/index');
    await vi.waitFor(() => expect(mocks.handleAppReady).toHaveBeenCalledOnce());

    expect(mocks.appSetPath).not.toHaveBeenCalled();
    expect(mocks.callOrder).toEqual(['bootstrap']);
  });
});
