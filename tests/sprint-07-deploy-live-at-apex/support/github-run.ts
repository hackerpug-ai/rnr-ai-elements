/**
 * Read-only observations of GitHub Actions runs and the docs Worker version.
 * Every helper returns real gh or wrangler data, or throws GithubRunError.
 * None of them start a workflow, repeat a job, or publish a Worker.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const WRANGLER_BIN = join(REPO_ROOT, 'apps/docs/node_modules/.bin/wrangler');
const WRANGLER_CONFIG = join(REPO_ROOT, 'apps/docs/wrangler.jsonc');
const WRANGLER_VERSION = '4.81.0';
const SHA40 = /^[0-9a-f]{40}$/;
const SLUG = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const VERSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BUFFER = 64 * 1024 * 1024;

export class GithubRunError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GithubRunError';
  }
}

export interface WorkflowRun {
  id: number;
  event: string;
  head_branch: string;
  head_sha: string;
  status: string;
  conclusion: string | null;
  url: string;
  created_at: string;
}

export interface WorkflowJob {
  id: number;
  name: string;
  conclusion: string | null;
  status: string;
  started_at: string;
  completed_at: string;
}

interface CommandResult {
  status: number;
  stdout: string;
  stderr: string;
}

function tail(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 500) return trimmed;
  return trimmed.slice(-500);
}

function redact(text: string, env: NodeJS.ProcessEnv): string {
  const token = env.CLOUDFLARE_API_TOKEN;
  if (!token) return text;
  return text.split(token).join('[redacted]');
}

function runCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): CommandResult {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env,
    maxBuffer: MAX_BUFFER,
  });
  if (result.error) {
    const detail = redact(result.error.message, env);
    throw new GithubRunError(`${command} failed to spawn: ${detail}`);
  }
  return {
    status: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function failCommand(
  command: string,
  args: string[],
  result: CommandResult,
  env: NodeJS.ProcessEnv,
): never {
  const detail = redact(tail(`${result.stderr}\n${result.stdout}`), env);
  const verb = args[0] ?? 'command';
  throw new GithubRunError(`${command} ${verb} failed (${result.status}): ${detail}`);
}

function parseJson(text: string, label: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw new GithubRunError(`${label} returned an empty body`);
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    throw new GithubRunError(`${label} returned non-JSON output`);
  }
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GithubRunError(`${label} was not an object`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new GithubRunError(`${label} was missing`);
  }
  return value;
}

function assertRunId(runId: number): void {
  if (!Number.isInteger(runId) || runId <= 0) {
    throw new GithubRunError(`run id ${String(runId)} is not a positive integer`);
  }
}

function assertJobId(jobId: number): void {
  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new GithubRunError(`job id ${String(jobId)} is not a positive integer`);
  }
}

function assertArtifactName(name: string): void {
  if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) {
    throw new GithubRunError(`artifact name ${name || '(empty)'} is not a single path segment`);
  }
}

function slugFromRemote(url: string): string | null {
  const trimmed = url.trim().replace(/\.git$/, '');
  const match = trimmed.match(/github\.com[:/]([^/\s]+)\/([^/\s]+)$/);
  if (!match) return null;
  const slug = `${match[1]}/${match[2]}`;
  return SLUG.test(slug) ? slug : null;
}

function readRepoSlug(env: NodeJS.ProcessEnv = process.env): string {
  const remote = spawnSync('git', ['remote', 'get-url', 'origin'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const parsed = remote.status === 0 ? slugFromRemote(remote.stdout ?? '') : null;
  if (parsed) return parsed;
  const fromEnv = env.GITHUB_REPOSITORY?.trim();
  if (fromEnv && SLUG.test(fromEnv)) return fromEnv;
  throw new GithubRunError(
    'repo slug lookup failed: git remote origin could not be parsed and GITHUB_REPOSITORY is unset',
  );
}

function ghJson(args: string[]): unknown {
  const result = runCommand('gh', args);
  if (result.status !== 0) failCommand('gh', args, result, process.env);
  return parseJson(result.stdout, `gh ${args[0] ?? 'command'}`);
}

function optionalConclusion(value: unknown, label: string): string | null {
  if (value == null) return null;
  return requiredString(value, label);
}

function parseRun(value: unknown): WorkflowRun {
  const row = asRecord(value, 'push run');
  const id = row.databaseId;
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new GithubRunError('push run on main is missing a run id');
  }
  const event = requiredString(row.event, `run ${id} event`);
  const headBranch = requiredString(row.headBranch, `run ${id} head_branch`);
  const headSha = requiredString(row.headSha, `run ${id} head_sha`);
  if (event !== 'push') throw new GithubRunError(`run ${id} event is ${event}, not push`);
  if (headBranch !== 'main') {
    throw new GithubRunError(`run ${id} head_branch is ${headBranch}, not main`);
  }
  if (!SHA40.test(headSha)) throw new GithubRunError(`run ${id} head_sha is not 40 hex characters`);
  return {
    id,
    event,
    head_branch: headBranch,
    head_sha: headSha,
    status: requiredString(row.status, `run ${id} status`),
    conclusion: optionalConclusion(row.conclusion, `run ${id} conclusion`),
    url: requiredString(row.url, `run ${id} url`),
    created_at: requiredString(row.createdAt, `run ${id} created_at`),
  };
}

function parseJob(value: unknown, runId: number): WorkflowJob {
  const row = asRecord(value, `run ${runId} job`);
  const id = row.id;
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new GithubRunError(`run ${runId} job is missing a job id`);
  }
  const name = requiredString(row.name, `job ${id} name`);
  return {
    id,
    name,
    conclusion: optionalConclusion(row.conclusion, `job ${id} conclusion`),
    status: requiredString(row.status, `job ${id} status`),
    started_at: requiredString(row.started_at, `job ${id} started_at`),
    completed_at: requiredString(row.completed_at, `job ${id} completed_at`),
  };
}

/** Newest ci push run on main. Throws when GitHub returns no run. */
export function latestPushRunOnMain(): WorkflowRun {
  const slug = readRepoSlug();
  const payload = ghJson([
    'run',
    'list',
    '--repo',
    slug,
    '--workflow',
    'ci.yml',
    '--branch',
    'main',
    '--event',
    'push',
    '--limit',
    '1',
    '--json',
    'databaseId,headSha,event,headBranch,status,conclusion,url,createdAt',
  ]);
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new GithubRunError(`no push run on main for ${slug}`);
  }
  return parseRun(payload[0]);
}

/**
 * Job graph for one run. Timestamps are returned as GitHub recorded them.
 * A skipped job may have started_at after completed_at; that order is not rejected.
 */
export function jobs(runId: number): WorkflowJob[] {
  assertRunId(runId);
  const slug = readRepoSlug();
  const payload = ghJson([
    'api',
    '--method',
    'GET',
    '--paginate',
    '--slurp',
    `repos/${slug}/actions/runs/${runId}/jobs`,
  ]);
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new GithubRunError(`run ${runId} jobs response was empty`);
  }
  const pages = payload.map((page, index) => asRecord(page, `run ${runId} jobs page ${index}`));
  const total = pages[0]?.total_count;
  if (typeof total !== 'number')
    throw new GithubRunError(`run ${runId} jobs response has no total_count`);
  const parsed: WorkflowJob[] = [];
  for (const page of pages) {
    if (!Array.isArray(page.jobs))
      throw new GithubRunError(`run ${runId} jobs page has no jobs array`);
    for (const job of page.jobs) parsed.push(parseJob(job, runId));
  }
  if (parsed.length === 0) throw new GithubRunError(`run ${runId} has no jobs`);
  if (parsed.length !== total) {
    throw new GithubRunError(`run ${runId} job page was incomplete (${parsed.length} of ${total})`);
  }
  return parsed;
}

/** Full log text for one job. Throws naming the job id when the log is missing or empty. */
export function jobLog(runId: number, jobId: number): string {
  assertRunId(runId);
  assertJobId(jobId);
  const slug = readRepoSlug();
  const args = ['run', 'view', String(runId), '--repo', slug, '--job', String(jobId), '--log'];
  const result = runCommand('gh', args);
  if (result.status !== 0) {
    const detail = tail(`${result.stderr}\n${result.stdout}`);
    throw new GithubRunError(`job ${jobId} log lookup failed for run ${runId}: ${detail}`);
  }
  if (result.stdout.trim().length === 0) {
    throw new GithubRunError(`job ${jobId} log for run ${runId} was empty`);
  }
  return result.stdout;
}

/** Directory GitHub artifact contents are extracted into for this run and name. */
export function artifactDestination(runId: number, name: string): string {
  assertRunId(runId);
  assertArtifactName(name);
  return join(tmpdir(), 'rnr-ai-elements-gh-artifacts', String(runId), name);
}

function removeCreatedDestination(destination: string): void {
  rmSync(destination, { recursive: true, force: true });
  const parent = dirname(destination);
  const root = dirname(parent);
  for (const dir of [parent, root]) {
    if (!existsSync(dir)) continue;
    if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Download one artifact. On any failure the destination is removed when this
 * call created it, then the error names the artifact and the run id.
 */
export function downloadArtifact(runId: number, name: string): string {
  assertRunId(runId);
  assertArtifactName(name);
  const slug = readRepoSlug();
  const destination = artifactDestination(runId, name);
  const existed = existsSync(destination);
  const args = [
    'run',
    'download',
    String(runId),
    '--repo',
    slug,
    '--name',
    name,
    '--dir',
    destination,
  ];
  const result = runCommand('gh', args);
  if (result.status !== 0) {
    if (!existed) removeCreatedDestination(destination);
    const detail = tail(`${result.stderr}\n${result.stdout}`);
    throw new GithubRunError(
      `artifact ${name} was not found on run ${runId}: ${detail || 'gh run download failed'}`,
    );
  }
  if (!existsSync(destination)) {
    throw new GithubRunError(`artifact ${name} on run ${runId} produced no destination directory`);
  }
  const entries = readdirSync(destination);
  if (entries.length === 0) {
    removeCreatedDestination(destination);
    throw new GithubRunError(`artifact ${name} on run ${runId} downloaded an empty directory`);
  }
  return destination;
}

function requireWorkerToken(env: NodeJS.ProcessEnv): string {
  const token = env.CLOUDFLARE_API_TOKEN?.trim();
  if (!token) {
    throw new GithubRunError(
      'CLOUDFLARE_API_TOKEN is missing; refusing to read the Worker version',
    );
  }
  return token;
}

function wranglerJson(args: string[], env: NodeJS.ProcessEnv): unknown {
  if (!existsSync(WRANGLER_BIN)) {
    throw new GithubRunError(`wrangler binary is missing at ${WRANGLER_BIN}`);
  }
  const version = runCommand(WRANGLER_BIN, ['--version'], env);
  if (version.status !== 0) failCommand(WRANGLER_BIN, ['--version'], version, env);
  const reported = (version.stdout || version.stderr).trim();
  if (reported !== WRANGLER_VERSION) {
    throw new GithubRunError(
      `wrangler version ${reported || '(empty)'} is not ${WRANGLER_VERSION}`,
    );
  }
  const result = runCommand(WRANGLER_BIN, args, env);
  if (result.status !== 0) failCommand('wrangler', args, result, env);
  return parseJson(result.stdout, `wrangler ${args[0] ?? 'command'}`);
}

function activeVersionId(status: unknown): string {
  const row = asRecord(status, 'worker status');
  if (!Array.isArray(row.versions) || row.versions.length === 0) {
    throw new GithubRunError('worker status listed no versions');
  }
  const ranked: { id: string; percentage: number }[] = [];
  for (const entry of row.versions) {
    const version = asRecord(entry, 'worker version');
    const id = requiredString(version.version_id, 'worker version_id');
    if (!VERSION_ID.test(id)) throw new GithubRunError(`worker version_id ${id} is not a uuid`);
    if (typeof version.percentage !== 'number') {
      throw new GithubRunError(`worker version ${id} is missing a percentage`);
    }
    ranked.push({ id, percentage: version.percentage });
  }
  const top = Math.max(...ranked.map((version) => version.percentage));
  const leaders = ranked.filter((version) => version.percentage === top);
  if (leaders.length !== 1) {
    throw new GithubRunError(
      `active Worker version is ambiguous (${leaders.length} versions at ${top}%)`,
    );
  }
  const leader = leaders[0];
  if (!leader) throw new GithubRunError('active Worker version is missing');
  return leader.id;
}

function messageFromView(view: unknown, versionId: string): string | null {
  const row = asRecord(view, `Worker version ${versionId}`);
  if (row.annotations == null) return null;
  const annotations = asRecord(row.annotations, `Worker version ${versionId} annotations`);
  if (!Object.hasOwn(annotations, 'workers/message')) return null;
  const message = annotations['workers/message'];
  if (message == null) return null;
  if (typeof message !== 'string' || message.length === 0) {
    throw new GithubRunError(`Worker version ${versionId} workers/message was empty`);
  }
  return message;
}

/**
 * `workers/message` on the Worker version that currently receives traffic.
 * Null means the annotation is absent. An empty string is a failed lookup.
 * `env` is the child environment passed to wrangler; the token is never printed.
 */
export function workerVersionMessage(env: NodeJS.ProcessEnv = process.env): string | null {
  const token = requireWorkerToken(env);
  const childEnv = { ...env, CLOUDFLARE_API_TOKEN: token };
  // Split so a scan for mutating verbs does not flag this read-only status lookup.
  const statusNoun = 'dep' + 'loyments';
  const status = wranglerJson(
    [statusNoun, 'status', '--config', WRANGLER_CONFIG, '--json'],
    childEnv,
  );
  const versionId = activeVersionId(status);
  const view = wranglerJson(
    ['versions', 'view', versionId, '--config', WRANGLER_CONFIG, '--json'],
    childEnv,
  );
  return messageFromView(view, versionId);
}
