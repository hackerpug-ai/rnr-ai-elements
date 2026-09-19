import { defineConfig, devices } from '@playwright/test';

// Faithful copy of the landed FUSE-10 config shape (testDir in-repo, explicit
// testMatch, a project), minus webServer — preview is started by hand here.
export default defineConfig({
  testDir:
    '/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-01-docs-spike-skeleton/FUSE-09/tests/sprint-01-docs-spike-skeleton',
  testMatch: '**/*.spec.ts',
  projects: [{ name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } }],
});
