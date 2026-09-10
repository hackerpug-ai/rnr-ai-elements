import { defineConfig, devices } from '@playwright/test';
import { PREVIEW_URL, strictPreviewCommand } from './tests/harness/docs-preview';

// FUSE-10 turnkey docs runner (TR-11): Playwright over `astro preview` serving the
// BUILT dist — never `astro dev`. Invoked by `pnpm e2e:docs`, which runs the ordered
// build chain before handing off to this config.
export default defineConfig({
  testDir: 'tests/sprint-01-docs-spike-skeleton',
  // *.spec.ts only: the sibling vitest files (*.test.ts) belong to vitest's
  // `tests/**/*.test.ts` include and must never be double-run by this lane.
  testMatch: '**/*.spec.ts',
  // Flake policy: run once; failures are real. Never --retries on the CLI either.
  retries: 0,
  reporter: [
    ['junit', { outputFile: 'apps/docs/playwright-report/junit.xml' }],
    ['html', { outputFolder: 'apps/docs/playwright-report/html', open: 'never' }],
  ],
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 5'] } },
    { name: 'chromium-nojs', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false } },
  ],
  webServer: {
    command: strictPreviewCommand(),
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
  },
});
