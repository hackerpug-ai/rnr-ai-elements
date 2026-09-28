import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import rootConfig from '../../playwright.config';
import publicationConfig from './publication.playwright.config';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PUBLIC_ORIGIN = 'https://rnraielements.com';

const LOCKED_FLOWS: Record<string, { owner: string; runCmd: string }> = {
  'FLOW-DOCS-01-getting-started-engine-decision': {
    owner: 'ORI-CONT-004',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision',
  },
  'FLOW-DOCS-01-theming-and-section-nav': {
    owner: 'ORI-CONT-004',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts --grep FLOW-DOCS-01-theming-and-section-nav',
  },
  'FLOW-DOCS-02-quickstart-chat-screen': {
    owner: 'ORI-CONT-004',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop',
  },
  'FLOW-SHELL-01-theme-toggle-persisted-flash-free': {
    owner: 'ORI-AST-003',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free',
  },
  'FLOW-SHELL-02-first-visit-prefers-dark-no-flash': {
    owner: 'ORI-AST-003',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash',
  },
  'FLOW-SHELL-07-cmdk-open-search-navigate': {
    owner: 'ORI-AST-010',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate',
  },
  'FLOW-SHELL-08-pagefind-lazy-load-on-first-open': {
    owner: 'ORI-AST-010',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts --grep FLOW-SHELL-08-pagefind-lazy-load-on-first-open',
  },
  'FLOW-SHELL-13-engine-tab-persists-across-pages': {
    owner: 'ORI-AST-010',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages',
  },
  'FLOW-SHELL-14-tab-panels-in-initial-html': {
    owner: 'ORI-AST-010',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html',
  },
  'FLOW-SHELL-15-search-contract-before-recovery': {
    owner: 'ORI-AST-004',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery',
  },
  'FLOW-GEND-07-registry-ledger-controls': {
    owner: 'ORI-AST-007',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls',
  },
  'FLOW-SHELL-16-not-found-search-recovery': {
    owner: 'ORI-AST-009',
    runCmd:
      'pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery',
  },
  'FLOW-DOCS-02-live-example-api-stream-history-abort': {
    owner: 'ORI-AI-001',
    runCmd:
      'pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort',
  },
};

function discover(args: string[]): { status: number | null; output: string } {
  const result = spawnSync(
    join(repoRoot, 'node_modules/.bin/playwright'),
    ['test', '--list', ...args],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: process.env,
    },
  );
  return {
    status: result.status,
    output: `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
  };
}

function listedTitles(output: string): string[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('›'));
}

it('publication lane owns the public apex and the local lane does not collect it', () => {
  expect(rootConfig.testDir).toBe('tests');
  expect(rootConfig.testMatch).toBe('**/*.spec.ts');
  expect(rootConfig.testIgnore).toBe('**/*.remote.spec.ts');
  expect(JSON.stringify(rootConfig)).not.toContain(PUBLIC_ORIGIN);

  expect(publicationConfig.testMatch).toBe('public-recovery.remote.spec.ts');
  expect(publicationConfig.testMatch).not.toBe('**/*.remote.spec.ts');
  const webServer = Array.isArray(publicationConfig.webServer)
    ? publicationConfig.webServer[0]
    : publicationConfig.webServer;
  expect(webServer).toBeUndefined();
  const use = publicationConfig.use ?? {};
  expect(use.baseURL).toBe(PUBLIC_ORIGIN);
  expect((publicationConfig.projects ?? []).map((project) => project.name).sort()).toEqual([
    'chromium-desktop',
    'chromium-mobile',
    'chromium-nojs',
  ]);

  const localRecovery = discover([
    '--config',
    'playwright.config.ts',
    'tests/sprint-05-orient-search/recovery-presentation.spec.ts',
  ]);
  expect(localRecovery.status, localRecovery.output).toBe(0);
  expect(localRecovery.output).not.toContain('ORI-VIS-005-ac-5');
  expect(localRecovery.output).toContain('ORI-VIS-005-ac-1');
  expect(localRecovery.output).not.toContain('.remote.spec.ts');

  const ignored = discover([
    '--config',
    'playwright.config.ts',
    'tests/sprint-05-orient-search/public-recovery.remote.spec.ts',
  ]);
  expect(ignored.output).not.toContain('ORI-VIS-005-ac-5');
  expect(ignored.status === 0 || ignored.status === 1).toBe(true);

  const publication = discover([
    '--config',
    'tests/sprint-05-orient-search/publication.playwright.config.ts',
  ]);
  expect(publication.status, publication.output).toBe(0);
  const titles = listedTitles(publication.output);
  expect(titles).toHaveLength(3);
  expect(titles.every((title) => title.includes('ORI-VIS-005-ac-5'))).toBe(true);
  expect(titles.some((title) => title.startsWith('[chromium-desktop]'))).toBe(true);
  expect(titles.some((title) => title.startsWith('[chromium-mobile]'))).toBe(true);
  expect(titles.some((title) => title.startsWith('[chromium-nojs]'))).toBe(true);
  const remoteSpec = readFileSync(
    join(repoRoot, 'tests/sprint-05-orient-search/public-recovery.remote.spec.ts'),
    'utf8',
  );
  expect(remoteSpec).toContain(`const PUBLIC_ORIGIN = '${PUBLIC_ORIGIN}'`);
  expect(remoteSpec).toContain('page.goto(url');
  expect(remoteSpec).not.toContain('test.skip');

  for (const relative of [
    'tests/sprint-05-orient-search/nativewind-live-example.test.ts',
    'tests/sprint-05-orient-search/live-example-api.test.ts',
    'tests/sprint-05-orient-search/support/nativewind-live-example.ts',
  ]) {
    expect(existsSync(join(repoRoot, relative)), relative).toBe(true);
    expect(relative.endsWith('.remote.spec.ts')).toBe(false);
  }

  const flows = JSON.parse(
    readFileSync(
      join(repoRoot, '.spec/prds/docs-site/tasks/sprint-05-orient-search/human-flows.json'),
      'utf8',
    ),
  ) as { flows: { id: string; run_cmd: string; primary_owner: string }[] };
  expect(flows.flows.map((flow) => flow.id).sort()).toEqual(Object.keys(LOCKED_FLOWS).sort());
  for (const flow of flows.flows) {
    const locked = LOCKED_FLOWS[flow.id];
    expect(locked, flow.id).toBeDefined();
    expect(flow.run_cmd).toBe(locked?.runCmd);
    expect(flow.primary_owner).toBe(locked?.owner);
  }
});
