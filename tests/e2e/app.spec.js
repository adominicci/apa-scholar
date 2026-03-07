const path = require('node:path');
const { test, expect, _electron: electron } = require('@playwright/test');

const rootDir = path.resolve(__dirname, '..', '..');

test('renders the project foundation shell in Electron', async () => {
  const app = await electron.launch({
    args: ['.'],
    cwd: rootDir,
  });

  try {
    const window = await app.firstWindow();

    await expect(
      window.getByRole('heading', { name: 'APA Scholar' }),
    ).toBeVisible();
    await expect(window.getByText('Secure desktop bridge ready')).toBeVisible();
    await expect(window.getByText('Project foundation shell')).toBeVisible();
  } finally {
    await app.close();
  }
});
