// fallow-ignore-file unused-file
/**
 * APX-020 — read-only deploy precondition check.
 *
 * Three GETs through `gh api`, in order: the Actions secret name
 * CLOUDFLARE_API_TOKEN is listed, GitHub main's ci.yml has a top-level
 * `deploy` job, and the production environment has a custom branch policy
 * named main. Exit 0 only when all three pass, 1 when a check fails, and 2
 * when the repo cannot be verified. A secret value is never read or printed.
 */

import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SECRET_NAME = 'CLOUDFLARE_API_TOKEN';
const SECRET_LABEL = 'secret CLOUDFLARE_API_TOKEN';
const MAIN_LABEL = 'main ci.yml deploy job';
const ENV_LABEL = 'production environment limited to main';
const SECRET_REMEDY = 'add the repo secret under Settings > Secrets and variables > Actions';
const MAIN_REMEDY = 'merge the sync PR that lands the deploy job on GitHub main';
const ENV_REMEDY =
  'create the production environment limited to main under Settings > Environments';
const SLUG_PART = /^[A-Za-z0-9_.-]+$/;
const REMOTE_PATTERNS = [
  /^git@github\.com:([^/\s]+)\/([^/\s]+)$/,
  /^ssh:\/\/git@github\.com\/([^/\s]+)\/([^/\s]+)$/,
  /^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)$/,
];
const JOBS_KEY = /^jobs:\s*(?:#.*)?$/;
const DEPLOY_KEY = /^ {2}deploy:\s*(?:#.*)?$/;
const TOP_LEVEL_KEY = /^[^\s#]/;

interface GhOk {
  ok: true;
  json: unknown;
}

interface GhErr {
  ok: false;
  httpStatus: number | null;
}

interface GhSpawn {
  status: number;
  stdout: string;
  stderr: string;
}

function cannotVerify(slug: string | null, detail: string): never {
  if (slug && slug.length > 0) {
    console.error(`cannot verify ${slug}: ${detail}`);
  } else {
    console.error(`cannot verify: ${detail}`);
  }
  process.exit(2);
}

function ghChildEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.CLOUDFLARE_API_TOKEN;
  env.GH_PROMPT_DISABLED = '1';
  env.GH_NO_UPDATE_NOTIFIER = '1';
  return env;
}

function errnoCode(error: Error): string | undefined {
  if (!('code' in error)) return undefined;
  if (typeof error.code !== 'string') return undefined;
  return error.code;
}

function textOf(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  return value;
}

function statusIn(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  const digits = match?.[1];
  if (!digits) return null;
  return Number(digits);
}

function httpStatusFromGh(stdout: string, stderr: string): number | null {
  const fromErr = statusIn(stderr, /HTTP (\d{3})/);
  if (fromErr !== null) return fromErr;
  return statusIn(stdout, /"status"\s*:\s*"?(\d{3})"?/);
}

function failSpawn(slug: string, error: Error): never {
  if (errnoCode(error) === 'ENOENT') cannotVerify(slug, 'gh is missing');
  cannotVerify(slug, 'the API call failed');
}

function spawnGh(slug: string, apiPath: string): GhSpawn {
  const result = spawnSync('gh', ['api', apiPath], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: ghChildEnv(),
    timeout: 60_000,
  });
  if (result.error) failSpawn(slug, result.error);
  if (typeof result.status !== 'number') cannotVerify(slug, 'the API call failed');
  return {
    status: result.status,
    stdout: textOf(result.stdout),
    stderr: textOf(result.stderr),
  };
}

function parseSuccessJson(slug: string, stdout: string): GhOk {
  try {
    return { ok: true, json: JSON.parse(stdout) as unknown };
  } catch {
    cannotVerify(slug, 'the API call failed');
  }
}

function ghGet(slug: string, apiPath: string): GhOk | GhErr {
  const spawned = spawnGh(slug, apiPath);
  if (spawned.status === 0) return parseSuccessJson(slug, spawned.stdout);
  const httpStatus = httpStatusFromGh(spawned.stdout, spawned.stderr);
  if (httpStatus === 401) cannotVerify(slug, 'gh is unauthenticated');
  return { ok: false, httpStatus };
}

function requireJson(slug: string, apiPath: string): unknown {
  const res = ghGet(slug, apiPath);
  if (!res.ok) cannotVerify(slug, 'the API call failed');
  return res.json;
}

function asRecord(value: unknown, slug: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object') cannotVerify(slug, 'the API call failed');
  if (Array.isArray(value)) cannotVerify(slug, 'the API call failed');
  return value as Record<string, unknown>;
}

function asArray(value: unknown, slug: string): unknown[] {
  if (!Array.isArray(value)) cannotVerify(slug, 'the API call failed');
  return value;
}

function asNumber(value: unknown, slug: string): number {
  if (typeof value !== 'number') cannotVerify(slug, 'the API call failed');
  if (!Number.isFinite(value)) cannotVerify(slug, 'the API call failed');
  return value;
}

function pageDone(chunk: unknown[], collected: number, total: number): boolean {
  if (chunk.length === 0) return true;
  return collected >= total;
}

function readAllItems(
  slug: string,
  pathForPage: (page: number) => string,
  itemsKey: string,
): unknown[] {
  const items: unknown[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const body = asRecord(requireJson(slug, pathForPage(page)), slug);
    const chunk = asArray(body[itemsKey], slug);
    const total = asNumber(body.total_count, slug);
    items.push(...chunk);
    if (pageDone(chunk, items.length, total)) return items;
  }
  cannotVerify(slug, 'the API call failed');
}

function isSlugPart(part: string): boolean {
  if (!SLUG_PART.test(part)) return false;
  if (part === '.') return false;
  if (part === '..') return false;
  return true;
}

function partAt(parts: string[], index: number): string {
  const part = parts[index];
  if (!part) return '';
  return part;
}

function isSlug(value: string): boolean {
  const parts = value.split('/');
  if (parts.length !== 2) return false;
  if (!isSlugPart(partAt(parts, 0))) return false;
  return isSlugPart(partAt(parts, 1));
}

function repoName(segment: string): string {
  if (!segment.endsWith('.git')) return segment;
  return segment.slice(0, -4);
}

function firstRemoteMatch(url: string): RegExpMatchArray | null {
  for (const pattern of REMOTE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match;
  }
  return null;
}

function capture(match: RegExpMatchArray | null, index: number): string | null {
  if (!match) return null;
  const value = match[index];
  if (!value) return null;
  return value;
}

function slugFromRemoteUrl(url: string): string | null {
  const match = firstRemoteMatch(url);
  const owner = capture(match, 1);
  const repo = capture(match, 2);
  if (!owner) return null;
  if (!repo) return null;
  return `${owner}/${repoName(repo)}`;
}

function trimmed(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function originUrl(): string | null {
  const result = spawnSync('git', ['remote', 'get-url', 'origin'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  if (result.status !== 0) return null;
  const url = trimmed(result.stdout);
  if (url.length === 0) return null;
  return url;
}

function requireRepoValue(repo: string | null, value: string | undefined): string {
  if (value === undefined) cannotVerify(repo, 'missing --repo value');
  if (value.startsWith('--')) cannotVerify(repo, 'missing --repo value');
  return value;
}

function parseArgs(argv: string[]): string | null {
  let repo: string | null = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg !== '--repo') cannotVerify(repo, 'unrecognized arguments');
    repo = requireRepoValue(repo, argv[i + 1]);
    i += 1;
  }
  return repo;
}

function requireSlug(slug: string | null): string {
  if (slug === null) cannotVerify(null, 'cannot resolve the git remote');
  if (!isSlug(slug)) cannotVerify(null, 'cannot resolve the git remote');
  return slug;
}

function remoteSlug(): string {
  const url = originUrl();
  if (url === null) cannotVerify(null, 'cannot resolve the git remote');
  return requireSlug(slugFromRemoteUrl(url));
}

function resolveSlug(argv: string[]): string {
  const flagged = parseArgs(argv);
  if (flagged === null) return remoteSlug();
  if (!isSlug(flagged)) cannotVerify(flagged, 'the repo slug is not owner/name');
  return flagged;
}

function assertRepoReadable(slug: string): void {
  const res = ghGet(slug, `repos/${slug}`);
  if (!res.ok) cannotVerify(slug, 'the API call failed');
}

function namedSecret(item: unknown, slug: string): boolean {
  return asRecord(item, slug).name === SECRET_NAME;
}

function secretListed(slug: string): boolean {
  const items = readAllItems(
    slug,
    (page) => `repos/${slug}/actions/secrets?per_page=100&page=${page}`,
    'secrets',
  );
  return items.some((item) => namedSecret(item, slug));
}

function jobsBlock(lines: string[], start: number): string[] {
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => TOP_LEVEL_KEY.test(line));
  if (end < 0) return rest;
  return rest.slice(0, end);
}

/** A `deploy` job is the key `deploy` indented two spaces under top-level `jobs:`. */
function ciYmlHasDeployJob(yaml: string): boolean {
  const lines = yaml.split(/\r?\n/);
  const start = lines.findIndex((line) => JOBS_KEY.test(line));
  if (start < 0) return false;
  return jobsBlock(lines, start).some((line) => DEPLOY_KEY.test(line));
}

function decodeBase64Field(content: unknown, encoding: unknown): string | null {
  if (typeof content !== 'string') return null;
  if (encoding !== 'base64') {
    if (encoding !== undefined) return null;
  }
  return Buffer.from(content.replace(/\s/g, ''), 'base64').toString('utf8');
}

function blobSha(slug: string, sha: unknown): string {
  if (typeof sha !== 'string') cannotVerify(slug, 'the API call failed');
  if (sha.length === 0) cannotVerify(slug, 'the API call failed');
  return sha;
}

function blobWorkflow(slug: string, sha: string): string {
  const blob = asRecord(requireJson(slug, `repos/${slug}/git/blobs/${sha}`), slug);
  const text = decodeBase64Field(blob.content, blob.encoding);
  if (text === null) cannotVerify(slug, 'the API call failed');
  return text;
}

function decodeWorkflow(slug: string, json: unknown): string {
  const body = asRecord(json, slug);
  const inline = decodeBase64Field(body.content, body.encoding);
  if (inline !== null) return inline;
  return blobWorkflow(slug, blobSha(slug, body.sha));
}

function missingWorkflow(slug: string, httpStatus: number | null): boolean {
  if (httpStatus === 404) return false;
  cannotVerify(slug, 'the API call failed');
}

function mainHasDeployJob(slug: string): boolean {
  const path = `repos/${slug}/contents/.github/workflows/ci.yml?ref=main`;
  const res = ghGet(slug, path);
  if (!res.ok) return missingWorkflow(slug, res.httpStatus);
  return ciYmlHasDeployJob(decodeWorkflow(slug, res.json));
}

function branchPolicyIncludesMain(item: unknown, slug: string): boolean {
  const policy = asRecord(item, slug);
  if (policy.name !== 'main') return false;
  return policy.type === 'branch';
}

function findProduction(slug: string, items: unknown[]): Record<string, unknown> | null {
  for (const item of items) {
    const record = asRecord(item, slug);
    if (record.name === 'production') return record;
  }
  return null;
}

function customBranchPolicies(slug: string, production: Record<string, unknown>): boolean {
  const policy = production.deployment_branch_policy;
  if (policy === null) return false;
  if (policy === undefined) return false;
  return asRecord(policy, slug).custom_branch_policies === true;
}

function listedBranchPolicies(slug: string): unknown[] {
  return readAllItems(
    slug,
    (page) =>
      `repos/${slug}/environments/production/deployment-branch-policies?per_page=100&page=${page}`,
    'branch_policies',
  );
}

function productionLimitedToMain(slug: string): boolean {
  const items = readAllItems(
    slug,
    (page) => `repos/${slug}/environments?per_page=100&page=${page}`,
    'environments',
  );
  const production = findProduction(slug, items);
  if (!production) return false;
  if (!customBranchPolicies(slug, production)) return false;
  return listedBranchPolicies(slug).some((item) => branchPolicyIncludesMain(item, slug));
}

function emit(label: string, pass: boolean, remedy: string): boolean {
  console.log(`${label}: ${pass ? 'PASS' : 'FAIL'}`);
  if (!pass) console.log(remedy);
  return pass;
}

function exitCode(secretPass: boolean, mainPass: boolean, envPass: boolean): number {
  if (!secretPass) return 1;
  if (!mainPass) return 1;
  if (!envPass) return 1;
  return 0;
}

function checkDeployPreconditions(): void {
  const slug = resolveSlug(process.argv.slice(2));
  assertRepoReadable(slug);
  const secretOk = secretListed(slug);
  const mainOk = mainHasDeployJob(slug);
  const envOk = productionLimitedToMain(slug);
  const secretPass = emit(SECRET_LABEL, secretOk, SECRET_REMEDY);
  const mainPass = emit(MAIN_LABEL, mainOk, MAIN_REMEDY);
  const envPass = emit(ENV_LABEL, envOk, ENV_REMEDY);
  process.exit(exitCode(secretPass, mainPass, envPass));
}

checkDeployPreconditions();
