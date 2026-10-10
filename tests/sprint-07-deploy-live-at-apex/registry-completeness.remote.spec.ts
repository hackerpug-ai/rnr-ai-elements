import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';

const APEX = 'https://rnraielements.com';
const ENGINES = ['nativewind', 'uniwind'] as const;
const CACHE_REGISTRY = 'public, max-age=300';
const REPO_ROOT = process.cwd();
const REGISTRY_PATH = join(REPO_ROOT, 'packages/registry/registry.json');
const EVIDENCE_DIR = join(
  REPO_ROOT,
  'tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-112-file-completeness',
);

type Engine = (typeof ENGINES)[number];

type RegistryUrl = {
  engine: Engine;
  name: string;
  url: string;
};

type SweepResult = {
  engine: Engine;
  name: string;
  url: string;
  status: number | null;
  contentType: string | null;
  cacheControl: string | null;
  bodyName: string | null;
  ok: boolean;
  error: string | null;
};

type TallyLine = {
  engine: string;
  present: number;
  expected: number;
};

type TallyReport = {
  ok: boolean;
  lines: TallyLine[];
  failures: string[];
  text: string[];
};

type UrlSet = {
  names: string[];
  engines: Engine[];
  urls: RegistryUrl[];
};

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function readRegistryNames(): string[] {
  const raw = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as {
    items?: Array<{ name?: string }>;
  };
  const names = (raw.items ?? [])
    .map((item) => item.name)
    .filter((name): name is string => typeof name === 'string' && name.length > 0);
  return [...new Set(names)];
}

/** Build the live URL set from the on-disk registry — never hard-code names. */
function buildRegistryUrlSet(names = readRegistryNames()): UrlSet {
  const urls: RegistryUrl[] = [];
  for (const engine of ENGINES) {
    for (const name of names) {
      urls.push({ engine, name, url: `${APEX}/r/${engine}/${name}.json` });
    }
  }
  return { names, engines: [...ENGINES], urls };
}

/** Pure per-engine tally: fails any engine whose present count is below expected. */
function tallyEngineResults(
  results: Array<{ engine: string; ok: boolean }>,
  expected: number,
): TallyReport {
  const engines = [...new Set(results.map((r) => r.engine))];
  const lines: TallyLine[] = [];
  const failures: string[] = [];
  const text: string[] = [];

  for (const engine of engines) {
    const present = results.filter((r) => r.engine === engine && r.ok).length;
    const line = { engine, present, expected };
    lines.push(line);
    const rendered = `engine=${engine} present=${present} expected=${expected}`;
    text.push(rendered);
    if (present < expected) {
      failures.push(rendered);
    }
  }

  return { ok: failures.length === 0, lines, failures, text };
}

function singleHeader(
  headers: Array<{ name: string; value: string }>,
  name: string,
): string | null {
  const matches = headers.filter((h) => h.name.toLowerCase() === name.toLowerCase());
  if (matches.length !== 1) return null;
  return matches[0]?.value ?? null;
}

function contentTypeIsJson(value: string | null): boolean {
  return typeof value === 'string' && /^application\/json\b/i.test(value);
}

function sweepBase(
  engine: Engine,
  name: string,
  url: string,
  status: number | null,
  contentType: string | null,
  cacheControl: string | null,
): SweepResult {
  return {
    engine,
    name,
    url,
    status,
    contentType,
    cacheControl,
    bodyName: null,
    ok: false,
    error: null,
  };
}

function headerContractErrors(
  status: number,
  contentType: string | null,
  cacheControl: string | null,
): string[] {
  const errors: string[] = [];
  if (status !== 200) errors.push(`status ${status}`);
  if (!contentTypeIsJson(contentType)) errors.push(`content-type ${contentType ?? '(missing)'}`);
  if (cacheControl !== CACHE_REGISTRY) {
    errors.push(`cache-control "${cacheControl ?? '(missing)'}"`);
  }
  return errors;
}

function parseBodyName(
  bodyText: string,
  expectedName: string,
): {
  bodyName: string | null;
  error: string | null;
} {
  if (bodyText.length === 0) return { bodyName: null, error: 'empty body' };
  try {
    const parsed = JSON.parse(bodyText) as { name?: unknown };
    if (typeof parsed.name !== 'string' || parsed.name !== expectedName) {
      return {
        bodyName: typeof parsed.name === 'string' ? parsed.name : null,
        error: `body.name "${String(parsed.name)}" !== "${expectedName}"`,
      };
    }
    return { bodyName: parsed.name, error: null };
  } catch (error) {
    return { bodyName: null, error: `JSON parse: ${errMessage(error)}` };
  }
}

function evaluateSweepResponse(args: {
  engine: Engine;
  name: string;
  url: string;
  status: number;
  contentType: string | null;
  cacheControl: string | null;
  bodyText: string;
}): SweepResult {
  const base = sweepBase(
    args.engine,
    args.name,
    args.url,
    args.status,
    args.contentType,
    args.cacheControl,
  );
  const errors = headerContractErrors(args.status, args.contentType, args.cacheControl);
  const body = parseBodyName(args.bodyText, args.name);
  if (body.error) errors.push(body.error);
  if (errors.length > 0) {
    return { ...base, bodyName: body.bodyName, error: errors.join('; ') };
  }
  return { ...base, bodyName: body.bodyName, ok: true, error: null };
}

async function probeOne(request: APIRequestContext, entry: RegistryUrl): Promise<SweepResult> {
  try {
    const response = await request.get(entry.url, { maxRedirects: 0 });
    const headers = response.headersArray();
    const bodyText = await response.text();
    return evaluateSweepResponse({
      engine: entry.engine,
      name: entry.name,
      url: entry.url,
      status: response.status(),
      contentType:
        singleHeader(headers, 'content-type') ?? response.headers()['content-type'] ?? null,
      cacheControl: singleHeader(headers, 'cache-control'),
      bodyText,
    });
  } catch (error) {
    return {
      ...sweepBase(entry.engine, entry.name, entry.url, null, null, null),
      error: errMessage(error),
    };
  }
}

function gitHeadShort(): string | null {
  const head = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  })
    .stdout?.trim()
    .slice(0, 40);
  return head || null;
}

function writeRunEvidence(payload: Record<string, unknown>): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(join(EVIDENCE_DIR, 'run.json'), `${JSON.stringify(payload, null, 2)}\n`);
}

test('APX-007-url-set', () => {
  test.setTimeout(60_000);

  const set = buildRegistryUrlSet();
  expect(set.names.length, 'distinct registry item names').toBe(56);
  expect(new Set(set.names).size, 'no duplicate names').toBe(56);
  expect(set.engines, 'both engines').toEqual(['nativewind', 'uniwind']);
  expect(set.urls.length, '112 live URLs').toBe(112);
  expect(new Set(set.urls.map((u) => u.url)).size, 'no duplicate URLs').toBe(112);

  const shape = /^https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;
  for (const entry of set.urls) {
    expect(entry.url, entry.url).toMatch(shape);
  }
});

test('APX-007-tally-oracle', () => {
  test.setTimeout(60_000);

  const shortList = [
    ...Array.from({ length: 56 }, () => ({ engine: 'A', ok: true })),
    ...Array.from({ length: 50 }, () => ({ engine: 'B', ok: true })),
    ...Array.from({ length: 6 }, () => ({ engine: 'B', ok: false })),
  ];
  const short = tallyEngineResults(shortList, 56);
  expect(short.ok).toBe(false);
  expect(short.text).toContain('engine=A present=56 expected=56');
  expect(short.text).toContain('engine=B present=50 expected=56');
  expect(short.failures).toEqual(['engine=B present=50 expected=56']);

  const fullList = [
    ...Array.from({ length: 56 }, () => ({ engine: 'A', ok: true })),
    ...Array.from({ length: 56 }, () => ({ engine: 'B', ok: true })),
  ];
  const full = tallyEngineResults(fullList, 56);
  expect(full.ok).toBe(true);
  expect(full.failures).toEqual([]);
  expect(full.text).toEqual(['engine=A present=56 expected=56', 'engine=B present=56 expected=56']);
});

test('FLOW-DELIV-03-112-file-completeness', async ({ request }) => {
  test.setTimeout(600_000);

  const set = buildRegistryUrlSet();
  expect(set.urls.length).toBe(112);

  const results: SweepResult[] = [];
  for (const entry of set.urls) {
    results.push(await probeOne(request, entry));
  }

  const tally = tallyEngineResults(
    results.map((r) => ({ engine: r.engine, ok: r.ok })),
    set.names.length,
  );

  const failures = [
    ...results.filter((r) => !r.ok).map((r) => `${r.url}: ${r.error}`),
    ...tally.failures.map((line) => `tally ${line}`),
  ];

  writeRunEvidence({
    flowId: 'FLOW-DELIV-03-112-file-completeness',
    capturedAt: new Date().toISOString(),
    gitHead: gitHeadShort(),
    outcome: failures.length === 0 ? 'green' : 'red',
    expectedCacheControl: CACHE_REGISTRY,
    nameCount: set.names.length,
    urlCount: set.urls.length,
    tallies: tally.text,
    presentByEngine: Object.fromEntries(
      tally.lines.map((line) => [line.engine, { present: line.present, expected: line.expected }]),
    ),
    results: results.map((r) => ({
      url: r.url,
      engine: r.engine,
      name: r.name,
      status: r.status,
      contentType: r.contentType,
      cacheControl: r.cacheControl,
      bodyName: r.bodyName,
      ok: r.ok,
      error: r.error,
    })),
  });

  if (failures.length > 0) {
    throw new Error(
      `FLOW-DELIV-03-112-file-completeness RED against live apex:\n- ${failures.join('\n- ')}\n${tally.text.join('\n')}`,
    );
  }

  expect(tally.text).toContain('engine=nativewind present=56 expected=56');
  expect(tally.text).toContain('engine=uniwind present=56 expected=56');
});
