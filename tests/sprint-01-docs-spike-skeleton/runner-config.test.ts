import { expect, it } from 'vitest';
import config from '../../playwright.config';

// UNIT_TEST_JUSTIFIED: pure config-object assertions — importing the config and
// checking fields involves no runtime service.
it('FUSE-10-config-contract', () => {
  // The Playwright lane is this sprint's directory and the *.spec.ts extension only —
  // the sibling vitest files (*.test.ts) belong to vitest's `tests/**/*.test.ts` include.
  expect(config.testDir).toBe('tests/sprint-01-docs-spike-skeleton');
  expect(config.testMatch).toBe('**/*.spec.ts');

  // Flake policy: run once, failures are real.
  expect(config.retries).toBe(0);

  // FIX-FUSE-06-1: the lane is serialized — deliv-03's destructive cases rmSync the
  // generated data artifacts mid-run, so any parallel worker ENOENTs them at import.
  expect(config.workers).toBe(1);

  // TR-11: Playwright over astro preview serving built dist — never astro dev.
  // The config type allows a webServer array; this config authors a single object.
  const webServer = Array.isArray(config.webServer) ? config.webServer[0] : config.webServer;
  expect(webServer, 'a webServer is required').toBeDefined();
  expect(webServer?.command).toContain('astro preview');
  expect(webServer?.command, 'astro dev is forbidden in the e2e harness').not.toContain(
    'astro dev',
  );
  expect(webServer?.command).toContain('--port 4321');
  // Strict port: astro preview hops to the next free port when 4321 is taken, so the
  // command must refuse to start instead of letting Playwright test a stale server.
  expect(webServer?.command).toContain('process.exit(1)');
  expect(webServer?.url).toBe('http://localhost:4321');
  expect(webServer?.reuseExistingServer).toBe(!process.env.CI);

  // Chromium only: desktop + mobile viewports plus the zero-JS fallback project.
  const projects = config.projects ?? [];
  expect(projects.map((project) => project.name).sort()).toEqual([
    'chromium-desktop',
    'chromium-mobile',
    'chromium-nojs',
  ]);
  const use = (name: string) => projects.find((project) => project.name === name)?.use ?? {};
  const desktop = use('chromium-desktop').viewport;
  const mobile = use('chromium-mobile').viewport;
  expect(desktop?.width).toBeGreaterThanOrEqual(1000);
  expect(mobile?.width).toBeLessThanOrEqual(500);
  expect(mobile?.width, 'the mobile project must be narrower than desktop').toBeLessThan(
    desktop?.width ?? 0,
  );
  expect(use('chromium-nojs').javaScriptEnabled, 'zero-JS fallback project').toBe(false);
  expect(use('chromium-desktop').javaScriptEnabled).not.toBe(false);
  expect(use('chromium-mobile').javaScriptEnabled).not.toBe(false);
});
