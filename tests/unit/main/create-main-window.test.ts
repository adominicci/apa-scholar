import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const resolvePreloadEntryPath = vi.fn(() => '/tmp/preload.js');

class MockBrowserWindow extends EventEmitter {
  static instances: MockBrowserWindow[] = [];

  readonly maximize = vi.fn(() => {
    this.callOrder.push('maximize');
  });

  readonly show = vi.fn(() => {
    this.callOrder.push('show');
  });

  readonly loadURL = vi.fn(async () => {});
  readonly loadFile = vi.fn(async () => {});
  readonly webContents = {
    openDevTools: vi.fn(),
  };

  readonly callOrder: string[] = [];

  constructor(options: unknown) {
    super();
    void options;
    MockBrowserWindow.instances.push(this);
  }
}

vi.mock('electron', () => ({
  BrowserWindow: MockBrowserWindow,
}));

vi.mock('@main/app/preload-entry-path', () => ({
  resolvePreloadEntryPath,
}));

describe('createMainWindow', () => {
  beforeEach(() => {
    MockBrowserWindow.instances = [];
    resolvePreloadEntryPath.mockClear();
    vi.resetModules();
  });

  it('maximizes the window before showing it when the app is ready', async () => {
    const { createMainWindow } = await import('@main/app/create-main-window');

    await createMainWindow();

    const mainWindow = MockBrowserWindow.instances[0];

    if (!mainWindow) {
      throw new Error('Expected a BrowserWindow instance to be created.');
    }

    expect(mainWindow.maximize).not.toHaveBeenCalled();
    expect(mainWindow.show).not.toHaveBeenCalled();

    mainWindow.emit('ready-to-show');

    expect(mainWindow.maximize).toHaveBeenCalledTimes(1);
    expect(mainWindow.show).toHaveBeenCalledTimes(1);
    expect(mainWindow.callOrder).toEqual(['maximize', 'show']);
  });
});
