import { expect, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

// TC-1/TC-2 canary: the turnkey runner serves the BUILT dist through astro preview
// and the site answers on the preview origin with real HTML.
test('FUSE-10-runner-turnkey', async ({ page }) => {
  const response = await navigateLocalhost(page, '/');
  expect(response?.status(), 'GET http://localhost:4321/ must return 200').toBe(200);
  const title = await page.title();
  expect(title.trim(), 'the served page must have a non-empty HTML title').not.toBe('');
});
