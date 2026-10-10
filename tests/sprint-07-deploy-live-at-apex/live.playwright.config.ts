import { defineConfig } from '@playwright/test';

/**
 * Sprint 07 live-origin lane. Browserless, apex-only, no local webServer.
 * Collected only via -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts.
 * The root playwright.config.ts keeps testIgnore for remote specs.
 */
const PUBLIC_ORIGIN = 'https://rnraielements.com';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.remote.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 3_600_000,
  use: { baseURL: PUBLIC_ORIGIN },
  projects: [{ name: 'live-edge' }],
});
