/**
 * APX-004 — edge-config preflight for the docs deploy job.
 *
 * Fail-closed checks run before upload:
 *   1. wrangler.jsonc is assets-only (assets present, no main, no bindings)
 *   2. <dist>/404.html exists and is non-empty
 *   3. optional --require-www-redirect: exactly one 301 from www to apex
 *
 * Host-side node built-ins only. Spawned via tsx; never imported.
 */
// fallow-ignore-file unused-file
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST_DEFAULT = join(REPO_ROOT, 'apps', 'docs', 'dist');
const CONFIG_DEFAULT = join(REPO_ROOT, 'apps', 'docs', 'wrangler.jsonc');
const DEFAULT_WWW = 'www.rnraielements.com';
const DEFAULT_APEX = 'rnraielements.com';
const OK_BASE =
  '[docs-deploy] preflight-edge ok: assets-only (no main, no bindings); 404.html present';

const FORBIDDEN_KEYS = [
  'main',
  'kv_namespaces',
  'd1_databases',
  'r2_buckets',
  'durable_objects',
  'services',
  'queues',
  'ai',
  'vars',
  'browser',
  'vectorize',
  'hyperdrive',
] as const;

type WwwClass = 'redirect-ok' | 'served-directly' | 'wrong-target' | 'unresolved';

interface CliArgs {
  dist: string;
  config: string;
  requireWwwRedirect: boolean;
  wwwHost: string;
  apexHost: string;
}

function fail(message: string): never {
  console.error(`[docs-deploy] preflight-edge FAILED: ${message}`);
  process.exit(1);
}

function stripJsonc(raw: string): string {
  const noBlock = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  const noLine = noBlock.replace(/^\s*\/\/.*$/gm, '');
  return noLine.replace(/,\s*([}\]])/g, '$1');
}

function asConfigObject(parsed: unknown, path: string): Record<string, unknown> {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    fail(`config at ${path} must be a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

function readJsoncText(path: string): unknown {
  try {
    return JSON.parse(stripJsonc(readFileSync(path, 'utf8')));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    fail(`cannot parse JSONC at ${path}: ${detail}`);
  }
}

function parseJsonc(path: string): Record<string, unknown> {
  return asConfigObject(readJsoncText(path), path);
}

function defaultArgs(): CliArgs {
  return {
    dist: DIST_DEFAULT,
    config: CONFIG_DEFAULT,
    requireWwwRedirect: false,
    wwwHost: DEFAULT_WWW,
    apexHost: DEFAULT_APEX,
  };
}

type FlagHandler = (args: CliArgs, next: string | undefined) => number;

const FLAG_HANDLERS: Record<string, FlagHandler> = {
  '--dist': (args, next) => {
    args.dist = resolve(next ?? DIST_DEFAULT);
    return 1;
  },
  '--config': (args, next) => {
    args.config = resolve(next ?? CONFIG_DEFAULT);
    return 1;
  },
  '--require-www-redirect': (args) => {
    args.requireWwwRedirect = true;
    return 0;
  },
  '--www-host': (args, next) => {
    args.wwwHost = next ?? DEFAULT_WWW;
    return 1;
  },
  '--apex-host': (args, next) => {
    args.apexHost = next ?? DEFAULT_APEX;
    return 1;
  },
};

function applyFlag(args: CliArgs, flag: string, next: string | undefined): number {
  const handler = FLAG_HANDLERS[flag];
  if (!handler) fail(`unknown argument: ${flag}`);
  return handler(args, next);
}

function parseArgs(argv: string[]): CliArgs {
  const args = defaultArgs();
  for (let i = 0; i < argv.length; i++) {
    i += applyFlag(args, argv[i] as string, argv[i + 1]);
  }
  return args;
}

function collectForbidden(cfg: Record<string, unknown>): string[] {
  return FORBIDDEN_KEYS.filter((key) => Object.hasOwn(cfg, key));
}

function assertAssetsBlock(cfg: Record<string, unknown>): void {
  if (!Object.hasOwn(cfg, 'assets') || cfg.assets === null || typeof cfg.assets !== 'object') {
    fail('missing assets block');
  }
}

function checkConfig(configPath: string): void {
  if (!existsSync(configPath)) fail(`config missing: ${configPath}`);
  const cfg = parseJsonc(configPath);
  assertAssetsBlock(cfg);
  const offenders = collectForbidden(cfg);
  if (offenders.length > 0) fail(`forbidden keys present: ${offenders.join(', ')}`);
}

function check404(dist: string): void {
  const path = join(dist, '404.html');
  if (!existsSync(path)) fail('404.html missing');
  if (statSync(path).size <= 0) fail('404.html empty');
}

function locationHost(location: string | null, baseHost: string): string | null {
  if (!location) return null;
  try {
    return new URL(location, `https://${baseHost}/`).host;
  } catch {
    return null;
  }
}

function classifyResponse(status: number, locHost: string | null, apexHost: string): WwwClass {
  if (status === 301 && locHost === apexHost) return 'redirect-ok';
  if (status === 200) return 'served-directly';
  return 'wrong-target';
}

async function classifyWww(wwwHost: string, apexHost: string): Promise<WwwClass> {
  try {
    const res = await fetch(`https://${wwwHost}/`, { redirect: 'manual' });
    return classifyResponse(
      res.status,
      locationHost(res.headers.get('location'), wwwHost),
      apexHost,
    );
  } catch {
    return 'unresolved';
  }
}

async function checkWww(wwwHost: string, apexHost: string): Promise<void> {
  const outcome = await classifyWww(wwwHost, apexHost);
  if (outcome !== 'redirect-ok') {
    fail(`www redirect ${outcome} (host=${wwwHost}, apex=${apexHost})`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  checkConfig(args.config);
  check404(args.dist);
  let ok = OK_BASE;
  if (args.requireWwwRedirect) {
    await checkWww(args.wwwHost, args.apexHost);
    ok = `${ok}; www redirect-ok`;
  }
  console.log(ok);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    const detail = err instanceof Error ? err.message : String(err);
    fail(detail);
  });
}
