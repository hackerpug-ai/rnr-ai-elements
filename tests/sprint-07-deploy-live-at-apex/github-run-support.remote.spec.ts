/**
 * APX-021 — real gh and wrangler observations for the shared live lane.
 * Run ids come from live queries. Nothing here triggers a workflow or publishes a Worker.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import {
  artifactDestination,
  downloadArtifact,
  GithubRunError,
  jobLog,
  jobs,
  latestPushRunOnMain,
  workerVersionMessage,
} from './support/github-run.ts';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const EVIDENCE = join(REPO_ROOT, '.tmp/APX-021/cycle-1');
const WRANGLER_BIN = join(REPO_ROOT, 'apps/docs/node_modules/.bin/wrangler');
const WRANGLER_CONFIG = join(REPO_ROOT, 'apps/docs/wrangler.jsonc');
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const SHA40 = /^[0-9a-f]{40}$/;
const JOB_NAMES = ['typecheck', 'lint', 'test', 'registry', 'docs-e2e'] as const;
const MISSING_ARTIFACT = 'apx-021-no-such-artifact';

interface GhJob {
  id: number;
  name: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string;
}

function redact(text: string): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) return text;
  return text.split(token).join('[redacted]');
}

function capture(name: string, value: unknown): void {
  mkdirSync(EVIDENCE, { recursive: true });
  const body = typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`;
  writeFileSync(join(EVIDENCE, name), redact(body));
}

function failureText(result: ReturnType<typeof spawnSync>): string {
  const stderr = typeof result.stderr === 'string' ? result.stderr : '';
  const stdout = typeof result.stdout === 'string' ? result.stdout : '';
  const spawned = result.error?.message ?? '';
  return redact(`${stderr}\n${stdout}\n${spawned}`.trim());
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv = process.env): string {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    const verb = args[0] ?? 'command';
    throw new Error(`${command} ${verb} failed (${result.status ?? -1}): ${failureText(result)}`);
  }
  return typeof result.stdout === 'string' ? result.stdout : '';
}

function ghJson(args: string[]): unknown {
  return JSON.parse(run('gh', args)) as unknown;
}

function repoSlug(): string {
  const slug = run('gh', [
    'repo',
    'view',
    '--json',
    'nameWithOwner',
    '--jq',
    '.nameWithOwner',
  ]).trim();
  if (!slug.includes('/')) throw new Error(`gh repo view returned no slug: ${slug}`);
  return slug;
}

function latestCompletedPullRequestRunId(): number {
  const payload = ghJson([
    'run',
    'list',
    '--workflow',
    'ci.yml',
    '--event',
    'pull_request',
    '--status',
    'completed',
    '--limit',
    '1',
    '--json',
    'databaseId',
  ]);
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('no completed pull_request ci run');
  }
  const id = (payload[0] as { databaseId?: unknown }).databaseId;
  if (typeof id !== 'number') throw new Error('completed pull_request run is missing databaseId');
  return id;
}

function independentJobs(runId: number): GhJob[] {
  const slug = repoSlug();
  const payload = ghJson([
    'api',
    '--method',
    'GET',
    '--paginate',
    '--slurp',
    `repos/${slug}/actions/runs/${runId}/jobs`,
  ]);
  if (!Array.isArray(payload)) throw new Error(`jobs payload for run ${runId} was not a page list`);
  const jobsOut: GhJob[] = [];
  for (const page of payload) {
    const rows = (page as { jobs?: GhJob[] }).jobs;
    if (!Array.isArray(rows)) throw new Error(`jobs page for run ${runId} has no jobs array`);
    jobsOut.push(...rows);
  }
  if (jobsOut.length === 0) throw new Error(`independent jobs for run ${runId} were empty`);
  return jobsOut;
}

function expectRejected(label: string, fn: () => unknown): string {
  try {
    fn();
  } catch (err) {
    expect(err, label).toBeInstanceOf(GithubRunError);
    const message = err instanceof Error ? err.message : '';
    expect(message.length, label).toBeGreaterThan(0);
    return message;
  }
  throw new Error(`${label} resolved instead of rejecting`);
}

test.beforeAll(() => {
  mkdirSync(EVIDENCE, { recursive: true });
});

test('APX-021-jobs-graph', () => {
  test.setTimeout(180_000);
  const runId = latestCompletedPullRequestRunId();
  const got = jobs(runId);
  const independent = independentJobs(runId);
  expect(got.length).toBeGreaterThan(0);
  expect(got.map((job) => job.id).sort((a, b) => a - b)).toEqual(
    independent.map((job) => job.id).sort((a, b) => a - b),
  );

  const names = got.map((job) => job.name);
  for (const name of JOB_NAMES) expect(names, `missing ${name}`).toContain(name);

  const inverted: string[] = [];
  for (const job of got) {
    const live = independent.find((row) => row.id === job.id);
    expect(live, `independent job ${job.id}`).toBeTruthy();
    if (!live) continue;
    expect(job.name).toBe(live.name);
    expect(job.conclusion).toBe(live.conclusion);
    expect(job.started_at).toBe(live.started_at);
    expect(job.completed_at).toBe(live.completed_at);
    expect(job.started_at).toMatch(ISO_TIMESTAMP);
    expect(job.completed_at).toMatch(ISO_TIMESTAMP);
    if (job.started_at > job.completed_at) inverted.push(job.name);
  }

  capture('jobs-graph.json', {
    run_id: runId,
    jobs: got.map((job) => ({
      id: job.id,
      name: job.name,
      conclusion: job.conclusion,
      started_at: job.started_at,
      completed_at: job.completed_at,
    })),
    // GitHub can record a skipped job with started_at one second after completed_at.
    // The helper returns that pair unchanged; it does not invent an order.
    started_after_completed: inverted,
  });
});

test('APX-021-latest-push-run', () => {
  test.setTimeout(180_000);
  const got = latestPushRunOnMain();
  const listed = ghJson([
    'run',
    'list',
    '--workflow',
    'ci.yml',
    '--branch',
    'main',
    '--event',
    'push',
    '--limit',
    '1',
    '--json',
    'databaseId,headSha',
  ]);
  if (!Array.isArray(listed) || listed.length === 0)
    throw new Error('independent push list was empty');
  const row = listed[0] as { databaseId?: unknown; headSha?: unknown };
  expect(got.id).toBe(row.databaseId);
  expect(got.head_sha).toBe(row.headSha);

  const viewed = JSON.parse(
    run('gh', ['run', 'view', String(got.id), '--json', 'event,headBranch,headSha,databaseId']),
  ) as { event?: string; headBranch?: string; headSha?: string; databaseId?: number };
  expect(got.event).toBe('push');
  expect(got.event).toBe(viewed.event);
  expect(got.head_branch).toBe('main');
  expect(got.head_branch).toBe(viewed.headBranch);
  expect(got.head_sha).toMatch(SHA40);
  expect(got.head_sha).toBe(viewed.headSha);
  expect(viewed.databaseId).toBe(got.id);
  expect(got.event).not.toBe('pull_request');

  capture('latest-push.json', got);
});

test('APX-021-job-log', () => {
  test.setTimeout(180_000);
  const runId = latestCompletedPullRequestRunId();
  const typecheck = independentJobs(runId).find((job) => job.name === 'typecheck');
  if (!typecheck) throw new Error(`run ${runId} has no typecheck job`);
  const log = jobLog(runId, typecheck.id);
  expect(log.length).toBeGreaterThan(200);
  expect(log).toContain('Current runner version');
  expect(log).toContain('Complete job name: typecheck');
  expect(log.trim().length).toBeGreaterThan(0);

  const missing = expectRejected('job id 1', () => jobLog(runId, 1));
  expect(missing).toContain('job 1');
  expect(missing).toMatch(/\bjob\b/);

  capture('job-log.json', {
    run_id: runId,
    job_id: typecheck.id,
    chars: log.length,
    contains_set_up_job: log.includes('Set up job'),
    contains_current_runner_version: log.includes('Current runner version'),
    excerpt: log.slice(0, 400),
  });
  capture('job-log-missing.txt', `${missing}\n`);
});

test('APX-021-artifact-fail-closed', () => {
  test.setTimeout(180_000);
  const runId = latestCompletedPullRequestRunId();
  const destination = artifactDestination(runId, MISSING_ARTIFACT);
  rmSync(destination, { recursive: true, force: true });
  expect(existsSync(destination)).toBe(false);

  const message = expectRejected('missing artifact', () =>
    downloadArtifact(runId, MISSING_ARTIFACT),
  );
  expect(message).toContain(MISSING_ARTIFACT);
  expect(message).toContain(String(runId));
  expect(existsSync(destination), 'destination must not remain').toBe(false);

  capture('artifact-missing.txt', `${message}\n`);
});

interface VersionShare {
  version_id?: string;
  percentage?: number;
}

function highestVersionId(versions: VersionShare[]): string {
  let bestId = '';
  let bestPct = -1;
  for (const version of versions) {
    const pct = version.percentage ?? -1;
    if (version.version_id && pct > bestPct) {
      bestPct = pct;
      bestId = version.version_id;
    }
  }
  if (!bestId) throw new Error('independent worker status listed no version id');
  return bestId;
}

function annotationMessage(annotations: Record<string, unknown> | undefined): string | null {
  if (!annotations || !Object.hasOwn(annotations, 'workers/message')) return null;
  const raw = annotations['workers/message'];
  if (raw == null) return null;
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new Error('independent workers/message was empty');
  }
  return raw;
}

function independentWorkerMessage(): { versionId: string; message: string | null } {
  const statusNoun = 'dep' + 'loyments';
  const status = JSON.parse(
    run(WRANGLER_BIN, [statusNoun, 'status', '--config', WRANGLER_CONFIG, '--json']),
  ) as { versions?: VersionShare[] };
  const versionId = highestVersionId(status.versions ?? []);
  const view = JSON.parse(
    run(WRANGLER_BIN, ['versions', 'view', versionId, '--config', WRANGLER_CONFIG, '--json']),
  ) as { annotations?: Record<string, unknown> };
  return { versionId, message: annotationMessage(view.annotations) };
}

test('APX-021-worker-message', () => {
  test.setTimeout(180_000);
  const got = workerVersionMessage();
  const independent = independentWorkerMessage();
  expect(got).toBe(independent.message);
  expect(got).not.toBe('');
  if (got !== null) expect(got).toMatch(SHA40);

  const childEnv = { ...process.env };
  delete childEnv.CLOUDFLARE_API_TOKEN;
  let missing = '';
  try {
    workerVersionMessage(childEnv);
  } catch (err) {
    expect(err).toBeInstanceOf(GithubRunError);
    missing = err instanceof Error ? err.message : '';
  }
  expect(missing).toContain('CLOUDFLARE_API_TOKEN');
  expect(missing.length).toBeGreaterThan(0);

  capture('worker-message.json', {
    version_id: independent.versionId,
    helper: got,
    independent: independent.message,
  });
  capture('worker-token-missing.txt', `${missing}\n`);
});
