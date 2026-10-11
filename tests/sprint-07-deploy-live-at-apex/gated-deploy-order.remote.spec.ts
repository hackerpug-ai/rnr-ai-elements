/**
 * APX-024 — FLOW-DELIV-02-gated-deploy-order against live GitHub, wrangler, and the apex.
 * Observe only. Run ids come from gh at runtime. Nothing here triggers a workflow or deploys.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type APIRequestContext, expect, test } from '@playwright/test';
import {
  jobLog,
  jobs,
  latestPushRunOnMain,
  type WorkflowJob,
  type WorkflowRun,
  workerVersionMessage,
} from './support/github-run.ts';
import { parseWorkflow } from './support/workflow-yaml.ts';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const EVIDENCE_DIR = join(
  REPO_ROOT,
  'tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-02-gated-deploy-order',
);
const SLUG = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA40 = /^[0-9a-f]{40}$/;
const UPSTREAM = ['registry', 'typecheck', 'lint', 'docs-build'] as const;
const DIST_LINE = /from the assets directory\s+\S+\/apps\/docs\/dist\b|\.\/dist\b/;
const UPLOAD_LINE =
  /Starting asset upload|static assets to upload|No updated asset files to upload|Uploaded \d+ of \d+ assets/;

interface OrderRun {
  event: string;
  conclusion: string | null;
}

interface ListedRun extends OrderRun {
  id: number;
  head_sha: string;
}

interface WfStep {
  name?: string;
  uses?: string;
}

interface WfJob {
  needs?: string[] | string;
  steps?: WfStep[];
}

interface DeployGate {
  needs: string[];
  steps: WfStep[];
}

interface HeaderLine {
  name: string;
  value: string;
}

interface ApexRead {
  status: number;
  headers: HeaderLine[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function rowRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${label} was not an object`);
  return value;
}

function repoSlug(): string {
  const remote = spawnSync('git', ['-C', REPO_ROOT, 'remote', 'get-url', 'origin'], {
    encoding: 'utf8',
  });
  if (remote.status !== 0) {
    throw new Error(`git remote origin failed (${remote.status ?? -1})`);
  }
  const trimmed = (remote.stdout ?? '').trim().replace(/\.git$/, '');
  const match = trimmed.match(/github\.com[:/]([^/\s]+)\/([^/\s]+)$/);
  const slug = match ? `${match[1]}/${match[2]}` : '';
  if (!SLUG.test(slug)) throw new Error('repo slug lookup failed');
  return slug;
}

function ghStdout(args: string[]): string {
  const result = spawnSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw new Error(`gh failed to spawn: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = `${result.stderr ?? ''}\n${result.stdout ?? ''}`.trim().slice(-500);
    throw new Error(`gh ${args[0] ?? 'command'} failed (${result.status}): ${detail}`);
  }
  return result.stdout ?? '';
}

function mainCiYaml(): string {
  const yaml = ghStdout([
    'api',
    '-H',
    'Accept: application/vnd.github.raw',
    `repos/${repoSlug()}/contents/.github/workflows/ci.yml?ref=main`,
  ]);
  if (yaml.trim().length === 0) throw new Error('ci.yml on main was empty');
  return yaml;
}

function listedId(row: Record<string, unknown>): number {
  const id = row.databaseId;
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new Error('gh run list row is missing a run id');
  }
  return id;
}

function listedEvent(row: Record<string, unknown>): string {
  const event = row.event;
  if (typeof event !== 'string' || event.length === 0) {
    throw new Error('gh run list row is missing event');
  }
  return event;
}

function listedConclusion(row: Record<string, unknown>): string | null {
  const conclusion = row.conclusion;
  if (conclusion == null) return null;
  if (typeof conclusion !== 'string' || conclusion.length === 0) {
    throw new Error('gh run list row conclusion was not a string');
  }
  return conclusion;
}

function listedHead(row: Record<string, unknown>): string {
  const headSha = row.headSha;
  if (typeof headSha !== 'string' || headSha.length === 0) {
    throw new Error('gh run list row is missing headSha');
  }
  return headSha;
}

function parseListed(payload: unknown): ListedRun {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('gh run list returned no ci run');
  }
  const row = rowRecord(payload[0], 'gh run list row');
  return {
    id: listedId(row),
    event: listedEvent(row),
    conclusion: listedConclusion(row),
    head_sha: listedHead(row),
  };
}

/** Latest ci run matching the live gh filters. The id is never hardcoded. */
function latestListedRun(filters: readonly string[]): ListedRun {
  const payload = JSON.parse(
    ghStdout([
      'run',
      'list',
      '--repo',
      repoSlug(),
      '--workflow',
      'ci.yml',
      ...filters,
      '--limit',
      '1',
      '--json',
      'databaseId,event,conclusion,headSha',
    ]),
  ) as unknown;
  return parseListed(payload);
}

function pushProblem(run: OrderRun): string | null {
  if (run.event === 'push') return null;
  return `event is ${run.event}, not push`;
}

function conclusionProblem(run: OrderRun): string | null {
  if (run.conclusion === 'success') return null;
  return `conclusion is ${String(run.conclusion)}, not success`;
}

function emptyJobsProblem(jobList: readonly WorkflowJob[]): string | null {
  if (jobList.length > 0) return null;
  return 'jobs list is empty';
}

function missingDeployProblem(jobList: readonly WorkflowJob[]): string | null {
  if (jobList.some((job) => job.name === 'deploy')) return null;
  return 'no deploy job';
}

function gateProblems(run: OrderRun, jobList: readonly WorkflowJob[]): string[] {
  return [
    pushProblem(run),
    conclusionProblem(run),
    emptyJobsProblem(jobList),
    missingDeployProblem(jobList),
  ].filter((problem): problem is string => problem !== null);
}

function requireDeploy(jobList: readonly WorkflowJob[]): WorkflowJob {
  const deploy = jobList.find((job) => job.name === 'deploy');
  if (!deploy) throw new Error('no deploy job');
  return deploy;
}

function needsOf(needs: string[] | string | undefined): string[] {
  if (Array.isArray(needs)) return needs;
  if (typeof needs === 'string' && needs.length > 0) return [needs];
  return [];
}

function sameMembers(actual: readonly string[], expected: readonly string[]): boolean {
  const left = [...actual].sort();
  const right = [...expected].sort();
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function assertNeeds(needs: readonly string[]): void {
  if (!sameMembers(needs, UPSTREAM)) {
    throw new Error(`needs set mismatch: ${needs.join(',') || '(empty)'}`);
  }
}

function isWrangler(step: WfStep): boolean {
  return typeof step.uses === 'string' && step.uses.startsWith('cloudflare/wrangler-action@');
}

function indexOfStep(
  steps: readonly WfStep[],
  label: string,
  match: (step: WfStep) => boolean,
): number {
  const index = steps.findIndex(match);
  if (index < 0) throw new Error(`${label} step is missing`);
  return index;
}

function assertThreeStepOrder(dist: number, edge: number, wrangler: number): void {
  if (edge !== dist + 1 || wrangler !== edge + 1) {
    throw new Error(
      `step order is not Preflight dist < Preflight edge < wrangler (3 steps), indexes ${dist},${edge},${wrangler}`,
    );
  }
}

function assertStepOrder(steps: readonly WfStep[]): void {
  const dist = indexOfStep(steps, 'Preflight dist', (step) => step.name === 'Preflight dist');
  const edge = indexOfStep(steps, 'Preflight edge', (step) => step.name === 'Preflight edge');
  const wrangler = indexOfStep(steps, 'wrangler', isWrangler);
  assertThreeStepOrder(dist, edge, wrangler);
}

function namedJob(jobList: readonly WorkflowJob[], name: string): WorkflowJob {
  const job = jobList.find((row) => row.name === name);
  if (!job) throw new Error(`missing job ${name}`);
  return job;
}

function assertSuccess(job: WorkflowJob): void {
  if (job.conclusion !== 'success') {
    throw new Error(`${job.name} conclusion is ${String(job.conclusion)}, not success`);
  }
}

function latestInstant(values: readonly string[]): string {
  let latest = values[0] ?? '';
  for (const value of values) {
    if (Date.parse(value) > Date.parse(latest)) latest = value;
  }
  return latest;
}

function assertDeployAfter(deploy: WorkflowJob, upstreams: readonly WorkflowJob[]): void {
  const latest = latestInstant(upstreams.map((job) => job.completed_at));
  const started = Date.parse(deploy.started_at);
  const finished = Date.parse(latest);
  if (Number.isNaN(started) || Number.isNaN(finished)) {
    throw new Error(`unparseable deploy timing ${deploy.started_at} or ${latest}`);
  }
  if (started < finished) {
    throw new Error(`deploy started_at ${deploy.started_at} is before ${latest}`);
  }
}

function assertUpstreams(jobList: readonly WorkflowJob[], deploy: WorkflowJob): void {
  const upstreams = UPSTREAM.map((name) => namedJob(jobList, name));
  for (const job of upstreams) assertSuccess(job);
  assertSuccess(deploy);
  assertDeployAfter(deploy, upstreams);
}

/**
 * Rejects a run that is not a push-to-main success with a deploy job.
 * One error lists every failed check, so a failed pull_request names both `push` and `conclusion`.
 */
function assertGatedDeployOrder(run: OrderRun, jobList: readonly WorkflowJob[]): void {
  const problems = gateProblems(run, jobList);
  if (problems.length > 0) throw new Error(problems.join('; '));
  assertUpstreams(jobList, requireDeploy(jobList));
}

function workflowJobs(value: unknown): Record<string, WfJob> {
  const root = rowRecord(value, 'ci.yml on main');
  const jobsBlock = root.jobs;
  if (!isRecord(jobsBlock)) throw new Error('ci.yml on main has no jobs');
  return jobsBlock as Record<string, WfJob>;
}

function readDeployGate(yaml: string): DeployGate {
  const dir = mkdtempSync(join(tmpdir(), 'apx-024-ci-'));
  const path = join(dir, 'ci.yml');
  writeFileSync(path, yaml);
  try {
    const deploy = workflowJobs(parseWorkflow(path)).deploy;
    if (!deploy) throw new Error('no deploy job in ci.yml on main');
    return { needs: needsOf(deploy.needs), steps: deploy.steps ?? [] };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function assertWorkerMessage(message: string | null, headSha: string): string {
  if (message == null || message.length === 0) throw new Error('workers/message is null');
  if (!SHA40.test(message)) throw new Error('workers/message is not 40 hex characters');
  if (message !== headSha) throw new Error('workers/message differs from head_sha');
  return message;
}

function assertNoToken(log: string): void {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (token && token.length > 0 && log.includes(token)) {
    throw new Error('deploy log contains the token value');
  }
}

/**
 * Wrangler 4.81 prints the resolved `./dist` directory and the asset upload on separate lines.
 */
function assertDeployLog(log: string): void {
  if (!DIST_LINE.test(log) || !UPLOAD_LINE.test(log)) {
    throw new Error('deploy log has no wrangler assets upload line for ./dist');
  }
  if (/Authentication error/i.test(log)) {
    throw new Error('deploy log contains a Cloudflare authentication error');
  }
  assertNoToken(log);
}

async function readApex(request: APIRequestContext): Promise<ApexRead> {
  const response = await request.get('https://rnraielements.com/');
  expect(response.url(), 'live apex response URL').toContain('rnraielements.com/');
  const status = response.status();
  const contentType = response.headers()['content-type'] ?? '';
  if (status !== 200) throw new Error(`apex status equals ${status}, expected 200`);
  if (!contentType.startsWith('text/html')) {
    throw new Error(`content-type ${contentType || '(missing)'} does not start with text/html`);
  }
  return { status, headers: response.headersArray() };
}

function receipt(
  run: WorkflowRun,
  jobList: readonly WorkflowJob[],
  versionMessage: string,
  apex: ApexRead,
) {
  return {
    run_id: run.id,
    head_sha: run.head_sha,
    jobs: jobList.map((job) => ({
      name: job.name,
      conclusion: job.conclusion,
      started_at: job.started_at,
      completed_at: job.completed_at,
    })),
    worker_message: versionMessage,
    apex: { status: apex.status, headers: apex.headers },
  };
}

function writeRunJson(body: ReturnType<typeof receipt>): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(join(EVIDENCE_DIR, 'run.json'), `${JSON.stringify(body, null, 2)}\n`);
}

function rejectedMessage(check: () => void): string {
  try {
    check();
  } catch (err) {
    if (err instanceof Error && err.message.length > 0) return err.message;
    throw new Error('order checker rejected without an error message');
  }
  throw new Error('order checker accepted a run that is not a gated deploy');
}

test('FLOW-DELIV-02-gated-deploy-order', async ({ request }) => {
  test.setTimeout(180_000);
  const run = latestPushRunOnMain();
  const jobList = jobs(run.id);
  const yaml = mainCiYaml();
  assertGatedDeployOrder(run, jobList);
  const gate = readDeployGate(yaml);
  assertNeeds(gate.needs);
  assertStepOrder(gate.steps);
  const versionMessage = assertWorkerMessage(workerVersionMessage(), run.head_sha);
  const deploy = requireDeploy(jobList);
  assertDeployLog(jobLog(run.id, deploy.id));
  const apex = await readApex(request);
  writeRunJson(receipt(run, jobList, versionMessage, apex));
});

test('APX-024-order-checker-rejects-non-deploy-runs', () => {
  test.setTimeout(180_000);
  const pullRequest = latestListedRun(['--event', 'pull_request', '--status', 'completed']);
  const failed = latestListedRun(['--status', 'failure']);
  const pullRequestJobs = jobs(pullRequest.id);
  const failedJobs = jobs(failed.id);
  const pullRequestError = rejectedMessage(() =>
    assertGatedDeployOrder(pullRequest, pullRequestJobs),
  );
  const failedError = rejectedMessage(() => assertGatedDeployOrder(failed, failedJobs));
  expect(pullRequestError).toContain('push');
  expect(failedError).toContain('conclusion');
});
