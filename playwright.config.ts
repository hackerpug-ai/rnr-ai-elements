import { defineConfig, devices } from '@playwright/test';
import { PREVIEW_URL, strictPreviewCommand } from './tests/harness/docs-preview';

// FUSE-10 turnkey docs runner (TR-11): Playwright over `astro preview` serving the
// BUILT dist — never `astro dev`. Invoked by `pnpm e2e:docs`, which runs the ordered
// build chain before handing off to this config.
export default defineConfig({
  // The ONE turnkey runner owns every lane under tests/ (SHELL-011 widened it
  // from the sprint-01 directory); lanes serialize under workers:1 below.
  testDir: 'tests',
  // *.spec.ts only: the sibling vitest files (*.test.ts) belong to vitest's
  // `tests/**/*.test.ts` include and must never be double-run by this lane.
  testMatch: '**/*.spec.ts',
  // Flake policy: run once; failures are real. Never --retries on the CLI either.
  retries: 0,
  // Serialize the lane (FIX-FUSE-06-1): deliv-03's contracted destructive cases rmSync
  // apps/docs/src/data + public/r mid-run and regenerate them; parallel workers import
  // those artifacts at module scope and ENOENT against the removal window (FUSE-06
  // cycle-1: 2 failed / 8 did-not-run). One worker makes the lane deterministic; the
  // wall-time cost is seconds-scale.
  workers: 1,
  reporter: [
    ['junit', { outputFile: 'apps/docs/playwright-report/junit.xml' }],
    ['html', { outputFolder: 'apps/docs/playwright-report/html', open: 'never' }],
  ],
  // Relative gotos in lane specs resolve against the preview origin (the L6
  // origin guard in the harness's navigateLocalhost still applies to every
  // harness-mediated navigation).
  use: { baseURL: PREVIEW_URL },
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
