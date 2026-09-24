/**
 * ORI-AST-005 — authored-snippet source gate (CAP-DOCS-01 "snippet gate").
 *
 * Deterministic build-time pipeline over the real authored md/mdx corpus and
 * the real source-owner packages:
 *
 *   1. discover   — parse every code-bearing block in the authored corpus:
 *                   fenced code blocks AND MDX `readFileSync` exports that feed
 *                   a CodeBlock `code={…}` prop (the Quickstart pattern).
 *   2. configure  — require the engine packages' committed configuration
 *                   inputs (shell/CSS/configuration code is never exempted
 *                   from provenance; the engine config sets are the
 *                   configuration kind's committed inputs).
 *   3. bind       — resolve every block against a committed binding
 *                   (whole file, or a region pinned by sha256+length);
 *                   unbound blocks, stale bindings and duplicate bindings
 *                   fail with document/snippet/source identities.
 *   4. compare    — byte-compare every block against its selected source
 *                   bytes (source drift, missing and ambiguous regions fail).
 *   5. compile    — run the real owner compilers: the committed consumer
 *                   recipe assembles each engine package (nativewind /
 *                   uniwind) into a real dependency context and `tsc --noEmit`
 *                   runs inside it; the live example compiles through its
 *                   owning import-graph config (tsconfig.live-chat.json).
 *   6. emit       — with `--check-emitted <dist>`, extract rendered
 *                   SourceSnippet bytes from the built output and byte-compare
 *                   them to the freshly selected sources; one drifted byte
 *                   fails. The gate never writes into the corpus or the dist.
 *
 * This is a gate: it only READS the corpus. Writes are limited to the owned
 * consumer cache (`--consumer-cache`, default a task-owned tmpdir) and the
 * per-case scratch copies it creates and removes.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIAGNOSTIC_PREFIX = '[authored-snippets]';

export interface RegionSpec {
  sha256: string;
  length: number;
}

export interface BlockBinding {
  /** Repo-relative authored document path, e.g. apps/docs/src/content/docs/cli.md. */
  doc: string;
  /** Block identity inside the document: fence-<ordinal> or the MDX export name. */
  snippet: string;
  /** Repo-relative committed source file the block must byte-equal. */
  source: string;
  /** Absent = whole file; present = the unique window of exactly `length` bytes. */
  region?: RegionSpec;
}

type Engine = 'nativewind' | 'uniwind';

const ENGINES: Engine[] = ['nativewind', 'uniwind'];

/**
 * The committed provenance for the current authored corpus (verified
 * byte-for-byte at review time; the gate re-proves it on every run).
 * Region bindings pin the exact window by sha256 + byte length.
 */
export const COMMITTED_BINDINGS: BlockBinding[] = [
  {
    doc: 'apps/docs/src/content/docs/quickstart.mdx',
    snippet: 'messagesSource',
    source: 'packages/docs-snippets/shared/quickstart-messages.ts',
  },
  {
    doc: 'apps/docs/src/content/docs/quickstart.mdx',
    snippet: 'screenSource',
    source: 'packages/docs-snippets/shared/quickstart-screen.tsx',
  },
  {
    doc: 'apps/docs/src/content/docs/quickstart.mdx',
    snippet: 'entrypointNativewind',
    source: 'packages/docs-snippets/nativewind/app/index.tsx',
  },
  {
    doc: 'apps/docs/src/content/docs/quickstart.mdx',
    snippet: 'entrypointUniwind',
    source: 'packages/docs-snippets/uniwind/app/index.tsx',
  },
  {
    doc: 'apps/docs/src/content/docs/cli.md',
    snippet: 'fence-0',
    source: 'packages/docs-snippets/commands/nativewind.sh',
    region: {
      sha256: '97761277ab70e48cd68036e590bed17364c559767461ee1b41117fd1fd182b91',
      length: 105,
    },
  },
  {
    doc: 'apps/docs/src/content/docs/theming.mdx',
    snippet: 'fence-0',
    source: 'apps/example/global.css',
    region: {
      sha256: '218d3c0c7bfa84a664eed364afc513d7ba3344eb374c7dc5eb4ac1682216430e',
      length: 838,
    },
  },
];

/** The engine packages' committed configuration inputs (the configuration kind). */
const REQUIRED_CONFIG_FILES: Record<Engine, string[]> = {
  nativewind: [
    'package.json',
    'tsconfig.json',
    'tailwind.config.js',
    'babel.config.js',
    'metro.config.js',
    'components.json',
    'app.json',
    'global.css',
    'nativewind-env.d.ts',
  ],
  uniwind: [
    'package.json',
    'tsconfig.json',
    'metro.config.js',
    'components.json',
    'app.json',
    'global.css',
    'uniwind-types.d.ts',
  ],
};

const SHARED_SOURCES = ['quickstart-messages.ts', 'quickstart-screen.tsx'];

type SnippetKind = 'ts' | 'tsx' | 'shell' | 'css' | 'configuration' | 'other';

interface DiscoveredBlock {
  doc: string;
  snippet: string;
  kind: SnippetKind;
  flavor: 'fence' | 'source-bound';
  bytes: string;
  /** source-bound blocks carry the path their readFileSync declaration names. */
  declaredSource: string | null;
}

interface CompilerReceipt {
  engine: string;
  executable: string;
  cwd: string;
  config: string;
  args: string[];
  exit: number;
  durationMs: number;
  typescriptVersion: string;
}

interface GateReport {
  ok: boolean;
  root: string;
  docsRoot: string;
  documents: string[];
  blocks: {
    doc: string;
    snippet: string;
    kind: SnippetKind;
    flavor: string;
    source: string;
    region: RegionSpec | null;
    byteLength: number;
    sha256: string;
  }[];
  kindCoverage: Record<string, number>;
  configurationInputs: string[];
  compilerReceipts: CompilerReceipt[];
  consumerCache: Record<string, string>;
  emitted: { distRoot: string; elements: number; failures: string[] } | null;
  errors: string[];
}

class GateFailure extends Error {}

function fail(message: string): never {
  throw new GateFailure(`${DIAGNOSTIC_PREFIX} ${message}`);
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// ---------------------------------------------------------------------------
// 1. Discovery — parse the real authored corpus; nothing list-based.
// ---------------------------------------------------------------------------

const FENCE_KINDS: Record<string, SnippetKind> = {
  ts: 'ts',
  typescript: 'ts',
  tsx: 'tsx',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  shell: 'shell',
  css: 'css',
  json: 'configuration',
  js: 'configuration',
  mjs: 'configuration',
  cjs: 'configuration',
};

function kindFromFenceLang(lang: string): SnippetKind {
  return FENCE_KINDS[lang.toLowerCase()] ?? 'other';
}

function kindFromSourcePath(sourceRel: string): SnippetKind {
  if (sourceRel.endsWith('.tsx')) return 'tsx';
  if (sourceRel.endsWith('.ts')) return 'ts';
  if (sourceRel.endsWith('.sh')) return 'shell';
  if (sourceRel.endsWith('.css')) return 'css';
  if (/\.(json|c?js|mjs)$/.test(sourceRel)) return 'configuration';
  return 'other';
}

function listDocuments(docsRoot: string): string[] {
  if (!existsSync(docsRoot)) {
    fail(`discovery: docs root does not exist: ${docsRoot}`);
  }
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(md|mdx)$/.test(entry.name)) out.push(p);
    }
  };
  walk(docsRoot);
  if (out.length === 0) {
    fail(`discovery: no authored md/mdx documents under ${docsRoot}`);
  }
  return out.sort();
}

function scanFences(text: string): { lang: string; bytes: string }[] {
  const lines = text.split('\n');
  const fences: { lang: string; bytes: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^\s{0,3}(`{3,}|~{3,})\s*([^\s`]*)\s*$/);
    if (!open) continue;
    const marker = open[1];
    const lang = open[2];
    let closed = false;
    const body: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trimEnd() === marker) {
        fences.push({ lang, bytes: body.join('\n') });
        i = j;
        closed = true;
        break;
      }
      body.push(lines[j]);
    }
    if (!closed) fail(`discovery: unterminated fenced code block opening at line ${i + 1}`);
  }
  return fences;
}

const READ_SYNC_EXPORT =
  /export\s+const\s+(\w+)\s*=\s*readFileSync\(\s*join\(\s*process\.cwd\(\)\s*,\s*['"]([^'"]+)['"]\s*\)\s*,\s*['"]utf8['"]\s*,?\s*\)/g;
const CODE_PROP_USE = /code=\{(\w+)\}/g;

interface DiscoveryResult {
  documents: string[];
  blocks: DiscoveredBlock[];
}

// The corpus parser must handle both authored block flavors; the branching is
// the specification, not incidental complexity.
// fallow-ignore-next-line complexity
function discoverBlocks(root: string, docsRoot: string): DiscoveryResult {
  const documents = listDocuments(docsRoot);
  // During the real docs build process.cwd() is the docs app, so MDX
  // readFileSync(join(process.cwd(), …)) paths resolve from there.
  const docsAppDir = resolve(docsRoot, '..', '..', '..');
  const blocks: DiscoveredBlock[] = [];
  for (const file of documents) {
    const text = readFileSync(file, 'utf8');
    const doc =
      root === '' ? file : file.startsWith(`${root}/`) ? file.slice(root.length + 1) : file;
    let fenceOrdinal = 0;
    for (const fence of scanFences(text)) {
      blocks.push({
        doc,
        snippet: `fence-${fenceOrdinal++}`,
        kind: kindFromFenceLang(fence.lang),
        flavor: 'fence',
        bytes: fence.bytes,
        declaredSource: null,
      });
    }
    if (file.endsWith('.mdx')) {
      const exported = new Map<string, string>();
      for (const m of text.matchAll(READ_SYNC_EXPORT)) {
        const sourceAbs = resolve(docsAppDir, m[2]);
        exported.set(m[1], sourceAbs);
      }
      for (const m of text.matchAll(CODE_PROP_USE)) {
        const name = m[1];
        const sourceAbs = exported.get(name);
        if (!sourceAbs) continue; // not a readFileSync-sourced prop; not a displayed source block
        const sourceRel = sourceAbs.startsWith(`${root}/`)
          ? sourceAbs.slice(root.length + 1)
          : sourceAbs;
        let bytes: string;
        try {
          bytes = readFileSync(sourceAbs, 'utf8');
        } catch (err) {
          fail(
            `missing source: ${sourceRel} (document ${doc} snippet ${name}): ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
        blocks.push({
          doc,
          snippet: name,
          kind: kindFromSourcePath(sourceRel),
          flavor: 'source-bound',
          bytes,
          declaredSource: sourceRel,
        });
      }
    }
  }
  return { documents, blocks };
}

// ---------------------------------------------------------------------------
// 2. Configuration inputs (the configuration kind's committed inputs).
// ---------------------------------------------------------------------------

function requireConfigurationInputs(root: string): string[] {
  const found: string[] = [];
  for (const engine of ENGINES) {
    for (const file of REQUIRED_CONFIG_FILES[engine]) {
      const rel = `packages/docs-snippets/${engine}/${file}`;
      if (!existsSync(join(root, rel))) {
        fail(
          `configuration input missing: ${rel} (the ${engine} engine package's committed configuration set is incomplete)`,
        );
      }
      found.push(rel);
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// 3. Bindings + 4. byte comparison.
// ---------------------------------------------------------------------------

function loadBindings(root: string, overridePath: string | undefined): BlockBinding[] {
  if (overridePath === undefined) return COMMITTED_BINDINGS.map((b) => ({ ...b }));
  const abs = resolve(root, overridePath);
  if (!existsSync(abs)) fail(`bindings file does not exist: ${abs}`);
  const parsed: unknown = JSON.parse(readFileSync(abs, 'utf8'));
  if (!Array.isArray(parsed)) fail(`bindings file must hold an array: ${abs}`);
  return parsed as BlockBinding[];
}

function selectSourceBytes(root: string, binding: BlockBinding): string {
  const abs = join(root, binding.source);
  let text: string;
  try {
    text = readFileSync(abs, 'utf8');
  } catch (err) {
    fail(
      `missing source: ${binding.source} (bound from ${binding.doc} snippet ${binding.snippet}): ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
  if (!binding.region) return text;
  const buf = Buffer.from(text, 'utf8');
  if (binding.region.length > buf.length) {
    fail(
      `selected region not found: source ${binding.source} (${buf.length} bytes) is shorter than the ` +
        `bound region (${binding.region.length} bytes) from ${binding.doc} snippet ${binding.snippet}`,
    );
  }
  const matches: number[] = [];
  for (let i = 0; i <= buf.length - binding.region.length; i++) {
    if (
      sha256(buf.subarray(i, i + binding.region.length).toString('utf8')) === binding.region.sha256
    ) {
      matches.push(i);
    }
  }
  if (matches.length === 0) {
    fail(
      `selected region not found: 0 matching windows of ${binding.region.length} bytes in ${binding.source} ` +
        `(bound from ${binding.doc} snippet ${binding.snippet})`,
    );
  }
  if (matches.length > 1) {
    fail(
      `ambiguous selection: ${matches.length} matching windows of ${binding.region.length} bytes in ` +
        `${binding.source} (bound from ${binding.doc} snippet ${binding.snippet})`,
    );
  }
  return buf.subarray(matches[0], matches[0] + binding.region.length).toString('utf8');
}

function firstMismatch(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : n;
}

// ---------------------------------------------------------------------------
// 5. Owner compilers — real processes in real dependency contexts.
// ---------------------------------------------------------------------------

interface ConsumerAssembly {
  cachePath: string;
  key: string;
}

function copyTree(src: string, dst: string): void {
  cpSync(src, dst, { recursive: true });
}

function requireConsumerPrerequisites(root: string, engine: Engine): void {
  const packageDir = join(root, 'packages/docs-snippets', engine);
  if (!existsSync(packageDir)) {
    fail(
      `prerequisite missing: packages/docs-snippets/${engine} (source package for the ${engine} engine)`,
    );
  }
  const tsconfig = join(packageDir, 'tsconfig.json');
  if (!existsSync(tsconfig)) {
    fail(
      `prerequisite missing: packages/docs-snippets/${engine}/tsconfig.json (owning compiler context for ${engine})`,
    );
  }
  if (!existsSync(join(packageDir, 'package.json'))) {
    fail(
      `prerequisite missing: packages/docs-snippets/${engine}/package.json (source package manifest for ${engine})`,
    );
  }
  for (const file of SHARED_SOURCES) {
    const rel = `packages/docs-snippets/shared/${file}`;
    if (!existsSync(join(root, rel))) {
      fail(
        `prerequisite missing: ${rel} (shared quickstart source consumed by the ${engine} engine)`,
      );
    }
  }
}

/**
 * Assembles (once per dependency identity) a real engine consumer exactly the
 * way the committed recipe does: template copy + shared sources, then the
 * recipe script verbatim (pnpm install, expo reconcile, the five public
 * registry installs, and its own tsc step). ponytail: recipe timeout orphans
 * pnpm grandchildren on the pathological 30-min path — same ceiling the
 * support helpers accept; add a detached process group if that ever fires.
 */
// Fail-closed prerequisite checks are deliberately verbose: each missing
// input names itself instead of collapsing into one generic error.
// fallow-ignore-next-line complexity
function ensureConsumer(root: string, engine: Engine, cacheDir: string): ConsumerAssembly {
  requireConsumerPrerequisites(root, engine);
  const packageDir = join(root, 'packages/docs-snippets', engine);
  const sharedDir = join(root, 'packages/docs-snippets/shared');
  const recipe = join(root, 'packages/docs-snippets/commands', `${engine}.sh`);
  if (!existsSync(recipe)) {
    fail(
      `prerequisite missing: packages/docs-snippets/commands/${engine}.sh (the committed consumer recipe)`,
    );
  }
  // The dependency identity — not the tutorial sources — decides the install.
  // Tutorial sources are synced into every fresh compile case afterwards.
  const key = sha256(readFileSync(join(packageDir, 'package.json'), 'utf8')).slice(0, 16);
  const cachePath = join(cacheDir, `${engine}-${key}`);
  const sentinel = join(cachePath, '.ori-consumer-ready');
  if (existsSync(sentinel)) return { cachePath, key };

  mkdirSync(cacheDir, { recursive: true });
  const building = join(cacheDir, `.building-${engine}-${process.pid}-${key}`);
  rmSync(building, { recursive: true, force: true });
  try {
    copyTree(packageDir, building);
    copyTree(sharedDir, join(building, 'shared'));
    const recipeRun = spawnSync('bash', [recipe], {
      cwd: building,
      encoding: 'utf8',
      timeout: 30 * 60_000,
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    });
    const exit = recipeRun.status ?? -1;
    if (exit !== 0 || !existsSync(join(building, 'node_modules', '.bin', 'tsc'))) {
      const tail = `${recipeRun.stdout ?? ''}${recipeRun.stderr ?? ''}`.slice(-4000);
      fail(
        `consumer ${engine}: committed recipe exited ${exit} (cwd ${building}); the real dependency ` +
          `context could not be assembled:\n${tail}`,
      );
    }
    // The readiness sentinel is written INSIDE the building copy so it rides
    // the rename: a cachePath without it never counts as assembled.
    writeFileSync(join(building, '.ori-consumer-ready'), `${engine}-${key}\n`);
    if (existsSync(cachePath)) rmSync(building, { recursive: true, force: true });
    else {
      try {
        renameSync(building, cachePath);
      } catch {
        rmSync(building, { recursive: true, force: true });
      }
    }
  } catch (err) {
    rmSync(building, { recursive: true, force: true });
    throw err;
  }
  return { cachePath, key };
}

function typescriptVersionOf(consumerRoot: string): string {
  const pkg = join(consumerRoot, 'node_modules', 'typescript', 'package.json');
  if (!existsSync(pkg)) {
    fail(
      `prerequisite missing: ${join(consumerRoot, 'node_modules', 'typescript')} (the consumer's TypeScript)`,
    );
  }
  return (JSON.parse(readFileSync(pkg, 'utf8')) as { version?: string }).version ?? 'unknown';
}

/**
 * Compiles a FRESH physical clone of the assembled consumer with the CURRENT
 * corpus sources synced in, so mutated templates/shared bytes are what the
 * real compiler sees. The case directory is removed on every exit path.
 */
function compileEngine(
  root: string,
  engine: Engine,
  assembly: ConsumerAssembly,
  boundBlocks: { doc: string; snippet: string; source: string }[],
): CompilerReceipt {
  const caseDir = mkdtempSync(join(tmpdir(), `ori-ast-005-${engine}-case-`));
  try {
    copyTree(assembly.cachePath, caseDir);
    const templateDir = join(root, 'packages/docs-snippets', engine);
    copyTree(templateDir, caseDir);
    rmSync(join(caseDir, 'shared'), { recursive: true, force: true });
    copyTree(join(root, 'packages/docs-snippets/shared'), join(caseDir, 'shared'));

    const tsconfig = join(caseDir, 'tsconfig.json');
    if (!existsSync(tsconfig)) {
      fail(
        `prerequisite missing: packages/docs-snippets/${engine}/tsconfig.json (owning compiler context for ${engine})`,
      );
    }
    const tscBin = join(caseDir, 'node_modules', '.bin', 'tsc');
    if (!existsSync(tscBin)) {
      fail(
        `prerequisite missing: ${tscBin} (the ${engine} consumer's TypeScript executable is not installed)`,
      );
    }
    // Evidence identity: the case clone is removed on every exit path, so the
    // receipt records the compiler and tsconfig at their persistent cache
    // paths (the clone is a byte-identical copy of both).
    const persistentExecutable = realpathSync(
      join(assembly.cachePath, 'node_modules', '.bin', 'tsc'),
    );
    const persistentConfig = join(assembly.cachePath, 'tsconfig.json');
    const started = Date.now();
    const run = spawnSync(tscBin, ['--noEmit'], {
      cwd: caseDir,
      encoding: 'utf8',
      timeout: 300_000,
      maxBuffer: 64 * 1024 * 1024,
    });
    const durationMs = Date.now() - started;
    const receipt: CompilerReceipt = {
      engine,
      executable: persistentExecutable,
      cwd: caseDir,
      config: persistentConfig,
      args: ['--noEmit'],
      exit: run.status ?? -1,
      durationMs,
      typescriptVersion: typescriptVersionOf(caseDir),
    };
    if (receipt.exit !== 0) {
      const diagnostics = `${run.stdout ?? ''}${run.stderr ?? ''}`.slice(0, 4000).trim();
      const identities = boundBlocks
        .map((b) => `${b.doc} snippet ${b.snippet} source ${b.source}`)
        .join('; ');
      fail(
        `compiler ${engine}: exit ${receipt.exit} (cwd ${caseDir}, config ${tsconfig}) — ` +
          `bound blocks: ${identities || 'none'}\n${diagnostics}`,
      );
    }
    return receipt;
  } finally {
    rmSync(caseDir, { recursive: true, force: true });
  }
}

function compileLiveChat(root: string): CompilerReceipt {
  const appDir = join(root, 'apps/example');
  const configPath = join(appDir, 'tsconfig.live-chat.json');
  if (!existsSync(appDir)) {
    fail(`prerequisite missing: apps/example (the live example's source package)`);
  }
  if (!existsSync(configPath)) {
    fail(
      `prerequisite missing: apps/example/tsconfig.live-chat.json (the live example's owning import-graph compiler context)`,
    );
  }
  const tscBin = join(appDir, 'node_modules', '.bin', 'tsc');
  if (!existsSync(tscBin)) {
    fail(`prerequisite missing: ${tscBin} (TypeScript is not installed for apps/example)`);
  }
  const executable = realpathSync(tscBin);
  const started = Date.now();
  const run = spawnSync(tscBin, ['-p', 'tsconfig.live-chat.json'], {
    cwd: appDir,
    encoding: 'utf8',
    timeout: 300_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const receipt: CompilerReceipt = {
    engine: 'live-chat',
    executable,
    cwd: appDir,
    config: configPath,
    args: ['-p', 'tsconfig.live-chat.json'],
    exit: run.status ?? -1,
    durationMs: Date.now() - started,
    typescriptVersion: typescriptVersionOf(appDir),
  };
  if (receipt.exit !== 0) {
    const diagnostics = `${run.stdout ?? ''}${run.stderr ?? ''}`.slice(0, 4000).trim();
    fail(
      `compiler live-chat: exit ${receipt.exit} (cwd ${appDir}, config ${configPath})\n${diagnostics}`,
    );
  }
  return receipt;
}

// ---------------------------------------------------------------------------
// 6. Emission check — built output vs freshly selected source bytes.
// ---------------------------------------------------------------------------

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function listHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.html')) out.push(p);
    }
  };
  if (!existsSync(dir)) fail(`emitted check: dist root does not exist: ${dir}`);
  walk(dir);
  return out;
}

interface EmittedCheck {
  elements: number;
  failures: string[];
}

// Each emitted element carries three provenance attributes plus a binding and
// a byte comparison; every failure mode needs its own attributable message.
// fallow-ignore-next-line complexity
function checkEmitted(
  distRoot: string,
  root: string,
  bindings: BlockBinding[],
  matchedKeys: Set<string>,
): EmittedCheck {
  const failures: string[] = [];
  let elements = 0;
  const elementRe = /<div\b([^>]*data-source-snippet[^>]*)>([\s\S]*?)<\/div>/g;
  const attr = (tag: string, name: string): string | null => {
    const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
    return m ? m[1] : null;
  };
  for (const file of listHtmlFiles(distRoot)) {
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(elementRe)) {
      elements++;
      const tag = m[1];
      const doc = attr(tag, 'data-doc');
      const snippet = attr(tag, 'data-snippet');
      const source = attr(tag, 'data-source');
      if (!doc || !snippet || !source) {
        failures.push(
          `${DIAGNOSTIC_PREFIX} emitted element in ${file} is missing doc/snippet/source provenance attributes`,
        );
        continue;
      }
      const binding = bindings.find((b) => b.doc === doc && b.snippet === snippet);
      if (!binding) {
        failures.push(
          `${DIAGNOSTIC_PREFIX} emitted ${doc} snippet ${snippet} source ${source}: no committed binding`,
        );
        continue;
      }
      matchedKeys.add(`${binding.doc}::${binding.snippet}`);
      if (binding.source !== source) {
        failures.push(
          `${DIAGNOSTIC_PREFIX} emitted ${doc} snippet ${snippet}: displayed source ${source} drifted from the committed binding ${binding.source}`,
        );
        continue;
      }
      const codeMatch = m[2].match(/<code\b[^>]*>([\s\S]*?)<\/code>/);
      if (!codeMatch) {
        failures.push(
          `${DIAGNOSTIC_PREFIX} emitted ${doc} snippet ${snippet}: no rendered <code> element found in ${file}`,
        );
        continue;
      }
      let expected: string;
      try {
        expected = selectSourceBytes(root, binding);
      } catch (err) {
        failures.push(err instanceof Error ? err.message : String(err));
        continue;
      }
      const rendered = decodeHtmlEntities(codeMatch[1]);
      if (rendered !== expected) {
        const offset = firstMismatch(rendered, expected);
        failures.push(
          `${DIAGNOSTIC_PREFIX} emitted byte mismatch: ${doc} snippet ${snippet} source ${source} — ` +
            `rendered ${rendered.length} bytes vs source ${expected.length} bytes, first mismatch at offset ${offset}`,
        );
      }
    }
  }
  if (elements === 0) {
    fail(`emitted check: no data-source-snippet elements found under ${distRoot}`);
  }
  return { elements, failures };
}

// ---------------------------------------------------------------------------
// Pipeline.
// ---------------------------------------------------------------------------

interface GateOptions {
  root: string;
  docsRoot?: string;
  bindingsPath?: string;
  checkEmitted?: string;
  consumerCache?: string;
}

function runGate(options: GateOptions): GateReport {
  const errors: string[] = [];
  const root = resolve(options.root);
  const docsRoot = resolve(root, options.docsRoot ?? 'apps/docs/src/content/docs');
  const consumerCache = resolve(options.consumerCache ?? join(tmpdir(), 'ori-ast-005-consumers'));
  const report: GateReport = {
    ok: false,
    root,
    docsRoot,
    documents: [],
    blocks: [],
    kindCoverage: {},
    configurationInputs: [],
    compilerReceipts: [],
    consumerCache: {},
    emitted: null,
    errors,
  };

  const step = (fn: () => void): void => {
    if (errors.length > 0) return;
    try {
      fn();
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  };

  let discovery: DiscoveryResult = { documents: [], blocks: [] };
  step(() => {
    discovery = discoverBlocks(root, docsRoot);
    report.documents = discovery.documents;
  });

  let configurationInputs: string[] = [];
  step(() => {
    configurationInputs = requireConfigurationInputs(root);
    report.configurationInputs = configurationInputs;
  });

  const emittedDist = options.checkEmitted ? resolve(root, options.checkEmitted) : null;
  let bindings: BlockBinding[] = [];
  // A binding is matched by an authored corpus block OR by an emitted
  // SourceSnippet element (bindings may also exist purely for emission checks
  // of pages outside the authored corpus, e.g. owned proof pages).
  const matchedKeys = new Set<string>();
  // Every authored block is diagnosed (not just the first failure) and each
  // failure mode carries its own attributable message.
  // fallow-ignore-next-line complexity
  step(() => {
    bindings = loadBindings(root, options.bindingsPath);
    const byKey = new Map<string, BlockBinding>();
    for (const binding of bindings) {
      const key = `${binding.doc}::${binding.snippet}`;
      if (byKey.has(key)) {
        fail(`duplicate binding for ${binding.doc} snippet ${binding.snippet}`);
      }
      byKey.set(key, binding);
    }
    // A binding is reviewed provenance for one snippet identity; an identity
    // may be DISPLAYED multiple times (the Quickstart renders the shared
    // sources once per engine tab), so bindings are matched, not consumed.
    // Every block is diagnosed — one unbound or drifted block must not hide
    // the state of the rest, so problems are collected, not thrown per block.
    const problem = (message: string): void => {
      errors.push(`${DIAGNOSTIC_PREFIX} ${message}`);
    };
    for (const block of discovery.blocks) {
      const key = `${block.doc}::${block.snippet}`;
      const binding = byKey.get(key);
      if (!binding) {
        problem(
          `no committed binding (unbound ${block.flavor} block): document ${block.doc} snippet ${block.snippet} kind ${block.kind}`,
        );
        continue;
      }
      matchedKeys.add(key);
      if (block.declaredSource !== null && binding.source !== block.declaredSource) {
        problem(
          `source binding drift: document ${block.doc} snippet ${block.snippet} reads ${block.declaredSource} ` +
            `but the committed binding pins ${binding.source}`,
        );
        continue;
      }
      let selected: string;
      try {
        selected = selectSourceBytes(root, binding);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
        continue;
      }
      const offset = firstMismatch(block.bytes, selected);
      if (offset !== -1) {
        problem(
          `byte mismatch (source drift): document ${block.doc} snippet ${block.snippet} source ${binding.source} — ` +
            `authored ${block.bytes.length} bytes vs source ${selected.length} bytes, first mismatch at offset ${offset}`,
        );
        continue;
      }
      report.blocks.push({
        doc: block.doc,
        snippet: block.snippet,
        kind: block.kind,
        flavor: block.flavor,
        source: binding.source,
        region: binding.region ?? null,
        byteLength: selected.length,
        sha256: sha256(selected),
      });
    }
    const coverage: Record<string, number> = {};
    for (const block of report.blocks) {
      coverage[block.kind] = (coverage[block.kind] ?? 0) + 1;
    }
    coverage['configuration'] = configurationInputs.length;
    report.kindCoverage = coverage;
  });

  // Owner-compiler phase: sequential, fail-closed per engine; the branching
  // is one gate per real compiler context.
  // fallow-ignore-next-line complexity
  step(() => {
    const boundByEngine = new Map<Engine, { doc: string; snippet: string; source: string }[]>();
    for (const engine of ENGINES) {
      boundByEngine.set(
        engine,
        report.blocks.filter(
          (b) => b.source.includes(`/${engine}/`) || b.source.includes('/shared/'),
        ),
      );
    }
    const receipts: CompilerReceipt[] = [];
    for (const engine of ENGINES) {
      const assembly = ensureConsumer(root, engine, consumerCache);
      report.consumerCache[engine] = assembly.cachePath;
      receipts.push(compileEngine(root, engine, assembly, boundByEngine.get(engine) ?? []));
    }
    receipts.push(compileLiveChat(root));
    report.compilerReceipts = receipts;
  });

  if (emittedDist !== null) {
    step(() => {
      const check = checkEmitted(emittedDist, root, bindings, matchedKeys);
      report.emitted = {
        distRoot: emittedDist,
        elements: check.elements,
        failures: check.failures,
      };
      for (const failure of check.failures) errors.push(failure);
    });
  }

  step(() => {
    const problem = (message: string): void => {
      errors.push(`${DIAGNOSTIC_PREFIX} ${message}`);
    };
    const byKey = new Map(bindings.map((b) => [`${b.doc}::${b.snippet}`, b] as const));
    for (const key of byKey.keys()) {
      if (!matchedKeys.has(key)) {
        problem(`stale binding: ${key} matches no authored block and no emitted element`);
      }
    }
  });

  report.ok = errors.length === 0;
  return report;
}

function parseArgs(argv: readonly string[]): GateOptions {
  const options: GateOptions = { root: REPO_ROOT };
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1];
    switch (argv[i]) {
      case '--root':
        options.root = String(value);
        i++;
        break;
      case '--docs-root':
        options.docsRoot = String(value);
        i++;
        break;
      case '--bindings':
        options.bindingsPath = String(value);
        i++;
        break;
      case '--check-emitted':
        options.checkEmitted = String(value);
        i++;
        break;
      case '--consumer-cache':
        options.consumerCache = String(value);
        i++;
        break;
      default:
        fail(
          `unknown argument: ${argv[i]} (supported: --root --docs-root --bindings --check-emitted --consumer-cache)`,
        );
    }
  }
  return options;
}

async function main(argv: readonly string[]): Promise<0 | 1> {
  let report: GateReport;
  try {
    report = runGate(parseArgs(argv));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
  for (const error of report.errors) console.error(error);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return report.ok ? 0 : 1;
}

const isDirectRun =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('authored-snippets.ts') ||
    process.argv[1].endsWith('authored-snippets.js'));

if (isDirectRun) {
  void main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
