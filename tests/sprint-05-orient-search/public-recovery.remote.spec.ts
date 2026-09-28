import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TestInfo } from '@playwright/test';
import { expect, test } from '@playwright/test';

/**
 * ORI-VIS-005-ac-5 — public-origin presentation handoff.
 *
 * This is the publication lane. It navigates to the literal
 * https://rnraielements.com origin. A stale or empty public 404 is a failed
 * prerequisite. Localhost is not a substitute, and the test is not skipped.
 */

const RECOVERY_TRIGGER = '[data-recovery-search]';
const OPEN_SEARCH_DIALOG = 'dialog[aria-modal="true"][open]';
const SEARCH_INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const MANUSCRIPT_PATH = 'apps/docs/src/content/system/not-found.md';
const PUBLIC_ORIGIN = 'https://rnraielements.com';
const SPEC_PATH = 'tests/sprint-05-orient-search/public-recovery.remote.spec.ts';

const REPO_ROOT = process.cwd();
const EVIDENCE_RECOVERY = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/recovery');
const PHASE_ROOT = join(
  REPO_ROOT,
  `.tmp/ORI-VIS-005/cycle-1/${process.env.ORI_VIS_PHASE ?? 'green'}`,
);
const RUN_ID = `ori-vis-005-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

function sha256Text(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function sha256File(relative: string): string {
  try {
    return sha256Text(readFileSync(join(REPO_ROOT, relative), 'utf8'));
  } catch {
    return 'absent';
  }
}

function runIdentity(): Record<string, unknown> {
  return {
    runId: RUN_ID,
    capturedAt: new Date().toISOString(),
    gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT }).toString().trim(),
    sourceHashes: {
      page404: sha256File('apps/docs/src/pages/404.astro'),
      systemManuscript: sha256File(MANUSCRIPT_PATH),
      docsLayout: sha256File('apps/docs/src/layouts/DocsLayout.astro'),
      searchDialogIsland: sha256File('apps/docs/src/components/islands/SearchDialog.astro'),
      searchDialogScript: sha256File('apps/docs/src/scripts/search-dialog.ts'),
      spec: sha256File(SPEC_PATH),
      lockfile: sha256File('pnpm-lock.yaml'),
      dist404: sha256File('apps/docs/dist/404.html'),
      pagefindEntry: sha256File('apps/docs/dist/pagefind/pagefind-entry.json'),
      surfacePolicy: sha256File('.spec/e2e-policy/surface.json'),
      coldbootPolicy: sha256File('.spec/e2e-policy/coldboot.json'),
    },
  };
}

function capture(testInfo: TestInfo, name: string, observed: Record<string, unknown>): void {
  const dir = join(PHASE_ROOT, 'captures');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${name}.json`),
    JSON.stringify(
      {
        runId: RUN_ID,
        project: testInfo.project.name,
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

function evidencePath(name: string): string {
  mkdirSync(EVIDENCE_RECOVERY, { recursive: true });
  return join(EVIDENCE_RECOVERY, name);
}

function mergeManifest(fields: Record<string, unknown>): void {
  const path = evidencePath('manifest.json');
  let record: Record<string, unknown> = {};
  try {
    record = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch {
    record = {};
  }
  writeFileSync(path, JSON.stringify({ ...record, ...fields }, null, 2));
}

function manuscriptParts(): { title: string; explanation: string; hint: string } {
  const raw = readFileSync(join(REPO_ROOT, MANUSCRIPT_PATH), 'utf8');
  const blocks = raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
  if (blocks.length < 3 || !blocks[0].startsWith('# ')) {
    throw new Error(`${MANUSCRIPT_PATH} must carry a # title plus explanation and hint blocks`);
  }
  return { title: blocks[0].replace(/^#\s+/, ''), explanation: blocks[1], hint: blocks[2] };
}

function isNoJs(testInfo: TestInfo): boolean {
  return testInfo.project.name === 'chromium-nojs';
}

// fallow-ignore-next-line complexity
test('ORI-VIS-005-ac-5: public-origin presentation handoff', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const parts = manuscriptParts();
  const url = `${PUBLIC_ORIGIN}/ori-vis-005-missing-${RUN_ID}`;
  const project = testInfo.project.name;

  const response = await page.goto(url, { timeout: 30_000 });
  const status = response?.status();
  const security = await response?.securityDetails();
  const html = (await response?.text()) ?? '';
  const componentsStatus = await page.request.get(`${PUBLIC_ORIGIN}/components`);
  const registryStatus = await page.request.get(`${PUBLIC_ORIGIN}/registry`);

  if (project === 'chromium-desktop') {
    await page.screenshot({ path: evidencePath('public-unknown-path.png'), fullPage: true });
    mergeManifest({
      publicUnknownPath: {
        file: 'public-unknown-path.png',
        project,
        runId: RUN_ID,
        url,
        servedStatus: status ?? null,
        servedHtmlSha256: sha256Text(html),
        tlsProtocol: security?.protocol ?? null,
        localCandidateDist404: sha256File('apps/docs/dist/404.html'),
      },
    });
  }
  capture(testInfo, 'ac5-public-probe', {
    url,
    servedStatus: status ?? null,
    servedHtmlSha256: sha256Text(html),
    servedHtmlBytes: html.length,
    tls: security ? { protocol: security.protocol, issuer: security.issuer } : null,
    publicComponentsStatus: componentsStatus.status(),
    publicRegistryStatus: registryStatus.status(),
    localDist404: sha256File('apps/docs/dist/404.html'),
    ...runIdentity(),
  });

  const branded =
    status === 404 &&
    html.includes(parts.title) &&
    html.includes(parts.explanation) &&
    html.includes('href="/components"');
  if (!branded) {
    throw new Error(
      `PUBLIC PREREQUISITE unmet for ${url}: observed status=${status ?? 'none'}, ` +
        `bodyBytes=${html.length}, title=${html.includes(parts.title) ? 'present' : 'absent'}. ` +
        'The deployment owner must publish the reviewed candidate at the public origin ' +
        '(ORI-DEP-003) before this AC can pass; the capture above records the ' +
        'currently published reality.',
    );
  }

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(parts.title);
  await expect(page.locator('main a[href="/components"]')).toBeVisible();
  await expect(page.locator('main a[href="/registry"]')).toBeVisible();
  expect(componentsStatus.status(), 'public /components must be HTTP 200').toBe(200);
  expect(registryStatus.status(), 'public /registry must be HTTP 200').toBe(200);
  if (!isNoJs(testInfo)) {
    await expect(page.locator(RECOVERY_TRIGGER)).toBeVisible();
    await page.locator(RECOVERY_TRIGGER).click();
    await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
    await expect(page.locator(SEARCH_INPUT)).toBeFocused();
    await page.keyboard.press('Escape');
  } else {
    await expect(page.locator(RECOVERY_TRIGGER), 'no dead public search control').toBeHidden();
  }
});
