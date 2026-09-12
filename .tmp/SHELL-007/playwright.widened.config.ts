import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import { PREVIEW_URL, strictPreviewCommand } from '../../tests/harness/docs-preview';

/**
 * SHELL-007 widened-lane runner (evidence infra, not production wiring): the
 * root playwright.config.ts testDir is still pinned to sprint-01 and is
 * outside this task's writeAllowed — SHELL-011 owns the real widening. This
 * config mirrors the root config exactly (testMatch, serialized workers, the
 * three chromium projects, the strict-port preview webServer over the real
 * built dist) except testDir points at tests/sprint-02-shell-hero, so
 * home-hero.spec.ts can be proven against the real build now.
 *
 * Run: pnpm exec playwright test --config .tmp/SHELL-007/playwright.widened.config.ts --grep FLOW-GEND
 */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  testDir: join(repoRoot, 'tests/sprint-02-shell-hero'),
  // *.spec.ts only: the sibling vitest files (*.test.ts) belong to vitest's
  // `tests/**/*.test.ts` include and must never be double-run by this lane.
  testMatch: '**/*.spec.ts',
  // Flake policy: run once; failures are real.
  retries: 0,
  // Serialize the lane: same rationale as the root config (deliv-03's
  // destructive cases regenerate src/data mid-run).
  workers: 1,
  reporter: [
    ['junit', { outputFile: join(repoRoot, '.tmp/SHELL-007/report/junit.xml') }],
    ['html', { outputFolder: join(repoRoot, '.tmp/SHELL-007/report/html'), open: 'never' }],
  ],
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 5'] } },
    { name: 'chromium-nojs', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false } },
  ],
  webServer: {
    command: strictPreviewCommand(),
    url: PREVIEW_URL,
    cwd: repoRoot,
    reuseExistingServer: !process.env.CI,
  },
});
