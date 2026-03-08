import { describe, expect, it } from 'vitest';
import { buildMainWindowOptions } from '@main/app/window-options';

describe('buildMainWindowOptions', () => {
  it('enforces secure BrowserWindow defaults for the renderer boundary', () => {
    const options = buildMainWindowOptions('/tmp/preload.js');

    expect(options.width).toBe(1440);
    expect(options.height).toBe(960);
    expect(options.minWidth).toBe(1100);
    expect(options.minHeight).toBe(720);
    expect(options.show).toBe(false);
    expect(options.backgroundColor).toBe('#f3efe5');
    expect(options.titleBarStyle).toBe('hiddenInset');
    expect(options.webPreferences?.preload).toBe('/tmp/preload.js');
    expect(options.webPreferences?.contextIsolation).toBe(true);
    expect(options.webPreferences?.nodeIntegration).toBe(false);
    expect(options.webPreferences?.sandbox).toBe(true);
    expect(options.webPreferences?.webSecurity).toBe(true);
    expect(options.webPreferences?.webviewTag).toBe(false);
    expect(options.webPreferences?.spellcheck).toBe(false);
  });
});
