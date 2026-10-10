/**
 * APX-020 — deploy precondition verdicts against real GitHub.
 *
 * Expected PASS/FAIL values come from this file's own `gh api` reads.
 * They are not hardcoded: the secret, the deploy job, and the production
 * environment can each flip when a human finishes that precondition.
 */

import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = join(REPO_ROOT, 'scripts', 'docs-deploy', 'check-deploy-preconditions.ts');
const REAL_REPO = 'hackerpug-ai/rnr-ai-elements';
const MISSING_REPO = 'hackerpug-ai/apx-020-does-not-exist';
const SECRET_LABEL = 'secret CLOUDFLARE_API_TOKEN';
const MAIN_LABEL = 'main ci.yml deploy job';
const ENV_LABEL = 'production environment limited to main';
const SECRET_REMEDY = 'Settings > Secrets and variables > Actions';
const MAIN_REMEDY = 'merge the sync PR';
const ENV_REMEDY = 'Settings > Environments';
const VERDICT_LINE =
  /^(secret CLOUDFLARE_API_TOKEN|main ci\.yml deploy job|production environment limited to main): (PASS|FAIL)$/;

interface RunResult {
  exit: number;
  stdout: string;
  stderr: string;
}

interface LiveFacts {
  secretListed: boolean;
  deployJob: boolean;
  productionLimitedToMain: boolean;
}

interface GhText {
  status: number;
  stdout: string;
}

function ghEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.CLOUDFLARE_API_TOKEN;
  env.GH_PROMPT_DISABLED = '1';
  env.GH_NO_UPDATE_NOTIFIER = '1';
  return env;
}

function httpStatus(stderr: string): number | null {
  const match = stderr.match(/HTTP (\d{3})/);
  if (!match?.[1]) return null;
  return Number(match[1]);
}

function ghText(apiPath: string, jq: string, paginate: boolean): GhText {
  const args = ['api'];
  if (paginate) args.push('--paginate');
  args.push(apiPath, '--jq', jq);
  const result = spawnSync('gh', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: ghEnv(),
    timeout: 60_000,
  });
  if (result.error) {
    const code = 'code' in result.error ? String(result.error.code) : 'error';
    throw new Error(`gh failed to start (${code})`);
  }
  if (result.status === 0) return { status: 200, stdout: result.stdout ?? '' };
  const status = httpStatus(result.stderr ?? '');
  if (status === 404) return { status: 404, stdout: '' };
  throw new Error(`gh api failed HTTP ${status ?? 'unknown'} for ${apiPath}`);
}

function ghOk(apiPath: string, jq: string, paginate: boolean): string {
  const got = ghText(apiPath, jq, paginate);
  if (got.status !== 200) {
    throw new Error(`gh api HTTP ${got.status} for ${apiPath}`);
  }
  return got.stdout;
}

function linesOf(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseObject(line: string): Record<string, unknown> {
  const value: unknown = JSON.parse(line);
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('gh jq row was not an object');
  }
  return value as Record<string, unknown>;
}

function repoName(segment: string): string {
  return segment.endsWith('.git') ? segment.slice(0, -4) : segment;
}

function slugFromRemoteUrl(url: string): string | null {
  const ssh = url.match(/^git@github\.com:([^/\s]+)\/([^/\s]+)$/);
  const sshUrl = url.match(/^ssh:\/\/git@github\.com\/([^/\s]+)\/([^/\s]+)$/);
  const https = url.match(/^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)$/);
  const match = ssh ?? sshUrl ?? https;
  const owner = match?.[1];
  const repo = match?.[2];
  if (!owner || !repo) return null;
  return `${owner}/${repoName(repo)}`;
}

function originSlug(): string {
  const result = spawnSync('git', ['remote', 'get-url', 'origin'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error('git remote get-url origin failed');
  const slug = slugFromRemoteUrl((result.stdout ?? '').trim());
  if (slug !== REAL_REPO) throw new Error(`origin resolved to ${slug ?? 'nothing'}`);
  return slug;
}

function listedSecret(slug: string): boolean {
  const stdout = ghOk(`repos/${slug}/actions/secrets?per_page=100`, '.secrets[].name', true);
  return linesOf(stdout).includes('CLOUDFLARE_API_TOKEN');
}

/** Same job rule as the script: two-space `deploy` key inside top-level `jobs:`. */
function hasDeployJob(yaml: string): boolean {
  const lines = yaml.split(/\r?\n/);
  const start = lines.findIndex((line) => /^jobs:\s*(?:#.*)?$/.test(line));
  if (start < 0) return false;
  for (const line of lines.slice(start + 1)) {
    if (/^[^\s#]/.test(line)) return false;
    if (/^ {2}deploy:\s*(?:#.*)?$/.test(line)) return true;
  }
  return false;
}

function decodeBase64(content: string): string {
  return Buffer.from(content.replace(/\s/g, ''), 'base64').toString('utf8');
}

function workflowYaml(slug: string): string | null {
  const got = ghText(
    `repos/${slug}/contents/.github/workflows/ci.yml?ref=main`,
    '{content: .content, encoding: .encoding, sha: .sha}',
    false,
  );
  if (got.status === 404) return null;
  const meta = parseObject(got.stdout);
  if (typeof meta.content === 'string') return decodeBase64(meta.content);
  if (typeof meta.sha !== 'string' || meta.sha.length === 0) {
    throw new Error('ci.yml contents response had no body');
  }
  const blob = ghOk(`repos/${slug}/git/blobs/${meta.sha}`, '.content', false);
  return decodeBase64(blob);
}

function deployJobOnMain(slug: string): boolean {
  const yaml = workflowYaml(slug);
  if (yaml === null) return false;
  return hasDeployJob(yaml);
}

function productionLimitedToMain(slug: string): boolean {
  const listed = ghOk(
    `repos/${slug}/environments?per_page=100`,
    '.environments[] | {name, custom: .deployment_branch_policy.custom_branch_policies}',
    true,
  );
  const production = linesOf(listed)
    .map((line) => parseObject(line))
    .find((row) => row.name === 'production');
  if (production?.custom !== true) return false;
  const policies = ghOk(
    `repos/${slug}/environments/production/deployment-branch-policies?per_page=100`,
    '.branch_policies[] | {name, type}',
    true,
  );
  return linesOf(policies)
    .map((line) => parseObject(line))
    .some((row) => row.name === 'main' && row.type === 'branch');
}

function readLiveFacts(slug: string): LiveFacts {
  const repo = ghText(`repos/${slug}`, '.full_name', false);
  if (repo.status !== 200) throw new Error(`repo probe HTTP ${repo.status}`);
  return {
    secretListed: listedSecret(slug),
    deployJob: deployJobOnMain(slug),
    productionLimitedToMain: productionLimitedToMain(slug),
  };
}

function runScript(args: string[], envExtra: Record<string, string> = {}): RunResult {
  const result = spawnSync('pnpm', ['exec', 'tsx', SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...envExtra },
    timeout: 120_000,
  });
  if (result.error) {
    const code = 'code' in result.error ? String(result.error.code) : 'error';
    throw new Error(`failed to spawn precondition script (${code})`);
  }
  return {
    exit: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function nonEmptyLines(text: string): string[] {
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

function verdictLines(stdout: string): string[] {
  return nonEmptyLines(stdout).filter((line) => VERDICT_LINE.test(line.trim()));
}

function verdictLine(label: string, pass: boolean): string {
  return `${label}: ${pass ? 'PASS' : 'FAIL'}`;
}

function assertRemedies(stdout: string, facts: LiveFacts): void {
  const lines = nonEmptyLines(stdout).map((line) => line.trim());
  const checks = [
    { label: SECRET_LABEL, pass: facts.secretListed, remedy: SECRET_REMEDY },
    { label: MAIN_LABEL, pass: facts.deployJob, remedy: MAIN_REMEDY },
    { label: ENV_LABEL, pass: facts.productionLimitedToMain, remedy: ENV_REMEDY },
  ];
  for (const check of checks) {
    const index = lines.indexOf(verdictLine(check.label, check.pass));
    expect(index, check.label).toBeGreaterThanOrEqual(0);
    if (check.pass) continue;
    expect(lines[index + 1], check.label).toContain(check.remedy);
  }
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i]?.endsWith(': FAIL')) continue;
    const next = lines[i + 1];
    expect(next, `remedy after ${lines[i]}`).toBeTruthy();
    expect(next?.endsWith(': PASS') ?? false).toBe(false);
    expect(next?.endsWith(': FAIL') ?? false).toBe(false);
  }
}

test.describe('APX-020 deploy preconditions', () => {
  test('APX-020-verdicts-match-github', () => {
    test.setTimeout(180_000);
    const slug = originSlug();
    const facts = readLiveFacts(slug);
    const run = runScript([]);
    const verdicts = verdictLines(run.stdout);
    const allPass = facts.secretListed && facts.deployJob && facts.productionLimitedToMain;
    expect(verdicts, JSON.stringify(facts)).toEqual([
      verdictLine(SECRET_LABEL, facts.secretListed),
      verdictLine(MAIN_LABEL, facts.deployJob),
      verdictLine(ENV_LABEL, facts.productionLimitedToMain),
    ]);
    expect(run.exit, run.stderr).toBe(allPass ? 0 : 1);
  });

  test('APX-020-unverifiable-repo-exits-2', () => {
    test.setTimeout(180_000);
    const probe = ghText(`repos/${MISSING_REPO}`, '.full_name', false);
    expect(probe.status).toBe(404);
    const run = runScript(['--repo', MISSING_REPO]);
    expect(run.exit, run.stderr).toBe(2);
    expect(run.stderr).toContain('cannot verify');
    expect(run.stderr).toContain(MISSING_REPO);
    expect(`${run.stdout}\n${run.stderr}`).not.toContain('PASS');
  });

  test('APX-020-never-prints-secret-value', () => {
    test.setTimeout(180_000);
    const canary = `apx020-canary-${randomBytes(8).toString('hex')}`;
    const run = runScript([], { CLOUDFLARE_API_TOKEN: canary });
    expect(run.stdout.trim().length).toBeGreaterThan(0);
    expect(run.stdout).not.toContain(canary);
    expect(run.stderr).not.toContain(canary);
    expect(verdictLines(run.stdout)).toHaveLength(3);
  });

  test('APX-020-fail-lines-carry-remedy', () => {
    test.setTimeout(180_000);
    const facts = readLiveFacts(originSlug());
    const run = runScript([]);
    expect(run.exit === 0 || run.exit === 1, run.stderr).toBe(true);
    assertRemedies(run.stdout, facts);
  });
});
