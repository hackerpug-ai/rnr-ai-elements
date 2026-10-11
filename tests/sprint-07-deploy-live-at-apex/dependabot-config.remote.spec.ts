/**
 * APX-026 — weekly Dependabot coverage for github-actions only.
 * The real file is parsed with system Ruby. Negative copies stay in the OS
 * temp directory. Every non-local workflow action is resolved with gh api.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { parseWorkflow } from './support/workflow-yaml';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEPENDABOT = join(REPO_ROOT, '.github/dependabot.yml');
const WORKFLOWS_DIR = join(REPO_ROOT, '.github/workflows');
const EVIDENCE = join(REPO_ROOT, '.tmp/APX-026/cycle-1');
const MISSING_REPO = 'hackerpug-ai/apx-026-no-such-repo';
const ROOT_WORKFLOW = /^\.github\/workflows\/[^/]+\.ya?ml$/;
const ACTION_REPO = /^([^/\s]+\/[^/@\s]+)(?:\/[^@\s]+)?@\S+$/;
const MINIMUM_REPOS = [
  'actions/checkout',
  'actions/download-artifact',
  'actions/setup-node',
  'actions/upload-artifact',
  'cloudflare/wrangler-action',
  'pnpm/action-setup',
];

interface ShapeReport {
  version: number;
  updateCount: number;
  ecosystem: string;
  directory: string;
  interval: string;
}

interface ValidatedUpdate {
  ecosystem: 'github-actions';
  directory: '/';
  interval: 'weekly';
}

interface RepoProbe {
  repo: string;
  status: number;
  statusLine: string;
  fullName: string | null;
  requestId: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function readDependabot(): string {
  return readFileSync(DEPENDABOT, 'utf8');
}

function capture(name: string, value: unknown): void {
  mkdirSync(EVIDENCE, { recursive: true });
  const body = typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`;
  writeFileSync(join(EVIDENCE, name), body.endsWith('\n') ? body : `${body}\n`);
}

function assertRepoUntouched(before: string): void {
  if (readDependabot() !== before) {
    throw new Error('negative control mutated .github/dependabot.yml');
  }
}

function assertOsTemp(path: string): void {
  const resolved = resolve(path);
  const repoRoot = resolve(REPO_ROOT);
  const tempRoot = resolve(tmpdir());
  if (resolved === repoRoot || resolved.startsWith(`${repoRoot}${sep}`)) {
    throw new Error(`negative control wrote inside the repo: ${resolved}`);
  }
  if (!resolved.startsWith(`${tempRoot}${sep}`)) {
    throw new Error(`negative control is not in the OS temp dir: ${resolved}`);
  }
}

function writeTempConfig(contents: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'apx-026-'));
  const path = join(dir, 'dependabot.yml');
  writeFileSync(path, contents);
  assertOsTemp(path);
  return path;
}

function withNpmEntry(source: string): string {
  const base = source.endsWith('\n') ? source : `${source}\n`;
  const entry = [
    '  - package-ecosystem: npm',
    '    directory: /',
    '    schedule:',
    '      interval: weekly',
    '',
  ].join('\n');
  return `${base}${entry}`;
}

function withMisspelledEcosystem(source: string): string {
  const needle = 'package-ecosystem: github-actions';
  if (!source.includes(needle)) {
    throw new Error('fixture setup failed: github-actions entry missing');
  }
  return source.replace(needle, 'package-ecosystem: github-action');
}

function withTabIndent(source: string): string {
  const lines = source.split('\n');
  const index = lines.findIndex((line) => line.startsWith('    directory:'));
  const current = lines[index];
  if (index < 0 || current === undefined) {
    throw new Error('fixture setup failed: directory line missing');
  }
  lines[index] = `\t${current.trimStart()}`;
  return lines.join('\n');
}

function callError(run: () => void): Error {
  try {
    run();
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error('checker threw a non-Error');
  }
  throw new Error('expected the checker to throw');
}

function intervalOf(schedule: unknown): unknown {
  if (!isRecord(schedule)) return undefined;
  return schedule.interval;
}

function assertUpdateEntry(entry: unknown, index: number): ValidatedUpdate {
  if (!isRecord(entry)) throw new Error(`updates[${index}] is not a mapping`);
  const ecosystem = entry['package-ecosystem'];
  if (typeof ecosystem !== 'string' || ecosystem !== 'github-actions') {
    throw new Error(
      `updates[${index}].package-ecosystem must equal github-actions, found ${String(ecosystem)}`,
    );
  }
  const directory = entry.directory;
  if (typeof directory !== 'string' || directory !== '/') {
    throw new Error(`updates[${index}].directory must equal /, found ${String(directory)}`);
  }
  const interval = intervalOf(entry.schedule);
  if (typeof interval !== 'string' || interval !== 'weekly') {
    throw new Error(
      `updates[${index}].schedule.interval must equal weekly, found ${String(interval)}`,
    );
  }
  return { ecosystem, directory, interval };
}

/** Reject any ecosystem other than github-actions, including a later entry. */
function assertDependabotShape(path: string): ShapeReport {
  const parsed = parseWorkflow(path);
  if (!isRecord(parsed)) throw new Error('dependabot document is not a mapping');
  const version = parsed.version;
  if (typeof version !== 'number' || version !== 2) {
    throw new Error(`version must equal 2, found ${String(version)}`);
  }
  const updates = parsed.updates;
  if (!Array.isArray(updates)) throw new Error('updates must be an array');
  if (updates.length === 0) throw new Error('updates must contain exactly 1 entry, found 0');
  const entries = updates.map((entry, index) => assertUpdateEntry(entry, index));
  const only = entries[0];
  if (entries.length !== 1 || !only) {
    const names = entries.map((entry) => entry.ecosystem).join(', ');
    throw new Error(`updates must contain exactly 1 entry, found ${entries.length}: ${names}`);
  }
  return {
    version,
    updateCount: entries.length,
    ecosystem: only.ecosystem,
    directory: only.directory,
    interval: only.interval,
  };
}

function ecosystems(path: string): string[] {
  const parsed = parseWorkflow(path);
  if (!isRecord(parsed) || !Array.isArray(parsed.updates)) {
    throw new Error('dependabot document has no updates array');
  }
  return parsed.updates.map((entry, index) => {
    if (!isRecord(entry) || typeof entry['package-ecosystem'] !== 'string') {
      throw new Error(`updates[${index}].package-ecosystem is missing`);
    }
    return entry['package-ecosystem'];
  });
}

function gitPaths(args: string[]): string[] {
  const result = spawnSync('git', ['ls-files', '-z', ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw new Error(`git ls-files failed to spawn: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`git ls-files failed: ${result.stderr ?? ''}`);
  return (result.stdout ?? '').split('\0').filter((file) => file.length > 0);
}

function assertWorkflowLocations(files: readonly string[]): void {
  for (const file of files) {
    if (!ROOT_WORKFLOW.test(file)) {
      throw new Error(`workflow file outside .github/workflows: ${file}`);
    }
  }
}

function listedWorkflows(): string[] {
  const names = readdirSync(WORKFLOWS_DIR, { withFileTypes: true });
  const files = names
    .filter((entry) => entry.isFile() && /\.ya?ml$/.test(entry.name))
    .map((entry) => join('.github/workflows', entry.name))
    .sort();
  if (files.length === 0) throw new Error('no workflow files in .github/workflows');
  assertWorkflowLocations(files);
  const tracked = [...gitPaths([]), ...gitPaths(['--others', '--exclude-standard'])];
  const outsiders = tracked.filter(
    (file) => file.includes('.github/workflows/') && /\.ya?ml$/.test(file),
  );
  assertWorkflowLocations(outsiders);
  return files;
}

function addUses(uses: string, repos: Set<string>): void {
  if (uses.startsWith('./')) return;
  const repo = ACTION_REPO.exec(uses)?.[1];
  if (!repo) throw new Error(`unrecognized uses reference: ${uses}`);
  repos.add(repo);
}

function walkUses(value: unknown, repos: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) walkUses(item, repos);
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'uses' && typeof child === 'string') addUses(child, repos);
    else walkUses(child, repos);
  }
}

function actionRepos(files: readonly string[]): string[] {
  const repos = new Set<string>();
  for (const file of files) walkUses(parseWorkflow(join(REPO_ROOT, file)), repos);
  if (repos.size === 0) throw new Error('empty action list (0 repos found in the workflows)');
  return [...repos].sort();
}

function ghEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    GH_PAGER: '',
    GH_PROMPT_DISABLED: '1',
    GH_NO_UPDATE_NOTIFIER: '1',
  };
}

function headerBlock(raw: string): string {
  return raw.split(/\r?\n\r?\n/, 1)[0] ?? '';
}

function httpStatus(raw: string): number | null {
  const match = /^HTTP\/\d+(?:\.\d+)?\s+(\d{3})\b/m.exec(headerBlock(raw));
  if (match?.[1]) return Number(match[1]);
  const fallback = raw.match(/HTTP (\d{3})/);
  return fallback?.[1] ? Number(fallback[1]) : null;
}

function headerValue(raw: string, name: string): string | null {
  const prefix = `${name.toLowerCase()}:`;
  for (const line of headerBlock(raw).split(/\r?\n/)) {
    if (line.toLowerCase().startsWith(prefix)) return line.slice(prefix.length).trim();
  }
  return null;
}

function fullNameOf(body: string): string | null {
  if (!body.startsWith('{')) return null;
  const parsed: unknown = JSON.parse(body);
  if (!isRecord(parsed) || typeof parsed.full_name !== 'string') return null;
  return parsed.full_name;
}

interface GhOutput {
  stdout: string;
  stderr: string;
}

function ghFailureCode(error: Error): string {
  if (!('code' in error)) return 'error';
  return String(error.code);
}

function runGhApi(repo: string): GhOutput {
  const result = spawnSync('gh', ['api', '--include', `repos/${repo}`], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: ghEnv(),
    maxBuffer: 16 * 1024 * 1024,
    timeout: 180_000,
  });
  if (result.error) {
    const code = ghFailureCode(result.error);
    throw new Error(`gh api ${code} for ${repo}: ${result.error.message}`);
  }
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function responseBody(stdout: string): string {
  return stdout
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join('\n\n')
    .trim();
}

function statusLineOf(stdout: string): string {
  const line = headerBlock(stdout).split(/\r?\n/, 1)[0] ?? '';
  return line.trim();
}

/** Live `gh api repos/<owner>/<repo>`. Status comes from the HTTP status line. */
function fetchRepo(repo: string): RepoProbe {
  const output = runGhApi(repo);
  const status = httpStatus(output.stdout) ?? httpStatus(output.stderr);
  if (status === null) {
    const detail = output.stderr || output.stdout;
    throw new Error(`gh api returned no HTTP status for ${repo}: ${detail}`);
  }
  const fullName = status === 200 ? fullNameOf(responseBody(output.stdout)) : null;
  return {
    repo,
    status,
    statusLine: statusLineOf(output.stdout),
    fullName,
    requestId: headerValue(output.stdout, 'x-github-request-id'),
  };
}

function assertRepoExists(repo: string): RepoProbe {
  const probe = fetchRepo(repo);
  const fullName = probe.fullName ?? 'missing';
  if (probe.status !== 200 || probe.fullName !== repo) {
    throw new Error(
      `${repo} is not a reachable GitHub repo (HTTP ${probe.status}, full_name ${fullName})`,
    );
  }
  return probe;
}

test('APX-026-config-shape', () => {
  const before = readDependabot();
  const report = assertDependabotShape(DEPENDABOT);
  assertRepoUntouched(before);
  expect(report).toEqual({
    version: 2,
    updateCount: 1,
    ecosystem: 'github-actions',
    directory: '/',
    interval: 'weekly',
  });
  capture('APX-026-config-shape.json', { report, sha256: sha256(before) });
});

test('APX-026-rejects-extra-ecosystem', () => {
  const before = readDependabot();
  const copy = writeTempConfig(withNpmEntry(before));
  expect(ecosystems(copy)).toEqual(['github-actions', 'npm']);
  const error = callError(() => assertDependabotShape(copy));
  expect(error.message).toContain('npm');
  assertRepoUntouched(before);
  capture('APX-026-rejects-extra-ecosystem.txt', error.message);
});

test('APX-026-covers-workflow-actions', () => {
  const files = listedWorkflows();
  for (const file of files) expect(file.startsWith('.github/workflows/')).toBe(true);
  const repos = actionRepos(files);
  expect(repos.length).toBeGreaterThanOrEqual(MINIMUM_REPOS.length);
  for (const required of MINIMUM_REPOS) expect(repos).toContain(required);
  const probes = repos.map((repo) => assertRepoExists(repo));
  const missing = callError(() => assertRepoExists(MISSING_REPO));
  expect(missing.message).toContain(MISSING_REPO);
  expect(missing.message).toContain('HTTP 404');
  capture('APX-026-covers-workflow-actions.json', { workflows: files, probes });
  capture('APX-026-missing-repo.txt', missing.message);
});

test('APX-026-rejects-malformed-config', () => {
  const before = readDependabot();
  const misspelled = writeTempConfig(withMisspelledEcosystem(before));
  expect(ecosystems(misspelled)).toEqual(['github-action']);
  const ecosystemError = callError(() => assertDependabotShape(misspelled));
  expect(ecosystemError.message).toMatch(/github-action(?!s)/);
  const tabbed = writeTempConfig(withTabIndent(before));
  const parseError = callError(() => assertDependabotShape(tabbed));
  expect(parseError.message).toContain('Psych::SyntaxError');
  assertRepoUntouched(before);
  capture(
    'APX-026-rejects-malformed-config.txt',
    `${ecosystemError.message}\n${parseError.message}\n`,
  );
});
