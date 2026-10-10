import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { require as tsxRequire } from 'tsx/cjs/api';

/**
 * packages/registry/package.json is not `"type": "module"`, so a native import
 * rejects build-registry.ts. tsx compiles that file in-process and polyfills
 * import.meta.url, so main() still does not run on import.
 */
type Engine = 'nativewind' | 'uniwind';
type RegistryFile = { path: string; type: string; target: string };
type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
};
type Registry = { items: RegistryItem[] };
type BuildItem = (
  item: RegistryItem,
  engine: Engine,
  readFile: (path: string) => string,
) => RegistryItem;

let buildItem: BuildItem;
let ENGINES: readonly Engine[];

/**
 * Playwright sets NODE_ENV=test before this file loads. That value breaks Expo
 * children APX-041 spawns, so drop it before any child process starts. Load the
 * Cloudflare token from the repo .env only when the environment does not have one.
 */
const REPO_ROOT = process.cwd();
const APEX = 'https://rnraielements.com';
const ITEM = 'conversation';
const BUILDER_PATH = 'packages/registry/scripts/build-registry.ts';
const REGISTRY_PATH = 'packages/registry/registry.json';
const RUN_JSON = join(
  REPO_ROOT,
  'tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-live-registry-round-trip/run.json',
);
const AD650 = 'ad650d363104077c942444d0045bbd75fcae22b6';
const ABSENT_SHA = 'ffffffffffffffffffffffffffffffffffffffff';
const DRIFTED_SHA = '0a899adaf9a5fc921a78ea41a61aac8eacac4af1';
const ONE_SHA = '5bfa77283a1182891ac8780fe477c3d676e2d918';
const OTHER_SHA = '0123456789abcdef0123456789abcdef01234567';
const EMPTY_SHA = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const PRE_GATE_DEPLOYMENT = '19b366d7-a31b-4f1f-9e39-446d3789a694';
const PRE_GATE_VERSION = 'bb65ae86-7586-45da-8bdb-27d734ded8b9';
const AD650_SHA: Record<Engine, string> = {
  nativewind: 'c84d855da4e4e557705d5b93727f5fda186b177b1071bf0a3dc374575b43576f',
  uniwind: '2b7018011145effab45555d3400f17809fbab1cd4751fcdad60ac56cafb0e7db',
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SHA40_RE = /\b[0-9a-f]{40}\b/gi;

/** Flow tests that must run and pass before run.json is written. APX-041 appends its tokens. */
const REQUIRED_FLOW_TESTS: string[] = [
  'APX-040-rebuild-at-commit',
  'APX-040-refuses-unfaithful-commit',
  'APX-040-live-deploy-identity',
  'APX-040-same-deploy',
];

type HeaderLine = { name: string; value: string };

type LiveDeploy = {
  deployment_id: string;
  version_id: string;
  percentage: number;
  versions_view_id: string;
  annotations: Record<string, string | null>;
  message: string | null;
};

type EngineReceipt = {
  status: number;
  content_type: string | null;
  cache_control: string | null;
  served_sha256: string;
  built_sha256: string | null;
};

type RoundTripReceipt = {
  deployment_id: string;
  version_id: string;
  commit: string | null;
  engines: Record<string, EngineReceipt>;
};

const flowResults = new Map<string, string>();
let receiptDraft: RoundTripReceipt | null = null;

delete process.env.NODE_ENV;
loadTokenFromDotenv();

const builder = tsxRequire(
  '../../packages/registry/scripts/build-registry.ts',
  import.meta.url,
) as {
  buildItem: BuildItem;
  ENGINES: readonly Engine[];
};
buildItem = builder.buildItem;
ENGINES = builder.ENGINES;

function isEnoent(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}

function loadTokenFromDotenv(): void {
  if (process.env.CLOUDFLARE_API_TOKEN) return;
  try {
    process.loadEnvFile(join(REPO_ROOT, '.env'));
  } catch (error) {
    if (isEnoent(error)) return;
    throw error;
  }
}

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function redact(text: string): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) return text;
  return text.split(token).join('[REDACTED]');
}

function containsToken(value: unknown): boolean {
  const token = process.env.CLOUDFLARE_API_TOKEN ?? '';
  if (!token) return false;
  return JSON.stringify(value).includes(token);
}

function sha256Text(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`malformed ${label}`);
  }
  return value as Record<string, unknown>;
}

function gitResult(args: string[]): { status: number; stdout: string; stderr: string } {
  const result = spawnSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 << 20,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function gitShow(sha: string, filePath: string): string {
  return execFileSync('git', ['show', `${sha}:${filePath}`], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 << 20,
  });
}

function assertCommitPresent(sha: string): void {
  const probe = gitResult(['cat-file', '-e', `${sha}^{commit}`]);
  if (probe.status === 0) return;
  throw new Error(`commit ${sha} is absent from the object store; git fetch origin`);
}

function assertBuilderMatchesHead(sha: string): void {
  const diff = gitResult(['diff', '--quiet', sha, 'HEAD', '--', BUILDER_PATH]);
  if (diff.status === 0) return;
  if (diff.status === 1) {
    throw new Error(`builder drift: ${BUILDER_PATH} differs between ${sha} and HEAD`);
  }
  throw new Error(`builder drift check failed for ${sha} against HEAD (exit ${diff.status})`);
}

/** Accept exactly one 40-hex commit token. Null, a short prefix, and two distinct tokens throw. */
function parseDeployCommit(message: string | null): string {
  if (message == null) {
    throw new Error('workers/message missing');
  }
  const found = message.match(SHA40_RE) ?? [];
  const unique = [...new Set(found.map((token) => token.toLowerCase()))];
  if (unique.length !== 1) {
    throw new Error(`workers/message must hold exactly one 40-hex commit, found ${unique.length}`);
  }
  const only = unique[0];
  if (!only) {
    throw new Error('workers/message must hold exactly one 40-hex commit, found 0');
  }
  return only;
}

/**
 * Rebuild one registry item at sha with buildItem over `git show <sha>:`.
 * Refuses an unknown commit and a build-registry.ts that differs from HEAD, before hashing.
 */
function rebuildAtCommit(sha: string, engine: Engine, itemName: string): string {
  assertCommitPresent(sha);
  assertBuilderMatchesHead(sha);
  const registry = JSON.parse(gitShow(sha, REGISTRY_PATH)) as Registry;
  const item = registry.items.find((entry) => entry.name === itemName);
  if (!item) {
    throw new Error(`registry item ${itemName} is absent at ${sha}`);
  }
  const built = buildItem(item, engine, (filePath) => gitShow(sha, filePath));
  return `${JSON.stringify(built, null, 2)}\n`;
}

function wranglerJson(args: string[]): unknown {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error(
      'CLOUDFLARE_API_TOKEN is unset; refusing to skip the live deploy identity check',
    );
  }
  const result = spawnSync(
    'pnpm',
    ['--dir', 'apps/docs', 'exec', 'wrangler', ...args, '--config', 'wrangler.jsonc', '--json'],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: process.env,
      maxBuffer: 16 * 1024 * 1024,
      timeout: 120_000,
    },
  );
  if (result.error) {
    throw new Error(`wrangler ${args.join(' ')} failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = redact(`${result.stderr ?? ''}\n${result.stdout ?? ''}`).slice(-500);
    throw new Error(`wrangler ${args.join(' ')} failed (exit ${result.status}): ${detail}`);
  }
  return parseWranglerJson(result.stdout ?? '', args.join(' '));
}

function parseWranglerJson(stdout: string, label: string): unknown {
  const objectAt = stdout.indexOf('{');
  const arrayAt = stdout.indexOf('[');
  const start = objectAt === -1 ? arrayAt : arrayAt === -1 ? objectAt : Math.min(objectAt, arrayAt);
  if (start < 0) {
    throw new Error(`wrangler ${label} returned no JSON`);
  }
  try {
    return JSON.parse(stdout.slice(start)) as unknown;
  } catch (error) {
    throw new Error(`wrangler ${label} returned malformed JSON: ${errMessage(error)}`);
  }
}

function readAnnotations(raw: unknown): Record<string, string | null> {
  const record = asRecord(raw, 'annotation: versions view annotations missing');
  const annotations: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string') {
      annotations[key] = value;
    } else if (value == null) {
      annotations[key] = null;
    } else {
      throw new Error(`malformed annotation: ${key} is ${typeof value}`);
    }
  }
  return annotations;
}

function readActiveVersion(raw: unknown): {
  deploymentId: string;
  versionId: string;
  percentage: number;
} {
  const record = asRecord(raw, 'deployments status');
  const deploymentId = record.id;
  if (typeof deploymentId !== 'string' || deploymentId.length === 0) {
    throw new Error('malformed deployments status: missing deployment id');
  }
  if (!Array.isArray(record.versions)) {
    throw new Error('split deployment: versions missing');
  }
  if (record.versions.length !== 1) {
    throw new Error(
      `split deployment: expected exactly one version, found ${record.versions.length}`,
    );
  }
  const only = asRecord(record.versions[0], 'version');
  const versionId = only.version_id;
  if (typeof versionId !== 'string' || !UUID_RE.test(versionId)) {
    throw new Error('malformed deployments status: version_id is not a UUID');
  }
  if (only.percentage !== 100) {
    throw new Error(
      `split deployment: expected percentage 100, found ${String(only.percentage)} on version ${versionId}`,
    );
  }
  return { deploymentId, versionId, percentage: 100 };
}

function readVersionView(
  raw: unknown,
  versionId: string,
): { id: string; annotations: Record<string, string | null> } {
  const record = asRecord(raw, 'versions view');
  if (typeof record.id !== 'string') {
    throw new Error(`malformed versions view for ${versionId}: missing id`);
  }
  if (record.id !== versionId) {
    throw new Error(`versions view id ${record.id} does not match deployment version ${versionId}`);
  }
  return { id: record.id, annotations: readAnnotations(record.annotations) };
}

/** Read-only active deployment: status, then versions view. Message is returned as-is. */
function resolveLiveDeploy(): LiveDeploy {
  const active = readActiveVersion(wranglerJson(['deployments', 'status']));
  const view = readVersionView(
    wranglerJson(['versions', 'view', active.versionId]),
    active.versionId,
  );
  const message = Object.hasOwn(view.annotations, 'workers/message')
    ? (view.annotations['workers/message'] ?? null)
    : null;
  return {
    deployment_id: active.deploymentId,
    version_id: active.versionId,
    percentage: active.percentage,
    versions_view_id: view.id,
    annotations: view.annotations,
    message,
  };
}

function headerValues(headers: HeaderLine[], name: string): string[] {
  return headers
    .filter((header) => header.name.toLowerCase() === name)
    .map((header) => header.value);
}

function expectServedHeaders(
  engine: Engine,
  status: number,
  headers: HeaderLine[],
): { contentType: string | null; cacheControl: string | null } {
  expect.soft(status, `${engine} status`).toBe(200);
  const contentTypes = headerValues(headers, 'content-type');
  const caches = headerValues(headers, 'cache-control');
  expect.soft(contentTypes, `${engine} content-type`).toEqual(['application/json']);
  expect.soft(caches, `${engine} cache-control`).toEqual(['public, max-age=300']);
  return {
    contentType: contentTypes[0] ?? null,
    cacheControl: caches[0] ?? null,
  };
}

function expectItemIdentity(engine: Engine, body: string): void {
  let name: unknown = null;
  let type: unknown = null;
  try {
    const parsed = JSON.parse(body) as { name?: unknown; type?: unknown };
    name = parsed.name ?? null;
    type = parsed.type ?? null;
  } catch (error) {
    expect.soft(false, `${engine} body is not JSON: ${errMessage(error)}`).toBe(true);
  }
  expect.soft(name, `${engine} name`).toBe(ITEM);
  expect.soft(type, `${engine} type`).toBe('registry:component');
}

function expectBuiltHash(engine: Engine, body: string, commit: string | null): string | null {
  if (!commit) return null;
  try {
    const built = rebuildAtCommit(commit, engine, ITEM);
    const builtHash = sha256Text(built);
    expect.soft(sha256Text(body), `${engine} served sha256`).toBe(builtHash);
    return builtHash;
  } catch (error) {
    expect.soft(false, errMessage(error)).toBe(true);
    return null;
  }
}

async function observeEngine(
  request: APIRequestContext,
  engine: Engine,
  commit: string | null,
): Promise<EngineReceipt> {
  const url = `${APEX}/r/${engine}/${ITEM}.json`;
  const response = await request.get(url, { maxRedirects: 0 });
  const status = response.status();
  const headers = response.headersArray();
  const body = await response.text();
  const served = expectServedHeaders(engine, status, headers);
  expectItemIdentity(engine, body);
  return {
    status,
    content_type: served.contentType,
    cache_control: served.cacheControl,
    served_sha256: sha256Text(body),
    built_sha256: expectBuiltHash(engine, body, commit),
  };
}

function deployCommit(deploy: LiveDeploy): string | null {
  try {
    const parsed = parseDeployCommit(deploy.message);
    const verified = gitResult(['rev-parse', '--verify', `${parsed}^{commit}`]);
    if (verified.status !== 0) {
      expect.soft(false, `unknown commit ${parsed}; git fetch origin`).toBe(true);
      return null;
    }
    return parsed;
  } catch (error) {
    const label =
      deploy.message == null
        ? `workers/message missing on version ${deploy.version_id}`
        : `workers/message on version ${deploy.version_id}: ${errMessage(error)}`;
    expect.soft(false, label).toBe(true);
    return null;
  }
}

function recordFlowResult(title: string, status: string): void {
  for (const token of REQUIRED_FLOW_TESTS) {
    if (title.includes(token)) flowResults.set(token, status);
  }
}

function requiredFlowPassed(): boolean {
  return REQUIRED_FLOW_TESTS.every((token) => flowResults.get(token) === 'passed');
}

function writeReceiptIfComplete(): void {
  if (!requiredFlowPassed() || !receiptDraft) return;
  if (!receiptDraft.commit || !/^[0-9a-f]{40}$/.test(receiptDraft.commit)) return;
  if (containsToken(receiptDraft)) {
    throw new Error('refusing to write run.json because it contains CLOUDFLARE_API_TOKEN');
  }
  mkdirSync(dirname(RUN_JSON), { recursive: true });
  writeFileSync(RUN_JSON, `${JSON.stringify(receiptDraft, null, 2)}\n`);
}

test.afterEach(
  // biome-ignore lint/correctness/noEmptyPattern: Playwright requires a fixture object pattern
  ({}, testInfo) => {
    recordFlowResult(testInfo.title, testInfo.status ?? 'failed');
  },
);

test.afterAll(() => {
  writeReceiptIfComplete();
});

test('APX-040-parse-deploy-commit', () => {
  expect(parseDeployCommit(ONE_SHA)).toBe(ONE_SHA);
  expect(parseDeployCommit(`deploy ${ONE_SHA} run 42`)).toBe(ONE_SHA);
  expect(() => parseDeployCommit(null)).toThrow(/workers\/message/);
  expect(() => parseDeployCommit(`${ONE_SHA} ${OTHER_SHA}`)).toThrow(/exactly one/);
  expect(() => parseDeployCommit(ONE_SHA.slice(0, 12))).toThrow(/exactly one/);
});

test('FLOW-DELIV-03-live-registry-round-trip APX-040-rebuild-at-commit', () => {
  const pinned = new Map<Engine, string>();
  for (const engine of ENGINES) {
    const rebuilt = rebuildAtCommit(AD650, engine, ITEM);
    const committed = gitShow(AD650, `public/r/${engine}/${ITEM}.json`);
    expect(rebuilt, `${engine} ad650d36 bytes`).toBe(committed);
    const hash = sha256Text(rebuilt);
    expect(hash, `${engine} ad650d36 sha256`).toBe(AD650_SHA[engine]);
    expect(hash).not.toBe(EMPTY_SHA);
    pinned.set(engine, hash);
  }
  expect(pinned.get('nativewind')).not.toBe(pinned.get('uniwind'));

  const head = gitResult(['rev-parse', 'HEAD']).stdout.trim();
  for (const engine of ENGINES) {
    const rebuilt = rebuildAtCommit(head, engine, ITEM);
    const committed = gitShow(head, `public/r/${engine}/${ITEM}.json`);
    expect(rebuilt, `${engine} HEAD bytes`).toBe(committed);
    expect(sha256Text(rebuilt)).not.toBe(EMPTY_SHA);
  }
});

test('FLOW-DELIV-03-live-registry-round-trip APX-040-refuses-unfaithful-commit', () => {
  let absentBuilt: string | null = null;
  try {
    absentBuilt = rebuildAtCommit(ABSENT_SHA, 'nativewind', ITEM);
  } catch (error) {
    const text = errMessage(error);
    expect(text).toContain(ABSENT_SHA);
    expect(text).toContain('git fetch origin');
    expect(text).not.toMatch(/[0-9a-f]{64}/);
  }
  expect(absentBuilt, 'absent commit must not rebuild').toBeNull();

  let driftedBuilt: string | null = null;
  try {
    driftedBuilt = rebuildAtCommit(DRIFTED_SHA, 'nativewind', ITEM);
  } catch (error) {
    const text = errMessage(error);
    expect(text).toContain('builder drift');
    expect(text).toContain(DRIFTED_SHA);
    expect(text).toContain('HEAD');
    expect(text).not.toMatch(/[0-9a-f]{64}/);
  }
  expect(driftedBuilt, 'drifted builder must not rebuild').toBeNull();
});

test('FLOW-DELIV-03-live-registry-round-trip APX-040-live-deploy-identity', () => {
  const deploy = resolveLiveDeploy();
  expect(deploy.deployment_id).toMatch(UUID_RE);
  expect(deploy.version_id).toMatch(UUID_RE);
  expect(deploy.percentage).toBe(100);
  expect(deploy.versions_view_id).toBe(deploy.version_id);
  expect(deploy.annotations['workers/triggered_by'], 'workers/triggered_by').toBeTruthy();
  expect(Object.keys(deploy.annotations).length).toBeGreaterThan(0);
  if (deploy.message === null) {
    expect(deploy.deployment_id).toBe(PRE_GATE_DEPLOYMENT);
    expect(deploy.version_id).toBe(PRE_GATE_VERSION);
    expect(deploy.message).toBeNull();
  } else {
    expect(deploy.message).toMatch(/[0-9a-f]{40}/);
  }
  expect((process.env.CLOUDFLARE_API_TOKEN ?? '').length > 0, 'CLOUDFLARE_API_TOKEN is unset').toBe(
    true,
  );
  expect(containsToken(deploy), 'token substring in resolveLiveDeploy result').toBe(false);
});

test('FLOW-DELIV-03-live-registry-round-trip APX-040-same-deploy', async ({ request }) => {
  const deploy = resolveLiveDeploy();
  expect.soft(deploy.percentage, 'active version percentage').toBe(100);
  expect.soft(deploy.versions_view_id, 'versions view id').toBe(deploy.version_id);
  const commit = deployCommit(deploy);
  const engines: Record<string, EngineReceipt> = {};
  for (const engine of ENGINES) {
    engines[engine] = await observeEngine(request, engine, commit);
  }
  receiptDraft = {
    deployment_id: deploy.deployment_id,
    version_id: deploy.version_id,
    commit,
    engines,
  };
  expect.soft(containsToken(receiptDraft), 'token substring in receipt draft').toBe(false);
});
