/**
 * ORI-AST-006 — the emitted-site link gate (CAP-DOCS-01; content standard item 2).
 *
 * Walks every .html file Astro actually emitted, resolves internal links
 * (root-relative, relative, and canonical-origin) against the SAME build being
 * checked, validates fragments against real target IDs, recognizes real
 * meta-refresh redirect documents and validates their destinations, and
 * exercises external links over real HTTP with ordinary-failure=warning vs
 * required-reference-failure=hard severity.
 *
 * CLI (default command unchanged): `tsx scripts/docs-data/check-dist-links.ts`
 *   --dist <dir>      checked output directory (default apps/docs/dist)
 *   --origin <url>    canonical origin (default https://rnraielements.com)
 *   --required <url>  additive required reference URL (repeatable; preserves defaults)
 *
 * Exits 0 when every internal link, redirect destination, fragment and required
 * reference resolves; 1 on any missing document/fragment, empty/absent output,
 * or required-reference failure; 2 on a usage error. Ordinary external failures
 * warn (source + URL + HTTP status) but do not fail the gate.
 *
 * A CLI spawned by the lane test via tsx, never imported (hence the
 * fallow-ignore-file unused-file directive below).
 */
// fallow-ignore-file unused-file
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_DIST = join(REPO_ROOT, 'apps/docs/dist');
const DEFAULT_ORIGIN = 'https://rnraielements.com';
const EXTERNAL_TIMEOUT_MS = 30_000;

/**
 * The default required-reference set — the authoritative prior-art/reference
 * URLs a complete build declares (Vercel AI Elements, elements.ai-sdk.dev
 * porting reference, the expo-ai-elements prior art, and the RNR CLI reference).
 * A failure on any of these is hard; the additive --required option preserves
 * this set and appends.
 */
export const DEFAULT_REQUIRED_REFERENCES = [
  'https://github.com/vercel/ai-elements',
  'https://elements.ai-sdk.dev',
  'https://github.com/muratcakmak/expo-ai-elements',
  'https://reactnativereusables.com',
  'https://reactnativereusables.com/docs/cli',
];

type Severity = 'error' | 'warning';

type IssueKind =
  | 'missing-document'
  | 'missing-fragment'
  | 'redirect-destination'
  | 'external'
  | 'no-html';

type Issue = {
  severity: Severity;
  source: string;
  url: string;
  kind: IssueKind;
  detail: string;
  status?: number;
  finalUrl?: string;
};

type ExternalResult = {
  requested: string;
  final: string;
  status: number;
  ok: boolean;
  error?: string;
};

type CheckResult = {
  htmlFiles: number;
  linksChecked: number;
  internal: number;
  external: number;
  issues: Issue[];
  externalResults: ExternalResult[];
};

type LinkClass =
  | { kind: 'skip' }
  | { kind: 'fragment'; fragment: string }
  | { kind: 'internal'; path: string; fragment: string | null }
  | { kind: 'external'; url: string };

type Resolved = { status: 'file'; file: string } | { status: 'missing' };

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// fallow-ignore-next-line complexity
function splitPathFragment(input: string): { path: string; fragment: string | null } {
  const hash = input.indexOf('#');
  if (hash === -1) {
    const query = input.indexOf('?');
    return { path: query === -1 ? input : input.slice(0, query), fragment: null };
  }
  const pathPart = input.slice(0, hash);
  const query = pathPart.indexOf('?');
  return {
    path: query === -1 ? pathPart : pathPart.slice(0, query),
    fragment: input.slice(hash + 1) || null,
  };
}

// fallow-ignore-next-line complexity
function classify(url: string, origin: string): LinkClass {
  const raw = url.trim();
  if (raw === '' || raw === '#') return { kind: 'skip' };
  if (raw.startsWith('#')) return { kind: 'fragment', fragment: raw.slice(1) };
  if (raw.startsWith('//')) return { kind: 'external', url: `https:${raw}` };
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(raw);
  if (scheme) {
    const name = scheme[1].toLowerCase();
    if (name === 'http' || name === 'https') {
      let parsed: URL;
      try {
        parsed = new URL(raw);
      } catch {
        return { kind: 'skip' };
      }
      const originUrl = new URL(origin);
      if (parsed.origin === originUrl.origin) {
        const { path, fragment } = splitPathFragment(`${parsed.pathname}${parsed.search}`);
        return { kind: 'internal', path, fragment };
      }
      return { kind: 'external', url: raw };
    }
    return { kind: 'skip' }; // mailto:, tel:, data:, javascript:, blob:, ...
  }
  const { path, fragment } = splitPathFragment(raw);
  return { kind: 'internal', path, fragment };
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

// fallow-ignore-next-line complexity
function resolveTarget(path: string, referringFile: string, dist: string): Resolved {
  const decoded = safeDecode(path);
  let abs: string;
  if (decoded.startsWith('/')) {
    abs = join(dist, decoded.replace(/^\/+/, ''));
  } else {
    abs = resolve(dirname(referringFile), decoded);
  }
  const candidates: string[] = [abs, join(abs, 'index.html'), `${abs}.html`];
  if (relative(dist, abs) === '') {
    candidates.push(join(dist, 'index.html'));
  }
  for (const candidate of candidates) {
    if (isFile(candidate)) return { status: 'file', file: candidate };
  }
  return { status: 'missing' };
}

/** Strip inline script/style bodies so href/src inside JS/CSS text is never scanned. */
function stripInert(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
}

// fallow-ignore-next-line complexity
function extractLinks(html: string): { url: string }[] {
  const links: { url: string }[] = [];
  const re = /\b(?:href|src)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  for (const match of html.matchAll(re)) {
    const value = (match[2] ?? match[3] ?? '').trim();
    if (value) links.push({ url: value });
  }
  return links;
}

// fallow-ignore-next-line complexity
function walkHtmlFiles(dist: string): string[] {
  const out: string[] = [];
  const stack = [dist];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) stack.push(path);
      else if (entry.name.endsWith('.html')) out.push(relative(dist, path).split(sep).join('/'));
    }
  }
  return out.sort();
}

/** Collect the id= and legacy name= anchors actually present in a document. */
function getIdSet(file: string, html: string, cache: Map<string, Set<string>>): Set<string> {
  const cached = cache.get(file);
  if (cached) return cached;
  const ids = new Set<string>();
  for (const match of html.matchAll(/\bid\s*=\s*"([^"]*)"/g)) ids.add(match[1]);
  for (const match of html.matchAll(/\bname\s*=\s*"([^"]*)"/g)) ids.add(match[1]);
  cache.set(file, ids);
  return ids;
}

/** Validate one fragment link against the target document's real IDs. */
function checkFragment(
  source: string,
  url: string,
  fragment: string,
  targetFile: string,
  targetHtml: string,
  idCache: Map<string, Set<string>>,
  issues: Issue[],
): void {
  const ids = getIdSet(targetFile, targetHtml, idCache);
  const decoded = safeDecode(fragment);
  if (ids.has(fragment) || ids.has(decoded)) return;
  issues.push({
    severity: 'error',
    kind: 'missing-fragment',
    source,
    url,
    detail: `fragment #${fragment} not found in target document`,
  });
}

/**
 * Astro's static redirect document: <meta http-equiv="refresh" content="0;url=…">.
 * Returns the relative destination, or null when the file is not a redirect.
 */
function readRedirectTarget(file: string): string | null {
  const html = readFileSync(file, 'utf8');
  const meta = /<meta\b[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/i.exec(html);
  if (!meta) return null;
  const content = /content\s*=\s*["']([^"']*)["']/i.exec(meta[0]);
  if (!content) return null;
  const url = /url\s*=\s*([^;,"'\s]+)/i.exec(content[1]);
  return url ? safeDecode(url[1]) : null;
}

// fallow-ignore-next-line complexity
function checkRedirectDestination(
  redirectFile: string,
  dist: string,
  seen: Set<string>,
  issues: Issue[],
): void {
  const target = readRedirectTarget(redirectFile);
  if (target === null) return;
  if (seen.has(redirectFile)) return;
  seen.add(redirectFile);
  if (target === '' || target === '#') {
    issues.push({
      severity: 'error',
      kind: 'redirect-destination',
      source: relative(dist, redirectFile).split(sep).join('/'),
      url: target,
      detail: 'redirect has an empty destination',
    });
    return;
  }
  const resolved = resolveTarget(target, redirectFile, dist);
  if (resolved.status === 'missing') {
    issues.push({
      severity: 'error',
      kind: 'redirect-destination',
      source: relative(dist, redirectFile).split(sep).join('/'),
      url: target,
      detail: 'redirect destination missing',
    });
    return;
  }
  checkRedirectDestination(resolved.file, dist, seen, issues);
}

async function fetchExternal(url: string): Promise<ExternalResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
    return {
      requested: url,
      final: res.url,
      status: res.status,
      ok: res.status >= 200 && res.status < 300,
    };
  } catch (err) {
    return {
      requested: url,
      final: url,
      status: -1,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeRef(url: string): string {
  return url.replace(/\/+$/, '');
}

function isRequired(url: string, requiredSet: string[]): boolean {
  const normalized = normalizeRef(url);
  return requiredSet.some((ref) => normalizeRef(ref) === normalized);
}

// fallow-ignore-next-line complexity
async function checkDist(
  dist: string,
  origin: string,
  requiredSet: string[],
): Promise<CheckResult> {
  const result: CheckResult = {
    htmlFiles: 0,
    linksChecked: 0,
    internal: 0,
    external: 0,
    issues: [],
    externalResults: [],
  };
  if (!existsSync(dist)) {
    result.issues.push({
      severity: 'error',
      kind: 'no-html',
      source: dist,
      url: '',
      detail: 'output directory absent',
    });
    return result;
  }
  const htmlFiles = walkHtmlFiles(dist);
  result.htmlFiles = htmlFiles.length;
  if (htmlFiles.length === 0) {
    result.issues.push({
      severity: 'error',
      kind: 'no-html',
      source: dist,
      url: '',
      detail: 'no HTML files (empty output)',
    });
    return result;
  }

  const idCache = new Map<string, Set<string>>();
  const externalCache = new Map<string, ExternalResult>();

  for (const relFile of htmlFiles) {
    const absFile = join(dist, relFile);
    const html = stripInert(readFileSync(absFile, 'utf8'));
    for (const { url } of extractLinks(html)) {
      const cls = classify(url, origin);
      if (cls.kind === 'skip') continue;
      result.linksChecked += 1;
      if (cls.kind === 'fragment') {
        result.internal += 1;
        checkFragment(
          relFile,
          `#${cls.fragment}`,
          cls.fragment,
          absFile,
          html,
          idCache,
          result.issues,
        );
        continue;
      }
      if (cls.kind === 'internal') {
        result.internal += 1;
        const resolved = resolveTarget(cls.path, absFile, dist);
        if (resolved.status === 'missing') {
          result.issues.push({
            severity: 'error',
            kind: 'missing-document',
            source: relFile,
            url,
            detail: 'no such target in the build',
          });
          continue;
        }
        checkRedirectDestination(resolved.file, dist, new Set(), result.issues);
        if (cls.fragment !== null) {
          const targetHtml = stripInert(readFileSync(resolved.file, 'utf8'));
          checkFragment(
            relFile,
            url,
            cls.fragment,
            resolved.file,
            targetHtml,
            idCache,
            result.issues,
          );
        }
        continue;
      }
      result.external += 1;
      const cached = externalCache.get(cls.url);
      const extResult = cached ?? (await fetchExternal(cls.url));
      externalCache.set(cls.url, extResult);
      result.externalResults.push(extResult);
      if (!extResult.ok) {
        const required = isRequired(cls.url, requiredSet);
        const status =
          extResult.status >= 0
            ? `HTTP ${extResult.status}`
            : `network error (${extResult.error ?? 'unknown'})`;
        result.issues.push({
          severity: required ? 'error' : 'warning',
          kind: 'external',
          source: relFile,
          url: cls.url,
          detail: required
            ? `required reference failed (${status})`
            : `external link failed (${status})`,
          status: extResult.status,
          finalUrl: extResult.final,
        });
      }
    }
  }
  return result;
}

// fallow-ignore-next-line complexity
function renderIssue(issue: Issue): string {
  const sev = issue.severity === 'error' ? 'error' : 'warning';
  if (issue.kind === 'no-html') {
    return `[docs-data] link-check: ${sev} ${issue.source}: ${issue.detail}`;
  }
  const status = issue.status !== undefined && issue.status >= 0 ? ` (HTTP ${issue.status})` : '';
  return `[docs-data] link-check: ${sev} ${issue.source} -> ${issue.url}: ${issue.detail}${status}`;
}

function readArg(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

// fallow-ignore-next-line complexity
function parseArgs(argv: string[]): { dist: string; origin: string; required: string[] } {
  const dist = readArg(argv, '--dist') ?? DEFAULT_DIST;
  const origin = readArg(argv, '--origin') ?? DEFAULT_ORIGIN;
  const required: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--required' && argv[i + 1]) required.push(argv[++i]);
  }
  return { dist, origin, required };
}

const USAGE = `usage: tsx scripts/docs-data/check-dist-links.ts [--dist <dir>] [--origin <url>] [--required <url>]...

  --dist <dir>      checked output directory (default apps/docs/dist)
  --origin <url>    canonical origin for canonical-domain internal links
  --required <url>  additive required reference URL (repeatable; preserves defaults)`;

// fallow-ignore-next-line complexity
async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(USAGE);
    process.exit(0);
  }
  const { dist, origin, required: additions } = parseArgs(argv);
  const requiredSet = [...DEFAULT_REQUIRED_REFERENCES, ...additions];
  const resolvedDist = resolve(dist);
  const result = await checkDist(resolvedDist, origin, requiredSet);

  const errors = result.issues.filter((issue) => issue.severity === 'error');
  const warnings = result.issues.filter((issue) => issue.severity === 'warning');
  for (const issue of result.issues) {
    console.error(renderIssue(issue));
  }
  console.log(
    `[docs-data] link-check: ${result.htmlFiles} html files, ${result.linksChecked} links ` +
      `(${result.internal} internal, ${result.external} external), ` +
      `${errors.length} error(s), ${warnings.length} warning(s)`,
  );
  if (errors.length > 0) process.exit(1);
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
