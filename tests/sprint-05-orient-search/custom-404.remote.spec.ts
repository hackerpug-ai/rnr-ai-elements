import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIResponse, Page, TestInfo } from '@playwright/test';
import { expect, test } from '@playwright/test';
import cfConfig, {
  RECEIPT_PATH,
  REPO_ROOT,
  resolveOriginBinding,
} from './cloudflare.playwright.config';

/**
 * ORI-DEP-002 — real Cloudflare version and 404-recovery verification.
 *
 * Every assertion runs against the receipt-bound remote origin from
 * cloudflare.playwright.config.ts — never localhost, never a substituted
 * host, never disabled certificate validation. Uploads do not live here:
 * reruns are read-only toward the deployed surface (charter boundary: keep
 * uploads outside tests).
 *
 * Fail-closed posture: when a receipt binding the accepted candidate does not
 * exist yet, the tests record the real observed state into public-http.json
 * and the screenshots, then throw a PREREQUISITE error naming the exact
 * missing input — the same honest pattern as public-recovery.remote.spec.ts.
 * Nothing is skipped and no canned response substitutes for the real origin.
 */

const EVIDENCE_DIR = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-DEP-002');
const APEX_ORIGIN = 'https://rnraielements.com';
const MISSING_PATH = '/__sprint05_missing__';
const MISSING_DEEP_PATH = '/docs/__sprint05_missing__/nested';
const MANUSCRIPT_PATH = 'apps/docs/src/content/system/not-found.md';
const SEARCH_QUERY = 'conversation';
const SEARCH_RESULT_HREF = '/components/conversation';

const RUN_ID = `ori-dep-002-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

interface RunReceipt {
  verified_surface: {
    version_id?: string;
    origin?: string;
    deployment_id?: string;
    release_sha?: string;
    dist_404_html_sha256?: string | null;
  };
  eligible_origins?: string[];
  upload?: { status?: string; candidate_version_id?: string | null };
  apex_baseline?: {
    active_deployment_id?: string;
    deployments?: DeploymentRecord[];
  };
  registry_prerequisite?: {
    urls?: Record<string, string>;
  };
  prerequisites?: Record<string, { status?: string; accepted_artifact_receipt?: string | null }>;
}

interface DeploymentRecord {
  id: string;
  created_on: string;
  versions: { version_id: string; percentage: number }[];
}

interface HttpObservation {
  url: string;
  status: number;
  contentType: string | null;
  contentLengthHeader: string | null;
  locationHeader: string | null;
  bodySha256: string;
  bodyBytes: number;
}

type GetLike = {
  get(url: string, options?: { maxRedirects?: number }): Promise<APIResponse>;
};

function sha256Buffer(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

function receipt(): RunReceipt {
  return JSON.parse(readFileSync(join(REPO_ROOT, RECEIPT_PATH), 'utf8')) as RunReceipt;
}

function recordObservation(key: string, observed: Record<string, unknown>): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const path = join(EVIDENCE_DIR, 'public-http.json');
  let record: Record<string, unknown> = {};
  try {
    record = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch {
    record = {};
  }
  record[key] = { runId: RUN_ID, recordedAt: new Date().toISOString(), ...observed };
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
}

function manuscriptTitle(): string {
  const raw = readFileSync(join(REPO_ROOT, MANUSCRIPT_PATH), 'utf8');
  const first = raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)[0];
  if (!first?.startsWith('# ')) {
    throw new Error(`${MANUSCRIPT_PATH} must start with a # title block`);
  }
  return first.replace(/^#\s+/, '');
}

function projectShotName(testInfo: TestInfo): string {
  return testInfo.project.name === 'chromium-desktop' ? '404-desktop.png' : '404-mobile.png';
}

function prerequisite(missing: string): never {
  throw new Error(
    `ORI-DEP-002 PREREQUISITE unmet: ${missing} The observations above record the currently ` +
      'deployed reality. The authorized candidate-version upload runs only after ORI-CI-004 ' +
      'acceptance exists (accepted-artifact.json); until then the branded 404 cannot be on any ' +
      'deployed surface.',
  );
}

async function directGet(request: GetLike, origin: string, path: string): Promise<HttpObservation> {
  const response = await request.get(`${origin}${path}`, { maxRedirects: 0 });
  const headers = response.headers();
  const body = await response.body();
  return {
    url: `${origin}${path}`,
    status: response.status(),
    contentType: headers['content-type'] ?? null,
    contentLengthHeader: headers['content-length'] ?? null,
    locationHeader: headers['location'] ?? null,
    bodySha256: sha256Buffer(body),
    bodyBytes: body.length,
  };
}

function assertNoRedirect(observation: HttpObservation, label: string): void {
  expect(observation.status, `${label} must be HTTP 404`).toBe(404);
  expect(
    observation.locationHeader,
    `${label} must not carry a Location header (no redirects)`,
  ).toBeNull();
  const status = observation.status;
  expect(status >= 300 && status < 400, `${label} must not be a 3xx response`).toBe(false);
}

/** The config-entrypoint shape every project must present at load time. */
function assertRemoteLaneShape(origin: string | undefined): void {
  expect(cfConfig.retries, 'remote lane runs each test once').toBe(0);
  expect(cfConfig.webServer, 'remote lane must not define a local webServer').toBeUndefined();
  expect(String(cfConfig.testMatch)).toMatch(/remote\.spec\.ts$/);
  expect(String(cfConfig.testMatch)).not.toContain('.test.ts');
  for (const project of cfConfig.projects ?? []) {
    // defineConfig merges the top-level `use` into each project at runtime;
    // the effective value is the project override over the top-level base.
    const effectiveUse = { ...(cfConfig.use ?? {}), ...(project.use ?? {}) };
    expect(effectiveUse.ignoreHTTPSErrors, 'certificate validation stays strict').toBe(false);
    expect(effectiveUse.baseURL, 'every project binds the receipt origin').toBe(origin);
  }
}

/**
 * Origin guard (AC-1 case 2): exercise the real entrypoint with untrusted
 * inputs and record that each is rejected before any network activity.
 */
function originGuardObservations(run: RunReceipt, project: string): void {
  const rejections: Record<string, string | null> = {};
  const rejectionCases = {
    missingReceipt: { receipt: null },
    localhostOverride: { receipt: run, override: 'http://localhost:4321' },
    exampleComOverride: { receipt: run, override: 'https://example.com' },
  } as const;
  for (const [label, input] of Object.entries(rejectionCases)) {
    try {
      resolveOriginBinding(input);
      rejections[label] = null;
    } catch (error) {
      rejections[label] = (error as Error).message;
    }
  }
  for (const [label, message] of Object.entries(rejections)) {
    expect(
      message,
      `configuration entrypoint must reject the ${label} case before network activity`,
    ).toBeTruthy();
  }
  const binding = resolveOriginBinding({ receipt: run });
  const origin = run.verified_surface?.origin;
  expect(new Set(binding.eligible)).toEqual(new Set([origin, APEX_ORIGIN]));
  recordObservation('ac1OriginGuard', {
    project,
    rejections,
    eligible: binding.eligible,
    selected: binding.selected,
  });
}

/** The observed state of the ORI-CI-004 acceptance binding, for honest messages. */
function ci004BindingText(run: RunReceipt): string {
  const ci004 = run.prerequisites?.['ORI-CI-004'];
  const status = ci004?.status ?? 'unknown';
  const receipt = ci004?.accepted_artifact_receipt ?? 'null';
  const dist404 = run.verified_surface.dist_404_html_sha256 ?? 'null';
  return (
    `ORI-CI-004's accepted-artifact.json does not exist (prerecorded status: ${status}; ` +
    `accepted_artifact_receipt: ${receipt}; dist_404_html_sha256: ${dist404}). `
  );
}

/** Fail closed unless the run binds ORI-CI-004's accepted artifact. */
function assertAcceptedArtifactBound(run: RunReceipt): void {
  const accepted = run.prerequisites?.['ORI-CI-004']?.accepted_artifact_receipt;
  const dist404 = run.verified_surface.dist_404_html_sha256;
  if (accepted && dist404) return;
  prerequisite(ci004BindingText(run));
}

function mediaTypeOf(observation: HttpObservation): string {
  return String(observation.contentType ?? '')
    .split(';')[0]
    .trim();
}

/** Visit both missing paths; capture the project screenshot at the root path. */
async function visitMissingPathsAndCapture(
  page: Page,
  origin: string,
  title: string,
  testInfo: TestInfo,
): Promise<{
  visits: Record<string, unknown>[];
  stylesheetResponses: { url: string; status: number }[];
}> {
  const stylesheetResponses: { url: string; status: number }[] = [];
  page.on('response', (response) => {
    if (response.request().resourceType() === 'stylesheet') {
      stylesheetResponses.push({ url: response.url(), status: response.status() });
    }
  });

  const visits: Record<string, unknown>[] = [];
  for (const path of [MISSING_PATH, MISSING_DEEP_PATH]) {
    const response = await page.goto(`${origin}${path}`, { timeout: 30_000 });
    const html = (await response?.text()) ?? '';
    visits.push({
      path,
      status: response?.status() ?? null,
      bodyBytes: html.length,
      hasTitle: html.includes(title),
      hasComponentsLink: html.includes('href="/components"'),
      hasRegistryLink: html.includes('href="/registry"'),
    });
    if (path === MISSING_PATH) {
      // Capture before navigating away (charter AC-3): the screenshot records
      // the rendered reality of this project, whatever it is.
      mkdirSync(EVIDENCE_DIR, { recursive: true });
      await page.screenshot({
        path: join(EVIDENCE_DIR, projectShotName(testInfo)),
        fullPage: true,
      });
    }
  }
  return { visits, stylesheetResponses };
}

/** Applied computed styles through the real rendered document. */
function appliedStyles(page: Page): Promise<Record<string, string | null>> {
  return page.evaluate(() => {
    // No-DOM-lib tsconfig: structural casts like not-found-search-recovery.spec.ts.
    const doc = (
      globalThis as unknown as {
        document: { querySelector(selectors: string): unknown; body: unknown };
      }
    ).document;
    type StyleLike = { display: string; color: string; fontSize: string; fontFamily: string };
    const gcs = (el: unknown): StyleLike | null =>
      el
        ? (globalThis as unknown as { getComputedStyle(el: unknown): StyleLike }).getComputedStyle(
            el,
          )
        : null;
    const mainStyle = gcs(doc.querySelector('main'));
    const headingStyle = gcs(doc.querySelector('h1'));
    return {
      mainDisplay: mainStyle?.display ?? null,
      headingColor: headingStyle?.color ?? null,
      headingFontSize: headingStyle?.fontSize ?? null,
      bodyFontFamily: gcs(doc.body)?.fontFamily ?? null,
    };
  });
}

/** The recovery page's two ordinary links, returning to the missing page. */
async function linkRecovery(page: Page, origin: string): Promise<void> {
  for (const [href, heading] of [
    ['/components', 'Components'],
    ['/registry', 'Registry'],
  ] as const) {
    await page.locator(`main a[href="${href}"]`).click();
    await page.waitForURL(`${origin}${href}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading, {
      timeout: 15_000,
    });
    await page.goBack();
    await page.waitForURL(`${origin}${MISSING_PATH}`);
  }
}

/**
 * Shared-search recovery through the ORI-AST-004 seam: desktop keyboard
 * command, mobile visible trigger, real Pagefind result activation.
 */
async function searchRecovery(page: Page, origin: string, isDesktop: boolean): Promise<void> {
  if (isDesktop) {
    await page.keyboard.press('Control+K');
  } else {
    await page.locator('[data-recovery-search]').click();
  }
  const dialog = page.locator('dialog[aria-modal="true"][open]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('dialog[aria-modal="true"] input[type="search"]').fill(SEARCH_QUERY);
  const result = page.locator(`a[data-search-result][href="${SEARCH_RESULT_HREF}"]`).first();
  await result.waitFor({ state: 'visible', timeout: 15_000 });
  await result.click();
  await page.waitForURL(`${origin}${SEARCH_RESULT_HREF}`);
  await expect(page).toHaveURL(`${origin}${SEARCH_RESULT_HREF}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Conversation');
}

/** Read-only live deployment identity through the real Cloudflare API. */
function queryDeployments(): DeploymentRecord[] {
  const listed = spawnSync(
    'pnpm --dir apps/docs exec wrangler deployments list --config wrangler.jsonc --json',
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: 120_000,
      shell: true,
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  if (listed.status !== 0) {
    throw new Error(
      `wrangler deployments list failed (exit ${listed.status}): ${(listed.stderr ?? '').slice(-400)}`,
    );
  }
  const jsonStart = listed.stdout.indexOf('[');
  return JSON.parse(listed.stdout.slice(jsonStart)) as DeploymentRecord[];
}

/** The receipt's baseline deployment record plus the live current state. */
function deploymentComparison(
  run: RunReceipt,
  deployments: DeploymentRecord[],
): {
  activeId: string;
  baselineVersions: { version_id: string; percentage: number }[];
  currentActive: DeploymentRecord;
  currentLatest: DeploymentRecord;
} {
  const baseline = run.apex_baseline;
  const activeId = baseline?.active_deployment_id ?? '';
  expect(activeId, 'receipt must record the pre-run baseline').toBeTruthy();
  if (!baseline?.deployments) {
    throw new Error('receipt must record the baseline deployments snapshot');
  }
  const baselineActive = baseline.deployments.find((d) => d.id === activeId);
  if (!baselineActive) {
    throw new Error('the baseline snapshot must contain the active deployment');
  }
  const currentActive = deployments.find((d) => d.id === activeId);
  if (!currentActive) {
    throw new Error(`the initial apex deployment ${activeId} must still exist`);
  }
  const currentLatest = deployments[deployments.length - 1];
  expect(
    currentLatest?.id,
    'no newer deployment may have appeared (upload would be promotion by other means)',
  ).toBe(activeId);
  return {
    activeId,
    baselineVersions: baselineActive.versions,
    currentActive,
    currentLatest,
  };
}

/** Compare live deployment identity and allocations with the pre-run baseline. */
function assertApexPreserved(
  run: RunReceipt,
  deployments: DeploymentRecord[],
  project: string,
): DeploymentRecord {
  const { activeId, baselineVersions, currentActive, currentLatest } = deploymentComparison(
    run,
    deployments,
  );
  expect(
    currentActive.versions,
    'active deployment version allocations must be identical to the baseline',
  ).toEqual(baselineVersions);
  recordObservation('ac4Deployments', {
    project,
    baselineActiveId: activeId,
    currentLatestId: currentLatest.id,
    currentActiveVersions: currentActive.versions,
    deploymentCount: deployments.length,
  });
  return currentActive;
}

/** Registry prerequisite bytes over trusted HTTPS, hash-bound to the receipt. */
async function assertRegistryBytes(
  run: RunReceipt,
  request: GetLike,
  project: string,
): Promise<void> {
  const registryUrls = run.registry_prerequisite?.urls ?? {};
  expect(
    Object.keys(registryUrls).length,
    'receipt must list the registry prerequisite URLs',
  ).toBeGreaterThan(0);
  const registryChecks: Record<string, unknown> = {};
  for (const [url, expectedSha] of Object.entries(registryUrls)) {
    const response = await request.get(url, { maxRedirects: 0 });
    const body = await response.body();
    const sha = sha256Buffer(body);
    registryChecks[url] = {
      status: response.status(),
      sha256: sha,
      matchesReceipt: sha === expectedSha,
      bytes: body.length,
    };
    expect(response.status(), `${url} must be HTTP 200`).toBe(200);
    expect(sha, `${url} bytes must match the ORI-DEP-001 receipt hash`).toBe(expectedSha);
  }
  recordObservation('ac4RegistryBytes', { project, registryChecks });
}

/** ORI-DEP-003 receives the exact nonempty version identity this run exercised. */
function assertHandoff(run: RunReceipt, deployments: DeploymentRecord[], project: string): void {
  const handoffVersion = run.verified_surface.version_id;
  expect(handoffVersion, 'handoff must carry a nonempty verified version id').toBeTruthy();
  const baseline = run.apex_baseline;
  const currentActive = deployments.find((d) => d.id === baseline?.active_deployment_id);
  expect(
    currentActive?.versions.some((v) => v.version_id === handoffVersion),
    'the handed-off version must be the one allocated at the verified deployment',
  ).toBe(true);
  recordObservation('ac4Handoff', {
    project,
    verifiedVersionId: handoffVersion,
    verifiedOrigin: run.verified_surface.origin ?? null,
    uploadStatus: run.upload?.status ?? null,
  });
}

test('ORI-DEP-002 AC-1 accepted-version-and-origin', async ({ request }, testInfo) => {
  test.setTimeout(120_000);
  const run = receipt();
  const origin = run.verified_surface?.origin;
  expect(origin, 'receipt must record the verified origin').toBeTruthy();

  // Config-entrypoint shape (AC-1 case 1, configuration half).
  assertRemoteLaneShape(origin);
  // Origin guard (AC-1 case 2): rejections happen before any network activity.
  originGuardObservations(run, testInfo.project.name);

  // Real request against the receipt origin (AC-1 case 1, remote half).
  const probe = await directGet(request, origin as string, MISSING_PATH);
  recordObservation('ac1MissingPathProbe', { project: testInfo.project.name, ...probe });
  expect(probe.status, 'the recorded origin must answer the missing path').toBe(404);

  // Accepted-candidate binding (fail closed on the absent receipt).
  assertAcceptedArtifactBound(run);
  expect(run.upload?.status, 'this run must record its upload state explicitly').toBeTruthy();
});

test('ORI-DEP-002 AC-2 direct-branded-404', async ({ request }, testInfo) => {
  test.setTimeout(120_000);
  const run = receipt();
  const origin = run.verified_surface?.origin as string;
  const accepted404Sha = run.verified_surface.dist_404_html_sha256 ?? null;

  // Both direct reads first, with redirects disabled, so both observations are
  // recorded even when an oracle fails.
  const root = await directGet(request, origin, MISSING_PATH);
  const deep = await directGet(request, origin, MISSING_DEEP_PATH);
  recordObservation('ac2Direct404', {
    project: testInfo.project.name,
    root,
    deep,
    acceptedDist404Sha256: accepted404Sha,
  });

  assertNoRedirect(root, MISSING_PATH);
  assertNoRedirect(deep, MISSING_DEEP_PATH);

  for (const [label, observation] of [
    ['root missing path', root],
    ['deep missing path', deep],
  ] as const) {
    expect(
      mediaTypeOf(observation),
      `${label} must serve Content-Type media type text/html (observed: ${observation.contentType})`,
    ).toBe('text/html');
  }

  if (!accepted404Sha) {
    prerequisite(
      `no accepted apps/docs/dist/404.html hash is bound in the run receipt ` +
        `(observed live: root body ${root.bodyBytes} bytes sha256 ${root.bodySha256}, ` +
        `deep body ${deep.bodyBytes} bytes sha256 ${deep.bodySha256}). `,
    );
  }
  expect(root.bodySha256, `${MISSING_PATH} must return the accepted branded bytes`).toBe(
    accepted404Sha,
  );
  expect(deep.bodySha256, `${MISSING_DEEP_PATH} must return the accepted branded bytes`).toBe(
    accepted404Sha,
  );
});

test('ORI-DEP-002 AC-3 rendered-recovery', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const run = receipt();
  const origin = run.verified_surface?.origin as string;
  const title = manuscriptTitle();
  const project = testInfo.project.name;

  const { visits, stylesheetResponses } = await visitMissingPathsAndCapture(
    page,
    origin,
    title,
    testInfo,
  );
  recordObservation('ac3RenderedVisits', { project, visits, stylesheetResponses });

  const rootVisit = visits[0] as { status: number; hasTitle: boolean };
  expect(rootVisit.status, 'the missing path must answer HTTP 404').toBe(404);
  if (!rootVisit.hasTitle) {
    prerequisite(
      `the rendered 404 at ${MISSING_PATH} does not carry the branded manuscript heading ` +
        `"${title}" (visits recorded above; ${stylesheetResponses.length} stylesheet request(s) observed). ` +
        'The deployed artifact predates ORI-AST-009 and contains no 404.html. ',
    );
  }

  // Branding + styling (reached only when the branded page is deployed).
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  const applied = await appliedStyles(page);
  expect(
    applied.mainDisplay,
    'the recovery surface must lay out as a grid, not a raw document',
  ).toBe('grid');
  recordObservation('ac3AppliedStyles', { project, applied });

  for (const sheet of stylesheetResponses) {
    expect(sheet.status, `stylesheet ${sheet.url} must load`).toBe(200);
    expect(sheet.url, 'stylesheets are root-relative on the version origin').toContain(origin);
  }

  await linkRecovery(page, origin);
  await searchRecovery(page, origin, project === 'chromium-desktop');
  recordObservation('ac3RecoveryComplete', { project, searchQuery: SEARCH_QUERY });
});

test('ORI-DEP-002 AC-4 apex-preserved-handoff', async ({ request }, testInfo) => {
  test.setTimeout(180_000);
  const run = receipt();
  const origin = run.verified_surface?.origin as string;

  // Current deployment identity through the real Cloudflare deployment API
  // (read-only Wrangler query), compared with this run's pre-run baseline.
  const deployments = queryDeployments();
  assertApexPreserved(run, deployments, testInfo.project.name);
  await assertRegistryBytes(run, request, testInfo.project.name);
  assertHandoff(run, deployments, testInfo.project.name);
  expect(origin, 'handoff origin must be the tested origin').toBe(cfConfig.use?.baseURL);
});
