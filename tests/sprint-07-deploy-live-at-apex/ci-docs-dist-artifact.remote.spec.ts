/**
 * APX-022 — docs-build publishes apps/docs/dist as the run-bound docs-dist
 * artifact. Parses the real ci.yml with system Ruby and checks the pin
 * against the GitHub API. Negative copies live in the OS temp dir.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { parseWorkflow, runActionlint } from './support/workflow-yaml';

const CI_YML = join(process.cwd(), '.github/workflows/ci.yml');
const UPLOAD_NAME = 'Upload docs dist';
const PINNED_USES = /^actions\/upload-artifact@[0-9a-f]{40}$/;
const VERSION_COMMENT = /# v\d+\.\d+\.\d+/;
const EVIDENCE_USES = 'actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02';
const JOB_IDS = ['typecheck', 'lint', 'registry', 'docs-build'];

interface WorkflowStep {
  name?: string;
  uses?: string;
  run?: string;
  if?: string;
  with?: Record<string, unknown>;
}

interface WorkflowJob {
  needs?: string[];
  steps: WorkflowStep[];
}

interface Workflow {
  jobs: Record<string, WorkflowJob>;
}

function loadWorkflow(path: string): Workflow {
  return parseWorkflow(path) as Workflow;
}

function docsBuild(workflow: Workflow): WorkflowJob {
  const job = workflow.jobs['docs-build'];
  if (!job) throw new Error('docs-build job is missing');
  return job;
}

function stepIndex(job: WorkflowJob, name: string): number {
  return job.steps.findIndex((step) => step.name === name);
}

function uploadUsesLine(source: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.trim() === `- name: ${UPLOAD_NAME}`);
  if (start < 0) throw new Error(`${UPLOAD_NAME} step is missing`);
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (line.startsWith('      - ')) break;
    if (line.includes('uses:')) return line;
  }
  throw new Error(`${UPLOAD_NAME} uses line is missing`);
}

function requireStep(job: WorkflowJob, name: string): { step: WorkflowStep; index: number } {
  const index = stepIndex(job, name);
  if (index < 0) throw new Error(`${name} step is missing`);
  const step = job.steps[index];
  if (!step) throw new Error(`${name} step is missing`);
  return { step, index };
}

function assertAfterDocsBuild(job: WorkflowJob, uploadAt: number): void {
  const buildAt = stepIndex(job, 'Docs build');
  if (uploadAt <= buildAt) throw new Error(`${UPLOAD_NAME} must come after Docs build`);
}

function assertNoIf(step: WorkflowStep): void {
  if (Object.hasOwn(step, 'if')) throw new Error(`${UPLOAD_NAME} must not have an if key`);
}

function assertPinnedUses(step: WorkflowStep, path: string): void {
  const uses = step.uses ?? '';
  if (!PINNED_USES.test(uses)) {
    throw new Error(`${UPLOAD_NAME} uses is not a 40-hex pin: ${uses}`);
  }
  const usesLine = uploadUsesLine(readFileSync(path, 'utf8'));
  if (!VERSION_COMMENT.test(usesLine)) {
    throw new Error(`${UPLOAD_NAME} uses line is missing a # vX.Y.Z comment`);
  }
  if (usesLine.includes('@v')) throw new Error(`${UPLOAD_NAME} uses a floating @v tag`);
}

function assertUploadInputs(step: WorkflowStep): void {
  const inputs = step.with ?? {};
  const nameAndPath = inputs.name === 'docs-dist' && inputs.path === 'apps/docs/dist';
  if (!nameAndPath) throw new Error(`${UPLOAD_NAME} name or path is wrong`);
  const retention = inputs['retention-days'] === 1 && inputs['if-no-files-found'] === 'error';
  if (!retention) throw new Error(`${UPLOAD_NAME} retention or if-no-files-found is wrong`);
}

/** Throws an error naming `Upload docs dist` when that step is absent or wrong. */
function assertUploadDocsDist(path: string): void {
  const job = docsBuild(loadWorkflow(path));
  const upload = requireStep(job, UPLOAD_NAME);
  assertAfterDocsBuild(job, upload.index);
  assertNoIf(upload.step);
  assertPinnedUses(upload.step, path);
  assertUploadInputs(upload.step);
}

function withoutUploadStep(source: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.trim() === `- name: ${UPLOAD_NAME}`);
  if (start < 0) throw new Error(`fixture setup failed: ${UPLOAD_NAME} not in source`);
  let end = start + 1;
  while (end < lines.length && !(lines[end] ?? '').startsWith('      - ')) end += 1;
  return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

function withBrokenNeeds(source: string): string {
  const needle = '    needs: [typecheck, lint, registry]';
  if (!source.includes(needle)) throw new Error('docs-build needs line missing');
  return source.replace(needle, '    needs: [no-such-job]');
}

function writeTempCopy(name: string, contents: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'apx-022-'));
  const path = join(dir, name);
  writeFileSync(path, contents);
  return path;
}

function jobsWithDocsDist(workflow: Workflow): string[] {
  return Object.entries(workflow.jobs)
    .filter(([, job]) => job.steps.some((step) => JSON.stringify(step).includes('docs-dist')))
    .map(([id]) => id);
}

function ghApi(endpoint: string): { status: number; stdout: string; stderr: string } {
  const result = spawnSync('gh', ['api', endpoint, '--jq', '.sha'], { encoding: 'utf8' });
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
  return sha.slice(0, -1) + flipped;
}

test('APX-022-artifact-step', () => {
  const original = readFileSync(CI_YML, 'utf8');
  assertUploadDocsDist(CI_YML);
  const copy = writeTempCopy('ci.yml', withoutUploadStep(original));
  expect(() => assertUploadDocsDist(copy)).toThrow(/Upload docs dist/);
  expect(readFileSync(CI_YML, 'utf8')).toBe(original);
});

test('APX-022-actionlint', () => {
  const original = readFileSync(CI_YML, 'utf8');
  const real = runActionlint(CI_YML);
  expect(real.status, `${real.stdout}\n${real.stderr}`).toBe(0);
  expect(`${real.stdout}${real.stderr}`.trim()).toBe('');

  const brokenPath = writeTempCopy('ci.yml', withBrokenNeeds(original));
  const broken = runActionlint(brokenPath);
  expect(broken.status).not.toBe(0);
  expect(`${broken.stdout}\n${broken.stderr}`).toContain('no-such-job');
  expect(readFileSync(CI_YML, 'utf8')).toBe(original);
});

test('APX-022-jobs-preserved', () => {
  const workflow = loadWorkflow(CI_YML);
  expect(Object.keys(workflow.jobs)).toEqual(JOB_IDS);
  const job = docsBuild(workflow);
  expect(job.needs).toEqual(['typecheck', 'lint', 'registry']);

  const build = job.steps.find((step) => step.name === 'Docs build');
  expect(build?.run ?? '').toContain('pnpm --filter @rnr-ai-elements/docs build');

  const evidence = job.steps.find((step) => step.name === 'Upload docs-build evidence');
  expect(evidence?.if).toBe('always()');
  expect(evidence?.uses).toBe(EVIDENCE_USES);
  expect(evidence?.with).toMatchObject({
    name: 'docs-build-log',
    path: 'docs-build.log',
    'retention-days': 7,
    'if-no-files-found': 'error',
  });
  expect(jobsWithDocsDist(workflow)).toEqual(['docs-build']);
});

test('APX-022-pin-resolves', () => {
  const usesLine = uploadUsesLine(readFileSync(CI_YML, 'utf8'));
  const match = usesLine.match(/actions\/upload-artifact@([0-9a-f]{40})\s+#\s+(v\d+\.\d+\.\d+)/);
  expect(match, usesLine).not.toBeNull();
  const sha = match?.[1] ?? '';
  const tag = match?.[2] ?? '';

  const bySha = ghApi(`repos/actions/upload-artifact/commits/${sha}`);
  expect(bySha.status, `${bySha.stdout}\n${bySha.stderr}`).toBe(0);
  expect(bySha.stdout.trim()).toBe(sha);

  const byTag = ghApi(`repos/actions/upload-artifact/commits/${tag}`);
  expect(byTag.status, `${byTag.stdout}\n${byTag.stderr}`).toBe(0);
  expect(byTag.stdout.trim()).toBe(sha);

  const flipped = flipLastHex(sha);
  const rejected = ghApi(`repos/actions/upload-artifact/commits/${flipped}`);
  const rejectedText = `${rejected.stdout}\n${rejected.stderr}`;
  expect(rejected.status, rejectedText).not.toBe(0);
  expect(rejectedText).toMatch(/404|422/);
  expect(rejected.stdout.trim()).not.toBe(flipped);
});
