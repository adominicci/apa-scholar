const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test, expect, _electron: electron } = require('@playwright/test');

const rootDir = path.resolve(__dirname, '..', '..');

test('creates a course and paper inside the workspace shell', async () => {
  const fallbackUserDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'apa-scholar-e2e-fallback-'),
  );
  const isolatedUserDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'apa-scholar-e2e-'),
  );
  const courseName = `Research Methods ${Date.now()}`;
  const paperTitle = `Capstone Draft ${Date.now()}`;
  let app;

  try {
    app = await electron.launch({
      args: ['.', `--user-data-dir=${fallbackUserDataDir}`],
      cwd: rootDir,
      env: {
        ...process.env,
        APA_SCHOLAR_USER_DATA_DIR: isolatedUserDataDir,
      },
    });

    const activeUserDataDir = await app.evaluate(({ app: electronApp }) =>
      electronApp.getPath('userData'),
    );

    expect(fs.realpathSync(activeUserDataDir)).toBe(
      fs.realpathSync(isolatedUserDataDir),
    );

    const window = await app.firstWindow();

    await expect(
      window.getByRole('heading', { name: 'APA Scholar' }),
    ).toBeVisible();

    const createCourseButton = await window
      .getByRole('button', { name: 'New course' })
      .first();
    await createCourseButton.click();

    await window.getByLabel('Course name').pressSequentially(courseName);
    await window.getByLabel('Professor').pressSequentially('Dr. Rivera');
    await window.getByRole('button', { name: 'Create course' }).click();

    await expect(
      window.getByRole('heading', { name: courseName }),
    ).toBeVisible();

    await window.getByRole('button', { name: 'New paper' }).first().click();
    await window.getByLabel('Paper title').pressSequentially(paperTitle);
    await window.getByRole('button', { name: 'Create paper' }).click();

    await expect(
      window.getByRole('heading', { level: 2, name: paperTitle }),
    ).toBeVisible();
    await expect(window.getByText(paperTitle).first()).toBeVisible();
    await expect(
      window.getByRole('complementary', { name: 'Inspector panel' }),
    ).toContainText('Paper details');
    await expect
      .poll(() =>
        fs.existsSync(path.join(isolatedUserDataDir, 'apa-scholar.sqlite')),
      )
      .toBe(true);
  } finally {
    if (app) {
      await app.close();
    }
    fs.rmSync(isolatedUserDataDir, { force: true, recursive: true });
    fs.rmSync(fallbackUserDataDir, { force: true, recursive: true });
  }
});
