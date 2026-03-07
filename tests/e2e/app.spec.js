const path = require('node:path');
const { test, expect, _electron: electron } = require('@playwright/test');

const rootDir = path.resolve(__dirname, '..', '..');

test('creates a course and paper inside the workspace shell', async () => {
  const app = await electron.launch({
    args: ['.'],
    cwd: rootDir,
  });

  const courseName = `Research Methods ${Date.now()}`;
  const paperTitle = `Capstone Draft ${Date.now()}`;

  try {
    const window = await app.firstWindow();

    await expect(window.getByRole('heading', { name: 'APA Scholar' })).toBeVisible();

    const createCourseButton = await window
      .getByRole('button', { name: 'New course' })
      .first();
    await createCourseButton.click();

    await window.getByLabel('Course name').fill(courseName);
    await window.getByLabel('Professor').fill('Dr. Rivera');
    await window.getByRole('button', { name: 'Create course' }).click();

    await expect(window.getByRole('heading', { name: courseName })).toBeVisible();

    await window.getByRole('button', { name: 'New paper' }).first().click();
    await window.getByLabel('Paper title').fill(paperTitle);
    await window.getByRole('button', { name: 'Create paper' }).click();

    await expect(window.getByRole('heading', { name: paperTitle })).toBeVisible();
    await expect(window.getByText('Title page scaffold')).toBeVisible();
    await expect(window.getByText('References scaffold')).toBeVisible();
    await expect(
      window.getByRole('complementary', { name: 'Inspector panel' }),
    ).toContainText('Paper details');
  } finally {
    await app.close();
  }
});
