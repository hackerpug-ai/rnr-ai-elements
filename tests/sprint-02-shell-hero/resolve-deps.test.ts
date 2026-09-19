import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import {
  type AiSdkPeer,
  deriveAiSdkPeers,
  type Engine,
  resolveRegistryDependencies,
} from '../../apps/docs/src/lib/resolve-deps';
import { CONTRACT_KEYS, siteFactsBytes } from '../../scripts/docs-data/prebuild';

/**
 * SHELL-006 — the data half of FLOW-GEND-21: the {engine}/{version} resolver
 * and the build-derived AI SDK peers fact (site-facts.json). Everything runs
 * against the REAL artifacts: the generated registry-items.json dataset, the
 * root package.json version, apps/example/package.json's `ai` pin, the real
 * `pnpm --filter @rnr-ai-elements/docs build` chain, and the real git index —
 * no fixtures, no mocks. The dataset + root public/r are seeded by the ordered
 * chain the docs build itself runs (registry:build && gallery:manifest &&
 * prebuild), so a plain docs build is self-seeding here.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const ITEMS_JSON = join(repoRoot, 'apps/docs/src/data/registry-items.json');
const SITE_FACTS_JSON = join(repoRoot, 'apps/docs/src/data/site-facts.json');
const ROOT_PKG = join(repoRoot, 'package.json');
const EXAMPLE_PKG = join(repoRoot, 'apps/example/package.json');
const DOCS_PKG = '@rnr-ai-elements/docs';
const RESOLVER_SOURCE = join(repoRoot, 'apps/docs/src/lib/resolve-deps.ts');
const ENGINES: Engine[] = ['nativewind', 'uniwind'];

type Run = { status: number | null; stdout: string; stderr: string };

/** The wired docs build — runs the ordered chain (registry, gallery, prebuild, astro). */
function docsBuild(): Run {
  const proc = spawnSync('pnpm', ['--filter', DOCS_PKG, 'build'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 600_000,
  });
  return { status: proc.status, stdout: proc.stdout ?? '', stderr: proc.stderr ?? '' };
}

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: repoRoot, stdio: 'pipe' }).toString();
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

type DatasetItem = { name: string; registryDependencies?: string[] };

function dataset(): DatasetItem[] {
  return readJson(ITEMS_JSON) as DatasetItem[];
}

function exampleDependencies(): Record<string, string> {
  return (readJson(EXAMPLE_PKG) as { dependencies: Record<string, string> }).dependencies;
}

/** The consumer-pin -> caret-range rule, restated here so the test is an independent oracle. */
function caretRange(pin: string): string {
  return /^[\^~><=]/.test(pin) ? pin : `^${pin}`;
}

it('SHELL-006-resolver-substitution: {engine} resolves per engine over the real 56-item dataset', () => {
  const items = dataset();
  expect(items).toHaveLength(56);
  const rootVersion = (readJson(ROOT_PKG) as { version: string }).version;
  // Fixture record: the same root version the sprint-01 chip carries.
  expect(rootVersion).toBe('0.2.1');

  const byName = new Map(items.map((i) => [i.name, i]));
  const shimmer = byName.get('shimmer') as DatasetItem;
  const conversation = byName.get('conversation') as DatasetItem;

  // The raw dataset carries the templates — a no-op passthrough leaks these.
  expect(shimmer.registryDependencies).toEqual([
    'https://reactnativereusables.com/r/{engine}/text.json',
  ]);
  expect(conversation.registryDependencies).toContain(
    'https://rnraielements.com/r/{engine}/empty.json',
  );

  // Shimmer under both engine segments.
  expect(
    resolveRegistryDependencies(shimmer.registryDependencies, 'nativewind', rootVersion),
  ).toEqual(['https://reactnativereusables.com/r/nativewind/text.json']);
  expect(resolveRegistryDependencies(shimmer.registryDependencies, 'uniwind', rootVersion)).toEqual(
    ['https://reactnativereusables.com/r/uniwind/text.json'],
  );

  // Conversation's self-referential URL at the live root version, both engines.
  for (const engine of ENGINES) {
    const resolved = resolveRegistryDependencies(
      conversation.registryDependencies,
      engine,
      rootVersion,
    );
    expect(resolved).toContain(`https://rnraielements.com/r/${engine}/empty.json`);
  }

  // Whole dataset x both engines: zero residual templates, and byte-parity
  // with what build-registry actually serves per engine (the never-drift
  // proof: panel URLs resolved here are exactly the served /r/*.json URLs).
  for (const item of items) {
    for (const engine of ENGINES) {
      const resolved = resolveRegistryDependencies(item.registryDependencies, engine, rootVersion);
      for (const url of resolved) {
        expect(url, `${item.name}/${engine}: residual template`).not.toContain('{engine}');
        expect(url, `${item.name}/${engine}: residual template`).not.toContain('{version}');
      }
      if (item.name === 'shimmer') {
        expect(resolved, 'shimmer must resolve to a non-empty array').toHaveLength(1);
      }
      const served = readJson(join(repoRoot, 'public/r', engine, `${item.name}.json`)) as {
        registryDependencies?: string[];
      };
      expect(
        resolved,
        `${item.name}/${engine}: resolved dataset URLs must equal the served fan-out`,
      ).toEqual(served.registryDependencies ?? []);
    }
  }

  // Negative control: the version is READ (root package.json -> prebuild ->
  // resolver argument), never hardcoded inside the resolver module.
  const moduleSource = readFileSync(RESOLVER_SOURCE, 'utf8');
  expect(moduleSource, 'resolver must not hardcode the version').not.toContain(rootVersion);
});

it('SHELL-006-site-facts-derived-peers: aiSdkPeers derive from apps/example/package.json, fail-closed, untracked', {
  timeout: 900_000,
}, () => {
  const deps = exampleDependencies();
  const aiPin = deps.ai as string;
  // Fixture record: the only real AI SDK pin in the repo.
  expect(aiPin).toBe('7.0.89');

  // 1. The real chain emits site-facts.json with the derived peers.
  const build = docsBuild();
  const evidence = `${build.stdout}\n${build.stderr}`;
  expect(build.status, `docs build failed\n${evidence}`).toBe(0);
  expect(existsSync(SITE_FACTS_JSON), 'site-facts.json must exist after the build').toBe(true);

  const facts = readJson(SITE_FACTS_JSON) as { aiSdkPeers: AiSdkPeer[] };
  const expected: AiSdkPeer[] = [{ name: 'ai', range: caretRange(aiPin) }];
  expect(facts.aiSdkPeers, 'peers must equal the manifest-derived expectation').toEqual(expected);
  const major = aiPin.split('.')[0];
  expect(
    facts.aiSdkPeers[0]?.range,
    'range must be major-pinned to the manifest pin (7.x from 7.0.89)',
  ).toMatch(new RegExp(`^\\^${major}\\.`));

  // 2. Untracked and ignored — a tracked copy would serve stale bytes.
  expect(git(['ls-files', '--', 'apps/docs/src/data/site-facts.json'])).toBe('');
  let ignored = false;
  try {
    execFileSync('git', ['check-ignore', 'apps/docs/src/data/site-facts.json'], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    ignored = true;
  } catch {
    ignored = false;
  }
  expect(ignored, 'check-ignore must exit 0 for site-facts.json').toBe(true);

  // 3. Fresh-clone proof: delete, rerun the wired build, identical bytes return.
  const preDeletion = readFileSync(SITE_FACTS_JSON);
  const prebuildStart = Date.now();
  rmSync(SITE_FACTS_JSON);
  expect(existsSync(SITE_FACTS_JSON)).toBe(false);
  const rerun = docsBuild();
  expect(rerun.status, `${rerun.stdout}\n${rerun.stderr}`).toBe(0);
  expect(existsSync(SITE_FACTS_JSON), 'site-facts.json must regenerate').toBe(true);
  expect(statSync(SITE_FACTS_JSON).mtimeMs).toBeGreaterThan(prebuildStart);
  expect(readFileSync(SITE_FACTS_JSON).equals(preDeletion), 'regenerated bytes must match').toBe(
    true,
  );

  // 4. Fail-closed: an empty peers resolution refuses to emit (throws before
  // any write), so a manifest that stops pinning `ai` fails the build.
  expect(() => siteFactsBytes({})).toThrow(/aiSdkPeers/);
  expect(() => siteFactsBytes({ react: '19.2.3' })).toThrow(/aiSdkPeers/);
  expect(deriveAiSdkPeers({})).toEqual([]);
});

it('SHELL-006-prebuild-wiring: docs build exits 0, 56 items x 14 contract keys, site-facts emission logged', {
  timeout: 900_000,
}, () => {
  const build = docsBuild();
  const out = `${build.stdout}\n${build.stderr}`;
  expect(build.status, `docs build failed\n${out}`).toBe(0);

  const entries = readJson(ITEMS_JSON) as Record<string, unknown>[];
  expect(entries).toHaveLength(56);
  for (const entry of entries) {
    expect(Object.keys(entry), `${entry.name}: contract key set`).toEqual([...CONTRACT_KEYS]);
  }

  // The prebuild summary names the emitted AI SDK consumer requirement.
  expect(out, 'summary must log the site-facts emission').toContain('site-facts');
  expect(out, 'summary must name the ai peer requirement').toContain(
    `ai@${caretRange(exampleDependencies().ai as string)}`,
  );
});
