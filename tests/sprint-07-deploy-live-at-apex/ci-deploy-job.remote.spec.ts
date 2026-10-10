/**
 * APX-023 — the deploy job ships the docs-dist artifact docs-build uploaded.
 * Parses the real ci.yml with system Ruby, lints it with actionlint, resolves
 * pins through gh, and dry-runs the pinned wrangler. Negative copies live in
 * the OS temp dir.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { parseWorkflow, runActionlint } from './support/workflow-yaml';

const CI_YML = join(process.cwd(), '.github/workflows/ci.yml');
const WRANGLER_JSONC = join(process.cwd(), 'apps/docs/wrangler.jsonc');
const PUSH_MAIN = "github.event_name == 'push' && github.ref == 'refs/heads/main'";
const PREFLIGHT_DIST = 'pnpm exec tsx scripts/docs-deploy/preflight-dist.ts --dist apps/docs/dist';
const PREFLIGHT_EDGE =
  'pnpm exec tsx scripts/docs-deploy/preflight-edge.ts --dist apps/docs/dist --require-www-redirect';

/** A GitHub Actions expression. Built so the source is not a fake JS template. */
function actionsExpression(name: string): string {
  return `$\x7b{ ${name} }}`;
}

const TOKEN = actionsExpression('secrets.CLOUDFLARE_API_TOKEN');
const DEPLOY_COMMAND = `deploy --message ${actionsExpression('github.sha')}`;
const SMOKE_URL = 'https://rnraielements.com/r/nativewind/conversation.json';
const MESSAGE_SHA = '0123456789abcdef0123456789abcdef01234567';
const EXPECTED_NEEDS = ['registry', 'typecheck', 'lint', 'docs-build'];
const EXPECTED_ON = ['pull_request', 'push', 'workflow_call'];
const BUILD_COMMANDS = ['registry:build', 'astro build', 'e2e:docs'];
const PIN_LINE = /uses:\s+([\w.-]+\/[\w.-]+)@([0-9a-f]{40})\s+#\s*(v\d+\.\d+\.\d+)/;
const PIN_REF = /^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/;

interface CommandResult {
  status: number;
  stdout: string;
  stderr: string;
}

interface WorkflowStep {
  name?: string;
  uses?: string;
  run?: string;
  env?: Record<string, string>;
  with?: Record<string, unknown>;
}

interface WorkflowJob {
  needs?: string[];
  if?: string;
  permissions?: Record<string, string>;
  environment?: string;
  concurrency?: { group?: string; 'cancel-in-progress'?: boolean };
  steps?: WorkflowStep[];
}

interface TriggerBlock {
  workflow_call?: { inputs?: { candidate_sha?: { required?: boolean } } };
  workflow_dispatch?: unknown;
}

interface Workflow {
  on?: TriggerBlock;
  true?: TriggerBlock;
  jobs: Record<string, WorkflowJob>;
}

interface DeployPin {
  repo: string;
  sha: string;
  version: string;
}

function loadWorkflow(path: string): Workflow {
  return parseWorkflow(path) as Workflow;
}

function triggersOf(workflow: Workflow): TriggerBlock {
  const block = workflow.on ?? workflow.true;
  if (!block) throw new Error('on block is missing');
  return block;
}

function deployJob(workflow: Workflow): WorkflowJob {
  const job = workflow.jobs.deploy;
  if (!job) throw new Error('deploy job is missing');
  return job;
}

function stepsOf(job: WorkflowJob): WorkflowStep[] {
  const steps = job.steps ?? [];
  if (steps.length === 0) throw new Error('empty steps list for the deploy job');
  return steps;
}

function sameMembers(actual: readonly string[], expected: readonly string[]): boolean {
  if (actual.length !== expected.length) return false;
  const left = [...actual].sort();
  const right = [...expected].sort();
  return left.every((value, index) => value === right[index]);
}

function indexByName(steps: WorkflowStep[], name: string): number {
  const index = steps.findIndex((step) => step.name === name);
  if (index < 0) throw new Error(`${name} step is missing`);
  return index;
}

function stepByName(steps: WorkflowStep[], name: string): WorkflowStep {
  const step = steps[indexByName(steps, name)];
  if (!step) throw new Error(`${name} step is missing`);
  return step;
}

function deployLines(source: string): string[] {
  const lines = source.split('\n');
  const start = lines.indexOf('  deploy:');
  if (start < 0) throw new Error('deploy job is missing from source');
  return lines.slice(start);
}

function writeTempCopy(contents: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'apx-023-'));
  const path = join(dir, 'ci.yml');
  writeFileSync(path, contents);
  return path;
}

function withWorkflowDispatch(source: string): string {
  const lines = source.split('\n');
  const index = lines.indexOf('on:');
  if (index < 0) throw new Error('fixture setup failed: on: missing');
  lines.splice(index + 1, 0, '  workflow_dispatch:');
  return lines.join('\n');
}

function withoutWorkflowCall(source: string): string {
  const lines = source.split('\n');
  const start = lines.indexOf('  workflow_call:');
  if (start < 0) throw new Error('fixture setup failed: workflow_call not in source');
  let end = start + 1;
  while (end < lines.length && (lines[end] ?? '').startsWith(' ')) end += 1;
  return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

function withoutNamedStep(source: string, name: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.trim() === `- name: ${name}`);
  if (start < 0) throw new Error(`fixture setup failed: ${name} not in source`);
  let end = start + 1;
  while (end < lines.length && !(lines[end] ?? '').startsWith('      - ')) end += 1;
  return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

function withBrokenDeployNeeds(source: string): string {
  const needle = '    needs: [registry, typecheck, lint, docs-build]';
  if (!source.includes(needle)) throw new Error('deploy needs line missing');
  return source.replace(needle, '    needs: [no-such-job]');
}

function assertOnKeys(block: TriggerBlock): void {
  if ('workflow_dispatch' in block) {
    throw new Error('workflow_dispatch trigger is not allowed');
  }
  if (!('workflow_call' in block)) {
    throw new Error('workflow_call is required and is not an extra trigger');
  }
  const keys = Object.keys(block);
  if (!sameMembers(keys, EXPECTED_ON)) {
    throw new Error(`on keys must be pull_request, push, and workflow_call: ${keys.join(',')}`);
  }
  const required = block.workflow_call?.inputs?.candidate_sha?.required;
  if (required !== true) {
    throw new Error('workflow_call input candidate_sha must be required: true');
  }
}

function assertNeeds(job: WorkflowJob): void {
  if (!Array.isArray(job.needs) || !sameMembers(job.needs, EXPECTED_NEEDS)) {
    throw new Error(`needs set mismatch: ${JSON.stringify(job.needs)}`);
  }
}

function assertNoContinue(job: WorkflowJob): void {
  if (JSON.stringify(job).includes('continue-on-error')) {
    throw new Error('continue-on-error appears in the deploy job');
  }
}

function assertNoRemovedJobs(workflow: Workflow): void {
  if (workflow.jobs.test || workflow.jobs['docs-e2e']) {
    throw new Error('restored test job or docs-e2e job');
  }
}

/** Throws naming workflow_dispatch or workflow_call when the trigger set is wrong. */
function assertGating(path: string): void {
  const workflow = loadWorkflow(path);
  assertOnKeys(triggersOf(workflow));
  const job = deployJob(workflow);
  assertNeeds(job);
  if (job.if !== PUSH_MAIN) throw new Error(`push-to-main if is missing or weaker: ${job.if}`);
  assertNoContinue(job);
  assertNoRemovedJobs(workflow);
}

function assertPermissions(job: WorkflowJob): void {
  const permissions = job.permissions ?? {};
  const keys = Object.keys(permissions);
  if (keys.length !== 1 || permissions.contents !== 'read') {
    throw new Error(
      `permissions must be exactly contents: read, got ${JSON.stringify(permissions)}`,
    );
  }
  if (job.environment !== 'production') throw new Error('environment must be production');
  const concurrency = job.concurrency;
  const groupOk = concurrency?.group === 'docs-deploy';
  const cancelOk = concurrency?.['cancel-in-progress'] === false;
  if (!groupOk || !cancelOk) {
    throw new Error('concurrency must be docs-deploy with cancel-in-progress false');
  }
}

function assertToken(job: WorkflowJob, source: string): void {
  const steps = stepsOf(job);
  const wrangler = steps.find((step) => (step.uses ?? '').includes('cloudflare/wrangler-action@'));
  if (!wrangler) throw new Error('wrangler step is missing');
  if (wrangler.env?.CLOUDFLARE_API_TOKEN !== TOKEN) {
    throw new Error('CLOUDFLARE_API_TOKEN must be the secret expression on the wrangler step');
  }
  for (const step of steps) {
    if (step === wrangler) continue;
    if (JSON.stringify(step).includes('CLOUDFLARE_API_TOKEN')) {
      throw new Error('CLOUDFLARE_API_TOKEN appears outside the wrangler step');
    }
  }
  const lines = deployLines(source).filter((line) => line.includes('CLOUDFLARE_API_TOKEN'));
  if (lines.length !== 1 || !lines[0]?.includes(TOKEN)) {
    throw new Error('CLOUDFLARE_API_TOKEN must appear only as the wrangler step env secret');
  }
}

function wranglerIndex(steps: WorkflowStep[]): number {
  const index = steps.findIndex((step) =>
    (step.uses ?? '').startsWith('cloudflare/wrangler-action@'),
  );
  if (index < 0) throw new Error('wrangler step is missing');
  return index;
}

function smokeIndex(steps: WorkflowStep[]): number {
  const index = steps.findIndex((step) => (step.run ?? '').includes(SMOKE_URL));
  if (index < 0) throw new Error('smoke step is missing');
  return index;
}

function assertIncreasing(indexes: number[]): void {
  for (let i = 1; i < indexes.length; i += 1) {
    const previous = indexes[i - 1] ?? -1;
    const current = indexes[i] ?? -1;
    if (current <= previous) throw new Error('deploy step order is wrong');
  }
}

function assertPreflightCommands(steps: WorkflowStep[]): void {
  const dist = stepByName(steps, 'Preflight dist');
  const edge = stepByName(steps, 'Preflight edge');
  if (dist.run !== PREFLIGHT_DIST) throw new Error(`Preflight dist command mismatch: ${dist.run}`);
  if (edge.run !== PREFLIGHT_EDGE) throw new Error(`Preflight edge command mismatch: ${edge.run}`);
}

function assertWranglerStep(step: WorkflowStep): void {
  const inputs = step.with ?? {};
  if (inputs.command !== DEPLOY_COMMAND) {
    throw new Error(`wrangler command mismatch: ${String(inputs.command)}`);
  }
  if (inputs.wranglerVersion !== '4.81.0') throw new Error('wranglerVersion must be 4.81.0');
  if (inputs.workingDirectory !== 'apps/docs') {
    throw new Error('workingDirectory must be apps/docs');
  }
  if (String(inputs.command).includes('--tag')) throw new Error('--tag flag in the deploy command');
}

function assertDownload(step: WorkflowStep): void {
  if (!(step.uses ?? '').startsWith('actions/download-artifact@')) {
    throw new Error('Download docs dist does not use download-artifact');
  }
  const inputs = step.with ?? {};
  if (inputs.name !== 'docs-dist' || inputs.path !== 'apps/docs/dist') {
    throw new Error('Download docs dist name or path is wrong');
  }
}

function assertNoBuild(steps: WorkflowStep[], wranglerAt: number): void {
  for (const step of steps.slice(0, wranglerAt)) {
    const blob = `${step.run ?? ''} ${JSON.stringify(step.with ?? {})}`;
    for (const command of BUILD_COMMANDS) {
      if (blob.includes(command)) throw new Error(`${command} runs before wrangler`);
    }
  }
}

function assertDocsDistSource(workflow: Workflow, source: string): void {
  const lines = source.split('\n');
  if (lines[246] !== '      - name: Upload docs dist') {
    throw new Error('Upload docs dist is not at .github/workflows/ci.yml:247');
  }
  const docsBuild = workflow.jobs['docs-build'];
  if (!docsBuild) throw new Error('docs-build job is missing');
  const upload = stepByName(docsBuild.steps ?? [], 'Upload docs dist');
  const inputs = upload.with ?? {};
  const nameAndPath = inputs.name === 'docs-dist' && inputs.path === 'apps/docs/dist';
  if (!nameAndPath || inputs['retention-days'] !== 1) {
    throw new Error('Upload docs dist name, path, or retention-days is wrong');
  }
  if (workflow.jobs['docs-e2e']) throw new Error('docs-dist must not come from docs-e2e');
}

/** Throws naming `Preflight edge` when that step is absent or the order is wrong. */
function assertStepOrder(path: string): void {
  const source = readFileSync(path, 'utf8');
  const workflow = loadWorkflow(path);
  const steps = stepsOf(deployJob(workflow));
  const downloadAt = indexByName(steps, 'Download docs dist');
  const distAt = indexByName(steps, 'Preflight dist');
  const edgeAt = indexByName(steps, 'Preflight edge');
  const wranglerAt = wranglerIndex(steps);
  const smokeAt = smokeIndex(steps);
  assertIncreasing([downloadAt, distAt, edgeAt, wranglerAt, smokeAt]);
  assertPreflightCommands(steps);
  assertDownload(steps[downloadAt] ?? {});
  assertWranglerStep(steps[wranglerAt] ?? {});
  assertNoBuild(steps, wranglerAt);
  assertDocsDistSource(workflow, source);
}

function deployPins(source: string): DeployPin[] {
  const found: DeployPin[] = [];
  for (const line of deployLines(source)) {
    if (!line.includes('uses:')) continue;
    const match = line.match(PIN_LINE);
    if (!match?.[1] || !match[2] || !match[3]) {
      throw new Error(`deploy uses is not a pinned SHA with a version comment: ${line.trim()}`);
    }
    const ref = `${match[1]}@${match[2]}`;
    if (!PIN_REF.test(ref)) throw new Error(`pin reference is not 40 hex: ${ref}`);
    found.push({ repo: match[1], sha: match[2], version: match[3] });
  }
  if (found.length !== 5) throw new Error(`expected 5 deploy action pins, found ${found.length}`);
  return found;
}

function ghCommit(repo: string, sha: string): CommandResult {
  const result = spawnSync('gh', ['api', `repos/${repo}/commits/${sha}`, '--jq', '.sha'], {
    encoding: 'utf8',
  });
  if (result.error) throw new Error(`gh failed to spawn: ${result.error.message}`);
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function flipLastHex(sha: string): string {
  const last = sha.slice(-1);
  const flipped = last === '0' ? '1' : '0';
  return `${sha.slice(0, -1)}${flipped}`;
}

function cloudflareFreeEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith('CLOUDFLARE')) delete env[key];
  }
  return env;
}

function runCommand(command: string, args: string[]): CommandResult {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    env: cloudflareFreeEnv(),
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw new Error(`${command} failed to spawn: ${result.error.message}`);
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function pinnedWrangler(args: string[]): CommandResult {
  return runCommand('pnpm', ['--dir', 'apps/docs', 'exec', 'wrangler', ...args]);
}

function writeDryRunConfig(): string {
  const dir = mkdtempSync(join(tmpdir(), 'apx-023-wrangler-'));
  const dist = join(dir, 'dist');
  mkdirSync(dist);
  writeFileSync(join(dist, 'index.html'), '<!doctype html><title>dry-run</title>\n');
  const source = readFileSync(WRANGLER_JSONC, 'utf8');
  const needle = '"directory": "./dist"';
  if (!source.includes(needle)) throw new Error('wrangler.jsonc assets directory line missing');
  const rewritten = source.replace(needle, `"directory": ${JSON.stringify(dist)}`);
  const config = join(dir, 'wrangler.jsonc');
  writeFileSync(config, rewritten);
  return config;
}

test('APX-023-gating', () => {
  const original = readFileSync(CI_YML, 'utf8');
  assertGating(CI_YML);

  const extra = writeTempCopy(withWorkflowDispatch(original));
  expect(() => assertGating(extra)).toThrow(/workflow_dispatch/);

  const removed = writeTempCopy(withoutWorkflowCall(original));
  expect(() => assertGating(removed)).toThrow(/workflow_call/);
  expect(readFileSync(CI_YML, 'utf8')).toBe(original);
});

test('APX-023-permissions-env', () => {
  const source = readFileSync(CI_YML, 'utf8');
  const job = deployJob(loadWorkflow(CI_YML));
  assertPermissions(job);
  assertToken(job, source);
});

test('APX-023-step-order', () => {
  const original = readFileSync(CI_YML, 'utf8');
  assertStepOrder(CI_YML);
  const copy = writeTempCopy(withoutNamedStep(original, 'Preflight edge'));
  expect(() => assertStepOrder(copy)).toThrow(/Preflight edge/);
  expect(readFileSync(CI_YML, 'utf8')).toBe(original);
});

test('APX-023-pins-resolve', () => {
  const pins = deployPins(readFileSync(CI_YML, 'utf8'));
  expect(pins).toHaveLength(5);
  for (const pin of pins) {
    expect(pin.version.startsWith('v')).toBe(true);
    const lookedUp = ghCommit(pin.repo, pin.sha);
    const text = `${lookedUp.stdout}\n${lookedUp.stderr}`;
    expect(lookedUp.status, text).toBe(0);
    expect(lookedUp.stdout.trim()).toBe(pin.sha);
  }

  const wrangler = pins.find((pin) => pin.repo === 'cloudflare/wrangler-action');
  if (!wrangler) throw new Error('wrangler-action pin is missing');
  const flipped = flipLastHex(wrangler.sha);
  const rejected = ghCommit(wrangler.repo, flipped);
  const rejectedText = `${rejected.stdout}\n${rejected.stderr}`;
  expect(rejected.status, rejectedText).not.toBe(0);
  expect(rejectedText).toMatch(/404|422/);
  expect(rejected.stdout.trim()).not.toBe(flipped);
  expect(rejected.stdout).not.toContain('"commit"');
});

test('APX-023-actionlint', () => {
  const original = readFileSync(CI_YML, 'utf8');
  const real = runActionlint(CI_YML);
  expect(real.status, `${real.stdout}\n${real.stderr}`).toBe(0);
  expect(`${real.stdout}${real.stderr}`.trim()).toBe('');

  const brokenPath = writeTempCopy(withBrokenDeployNeeds(original));
  const broken = runActionlint(brokenPath);
  expect(broken.status).not.toBe(0);
  expect(`${broken.stdout}\n${broken.stderr}`).toContain('no-such-job');
  expect(readFileSync(CI_YML, 'utf8')).toBe(original);
});

test('APX-023-wrangler-accepts-message', () => {
  const version = pinnedWrangler(['--version']);
  expect(version.status, `${version.stdout}\n${version.stderr}`).toBe(0);
  expect(`${version.stdout}\n${version.stderr}`).toContain('4.81.0');

  const help = pinnedWrangler(['deploy', '--help']);
  const helpText = `${help.stdout}\n${help.stderr}`;
  expect(help.status, helpText).toBe(0);
  expect(helpText).toContain('--message');
  expect(helpText.trim().length).toBeGreaterThan(0);

  const config = writeDryRunConfig();
  const dry = pinnedWrangler(['deploy', '--dry-run', '--message', MESSAGE_SHA, '--config', config]);
  const dryText = `${dry.stdout}\n${dry.stderr}`;
  expect(dry.status, dryText).toBe(0);
  expect(dryText).toContain('--dry-run: exiting now.');
  expect(dryText).not.toMatch(/authentication/i);
  expect(dryText).not.toContain('api.cloudflare.com');

  const unknown = pinnedWrangler([
    'deploy',
    '--dry-run',
    '--message',
    MESSAGE_SHA,
    '--config',
    config,
    '--no-such-flag',
  ]);
  expect(unknown.status, `${unknown.stdout}\n${unknown.stderr}`).not.toBe(0);
});
