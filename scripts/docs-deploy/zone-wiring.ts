/**
 * APX-002 — www → apex zone wiring (DNS + Single Redirect).
 *
 * Operator-facing, fail-loud, idempotent. Modes:
 *   --probe-www  public HTTPS classification (no token)
 *   --check      read-only Cloudflare API (token)
 *   --apply      create missing www AAAA + redirect rule (token), then re-probe
 *
 * Exit codes: 0 ok | 3 authority missing | 4 drift / not-yet-wired |
 *             5 applied but probe did not read redirect-ok
 *
 * Host-side node built-ins only. Spawned via tsx; never imported.
 */
// fallow-ignore-file unused-file
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const WRANGLER_CONFIG = join(REPO_ROOT, 'apps', 'docs', 'wrangler.jsonc');
const CF_API = 'https://api.cloudflare.com/client/v4';

const DEFAULT_WWW_HOST = 'www.rnraielements.com';
const DEFAULT_APEX_HOST = 'rnraielements.com';
const WWW_CONTENT = '100::';
const RULE_REF = 'rnr-www-to-apex';
const RULE_EXPRESSION = 'http.host eq "www.rnraielements.com"';
const RULE_TARGET_EXPRESSION = 'concat("https://rnraielements.com", http.request.uri.path)';
const PHASE = 'http_request_dynamic_redirect';

const PERM_DNS = 'Zone > DNS > Edit';
const PERM_REDIRECT = 'Zone > Single Redirect > Edit';
const AUTH_CODES = new Set([10000, 9109, 6003, 6111, 9106, 10001]);

type Mode = 'probe-www' | 'check' | 'apply' | 'help';
type WwwClass = 'redirect-ok' | 'served-directly' | 'wrong-target' | 'unresolved';

interface CliArgs {
  mode: Mode | null;
  host: string;
  apexHost: string;
}

interface CfError {
  code?: number;
  message?: string;
}

interface CfResponse<T> {
  success: boolean;
  errors: CfError[];
  messages: unknown[];
  result: T;
}

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
}

interface RedirectFromValue {
  target_url?: { expression?: string; value?: string };
  status_code?: number;
  preserve_query_string?: boolean;
}

interface RedirectRule {
  id?: string;
  ref?: string;
  expression?: string;
  description?: string;
  action?: string;
  enabled?: boolean;
  action_parameters?: { from_value?: RedirectFromValue };
}

interface Ruleset {
  id: string;
  name: string;
  kind: string;
  phase: string;
  rules?: RedirectRule[];
}

function fail(message: string, code = 1): never {
  console.error(`[docs-deploy] zone-wiring FAILED: ${message}`);
  process.exit(code);
}

function exitAuthority(): never {
  console.error(`[docs-deploy] zone-wiring: token lacks ${PERM_DNS} and/or ${PERM_REDIRECT}`);
  process.exit(3);
}

function parseWranglerText(raw: string): Record<string, unknown> {
  // JSONC: drop block comments, line comments, and trailing commas before JSON.parse.
  const cleaned = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,\s*([}\]])/g, '$1');
  const parsed: unknown = JSON.parse(cleaned);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    fail(`${WRANGLER_CONFIG} must be a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

// fallow-ignore-next-line complexity
function zoneIdFromRoutes(routes: unknown): string {
  if (!Array.isArray(routes) || routes.length === 0) return '';
  const first = routes[0];
  if (first === null || typeof first !== 'object') return '';
  const zone = (first as { zone_id?: unknown }).zone_id;
  return typeof zone === 'string' ? zone : '';
}

// fallow-ignore-next-line complexity
function readZoneId(): string {
  let cfg: Record<string, unknown>;
  try {
    cfg = parseWranglerText(readFileSync(WRANGLER_CONFIG, 'utf8'));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    fail(`cannot parse ${WRANGLER_CONFIG}: ${detail}`);
  }
  const accountId = typeof cfg.account_id === 'string' ? cfg.account_id : '';
  const zoneId = zoneIdFromRoutes(cfg.routes);
  if (!accountId || !zoneId) fail(`account_id/zone_id missing from ${WRANGLER_CONFIG}`);
  return zoneId;
}

function printHelp(): void {
  console.log(`Usage: pnpm exec tsx scripts/docs-deploy/zone-wiring.ts <mode> [options]

Modes:
  --probe-www   Public HTTPS probe of www (or --host) against the apex. No token.
  --check       Read-only: DNS www record + Single Redirect rule. Requires token.
  --apply       Idempotent create of missing www AAAA 100:: and redirect rule, then re-probe.
  --help        Show this help.

Options:
  --host <name>       Host to probe (default: ${DEFAULT_WWW_HOST}). Used with --probe-www.
  --apex-host <name>  Expected apex host for redirect-ok (default: ${DEFAULT_APEX_HOST}).

Exit codes:
  0  ok (wired / redirect-ok)
  3  authority missing (${PERM_DNS} and/or ${PERM_REDIRECT})
  4  drift or not-yet-wired / probe not redirect-ok
  5  --apply wrote, but www probe did not read redirect-ok

Token: CLOUDFLARE_API_TOKEN env only. Never printed.
Required permissions: ${PERM_DNS}; ${PERM_REDIRECT}.
`);
}

const MODE_FLAGS: Record<string, Mode> = {
  '--probe-www': 'probe-www',
  '--check': 'check',
  '--apply': 'apply',
  '--help': 'help',
  '-h': 'help',
};

// fallow-ignore-next-line complexity
function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { mode: null, host: DEFAULT_WWW_HOST, apexHost: DEFAULT_APEX_HOST };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i] as string;
    const mode = MODE_FLAGS[flag];
    if (mode) {
      if (args.mode !== null && args.mode !== 'help' && mode !== 'help') {
        fail(`multiple modes: already ${args.mode}, got ${flag}`);
      }
      args.mode = mode;
      continue;
    }
    if (flag === '--host') {
      args.host = argv[++i] ?? DEFAULT_WWW_HOST;
      continue;
    }
    if (flag === '--apex-host') {
      args.apexHost = argv[++i] ?? DEFAULT_APEX_HOST;
      continue;
    }
    fail(`unknown argument: ${flag}`);
  }
  return args;
}

function requireToken(): string {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!token) {
    console.error(
      `[docs-deploy] zone-wiring: CLOUDFLARE_API_TOKEN missing; need ${PERM_DNS} and ${PERM_REDIRECT}`,
    );
    process.exit(3);
  }
  return token;
}

// fallow-ignore-next-line complexity
function errorLooksLikeAuth(err: CfError): boolean {
  if (typeof err.code === 'number' && AUTH_CODES.has(err.code)) return true;
  const msg = (err.message ?? '').toLowerCase();
  return msg.includes('authentication') || msg.includes('authorization');
}

function isAuthFailure(status: number, errors: CfError[]): boolean {
  return status === 401 || status === 403 || errors.some(errorLooksLikeAuth);
}

async function parseCfJson<T>(res: Response): Promise<CfResponse<T>> {
  try {
    const data = (await res.json()) as CfResponse<T>;
    if (!Array.isArray(data.errors)) data.errors = [];
    return data;
  } catch {
    return {
      success: false,
      errors: [{ message: `non-JSON HTTP ${res.status}` }],
      messages: [],
      result: null as T,
    };
  }
}

async function cfFetchOnce<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: CfResponse<T> }> {
  const res = await fetch(`${CF_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await parseCfJson<T>(res);
  if (isAuthFailure(res.status, data.errors)) exitAuthority();
  return { status: res.status, data };
}

function isTransientNetworkError(err: unknown): boolean {
  const detail = err instanceof Error ? err.message : String(err);
  return /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket|network/i.test(detail);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// fallow-ignore-next-line complexity
async function cfFetch<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: CfResponse<T> }> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await cfFetchOnce<T>(token, method, path, body);
    } catch (err) {
      lastErr = err;
      if (!isTransientNetworkError(err) || attempt === 2) throw err;
      await sleep(250 * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/**
 * Public probe: one request, redirects off. redirect-ok requires status 301
 * whose Location host equals the apex. DNS/network failure → unresolved.
 */
// fallow-ignore-next-line complexity
async function probeHost(host: string, apexHost: string): Promise<WwwClass> {
  let outcome: WwwClass = 'unresolved';
  try {
    const res = await fetch(`https://${host}/`, { redirect: 'manual' });
    const location = res.headers.get('location');
    let locHost: string | null = null;
    if (location) {
      try {
        locHost = new URL(location, `https://${host}/`).host;
      } catch {
        locHost = null;
      }
    }
    if (res.status === 301 && locHost === apexHost) outcome = 'redirect-ok';
    else if (res.status === 200) outcome = 'served-directly';
    else outcome = 'wrong-target';
  } catch {
    outcome = 'unresolved';
  }
  console.log(`[docs-deploy] zone-wiring probe host=${host} apex=${apexHost} ${outcome}`);
  return outcome;
}

function expectedRedirectRule(): RedirectRule {
  return {
    ref: RULE_REF,
    expression: RULE_EXPRESSION,
    description: 'www to apex 301 (rnr-www-to-apex)',
    action: 'redirect',
    enabled: true,
    action_parameters: {
      from_value: {
        target_url: { expression: RULE_TARGET_EXPRESSION },
        status_code: 301,
        preserve_query_string: true,
      },
    },
  };
}

function fromValue(rule: RedirectRule): RedirectFromValue {
  return rule.action_parameters?.from_value ?? {};
}

// fallow-ignore-next-line complexity
function ruleMatchesExpected(rule: RedirectRule): boolean {
  const fv = fromValue(rule);
  return (
    rule.ref === RULE_REF &&
    rule.expression === RULE_EXPRESSION &&
    rule.action === 'redirect' &&
    fv.status_code === 301 &&
    fv.preserve_query_string === true &&
    fv.target_url?.expression === RULE_TARGET_EXPRESSION
  );
}

// fallow-ignore-next-line complexity
function describeRuleDrift(rule: RedirectRule): string {
  const fv = fromValue(rule);
  return (
    [
      rule.expression === RULE_EXPRESSION ? null : `expression=${JSON.stringify(rule.expression)}`,
      rule.action === 'redirect' ? null : `action=${JSON.stringify(rule.action)}`,
      fv.status_code === 301 ? null : `status_code=${String(fv.status_code)}`,
      fv.preserve_query_string === true ? null : 'preserve_query_string!=true',
      fv.target_url?.expression === RULE_TARGET_EXPRESSION
        ? null
        : `target_url=${JSON.stringify(fv.target_url)}`,
    ]
      .filter(Boolean)
      .join(', ') || 'unknown drift'
  );
}

function assertWwwDnsShape(rec: DnsRecord, context: string): void {
  if (rec.type === 'AAAA' && rec.content === WWW_CONTENT && rec.proxied === true) return;
  fail(
    `DNS drift (${context}): type=${rec.type} content=${rec.content} proxied=${String(rec.proxied)} (want AAAA ${WWW_CONTENT} proxied)`,
    4,
  );
}

async function listWwwDns(token: string, zoneId: string): Promise<DnsRecord[]> {
  const { data } = await cfFetch<DnsRecord[]>(
    token,
    'GET',
    `/zones/${zoneId}/dns_records?name=${encodeURIComponent(DEFAULT_WWW_HOST)}&type=AAAA`,
  );
  if (!data.success) fail(`DNS list failed: ${JSON.stringify(data.errors)}`);
  return data.result ?? [];
}

// fallow-ignore-next-line complexity
async function getRedirectEntrypoint(token: string, zoneId: string): Promise<Ruleset | null> {
  const { status, data } = await cfFetch<Ruleset>(
    token,
    'GET',
    `/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`,
  );
  if (status === 404) return null;
  if (!data.success) {
    if (data.errors[0]?.code === 10003) return null;
    fail(`redirect entrypoint read failed: ${JSON.stringify(data.errors)}`);
  }
  return data.result;
}

function findTaggedRule(ruleset: Ruleset | null): RedirectRule | null {
  return ruleset?.rules?.find((r) => r.ref === RULE_REF) ?? null;
}

function requireSingleWwwRecord(records: DnsRecord[]): DnsRecord {
  if (records.length === 0) fail('not-yet-wired: missing proxied AAAA www 100:: DNS record', 4);
  if (records.length > 1) {
    fail(`DNS drift: expected one www AAAA record, found ${records.length}`, 4);
  }
  return records[0] as DnsRecord;
}

async function checkWiring(token: string, zoneId: string): Promise<void> {
  const rec = requireSingleWwwRecord(await listWwwDns(token, zoneId));
  assertWwwDnsShape(rec, 'check');
  const rule = findTaggedRule(await getRedirectEntrypoint(token, zoneId));
  if (!rule) fail(`not-yet-wired: missing Single Redirect rule ref=${RULE_REF}`, 4);
  if (!ruleMatchesExpected(rule)) {
    fail(`redirect drift on ref=${RULE_REF}: ${describeRuleDrift(rule)}`, 4);
  }
  console.log(
    `[docs-deploy] zone-wiring check ok: www AAAA ${WWW_CONTENT} proxied; rule ${RULE_REF} present`,
  );
}

async function createWwwDns(token: string, zoneId: string): Promise<void> {
  const { data } = await cfFetch<DnsRecord>(token, 'POST', `/zones/${zoneId}/dns_records`, {
    type: 'AAAA',
    name: 'www',
    content: WWW_CONTENT,
    proxied: true,
    ttl: 1,
  });
  if (!data.success) fail(`DNS create failed: ${JSON.stringify(data.errors)}`);
  console.log(`[docs-deploy] zone-wiring created DNS AAAA www ${WWW_CONTENT} proxied`);
}

async function createRedirectRuleset(token: string, zoneId: string): Promise<void> {
  const { data } = await cfFetch<Ruleset>(token, 'POST', `/zones/${zoneId}/rulesets`, {
    name: 'Redirect rules ruleset',
    kind: 'zone',
    phase: PHASE,
    rules: [expectedRedirectRule()],
  });
  if (!data.success) fail(`redirect ruleset create failed: ${JSON.stringify(data.errors)}`);
  console.log(`[docs-deploy] zone-wiring created ${PHASE} ruleset with rule ${RULE_REF}`);
}

async function addRedirectRule(token: string, zoneId: string, rulesetId: string): Promise<void> {
  const { data } = await cfFetch<Ruleset>(
    token,
    'POST',
    `/zones/${zoneId}/rulesets/${rulesetId}/rules`,
    expectedRedirectRule(),
  );
  if (!data.success) fail(`redirect rule add failed: ${JSON.stringify(data.errors)}`);
  console.log(`[docs-deploy] zone-wiring added rule ${RULE_REF} to ruleset ${rulesetId}`);
}

// fallow-ignore-next-line complexity
async function ensureWwwDns(token: string, zoneId: string): Promise<boolean> {
  const records = await listWwwDns(token, zoneId);
  if (records.length === 0) {
    await createWwwDns(token, zoneId);
    return true;
  }
  if (records.length > 1) {
    fail(`DNS drift: expected one www AAAA record, found ${records.length}`, 4);
  }
  assertWwwDnsShape(records[0] as DnsRecord, 'apply');
  console.log('[docs-deploy] zone-wiring DNS www already correct; skipping create');
  return false;
}

// fallow-ignore-next-line complexity
async function ensureRedirectRule(token: string, zoneId: string): Promise<boolean> {
  const ruleset = await getRedirectEntrypoint(token, zoneId);
  const existing = findTaggedRule(ruleset);
  if (!ruleset) {
    await createRedirectRuleset(token, zoneId);
    return true;
  }
  if (!existing) {
    await addRedirectRule(token, zoneId, ruleset.id);
    return true;
  }
  if (!ruleMatchesExpected(existing)) {
    fail(
      `redirect drift: existing rule ref=${RULE_REF} differs (${describeRuleDrift(existing)}); refusing overwrite`,
      4,
    );
  }
  console.log(`[docs-deploy] zone-wiring rule ${RULE_REF} already correct; skipping create`);
  return false;
}

async function applyWiring(token: string, zoneId: string): Promise<void> {
  await ensureWwwDns(token, zoneId);
  await ensureRedirectRule(token, zoneId);
}

async function runApply(token: string, zoneId: string): Promise<void> {
  await applyWiring(token, zoneId);
  const outcome = await probeHost(DEFAULT_WWW_HOST, DEFAULT_APEX_HOST);
  if (outcome === 'redirect-ok') {
    console.log('[docs-deploy] zone-wiring apply ok: probe redirect-ok');
    process.exit(0);
  }
  console.error(
    `[docs-deploy] zone-wiring apply wrote/verified config but probe read ${outcome} (want redirect-ok)`,
  );
  process.exit(5);
}

// fallow-ignore-next-line complexity
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.mode === null || args.mode === 'help') {
    printHelp();
    if (args.mode === null) fail('mode required: --probe-www | --check | --apply | --help');
    process.exit(0);
  }
  if (args.mode === 'probe-www') {
    const outcome = await probeHost(args.host, args.apexHost);
    process.exit(outcome === 'redirect-ok' ? 0 : 4);
  }
  const token = requireToken();
  const zoneId = readZoneId();
  if (args.mode === 'check') {
    await checkWiring(token, zoneId);
    process.exit(0);
  }
  await runApply(token, zoneId);
}

function boot(): void {
  main().catch((err) => {
    const detail = err instanceof Error ? err.message : String(err);
    if (/authentication|authorization|401|403/i.test(detail)) exitAuthority();
    fail(detail);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  boot();
}
