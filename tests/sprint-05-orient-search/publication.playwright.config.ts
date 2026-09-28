import { defineConfig, devices } from '@playwright/test';

/**
 * Postpublication lane for the public apex. It selects one spec, the three
 * browser projects, and the literal public origin. It does not start a
 * localhost preview and it does not collect version-URL checks.
 */
const PUBLIC_ORIGIN = 'https://rnraielements.com';

export default defineConfig({
  testDir: '.',
  testMatch: 'public-recovery.remote.spec.ts',
  retries: 0,
  workers: 1,
  use: { baseURL: PUBLIC_ORIGIN },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 5'] } },
    { name: 'chromium-nojs', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false } },
  ],
});
