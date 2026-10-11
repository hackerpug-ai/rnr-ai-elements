/**
 * APX-025 — a merged registry edit, its ci push run, and the live apex.
 * Observes git, gh, and https://rnraielements.com. Never pushes, merges, or
 * dispatches a workflow. Writes run.json only after the three hashes match.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type APIRequestContext, type APIResponse, expect, test } from '@playwright/test';
import { downloadArtifact, jobs, type WorkflowJob } from './support/github-run.ts';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const APEX = 'https://rnraielements.com';
const NATIVEWIND_CONVERSATION = '/r/nativewind/conversation.json';
const UNIWIND_CONVERSATION = '/r/uniwind/conversation.json';
const EVIDENCE_DIR = join(
  REPO_ROOT,
  'tests/sprint-07-deploy-live-at-apex/evidence/journeys-docs-delivery-arc',
);
const REGISTRY_JSON = /^public\/r\/(nativewind|uniwind)\/[^/]+\.json$/;
const NATIVEWIND_ITEM = /^public\/r\/nativewind\/([^/]+)\.json$/;
const SHA40 = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const TTL_MS = (300 + 60) * 1000;
const POLL_SLICE_MS = 1_000;
const MAX_BUFFER = 64 * 1024 * 1024;

type ListedRun = {
  id: number;
  event: string;
  headSha: string;
  headBranch: string;
  status: string;
  conclusion: string | null;
};

type ArcRun = {
  id: number;
  deploy: WorkflowJob;
};

type ArcReady = { ok: true; paths: string[]; run: ArcRun } | { ok: false; error: string };

type LiveObservation = {
  status: number;
  contentType: string;
  cacheControl: string | null;
  hash: string;
  body: Buffer;
};

type LiveHit = LiveObservation & { attempts: number };

type JourneyRecord = {
  ARC_SHA: string;
  run_id: number;
  artifact_hash: string;
  live_hash: string;
  deploy_completed_at: string;
  seconds_until_live_bytes_matched: number;
};

function redact(text: string): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) return text;
  return text.split(token).join('[redacted]');
}

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function spawnText(
  command: string,
  args: string[],
): { status: number; stdout: string; stderr: string } {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  if (result.error) {
    throw new Error(redact(`${command} failed to spawn: ${result.error.message}`));
  }
  return {
    status: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function commandText(command: string, args: string[]): string {
  const result = spawnText(command, args);
  if (result.status !== 0) {
    const detail = redact(`${result.stderr}\n${result.stdout}`.trim());
    throw new Error(`${command} ${args[0] ?? 'command'} failed (${result.status}): ${detail}`);
  }
  return result.stdout;
}

function gitShow(sha: string, path: string): Buffer {
  const result = spawnSync('git', ['show', `${sha}:${path}`], {
    cwd: REPO_ROOT,
    maxBuffer: MAX_BUFFER,
  });
  if (result.error) throw new Error(redact(`git show failed to spawn: ${result.error.message}`));
  if ((result.status ?? -1) !== 0) {
    const detail = redact(result.stderr?.toString('utf8').trim() ?? '');
    throw new Error(`git show ${sha}:${path} failed (${result.status ?? -1}): ${detail}`);
  }
  return result.stdout;
}

/** Full SHA for a commit-ish. Throws naming ARC_SHA when the ref is missing. */
function resolveArcRef(ref: string | undefined): string {
  if (ref == null || ref.trim() === '') throw new Error('ARC_SHA is unset');
  const result = spawnText('git', ['rev-parse', '--verify', `${ref}^{commit}`]);
  if (result.status !== 0) {
    const detail = redact(`${result.stderr}\n${result.stdout}`.trim());
    throw new Error(`ARC_SHA ref ${ref} does not resolve${detail ? `: ${detail}` : ''}`);
  }
  const sha = result.stdout.trim();
  if (!SHA40.test(sha)) {
    throw new Error(`ARC_SHA ref ${ref} resolved to ${sha || '(empty)'}, not 40 hex characters`);
  }
  return sha;
}

function changedPaths(sha: string): string[] {
  const text = commandText('git', [
    'diff-tree',
    '--no-commit-id',
    '--name-only',
    '-r',
    '--root',
    sha,
  ]);
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Registry JSON paths this commit changed. Throws when there are none. */
function guardArcSha(sha: string): string[] {
  const paths = changedPaths(sha).filter((path) => REGISTRY_JSON.test(path));
  if (paths.length === 0) throw new Error(`ARC_SHA ${sha} changed no public/r JSON`);
  return paths;
}

function guardArcInput(env: NodeJS.ProcessEnv): { sha: string; paths: string[] } {
  const sha = resolveArcRef(env.ARC_SHA);
  return { sha, paths: guardArcSha(sha) };
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} was missing`);
  return value;
}

function parseListedRun(value: unknown): ListedRun {
  if (!value || typeof value !== 'object') throw new Error('push run was not an object');
  const row = value as Record<string, unknown>;
  const id = row.databaseId;
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new Error('push run is missing a run id');
  }
  const conclusion = row.conclusion;
  return {
    id,
    event: requireString(row.event, `run ${id} event`),
    headSha: requireString(row.headSha, `run ${id} headSha`),
    headBranch: requireString(row.headBranch, `run ${id} headBranch`),
    status: requireString(row.status, `run ${id} status`),
    conclusion: typeof conclusion === 'string' ? conclusion : null,
  };
}

function acceptPushRun(run: ListedRun, sha: string): ListedRun {
  if (run.event !== 'push') throw new Error(`run ${run.id} event is ${run.event}, not push`);
  if (run.headSha !== sha) throw new Error(`run ${run.id} headSha is ${run.headSha}, not ${sha}`);
  return run;
}

function listPushRuns(sha: string): ListedRun[] {
  const payload = JSON.parse(
    commandText('gh', [
      'run',
      'list',
      '--workflow',
      'ci.yml',
      '--event',
      'push',
      '--commit',
      sha,
      '--json',
      'databaseId,headSha,event,headBranch,status,conclusion',
    ]),
  ) as unknown;
  if (!Array.isArray(payload)) throw new Error(`push run list for ${sha} was not an array`);
  return payload.map((row) => acceptPushRun(parseListedRun(row), sha));
}

function requireDeployJob(sha: string, runId: number, graph: WorkflowJob[]): WorkflowJob {
  const deploy = graph.find((job) => job.name === 'deploy');
  if (!deploy) throw new Error(`no ci push run has a deploy job for ${sha} (run ${runId})`);
  if (deploy.status !== 'completed' || deploy.conclusion !== 'success') {
    throw new Error(
      `deploy job ${deploy.id} on run ${runId} is ${deploy.status}/${deploy.conclusion ?? 'null'}`,
    );
  }
  return deploy;
}

/** The ci push run for this SHA, which must contain a successful deploy job. */
function runGraphGate(sha: string): ArcRun {
  const runs = listPushRuns(sha);
  const run = runs[0];
  if (!run) throw new Error(`no push run for ${sha}`);
  return { id: run.id, deploy: requireDeployJob(sha, run.id, jobs(run.id)) };
}

function arcReadiness(sha: string): ArcReady {
  const failures: string[] = [];
  let paths: string[] | undefined;
  let run: ArcRun | undefined;
  try {
    paths = guardArcSha(sha);
  } catch (error) {
    failures.push(errMessage(error));
  }
  try {
    run = runGraphGate(sha);
  } catch (error) {
    failures.push(errMessage(error));
  }
  if (failures.length > 0 || !paths || !run) {
    return { ok: false, error: failures.join('; ') || `ARC_SHA ${sha} is not delivered` };
  }
  return { ok: true, paths, run };
}

function nativewindItem(paths: readonly string[]): string {
  const names: string[] = [];
  for (const path of paths) {
    const match = NATIVEWIND_ITEM.exec(path);
    if (match?.[1]) names.push(match[1]);
  }
  names.sort();
  if (names.includes('conversation')) return 'conversation';
  const first = names[0];
  if (!first) throw new Error('commit changed no public/r/nativewind JSON');
  return first;
}

function artifactItem(dir: string, item: string): string {
  const relative = join('r', 'nativewind', `${item}.json`);
  const path = join(dir, relative);
  if (!existsSync(path)) throw new Error(`docs-dist is missing ${relative}`);
  return path;
}

function liveUrl(path: string): string {
  return `${APEX}${path}`;
}

function contentTypeOf(response: APIResponse): string {
  return response.headers()['content-type'] ?? '';
}

function singleCacheControl(response: APIResponse): string | null {
  const values = response
    .headersArray()
    .filter((header) => header.name.toLowerCase() === 'cache-control')
    .map((header) => header.value);
  if (values.length !== 1) return null;
  return values[0] ?? null;
}

async function observeLive(request: APIRequestContext, path: string): Promise<LiveObservation> {
  const response = await request.get(liveUrl(path), { maxRedirects: 0, timeout: 20_000 });
  const body = Buffer.from(await response.body());
  return {
    status: response.status(),
    contentType: contentTypeOf(response),
    cacheControl: singleCacheControl(response),
    hash: sha256(body),
    body,
  };
}

function liveBytesMatch(observed: LiveObservation, expectedHash: string): boolean {
  return (
    observed.status === 200 &&
    observed.contentType.startsWith('application/json') &&
    observed.body.length > 0 &&
    observed.hash === expectedHash
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Fetch until the body hash matches, or the window elapses.
 * A mismatch names both sha256 values. The caller supplies the window.
 */
async function pollLiveForHash(
  request: APIRequestContext,
  path: string,
  expectedHash: string,
  windowMs: number,
): Promise<LiveHit> {
  const started = Date.now();
  let attempts = 0;
  let lastHash = '';
  while (true) {
    attempts += 1;
    const observed = await observeLive(request, path);
    lastHash = observed.hash;
    if (liveBytesMatch(observed, expectedHash)) return { ...observed, attempts };
    const elapsed = Date.now() - started;
    if (elapsed >= windowMs && attempts >= 2) {
      throw new Error(
        `live bytes did not match after ${windowMs} ms and ${attempts} attempts: expected sha256 ${expectedHash} actual sha256 ${lastHash}`,
      );
    }
    const remaining = windowMs - elapsed;
    if (remaining > 0) await delay(Math.min(POLL_SLICE_MS, remaining));
  }
}

function compareRegistryBytes(left: Buffer, right: Buffer): { left: string; right: string } {
  const leftHash = sha256(left);
  const rightHash = sha256(right);
  if (leftHash !== rightHash) {
    throw new Error(`registry bytes differ: sha256 ${leftHash} != sha256 ${rightHash}`);
  }
  return { left: leftHash, right: rightHash };
}

function remainingWindowMs(completedAt: string): number {
  const completed = Date.parse(completedAt);
  if (Number.isNaN(completed)) {
    throw new Error(`deploy completed_at ${completedAt} is not a timestamp`);
  }
  return Math.max(0, completed + TTL_MS - Date.now());
}

function secondsUntilMatch(completedAt: string, matchedAt: number): number {
  const completed = Date.parse(completedAt);
  if (Number.isNaN(completed)) {
    throw new Error(`deploy completed_at ${completedAt} is not a timestamp`);
  }
  const seconds = (matchedAt - completed) / 1000;
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > TTL_MS / 1000) {
    throw new Error(
      `live bytes matched ${seconds}s after deploy completed_at ${completedAt}, outside the 360s window`,
    );
  }
  return Number(seconds.toFixed(3));
}

function assertRegistryCache(cacheControl: string | null): void {
  if (cacheControl !== 'public, max-age=300') {
    throw new Error(
      `cache-control: expected "public, max-age=300", got "${cacheControl ?? '(missing)'}"`,
    );
  }
}

function writeRunJson(record: JourneyRecord): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const body = `${JSON.stringify(record, null, 2)}\n`;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (token && body.includes(token)) {
    throw new Error('refusing to write run.json because it contains CLOUDFLARE_API_TOKEN');
  }
  writeFileSync(join(EVIDENCE_DIR, 'run.json'), body);
}

async function proveHashes(
  request: APIRequestContext,
  sha: string,
  paths: readonly string[],
  run: ArcRun,
): Promise<void> {
  const item = nativewindItem(paths);
  const gitBytes = gitShow(sha, `public/r/nativewind/${item}.json`);
  const artifactBytes = readFileSync(artifactItem(downloadArtifact(run.id, 'docs-dist'), item));
  const compared = compareRegistryBytes(gitBytes, artifactBytes);
  const live = await pollLiveForHash(
    request,
    `/r/nativewind/${item}.json`,
    compared.left,
    remainingWindowMs(run.deploy.completed_at),
  );
  const matchedAt = Date.now();
  if (live.hash !== compared.right) {
    throw new Error(`live sha256 ${live.hash} != artifact sha256 ${compared.right}`);
  }
  assertRegistryCache(live.cacheControl);
  writeRunJson({
    ARC_SHA: sha,
    run_id: run.id,
    artifact_hash: compared.left,
    live_hash: live.hash,
    deploy_completed_at: run.deploy.completed_at,
    seconds_until_live_bytes_matched: secondsUntilMatch(run.deploy.completed_at, matchedAt),
  });
}

function thrownMessage(fn: () => unknown): string {
  try {
    fn();
  } catch (error) {
    return errMessage(error);
  }
  throw new Error('expected a throw and the call returned');
}

function latestRegistryCommit(): string {
  const sha = commandText('git', ['log', '-1', '--format=%H', '--', 'public/r/nativewind']).trim();
  if (!SHA40.test(sha)) throw new Error(`registry commit ${sha || '(empty)'} is not 40 hex`);
  return sha;
}

function commitWithoutRegistryJson(): string {
  const log = commandText('git', ['log', '-n', '50', '--format=%H']);
  for (const sha of log
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)) {
    const hit = changedPaths(sha).some((path) => path.startsWith('public/r'));
    if (!hit) return sha;
  }
  throw new Error('no commit in the last 50 changed zero public/r paths');
}

function completedPullRequestHeads(): string[] {
  const payload = JSON.parse(
    commandText('gh', [
      'run',
      'list',
      '--workflow',
      'ci.yml',
      '--event',
      'pull_request',
      '--status',
      'completed',
      '--limit',
      '20',
      '--json',
      'headSha',
    ]),
  ) as unknown;
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('no completed pull_request ci run');
  }
  const heads: string[] = [];
  for (const row of payload) {
    if (!row || typeof row !== 'object') continue;
    const sha = (row as { headSha?: unknown }).headSha;
    if (typeof sha === 'string' && SHA40.test(sha)) heads.push(sha);
  }
  if (heads.length === 0) throw new Error('completed pull_request runs had no head SHA');
  return heads;
}

function pullRequestHeadWithoutPushRun(): string {
  for (const sha of completedPullRequestHeads()) {
    if (listPushRuns(sha).length === 0) return sha;
  }
  throw new Error('every recent pull_request head has a push run');
}

function hashesIn(message: string): string[] {
  return message.match(/[0-9a-f]{64}/g) ?? [];
}

test('APX-025-arc-input-guard', () => {
  const paths = guardArcSha(latestRegistryCommit());
  expect(paths.length).toBeGreaterThanOrEqual(1);
  for (const path of paths) expect(path).toMatch(REGISTRY_JSON);

  const independent = commandText('git', ['rev-parse', 'HEAD']).trim();
  const resolved = resolveArcRef('HEAD');
  expect(resolved).toBe(independent);
  expect(resolved).toMatch(SHA40);

  const missing = thrownMessage(() => resolveArcRef('refs/heads/apx-025-no-such-ref'));
  expect(missing).toContain('apx-025-no-such-ref');

  const plain = thrownMessage(() => guardArcSha(commitWithoutRegistryJson()));
  expect(plain).toContain('changed no public/r JSON');

  const saved = process.env.ARC_SHA;
  delete process.env.ARC_SHA;
  try {
    const unset = thrownMessage(() => guardArcInput(process.env));
    expect(unset).toContain('ARC_SHA');
  } finally {
    if (saved === undefined) delete process.env.ARC_SHA;
    else process.env.ARC_SHA = saved;
  }
});

test('APX-025-poll-matches-live-bytes', async ({ request }) => {
  test.setTimeout(120_000);
  const native = await observeLive(request, NATIVEWIND_CONVERSATION);
  expect(native.body.length).toBeGreaterThan(0);
  const matched = await pollLiveForHash(request, NATIVEWIND_CONVERSATION, native.hash, 5_000);
  expect(matched.attempts).toBe(1);
  expect(matched.status).toBe(200);
  expect(matched.contentType.startsWith('application/json')).toBe(true);

  const uni = await observeLive(request, UNIWIND_CONVERSATION);
  const started = Date.now();
  let message = '';
  try {
    await pollLiveForHash(request, NATIVEWIND_CONVERSATION, uni.hash, 5_000);
  } catch (error) {
    message = errMessage(error);
  }
  expect(Date.now() - started).toBeGreaterThanOrEqual(5_000);
  expect(message).toContain(uni.hash);
  expect(message).toContain(native.hash);
  const attempts = Number(message.match(/(\d+) attempts/)?.[1] ?? '0');
  expect(attempts).toBeGreaterThanOrEqual(2);
});

test('APX-025-run-graph-rejects-commit-without-push-run', () => {
  test.setTimeout(180_000);
  const sha = pullRequestHeadWithoutPushRun();
  const message = thrownMessage(() => runGraphGate(sha));
  expect(message).toContain('no push run');
  expect(message).toContain(sha);
});

test('APX-025-hash-comparator-rejects-different-bytes', () => {
  const native = gitShow('HEAD', 'public/r/nativewind/conversation.json');
  const again = gitShow('HEAD', 'public/r/nativewind/conversation.json');
  const same = compareRegistryBytes(native, again);
  expect(same.left).toMatch(SHA256);
  expect(same.right).toBe(same.left);

  const uni = gitShow('HEAD', 'public/r/uniwind/conversation.json');
  const message = thrownMessage(() => compareRegistryBytes(native, uni));
  const hashes = hashesIn(message);
  expect(hashes.length).toBeGreaterThanOrEqual(2);
  expect(hashes[0]).not.toBe(hashes[1]);
});

test('journeys/docs-delivery-arc', async ({ request }) => {
  const sha = resolveArcRef(process.env.ARC_SHA);
  const ready = arcReadiness(sha);
  if (!ready.ok) throw new Error(ready.error);
  await proveHashes(request, sha, ready.paths, ready.run);
});
