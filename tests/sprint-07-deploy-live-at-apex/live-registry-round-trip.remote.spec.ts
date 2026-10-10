import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  closeSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { require as tsxRequire } from 'tsx/cjs/api';
import {
  cleanupConsumer,
  compileConsumer,
  REPO_ROOT as HELPER_REPO_ROOT,
  type RunResult,
  resolveCliVersion,
  run,
  sha256,
  TEMPLATE_FILES,
} from '../sprint-05-orient-search/support/quickstart-consumer';

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
  'APX-041-AC-1-cli-add',
  'APX-041-AC-2-alias-transform',
  'APX-041-AC-3-template-allowlist',
  'APX-041-AC-4-consumer-compiles',
  'APX-041-AC-5-install-failure-not-retried',
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

type AliasChangedLines = {
  conversation: number[];
  empty: number[];
};

type RoundTripReceipt = {
  deployment_id: string;
  version_id: string;
  commit: string | null;
  engines: Record<string, EngineReceipt>;
  cli_version?: string;
  created_files?: Record<string, string[]>;
  changed_lines?: Record<string, AliasChangedLines>;
  tsc_exits?: Record<string, number>;
  install_output_tails?: Record<string, string | null>;
};

const CONSUMER_ENGINES = ['nativewind', 'uniwind'] as const satisfies readonly Engine[];

type InstallProof = {
  cliVersion: string;
  createdFiles: Record<string, string[]>;
  changedLines: Record<string, AliasChangedLines>;
  tscExits: Partial<Record<Engine, number>>;
  installOutputTails: Partial<Record<Engine, string | null>>;
};

const flowResults = new Map<string, string>();
let receiptDraft: RoundTripReceipt | null = null;
const installProof: InstallProof = {
  cliVersion: '',
  createdFiles: {},
  changedLines: {},
  tscExits: {},
  installOutputTails: {},
};

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

function attachInstallProof(draft: RoundTripReceipt): RoundTripReceipt {
  if (!/^\d+\.\d+\.\d+$/.test(installProof.cliVersion)) {
    throw new Error(`APX-041 cli_version missing from receipt: ${installProof.cliVersion}`);
  }
  const created_files: Record<string, string[]> = {};
  const changed_lines: Record<string, AliasChangedLines> = {};
  const tsc_exits: Record<string, number> = {};
  const install_output_tails: Record<string, string | null> = {};
  for (const engine of CONSUMER_ENGINES) {
    const created = installProof.createdFiles[engine];
    const changed = installProof.changedLines[engine];
    const tscExit = installProof.tscExits[engine];
    if (!created || !changed || tscExit === undefined) {
      throw new Error(`APX-041 receipt is missing install proof for ${engine}`);
    }
    created_files[engine] = created;
    changed_lines[engine] = changed;
    tsc_exits[engine] = tscExit;
    install_output_tails[engine] = installProof.installOutputTails[engine] ?? null;
  }
  return {
    ...draft,
    cli_version: installProof.cliVersion,
    created_files,
    changed_lines,
    tsc_exits,
    install_output_tails,
  };
}

function writeReceiptIfComplete(): void {
  if (!requiredFlowPassed() || !receiptDraft) return;
  const receipt = attachInstallProof(receiptDraft);
  if (!receipt.commit || !/^[0-9a-f]{40}$/.test(receipt.commit)) return;
  if (containsToken(receipt)) {
    throw new Error('refusing to write run.json because it contains CLOUDFLARE_API_TOKEN');
  }
  mkdirSync(dirname(RUN_JSON), { recursive: true });
  writeFileSync(RUN_JSON, `${JSON.stringify(receipt, null, 2)}\n`);
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

/**
 * Expected aliases.ui target. The mutation check changes this string to `@/ui`.
 * The alias map itself is read from the consumer's components.json.
 */
const EXPECTED_ALIASES_UI = '@/components/ui';
const EXPECTED_ALIASES_UTILS = '@/lib/utils';
const CONSUMER_PHASE_TIMEOUT_MS = 10 * 60_000;
const PROBE_INSTALL_TIMEOUT_MS = 45_000;
const EXPECTED_CREATED = [
  'components/ai/conversation.tsx',
  'components/ui/button.tsx',
  'components/ui/empty.tsx',
  'components/ui/icon.tsx',
  'components/ui/text.tsx',
];
const ABSENT_PACKAGE_JSON =
  '{"name":"apx041-probe","version":"0.0.0","dependencies":{"apx041-definitely-absent-package-2026":"1.0.0"}}\n';

type HeldRoot = { root: string; lease: number; released: boolean };
type InstallPhaseResult = {
  exit: number;
  output: string;
  attempts: number;
  retried: boolean;
  firstOutputTail: string | null;
  root: string;
};
type PreparedConsumer = {
  engine: Engine;
  held: HeldRoot;
  installExit: number;
  installAttempts: number;
  installRetried: boolean;
  expoExit: number;
  expoOutput: string;
  componentsBefore: boolean;
  cliCommand: string;
  cliExit: number;
  cliOutput: string;
  created: string[];
};
type ComparedFile = {
  item: 'conversation' | 'empty';
  installedPath: string;
  changed: readonly number[];
  specifiers: readonly string[];
};
type ConsumerAliases = { ui: string; utils: string };

const heldRoots: HeldRoot[] = [];
const preparedConsumers = new Map<Engine, PreparedConsumer>();
const COMPARED_FILES: readonly ComparedFile[] = [
  {
    item: 'conversation',
    installedPath: 'components/ai/conversation.tsx',
    changed: [1, 2, 3, 4],
    specifiers: [
      `${EXPECTED_ALIASES_UI}/button`,
      `${EXPECTED_ALIASES_UI}/empty`,
      `${EXPECTED_ALIASES_UI}/icon`,
      EXPECTED_ALIASES_UTILS,
    ],
  },
  {
    item: 'empty',
    installedPath: 'components/ui/empty.tsx',
    changed: [1, 2, 4],
    specifiers: [
      `${EXPECTED_ALIASES_UI}/text`,
      EXPECTED_ALIASES_UTILS,
      `${EXPECTED_ALIASES_UI}/icon`,
    ],
  },
];

function assertNodeEnvCleared(): void {
  if (process.env.NODE_ENV === 'test') {
    throw new Error('NODE_ENV=test survived the module-top delete; refusing to spawn');
  }
}

function assertRootPresent(root: string): void {
  if (!existsSync(root)) throw new Error(`consumer root vanished: ${root}`);
}

function assertConsumerRoot(root: string): void {
  expect(root.startsWith(tmpdir())).toBe(true);
  expect(root.startsWith(HELPER_REPO_ROOT)).toBe(false);
}

function createHeldRoot(label: string): HeldRoot {
  const root = mkdtempSync(join(tmpdir(), `apx041-${label}-`));
  assertRootPresent(root);
  const held = { root, lease: openSync(join(root, '.apx041-lease'), 'a'), released: false };
  heldRoots.push(held);
  return held;
}

function releaseHeld(held: HeldRoot): void {
  if (held.released) return;
  held.released = true;
  try {
    closeSync(held.lease);
  } catch {
    // The lease fd is already closed.
  }
  cleanupConsumer(held.root);
  const index = heldRoots.indexOf(held);
  if (index >= 0) heldRoots.splice(index, 1);
}

function releaseAllHeld(): void {
  for (const held of [...heldRoots]) releaseHeld(held);
}

function spawnInConsumer(command: string, root: string, timeoutMs: number): RunResult {
  assertNodeEnvCleared();
  assertRootPresent(root);
  return run(command, root, timeoutMs);
}

function cliAddCommand(engine: Engine): string {
  const url = `https://rnraielements.com/r/${engine}/conversation.json`;
  return `npx @react-native-reusables/cli@latest add ${url}`;
}

function copyTemplate(engine: Engine, root: string): void {
  assertRootPresent(root);
  const sourceRoot = join(HELPER_REPO_ROOT, 'packages/docs-snippets', engine);
  for (const rel of TEMPLATE_FILES[engine]) {
    const src = join(sourceRoot, rel);
    if (!existsSync(src)) throw new Error(`template file missing: ${src}`);
    const dst = join(root, rel);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }
}

function installPhase(root: string, renew: () => string, timeoutMs: number): InstallPhaseResult {
  const first = spawnInConsumer('pnpm install', root, timeoutMs);
  if (first.exit === 0 || !first.output.includes('react-native-web')) {
    return {
      exit: first.exit,
      output: first.output,
      attempts: 1,
      retried: false,
      firstOutputTail: null,
      root,
    };
  }
  const next = renew();
  const second = spawnInConsumer('pnpm install', next, timeoutMs);
  return {
    exit: second.exit,
    output: second.output,
    attempts: 2,
    retried: true,
    firstOutputTail: first.output.slice(-800),
    root: next,
  };
}

function listComponentFiles(root: string): string[] {
  const base = join(root, 'components');
  if (!existsSync(base)) return [];
  const prefix = root.endsWith('/') ? root : `${root}/`;
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else found.push(abs.slice(prefix.length));
    }
  };
  walk(base);
  return found.sort();
}

function assertCreatedFile(root: string, rel: string): void {
  const abs = join(root, rel);
  const stat = lstatSync(abs);
  expect(stat.isSymbolicLink(), rel).toBe(false);
  expect(stat.size, rel).toBeGreaterThan(0);
  expect(realpathSync(abs).startsWith(HELPER_REPO_ROOT), rel).toBe(false);
}

function prepareEngine(engine: Engine): PreparedConsumer {
  let held = createHeldRoot(engine);
  copyTemplate(engine, held.root);
  const install = installPhase(
    held.root,
    () => {
      releaseHeld(held);
      held = createHeldRoot(engine);
      copyTemplate(engine, held.root);
      return held.root;
    },
    CONSUMER_PHASE_TIMEOUT_MS,
  );
  if (install.root !== held.root) {
    throw new Error(`install root ${install.root} is not the leased root ${held.root}`);
  }
  const expo = spawnInConsumer('npx expo install', held.root, CONSUMER_PHASE_TIMEOUT_MS);
  const componentsBefore = existsSync(join(held.root, 'components'));
  const cliCommand = cliAddCommand(engine);
  const cli = spawnInConsumer(cliCommand, held.root, CONSUMER_PHASE_TIMEOUT_MS);
  const created = listComponentFiles(held.root);
  installProof.createdFiles[engine] = created;
  installProof.installOutputTails[engine] = install.firstOutputTail;
  console.log(
    `APX-041 ${engine} install_exit ${install.exit} attempts ${install.attempts} expo_exit ${expo.exit} cli_exit ${cli.exit} files ${created.length}`,
  );
  return {
    engine,
    held,
    installExit: install.exit,
    installAttempts: install.attempts,
    installRetried: install.retried,
    expoExit: expo.exit,
    expoOutput: expo.output,
    componentsBefore,
    cliCommand,
    cliExit: cli.exit,
    cliOutput: cli.output,
    created,
  };
}

function requirePrepared(engine: Engine): PreparedConsumer {
  const row = preparedConsumers.get(engine);
  if (!row) throw new Error(`missing prepared ${engine} consumer`);
  return row;
}

function allowlistFromGit(engine: Engine): string[] {
  const prefix = `packages/docs-snippets/${engine}/`;
  const listed = gitResult(['ls-files', '--', `packages/docs-snippets/${engine}`]);
  expect(listed.status, listed.stderr).toBe(0);
  const tracked = listed.stdout
    .split('\n')
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length))
    .filter((rel) => rel.length > 0);
  expect(tracked, `${engine} git ls-files`).toContain('app/index.tsx');
  return tracked.filter((rel) => rel !== 'app/index.tsx');
}

function readAliases(root: string): ConsumerAliases {
  const parsed = JSON.parse(readFileSync(join(root, 'components.json'), 'utf8')) as {
    aliases?: { ui?: unknown; utils?: unknown };
  };
  const ui = parsed.aliases?.ui;
  const utils = parsed.aliases?.utils;
  if (typeof ui !== 'string' || ui.length === 0) {
    throw new Error(`aliases.ui missing in ${root}/components.json`);
  }
  if (typeof utils !== 'string' || utils.length === 0) {
    throw new Error(`aliases.utils missing in ${root}/components.json`);
  }
  return { ui, utils };
}

function mapRegistryLine(line: string, engine: Engine, aliases: ConsumerAliases): string {
  return line
    .replace(`@/registry/${engine}/components/ui/`, `${aliases.ui}/`)
    .replace(`@/registry/${engine}/lib/utils`, aliases.utils);
}

function mapServedContent(served: string, engine: Engine, aliases: ConsumerAliases): string {
  return served
    .split('\n')
    .map((line) => mapRegistryLine(line, engine, aliases))
    .join('\n');
}

function changedLineNumbers(served: string, installed: string): number[] {
  const servedLines = served.split('\n');
  const installedLines = installed.split('\n');
  const count = Math.max(servedLines.length, installedLines.length);
  const changed: number[] = [];
  for (let index = 0; index < count; index++) {
    if (servedLines[index] !== installedLines[index]) changed.push(index + 1);
  }
  return changed;
}

function assertAliasTransform(
  engine: Engine,
  aliases: ConsumerAliases,
  served: string,
  installed: string,
  file: ComparedFile,
): number[] {
  expect(served.length, `${engine} ${file.item} served`).toBeGreaterThan(0);
  expect(installed.length, `${engine} ${file.item} installed`).toBeGreaterThan(0);
  expect(file.specifiers, `${engine} ${file.item} specifiers`).toHaveLength(file.changed.length);
  const numbers = changedLineNumbers(served, installed);
  expect(numbers, `${engine} ${file.item} changed lines`).toEqual([...file.changed]);
  const servedLines = served.split('\n');
  const installedLines = installed.split('\n');
  for (let index = 0; index < numbers.length; index++) {
    const lineNo = numbers[index] ?? 0;
    const servedLine = servedLines[lineNo - 1] ?? '';
    const installedLine = installedLines[lineNo - 1] ?? '';
    expect(servedLine, `${engine} ${file.item} line ${lineNo}`).toContain(`@/registry/${engine}/`);
    expect(installedLine, `${engine} ${file.item} line ${lineNo}`).toContain(
      file.specifiers[index] ?? '',
    );
    expect(mapRegistryLine(servedLine, engine, aliases), `${engine} line ${lineNo}`).toBe(
      installedLine,
    );
  }
  const mapped = mapServedContent(served, engine, aliases);
  expect(mapped, `${engine} ${file.item} mapped bytes`).toBe(installed);
  expect(sha256(mapped), `${engine} ${file.item} sha256`).toBe(sha256(installed));
  expect(installed.includes('@/registry/'), `${engine} ${file.item} registry prefix`).toBe(false);
  return numbers;
}

async function fetchServedContent(
  request: APIRequestContext,
  engine: Engine,
  item: string,
): Promise<string> {
  const url = `https://rnraielements.com/r/${engine}/${item}.json`;
  const response = await request.get(url, { maxRedirects: 0 });
  expect(response.status(), url).toBe(200);
  const parsed = JSON.parse(await response.text()) as { files?: { content?: unknown }[] };
  const content = parsed.files?.[0]?.content;
  if (typeof content !== 'string') throw new Error(`${url} files[0].content is missing`);
  return content;
}

function consumerTypescriptVersion(root: string): string {
  const pkgPath = join(root, 'node_modules', 'typescript', 'package.json');
  const parsed = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: unknown };
  return typeof parsed.version === 'string' ? parsed.version : '';
}

test('FLOW-DELIV-03-live-registry-round-trip APX-041-AC-3-template-allowlist', () => {
  test.setTimeout(60_000);
  const owned: HeldRoot[] = [];
  try {
    for (const engine of CONSUMER_ENGINES) {
      const allow = allowlistFromGit(engine).sort();
      const copied = [...TEMPLATE_FILES[engine]].sort();
      expect(copied, `${engine} allowlist`).toEqual(allow);
      expect(copied, `${engine} app/index.tsx`).not.toContain('app/index.tsx');
      expect(allow, `${engine} count`).toHaveLength(engine === 'nativewind' ? 12 : 10);
      const held = createHeldRoot(`allowlist-${engine}`);
      owned.push(held);
      assertConsumerRoot(held.root);
    }
  } finally {
    for (const held of owned) releaseHeld(held);
  }
});

test('FLOW-DELIV-03-live-registry-round-trip APX-041-AC-5-install-failure-not-retried', () => {
  test.setTimeout(60_000);
  const owned: HeldRoot[] = [];
  const makeProbe = (): HeldRoot => {
    const held = createHeldRoot('probe');
    owned.push(held);
    writeFileSync(join(held.root, 'package.json'), ABSENT_PACKAGE_JSON);
    return held;
  };
  const first = makeProbe();
  try {
    const phase = installPhase(first.root, () => makeProbe().root, PROBE_INSTALL_TIMEOUT_MS);
    expect(phase.exit, phase.output.slice(-800)).not.toBe(0);
    expect(phase.output).toContain('ERR_PNPM');
    expect(phase.attempts).toBe(1);
    expect(phase.retried).toBe(false);
  } finally {
    for (const held of owned) releaseHeld(held);
  }
});

test.describe('FLOW-DELIV-03-live-registry-round-trip', () => {
  test.describe.configure({ mode: 'serial', timeout: 50 * 60_000 });

  test.beforeAll(() => {
    test.setTimeout(50 * 60_000);
    assertNodeEnvCleared();
    installProof.cliVersion = resolveCliVersion();
    console.log(`APX-041 resolved @latest CLI version ${installProof.cliVersion}`);
    for (const engine of CONSUMER_ENGINES) {
      preparedConsumers.set(engine, prepareEngine(engine));
    }
  });

  test.afterAll(() => {
    releaseAllHeld();
  });

  test('FLOW-DELIV-03-live-registry-round-trip APX-041-AC-1-cli-add', () => {
    expect(installProof.cliVersion).toMatch(/^\d+\.\d+\.\d+$/);
    console.log(`APX-041 resolved @latest CLI version ${installProof.cliVersion}`);
    for (const engine of CONSUMER_ENGINES) {
      const row = requirePrepared(engine);
      const literal = cliAddCommand(engine);
      assertConsumerRoot(row.held.root);
      expect(row.cliCommand).toBe(literal);
      expect(row.cliCommand).not.toContain('--yes');
      expect(row.cliCommand).not.toContain('--overwrite');
      expect(row.installExit, `${engine} pnpm install`).toBe(0);
      expect(row.installAttempts, `${engine} pnpm attempts`).toBe(row.installRetried ? 2 : 1);
      expect(row.expoExit, row.expoOutput.slice(-800)).toBe(0);
      expect(row.componentsBefore, `${engine} components before add`).toBe(false);
      expect(row.cliExit, row.cliOutput.slice(-800)).toBe(0);
      expect(row.created, `${engine} created files`).toEqual(EXPECTED_CREATED);
      for (const rel of EXPECTED_CREATED) assertCreatedFile(row.held.root, rel);
    }
  });

  test('FLOW-DELIV-03-live-registry-round-trip APX-041-AC-2-alias-transform', async ({
    request,
  }) => {
    for (const engine of CONSUMER_ENGINES) {
      const row = requirePrepared(engine);
      const aliases = readAliases(row.held.root);
      expect(aliases.ui, `${engine} aliases.ui`).toBe(EXPECTED_ALIASES_UI);
      expect(aliases.utils, `${engine} aliases.utils`).toBe(EXPECTED_ALIASES_UTILS);
      const changed: AliasChangedLines = { conversation: [], empty: [] };
      for (const file of COMPARED_FILES) {
        const served = await fetchServedContent(request, engine, file.item);
        const installed = readFileSync(join(row.held.root, file.installedPath), 'utf8');
        const numbers = assertAliasTransform(engine, aliases, served, installed, file);
        if (file.item === 'conversation') changed.conversation = numbers;
        if (file.item === 'empty') changed.empty = numbers;
      }
      installProof.changedLines[engine] = changed;
      console.log(`APX-041 ${engine} changed_lines ${JSON.stringify(changed)}`);
    }
  });

  test('FLOW-DELIV-03-live-registry-round-trip APX-041-AC-4-consumer-compiles', () => {
    for (const engine of CONSUMER_ENGINES) {
      const row = requirePrepared(engine);
      assertNodeEnvCleared();
      assertRootPresent(row.held.root);
      const compiled = compileConsumer(row.held.root);
      installProof.tscExits[engine] = compiled.exit;
      expect(compiled.command).toBe('pnpm exec tsc --noEmit');
      expect(compiled.cwd).toBe(row.held.root);
      expect(compiled.cwd.startsWith(HELPER_REPO_ROOT)).toBe(false);
      expect(compiled.exit, compiled.output.slice(-800)).toBe(0);
      expect(compiled.output.includes('TS2307')).toBe(false);
      expect(consumerTypescriptVersion(row.held.root)).toMatch(/^6\.0\.\d+$/);
      console.log(`APX-041 ${engine} tsc_exit ${compiled.exit}`);
    }
  });
});
