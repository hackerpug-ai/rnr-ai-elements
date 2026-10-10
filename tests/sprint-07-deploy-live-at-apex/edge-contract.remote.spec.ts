import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import liveConfig from './live.playwright.config';

const APEX = 'https://rnraielements.com';
const WWW = 'https://www.rnraielements.com';
const REPO_ROOT = process.cwd();
const EVIDENCE_DIR = join(
  REPO_ROOT,
  'tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-02-header-and-domain-contract',
);
const PLAYWRIGHT_BIN = join(REPO_ROOT, 'node_modules/.bin/playwright');

const CACHE_HTML = 'public, max-age=0, must-revalidate';
const CACHE_ASTRO = 'public, max-age=31536000, immutable';
const CACHE_REGISTRY = 'public, max-age=300';

const CSP_REQUIRED =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'";

const SECURITY_HEADERS: Record<string, string> = {
  'content-security-policy': CSP_REQUIRED,
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

type HeaderLine = { name: string; value: string };

type ProbeRecord = {
  url: string;
  status: number | null;
  headers: HeaderLine[];
  error: string | null;
};

type ProbeResult = {
  status: number;
  headers: HeaderLine[];
  contentType?: string | null;
};

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function assertSingleCacheControl(headers: HeaderLine[], expected: string): void {
  const cacheControls = headers.filter((h) => h.name.toLowerCase() === 'cache-control');
  if (cacheControls.length !== 1) {
    throw new Error(
      `cache-control: expected exactly one header line, found ${cacheControls.length}`,
    );
  }
  const cacheValue = cacheControls[0]?.value ?? '';
  const maxAgeTokens = cacheValue.match(/max-age=/g) ?? [];
  if (maxAgeTokens.length !== 1 || cacheValue !== expected) {
    throw new Error(`cache-control: expected exactly "${expected}", got "${cacheValue}"`);
  }
}

function headerValues(headers: HeaderLine[], name: string): string[] {
  return headers.filter((h) => h.name.toLowerCase() === name).map((h) => h.value);
}

function assertExactHeader(headers: HeaderLine[], name: string, expected: string): void {
  const values = headerValues(headers, name);
  if (values.length === 0) {
    throw new Error(`${name}: missing required security header`);
  }
  if (values.length !== 1) {
    throw new Error(`${name}: expected exactly one header line, found ${values.length}`);
  }
  if (values[0] !== expected) {
    throw new Error(`${name}: expected "${expected}", got "${values[0]}"`);
  }
}

function assertCsp(headers: HeaderLine[], expected: string): void {
  const values = headerValues(headers, 'content-security-policy');
  if (values.length === 0) {
    throw new Error('content-security-policy: missing required security header');
  }
  if (values.length !== 1) {
    throw new Error(
      `content-security-policy: expected exactly one header line, found ${values.length}`,
    );
  }
  const value = values[0] ?? '';
  for (const directive of expected
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)) {
    if (!value.includes(directive)) {
      throw new Error(
        `content-security-policy: missing required directive "${directive}" in "${value}"`,
      );
    }
  }
  if (!value.includes("'wasm-unsafe-eval'")) {
    throw new Error("content-security-policy: script-src must contain 'wasm-unsafe-eval'");
  }
}

/** Header oracle: exact single cache-control plus the five security headers. */
function assertDeliveryHeaders(headers: HeaderLine[], expectedCacheControl: string): void {
  assertSingleCacheControl(headers, expectedCacheControl);
  assertCsp(headers, SECURITY_HEADERS['content-security-policy']);
  assertExactHeader(
    headers,
    'strict-transport-security',
    SECURITY_HEADERS['strict-transport-security'],
  );
  assertExactHeader(headers, 'x-content-type-options', SECURITY_HEADERS['x-content-type-options']);
  assertExactHeader(headers, 'x-frame-options', SECURITY_HEADERS['x-frame-options']);
  assertExactHeader(headers, 'referrer-policy', SECURITY_HEADERS['referrer-policy']);
}

function writeEvidence(probes: ProbeRecord[], outcome: 'red' | 'green'): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const head = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  })
    .stdout?.trim()
    .slice(0, 40);
  writeFileSync(
    join(EVIDENCE_DIR, 'run.json'),
    `${JSON.stringify(
      {
        flowId: 'FLOW-DELIV-02-header-and-domain-contract',
        capturedAt: new Date().toISOString(),
        gitHead: head ?? null,
        outcome,
        probes,
      },
      null,
      2,
    )}\n`,
  );
}

function listPlaywright(args: string[]): string {
  const result = spawnSync(PLAYWRIGHT_BIN, ['test', '--list', ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: process.env,
  });
  return `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
}

function htmlTierHeaders(): HeaderLine[] {
  return [
    { name: 'cache-control', value: CACHE_HTML },
    { name: 'content-security-policy', value: CSP_REQUIRED },
    { name: 'strict-transport-security', value: SECURITY_HEADERS['strict-transport-security'] },
    { name: 'x-content-type-options', value: SECURITY_HEADERS['x-content-type-options'] },
    { name: 'x-frame-options', value: SECURITY_HEADERS['x-frame-options'] },
    { name: 'referrer-policy', value: SECURITY_HEADERS['referrer-policy'] },
  ];
}

async function probeGet(
  request: APIRequestContext,
  url: string,
  probes: ProbeRecord[],
  failures: string[],
): Promise<ProbeResult | null> {
  try {
    const response = await request.get(url, { maxRedirects: 0 });
    const result: ProbeResult = {
      status: response.status(),
      headers: response.headersArray(),
      contentType: response.headers()['content-type'] ?? null,
    };
    probes.push({ url, status: result.status, headers: result.headers, error: null });
    return result;
  } catch (error) {
    const message = errMessage(error);
    probes.push({ url, status: null, headers: [], error: message });
    failures.push(`${url}: ${message}`);
    return null;
  }
}

async function checkTier(
  label: string,
  result: ProbeResult | null,
  expectedStatus: number,
  expectedCache: string,
  failures: string[],
  extra?: (result: ProbeResult) => void,
): Promise<void> {
  if (!result) return;
  try {
    expect(result.status, `${label} status`).toBe(expectedStatus);
    extra?.(result);
    assertDeliveryHeaders(result.headers, expectedCache);
  } catch (error) {
    failures.push(`${label} contract: ${errMessage(error)}`);
  }
}

async function firstAstroCssHref(
  request: APIRequestContext,
  probes: ProbeRecord[],
  failures: string[],
): Promise<string | null> {
  try {
    const response = await request.get(`${APEX}/`, { maxRedirects: 0 });
    const body = await response.text();
    probes.push({
      url: `${APEX}/`,
      status: response.status(),
      headers: response.headersArray(),
      error: null,
    });
    return body.match(/\/_astro\/[^"')\s]+\.css/)?.[0] ?? null;
  } catch (error) {
    const message = errMessage(error);
    probes.push({ url: `${APEX}/`, status: null, headers: [], error: message });
    failures.push(`${APEX}/: ${message}`);
    return null;
  }
}

async function checkWwwRedirect(
  request: APIRequestContext,
  path: '/docs/introduction' | '/',
  probes: ProbeRecord[],
  failures: string[],
): Promise<void> {
  const wwwUrl = `${WWW}${path}`;
  const apexUrl = `${APEX}${path === '/' ? '/' : path}`;
  const www = await probeGet(request, wwwUrl, probes, failures);
  if (!www) return;
  try {
    expect(www.status, `${wwwUrl} status`).toBe(301);
    const locations = www.headers.filter((h) => h.name.toLowerCase() === 'location');
    expect(locations, `${wwwUrl} location count`).toHaveLength(1);
    const location = locations[0]?.value ?? '';
    expect(location, `${wwwUrl} location`).toBe(apexUrl);
    const followed = await request.get(location, { maxRedirects: 0 });
    probes.push({
      url: location,
      status: followed.status(),
      headers: followed.headersArray(),
      error: null,
    });
    expect(followed.status(), `followed ${location}`).toBe(200);
  } catch (error) {
    failures.push(`www ${path} contract: ${errMessage(error)}`);
  }
}

test('APX-006-header-oracle', () => {
  test.setTimeout(60_000);

  const joined = htmlTierHeaders().map((h) =>
    h.name === 'cache-control'
      ? {
          name: h.name,
          value: 'public, max-age=0, must-revalidate, public, max-age=31536000, immutable',
        }
      : h,
  );
  expect(() => assertDeliveryHeaders(joined, CACHE_HTML)).toThrow(/cache-control/);

  const repeated: HeaderLine[] = [
    { name: 'cache-control', value: CACHE_HTML },
    { name: 'cache-control', value: CACHE_ASTRO },
    ...htmlTierHeaders().filter((h) => h.name !== 'cache-control'),
  ];
  expect(() => assertDeliveryHeaders(repeated, CACHE_HTML)).toThrow(/cache-control/);

  const missingFrame = htmlTierHeaders().filter((h) => h.name !== 'x-frame-options');
  expect(() => assertDeliveryHeaders(missingFrame, CACHE_HTML)).toThrow(/x-frame-options/);

  expect(() => assertDeliveryHeaders(htmlTierHeaders(), CACHE_HTML)).not.toThrow();
});

test('APX-006-lane-isolation', () => {
  test.setTimeout(60_000);

  const rootOut = listPlaywright([]);
  expect(rootOut).not.toContain('edge-contract.remote.spec.ts');
  expect(rootOut).not.toContain('tests/sprint-07-deploy-live-at-apex');

  const liveOut = listPlaywright([
    '-c',
    'tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts',
  ]);
  expect(liveOut).toContain('edge-contract.remote.spec.ts');
  expect(liveOut).toContain('FLOW-DELIV-02-header-and-domain-contract');

  expect(liveConfig.workers).toBe(1);
  expect(liveConfig.retries).toBe(0);
  expect(liveConfig.timeout).toBe(3_600_000);
  expect(liveConfig.use?.baseURL).toBe(APEX);
  expect(liveConfig.projects).toHaveLength(1);
  expect(liveConfig.webServer).toBeUndefined();
});

test('FLOW-DELIV-02-header-and-domain-contract', async ({ request }) => {
  test.setTimeout(60_000);
  const probes: ProbeRecord[] = [];
  const failures: string[] = [];

  try {
    const docs = await probeGet(request, `${APEX}/docs/introduction`, probes, failures);
    await checkTier('/docs/introduction', docs, 200, CACHE_HTML, failures);

    const astroHref = await firstAstroCssHref(request, probes, failures);
    if (!astroHref) {
      failures.push('home HTML: no /_astro/*.css href found');
    } else {
      const css = await probeGet(request, `${APEX}${astroHref}`, probes, failures);
      await checkTier('/_astro css', css, 200, CACHE_ASTRO, failures);
    }

    const registry = await probeGet(
      request,
      `${APEX}/r/nativewind/conversation.json`,
      probes,
      failures,
    );
    await checkTier('registry JSON', registry, 200, CACHE_REGISTRY, failures, (result) => {
      expect(result.contentType ?? '', 'registry JSON content-type').toMatch(
        /^application\/json\b/,
      );
    });

    const missing = await probeGet(request, `${APEX}/no-such-page`, probes, failures);
    await checkTier('/no-such-page', missing, 404, CACHE_HTML, failures);

    await checkWwwRedirect(request, '/docs/introduction', probes, failures);
    await checkWwwRedirect(request, '/', probes, failures);

    if (failures.length > 0) {
      throw new Error(
        `FLOW-DELIV-02-header-and-domain-contract RED against live apex:\n- ${failures.join('\n- ')}`,
      );
    }
  } finally {
    writeEvidence(probes, failures.length === 0 ? 'green' : 'red');
  }
});
