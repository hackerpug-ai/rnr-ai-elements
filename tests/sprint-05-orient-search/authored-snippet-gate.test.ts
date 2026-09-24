/**
 * ORI-AST-005 — authored code that loses its real source or typecheck is rejected.
 *
 * Tiering (task file, REQUIREMENT-CONTRACT v1):
 *  - AC-1 (integration): the complete unchanged real corpus passes the real
 *    gate command — the inventory equals an independently recorded block
 *    count, every block resolves provenance, both engine owner compilers and
 *    the live-example import-graph compiler run with exit 0.
 *  - AC-2 (integration): missing sources, missing/ambiguous regions, unbound
 *    blocks and missing/empty discovery roots fail with attributable
 *    document/snippet/source diagnostics on real filesystem copies; restored
 *    inputs pass.
 *  - AC-3 (e2e): a real Astro build serving SourceSnippet output — rendered
 *    text and real Chromium clipboard bytes equal the selected source
 *    byte-for-byte; a one-byte emission drift fails the production
 *    comparison through the real command while the untouched output passes.
 *  - AC-4 (integration): both engine owner compilers reject an invalid import
 *    and an invalid component prop through real tsc processes; missing
 *    compiler context, source package, or installed dependency fail closed;
 *    restored sources pass again.
 *
 * No mocks: every run spawns the real gate CLI (tsx), the real TypeScript
 * compilers inside assembled consumers, a real Astro build + preview server,
 * and a real Chromium with the real clipboard.
 */

import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { COMMITTED_BINDINGS } from '../../scripts/docs-data/authored-snippets';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const GATE_SCRIPT = join(REPO_ROOT, 'scripts/docs-data/authored-snippets.ts');
const TSX_BIN = join(REPO_ROOT, 'node_modules/.bin/tsx');
const CONSUMER_CACHE = join(tmpdir(), 'ori-ast-005-consumers');

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

interface GateRun {
  exit: number;
  stdout: string;
  stderr: string;
}

interface GateBlock {
  doc: string;
  snippet: string;
  kind: string;
  flavor: string;
  source: string;
  region: { sha256: string; length: number } | null;
  byteLength: number;
  sha256: string;
}

interface GateReceipt {
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
  blocks: GateBlock[];
  kindCoverage: Record<string, number>;
  configurationInputs: string[];
  compilerReceipts: GateReceipt[];
  consumerCache: Record<string, string>;
  emitted: { distRoot: string; elements: number; failures: unknown[] } | null;
}

function runGate(args: string[], timeoutMs = 420_000): GateRun {
  const res = spawnSync(TSX_BIN, [GATE_SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    exit: res.status ?? -1,
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
  };
}

function parseReport(run: GateRun): GateReport {
  return JSON.parse(run.stdout) as GateReport;
}

/** Directory exclusions for corpus copies (never copy installed trees). */
const COPY_EXCLUDED = new Set(['node_modules', 'dist', '.expo', '.turbo', '.astro']);

function makeCorpusCopy(tag: string): string {
  const root = mkdtempSync(join(tmpdir(), `ori-ast-005-${tag}-`));
  cpSync(join(REPO_ROOT, 'apps/docs/src/content/docs'), join(root, 'apps/docs/src/content/docs'), {
    recursive: true,
  });
  cpSync(join(REPO_ROOT, 'packages/docs-snippets'), join(root, 'packages/docs-snippets'), {
    recursive: true,
  });
  cpSync(join(REPO_ROOT, 'apps/example'), join(root, 'apps/example'), {
    recursive: true,
    filter: (src) => {
      const rel = relative(REPO_ROOT, src);
      if (rel === '') return true;
      return !rel.split(/[/\\]/).some((segment) => COPY_EXCLUDED.has(segment));
    },
  });
  symlinkSync(
    join(REPO_ROOT, 'apps/example/node_modules'),
    join(root, 'apps/example/node_modules'),
    'dir',
  );
  return root;
}

const CORPUS_DOCS_REL = 'apps/docs/src/content/docs';

/**
 * The test's OWN corpus scan — deliberately independent of the gate's parser.
 * Counts fenced code blocks (line scanner) and MDX readFileSync exports that
 * feed a CodeBlock code={…} prop. Identities use the same repo-relative
 * document paths the gate's committed bindings name.
 */
// The independence IS the point: this scanner shares no code with the gate.
// fallow-ignore-next-line complexity
function independentInventory(docsDir: string): { doc: string; snippet: string }[] {
  const blocks: { doc: string; snippet: string }[] = [];
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(p));
      else if (/\.(md|mdx)$/.test(entry.name)) out.push(p);
    }
    return out;
  };
  for (const file of walk(docsDir).sort()) {
    const text = readFileSync(file, 'utf8');
    const doc = `${CORPUS_DOCS_REL}/${relative(docsDir, file).split(/[/\\]/).join('/')}`;
    let fenceIndex = 0;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/^```[^`\n]*$/.test(lines[i]) && lines[i].length > 3) {
        // opening fence with an info string; find the closing bare fence
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j] === '```') {
            blocks.push({ doc, snippet: `fence-${fenceIndex++}` });
            i = j;
            break;
          }
        }
      }
    }
    if (file.endsWith('.mdx')) {
      const exports = new Map<string, string>();
      for (const m of text.matchAll(
        /export\s+const\s+(\w+)\s*=\s*readFileSync\(\s*join\(\s*process\.cwd\(\)\s*,\s*['"]([^'"]+)['"]/g,
      )) {
        exports.set(m[1], m[2]);
      }
      for (const m of text.matchAll(/code=\{(\w+)\}/g)) {
        if (exports.has(m[1])) blocks.push({ doc, snippet: m[1] });
      }
    }
  }
  return blocks;
}

let corpus: string;

beforeAll(() => {
  corpus = makeCorpusCopy('corpus');
});

afterAll(() => {
  rmSync(corpus, { recursive: true, force: true });
});

describe('ORI-AST-005 authored snippet gate', () => {
  it('ORI-AST-005-inventory: unchanged real corpus passes with complete provenance and real compiler receipts', {
    timeout: 900_000,
  }, () => {
    const run = runGate(['--root', corpus, '--consumer-cache', CONSUMER_CACHE]);
    const stderr = run.stderr;
    expect(run.exit, `gate exited ${run.exit}; stderr:\n${stderr}`).toBe(0);
    const report = parseReport(run);

    const expected = independentInventory(join(corpus, CORPUS_DOCS_REL));
    expect(
      expected.length,
      'independent inventory found no authored code blocks — the corpus scan is broken',
    ).toBeGreaterThan(0);
    expect(report.blocks.length).toBe(expected.length);

    const reported = new Set(report.blocks.map((b) => `${b.doc}::${b.snippet}`));
    const independent = new Set(expected.map((b) => `${b.doc}::${b.snippet}`));
    expect([...reported].sort()).toEqual([...independent].sort());

    // Coverage includes TS, TSX, shell and CSS kinds from real blocks.
    expect(report.kindCoverage['ts']).toBeGreaterThan(0);
    expect(report.kindCoverage['tsx']).toBeGreaterThan(0);
    expect(report.kindCoverage['shell']).toBeGreaterThan(0);
    expect(report.kindCoverage['css']).toBeGreaterThan(0);

    // Every block resolves to exactly one committed source file or region.
    for (const block of report.blocks) {
      expect(block.source, `block ${block.doc}::${block.snippet} has empty provenance`).not.toBe(
        '',
      );
      expect(existsSync(join(corpus, block.source))).toBe(true);
      expect(block.byteLength).toBeGreaterThan(0);
      const sourceText = readFileSync(join(corpus, block.source), 'utf8');
      if (block.region === null) {
        expect(block.sha256, `whole-file block ${block.doc}::${block.snippet} drifted`).toEqual(
          sha256(sourceText),
        );
        expect(block.byteLength).toBe(sourceText.length);
      } else {
        // Region binding: exactly one window of the committed length carries
        // the committed sha256 inside the source file.
        const buf = Buffer.from(sourceText, 'utf8');
        const windows: number[] = [];
        for (let i = 0; i <= buf.length - block.region.length; i++) {
          if (
            sha256(buf.subarray(i, i + block.region.length).toString('utf8')) ===
            block.region.sha256
          ) {
            windows.push(i);
          }
        }
        expect(
          windows.length,
          `region block ${block.doc}::${block.snippet} matched ${windows.length} windows in ${block.source}`,
        ).toBe(1);
        expect(block.sha256).toBe(block.region.sha256);
      }
    }

    // Configuration inputs of both engine packages are present and recorded.
    expect(report.configurationInputs.length).toBeGreaterThan(0);
    expect(report.configurationInputs.some((p) => p.includes('nativewind'))).toBe(true);
    expect(report.configurationInputs.some((p) => p.includes('uniwind'))).toBe(true);

    // Real compiler receipts: both engine owners + the live-example import graph.
    const receipts = report.compilerReceipts;
    expect(receipts.length).toBe(3);
    for (const receipt of receipts) {
      expect(receipt.exit, `receipt ${receipt.engine} exited ${receipt.exit}`).toBe(0);
      expect(existsSync(receipt.executable), `executable missing: ${receipt.executable}`).toBe(
        true,
      );
      expect(existsSync(receipt.config), `config missing: ${receipt.config}`).toBe(true);
      expect(receipt.typescriptVersion).toMatch(/^\d+\.\d+/);
    }
    const engines = receipts.map((r) => r.engine).sort();
    expect(engines).toEqual(['live-chat', 'nativewind', 'uniwind']);
  });

  it('ORI-AST-005-binding-rejections: missing, ambiguous, unbound and undiscoverable inputs fail with attributable diagnostics', {
    timeout: 900_000,
  }, () => {
    // Case 1 — referenced source file removed.
    const missingCopy = makeCorpusCopy('missing');
    try {
      rmSync(join(missingCopy, 'packages/docs-snippets/shared/quickstart-messages.ts'));
      const run = runGate(['--root', missingCopy, '--consumer-cache', CONSUMER_CACHE]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('quickstart.mdx');
      expect(run.stderr).toContain('messagesSource');
      expect(run.stderr).toContain('quickstart-messages.ts');
      expect(run.stderr).toContain('missing source');
    } finally {
      rmSync(missingCopy, { recursive: true, force: true });
    }

    // Case 2 — the selected region is removed from its source.
    const regionGone = makeCorpusCopy('region-gone');
    try {
      const cssPath = join(regionGone, 'apps/example/global.css');
      const fence = readFileSync(join(regionGone, 'apps/docs/src/content/docs/theming.mdx'), 'utf8')
        .split('```css\n')[1]
        .split('\n```')[0];
      writeFileSync(cssPath, readFileSync(cssPath, 'utf8').replace(fence, '/* region removed */'));
      const run = runGate(['--root', regionGone, '--consumer-cache', CONSUMER_CACHE]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('theming.mdx');
      expect(run.stderr).toContain('fence-0');
      expect(run.stderr).toContain('global.css');
      expect(run.stderr).toContain('region');
    } finally {
      rmSync(regionGone, { recursive: true, force: true });
    }

    // Case 3 — the selected region is duplicated (ambiguous selection).
    const ambiguous = makeCorpusCopy('ambiguous');
    try {
      const cssPath = join(ambiguous, 'apps/example/global.css');
      const fence = readFileSync(join(ambiguous, 'apps/docs/src/content/docs/theming.mdx'), 'utf8')
        .split('```css\n')[1]
        .split('\n```')[0];
      writeFileSync(cssPath, fence + '\n' + readFileSync(cssPath, 'utf8'));
      const run = runGate(['--root', ambiguous, '--consumer-cache', CONSUMER_CACHE]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('theming.mdx');
      expect(run.stderr).toContain('fence-0');
      expect(run.stderr).toContain('ambiguous');
    } finally {
      rmSync(ambiguous, { recursive: true, force: true });
    }

    // Case 4 — source bindings removed from the TS, TSX, shell and CSS groups
    // while the authored code stays. Every group must be named.
    const unbound = makeCorpusCopy('unbound');
    try {
      const bindingsPath = join(unbound, 'bindings.json');
      writeFileSync(bindingsPath, JSON.stringify([]));
      const run = runGate([
        '--root',
        unbound,
        '--consumer-cache',
        CONSUMER_CACHE,
        '--bindings',
        bindingsPath,
      ]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('messagesSource');
      expect(run.stderr).toContain('screenSource');
      expect(run.stderr).toContain('entrypointNativewind');
      expect(run.stderr).toContain('entrypointUniwind');
      expect(run.stderr).toContain('cli.md');
      expect(run.stderr).toContain('theming.mdx');
      expect(run.stderr).toContain('no committed binding');

      // Restoring the original bindings yields exit 0 with the original inventory.
      const restored = runGate(['--root', unbound, '--consumer-cache', CONSUMER_CACHE]);
      expect(restored.exit, `restored run failed:\n${restored.stderr}`).toBe(0);
      const report = parseReport(restored);
      expect(report.blocks.length).toBe(
        independentInventory(join(unbound, CORPUS_DOCS_REL)).length,
      );
    } finally {
      rmSync(unbound, { recursive: true, force: true });
    }

    // Case 5 — the discovery root does not exist.
    {
      const run = runGate([
        '--root',
        corpus,
        '--consumer-cache',
        CONSUMER_CACHE,
        '--docs-root',
        join(corpus, 'apps/docs/src/content/does-not-exist'),
      ]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('discovery');
    }

    // Case 6 — the discovery root exists but contains no documents.
    {
      const empty = join(corpus, 'apps/docs/src/content/empty-corpus');
      mkdirSync(empty, { recursive: true });
      const run = runGate([
        '--root',
        corpus,
        '--consumer-cache',
        CONSUMER_CACHE,
        '--docs-root',
        empty,
      ]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('discovery');
      expect(run.stderr).toContain('no authored');
    }
  });

  // One AC = one real end-to-end chain: scratch docs build, owned preview,
  // real Chromium clipboard, then the production emission comparison. The
  // complexity is the orchestration the AC demands, not branching logic.
  it(
    'ORI-AST-005-byte-fidelity: rendered and clipboard bytes equal the selected source and one-byte emission drift fails',
    {
      timeout: 1_500_000,
    },
    () => byteFidelityProof(),
  );

  // One AC = one real end-to-end chain: scratch docs build, owned preview,
  // real Chromium clipboard, then the production emission comparison. The
  // complexity is the orchestration the AC demands, not branching logic.
  // fallow-ignore-next-line complexity
  async function byteFidelityProof(): Promise<void> {
    // Repo-shaped scratch: <scratch>/package.json + <scratch>/apps/docs, so
    // the one repo-root-relative import (index.astro -> ../../../../package.json)
    // resolves inside the owned copy.
    const scratchRoot = mkdtempSync(join(tmpdir(), 'ori-ast-005-docs-'));
    const docsApp = join(scratchRoot, 'apps/docs');
    const distDir = join(docsApp, 'dist');
    const previewChildren: ChildProcess[] = [];
    try {
      cpSync(join(REPO_ROOT, 'package.json'), join(scratchRoot, 'package.json'));
      // Repo-root-relative imports inside the docs app (index.astro ->
      // ../../../../package.json, TokenTable.astro -> ../../../../scripts/
      // docs-data/token-map) resolve against this repo-shaped scratch root.
      cpSync(join(REPO_ROOT, 'scripts/docs-data'), join(scratchRoot, 'scripts/docs-data'), {
        recursive: true,
      });
      cpSync(join(REPO_ROOT, 'apps/docs'), docsApp, {
        recursive: true,
        filter: (src) => {
          const rel = relative(join(REPO_ROOT, 'apps/docs'), src);
          if (rel === '') return true;
          return !rel.split(/[/\\]/).some((segment) => COPY_EXCLUDED.has(segment));
        },
      });
      symlinkSync(join(REPO_ROOT, 'apps/docs/node_modules'), join(docsApp, 'node_modules'), 'dir');
      // Root dependencies (e.g. qrcode, imported by pages/components) resolve
      // through the workspace root install, mirrored into the scratch shape.
      symlinkSync(join(REPO_ROOT, 'node_modules'), join(scratchRoot, 'node_modules'), 'dir');
      // The Quickstart manuscript reads its displayed sources at build time via
      // ../../packages/docs-snippets — the symlink keeps those reads real.
      mkdirSync(join(scratchRoot, 'packages'), { recursive: true });
      symlinkSync(
        join(REPO_ROOT, 'packages/docs-snippets'),
        join(scratchRoot, 'packages/docs-snippets'),
        'dir',
      );

      // The two selections under proof: one whole file, one named multiline
      // region with boundary whitespace (interior indentation + final newline).
      const messagesBytes = readFileSync(
        join(corpus, 'packages/docs-snippets/shared/quickstart-messages.ts'),
        'utf8',
      );
      const screenBytes = readFileSync(
        join(corpus, 'packages/docs-snippets/shared/quickstart-screen.tsx'),
        'utf8',
      );
      const regionStart = screenBytes.indexOf('export function QuickstartScreen');
      const nextExport = screenBytes.indexOf('\nexport', regionStart + 1);
      const regionBytes = screenBytes.slice(
        regionStart,
        nextExport === -1 ? screenBytes.length : nextExport + 1,
      );
      expect(regionBytes.endsWith('\n')).toBe(true);
      expect(regionBytes).toContain('\n  ');

      writeFileSync(
        join(docsApp, 'src/pages/source-snippet-proof.astro'),
        `---
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import SourceSnippet from '../components/SourceSnippet.astro';

const whole = readFileSync(
  join(process.cwd(), '../../packages/docs-snippets/shared/quickstart-messages.ts'),
  'utf8',
);
const screen = readFileSync(
  join(process.cwd(), '../../packages/docs-snippets/shared/quickstart-screen.tsx'),
  'utf8',
);
const start = screen.indexOf('export function QuickstartScreen');
const nextExport = screen.indexOf('\\nexport', start + 1);
const region =
  nextExport === -1 ? screen.slice(start) : screen.slice(start, nextExport + 1);
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SourceSnippet byte fidelity proof</title>
  </head>
  <body>
    <main>
      <SourceSnippet
        doc="source-snippet-proof"
        snippet="whole-file-messages"
        source="packages/docs-snippets/shared/quickstart-messages.ts"
        code={whole}
        label="Copy whole file"
      />
      <SourceSnippet
        doc="source-snippet-proof"
        snippet="named-region-screen"
        source="packages/docs-snippets/shared/quickstart-screen.tsx"
        region="quickstart-screen-body"
        code={region}
        label="Copy named region"
      />
    </main>
  </body>
</html>
`,
      );

      // Build the real docs app in the scratch copy.
      rmSync(join(docsApp, 'node_modules', '.astro'), { recursive: true, force: true });
      const build = spawnSync(join(docsApp, 'node_modules/.bin/astro'), ['build'], {
        cwd: docsApp,
        encoding: 'utf8',
        timeout: 600_000,
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      });
      expect(
        build.status,
        `astro build exited ${build.status}\n${String(build.stdout).slice(-2000)}\n${String(build.stderr).slice(-2000)}`,
      ).toBe(0);

      // Serve the built output on an owned reserved port (never 4321/4322).
      const freePort = await new Promise<number>((res, rej) => {
        const srv = createServer();
        srv.listen(0, '127.0.0.1', () => {
          const addr = srv.address();
          srv.close(() => undefined);
          if (addr && typeof addr === 'object') res(addr.port);
          else rej(new Error('no port'));
        });
        srv.on('error', rej);
      });
      const preview: ChildProcess = spawn(
        join(docsApp, 'node_modules/.bin/astro'),
        ['preview', '--host', '127.0.0.1', '--port', String(freePort), '--ignore-lock'],
        {
          cwd: docsApp,
          env: { ...process.env, ASTRO_PREVIEW_BACKGROUND: '1', ASTRO_TELEMETRY_DISABLED: '1' },
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      previewChildren.push(preview);
      const previewUrl = `http://127.0.0.1:${freePort}`;
      let served = false;
      for (let i = 0; i < 60 && !served; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const res = await fetch(`${previewUrl}/source-snippet-proof/`);
          served = res.status === 200;
        } catch {
          /* not up yet */
        }
      }
      expect(served, `owned preview at ${previewUrl} never answered 200`).toBe(true);

      // Real Chromium: read the rendered code text and the real clipboard.
      const browser = await chromium.launch();
      try {
        const context = await browser.newContext();
        await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
          origin: previewUrl,
        });
        const page = await context.newPage();
        await page.goto(`${previewUrl}/source-snippet-proof/`);

        for (const [snippetId, expected] of [
          ['whole-file-messages', messagesBytes],
          ['named-region-screen', regionBytes],
        ] as const) {
          const rendered = await page
            .locator(`div[data-snippet="${snippetId}"] code`)
            .textContent();
          if (rendered !== expected) {
            // Precise mismatch identity — a bare toBe truncates long strings.
            const n = Math.min(rendered?.length ?? 0, expected.length);
            let off = -1;
            for (let i = 0; i < n; i++) {
              if (rendered![i] !== expected[i]) {
                off = i;
                break;
              }
            }
            throw new Error(
              `${snippetId}: rendered ${rendered?.length} chars vs source ${expected.length}; ` +
                `first mismatch at ${off}; rendered[..]=${JSON.stringify(rendered?.slice(Math.max(0, off - 10), off + 20))} ` +
                `expected[..]=${JSON.stringify(expected.slice(Math.max(0, off - 10), off + 20))}`,
            );
          }
          expect(rendered, `${snippetId}: rendered text is not the selected source`).toBe(expected);
          await page.locator(`div[data-snippet="${snippetId}"] button`).click();
          const clipboard = await page.evaluate(() => navigator.clipboard.readText());
          expect(clipboard.length, `${snippetId}: clipboard length differs`).toBe(expected.length);
          expect(sha256(clipboard), `${snippetId}: clipboard sha differs`).toBe(sha256(expected));
          expect(clipboard).toBe(expected);
        }
        await context.close();
      } finally {
        await browser.close();
      }

      // Production emission comparison, pristine output first.
      const bindingsPath = join(scratchRoot, 'proof-bindings.json');
      writeFileSync(
        bindingsPath,
        JSON.stringify([
          ...COMMITTED_BINDINGS,
          {
            doc: 'source-snippet-proof',
            snippet: 'whole-file-messages',
            source: 'packages/docs-snippets/shared/quickstart-messages.ts',
          },
          {
            doc: 'source-snippet-proof',
            snippet: 'named-region-screen',
            source: 'packages/docs-snippets/shared/quickstart-screen.tsx',
            // Region identity is BYTE-based: length is the utf8 byte length,
            // not the JS string length (the seed text has multibyte chars).
            region: {
              sha256: sha256(regionBytes),
              length: Buffer.byteLength(regionBytes, 'utf8'),
            },
          },
        ]),
      );

      const pristine = runGate([
        '--root',
        corpus,
        '--consumer-cache',
        CONSUMER_CACHE,
        '--check-emitted',
        distDir,
        '--bindings',
        bindingsPath,
      ]);
      expect(pristine.exit, `pristine emission check failed:\n${pristine.stderr}`).toBe(0);
      const pristineReport = parseReport(pristine);
      expect(pristineReport.emitted).not.toBeNull();
      expect(pristineReport.emitted?.elements).toBe(2);
      expect(pristineReport.emitted?.failures.length).toBe(0);

      // One-byte drift in a fresh physical output copy fails through the
      // real command, which must not rewrite the corrupted artifact.
      const driftDir = join(scratchRoot, 'dist-drift');
      cpSync(distDir, driftDir, { recursive: true });
      const driftHtmlPath = join(driftDir, 'source-snippet-proof', 'index.html');
      const driftHtml = readFileSync(driftHtmlPath, 'utf8');
      const marker = driftHtml.indexOf('data-snippet="whole-file-messages"');
      expect(marker).toBeGreaterThan(-1);
      const codeOpen = driftHtml.indexOf('<code', marker);
      const flipAt = driftHtml.indexOf('export const SEED_MESSAGES', codeOpen);
      expect(flipAt).toBeGreaterThan(codeOpen);
      const drifted =
        driftHtml.slice(0, flipAt) + 'exPort' + driftHtml.slice(flipAt + 'export'.length);
      writeFileSync(driftHtmlPath, drifted);

      const drift = runGate([
        '--root',
        corpus,
        '--consumer-cache',
        CONSUMER_CACHE,
        '--check-emitted',
        driftDir,
        '--bindings',
        bindingsPath,
      ]);
      expect(drift.exit, 'the 1-byte drifted emission passed the production comparison').not.toBe(
        0,
      );
      expect(drift.stderr).toContain('source-snippet-proof');
      expect(drift.stderr).toContain('whole-file-messages');
      expect(drift.stderr).toContain('quickstart-messages.ts');
      expect(drift.stderr).toContain('byte mismatch');
      expect(readFileSync(driftHtmlPath, 'utf8')).toContain('exPort const SEED_MESSAGES');
    } finally {
      for (const child of previewChildren) {
        try {
          child.kill('SIGTERM');
        } catch {
          /* already gone */
        }
      }
      rmSync(scratchRoot, { recursive: true, force: true });
    }
  }

  it('ORI-AST-005-owner-compilers: invalid imports and props fail both engines; missing prerequisites fail closed; restored sources pass', {
    timeout: 1_500_000,
  }, () => {
    // Unchanged receipts first (also primes the consumer cache).
    const base = runGate(['--root', corpus, '--consumer-cache', CONSUMER_CACHE]);
    expect(base.exit, `baseline run failed:\n${base.stderr}`).toBe(0);
    const baseReport = parseReport(base);
    expect(baseReport.compilerReceipts.length).toBe(3);
    for (const receipt of baseReport.compilerReceipts) {
      expect(receipt.exit).toBe(0);
      expect(receipt.durationMs).toBeGreaterThan(0);
      expect(receipt.typescriptVersion).toMatch(/^\d+\.\d+/);
      if (receipt.engine === 'live-chat') {
        expect(receipt.args).toContain('tsconfig.live-chat.json');
      } else {
        expect(receipt.args).toContain('--noEmit');
      }
    }
    const nativewindCache = baseReport.consumerCache['nativewind'];
    expect(existsSync(nativewindCache)).toBe(true);

    // Import and prop mutations, per engine, each in a fresh corpus copy.
    const engines = ['nativewind', 'uniwind'] as const;
    for (const engine of engines) {
      const entrySnippet = `entrypoint${engine[0].toUpperCase()}${engine.slice(1)}`;
      const indexPath = `packages/docs-snippets/${engine}/app/index.tsx`;

      const importCopy = makeCorpusCopy(`${engine}-import`);
      try {
        const p = join(importCopy, indexPath);
        writeFileSync(
          p,
          readFileSync(p, 'utf8').replace(
            '@/shared/quickstart-screen',
            '@/shared/__ori_ast_005_missing__',
          ),
        );
        const run = runGate(['--root', importCopy, '--consumer-cache', CONSUMER_CACHE]);
        expect(run.exit, `${engine} invalid import passed`).not.toBe(0);
        expect(run.stderr).toContain('__ori_ast_005_missing__');
        expect(run.stderr).toContain(engine);
        expect(run.stderr).toContain('quickstart.mdx');
        expect(run.stderr).toContain(entrySnippet);
      } finally {
        rmSync(importCopy, { recursive: true, force: true });
      }

      const propCopy = makeCorpusCopy(`${engine}-prop`);
      try {
        const p = join(propCopy, indexPath);
        writeFileSync(
          p,
          readFileSync(p, 'utf8').replace(
            '<QuickstartScreen />',
            '<QuickstartScreen __ori_ast_005_invalid_prop__ />',
          ),
        );
        const run = runGate(['--root', propCopy, '--consumer-cache', CONSUMER_CACHE]);
        expect(run.exit, `${engine} invalid prop passed`).not.toBe(0);
        expect(run.stderr).toContain('__ori_ast_005_invalid_prop__');
        expect(run.stderr).toContain(engine);
        expect(run.stderr).toContain(entrySnippet);
      } finally {
        rmSync(propCopy, { recursive: true, force: true });
      }
    }

    // Missing prerequisite: the owning compiler context (tsconfig) removed.
    const noTsconfig = makeCorpusCopy('no-tsconfig');
    try {
      rmSync(join(noTsconfig, 'packages/docs-snippets/nativewind/tsconfig.json'));
      const run = runGate(['--root', noTsconfig, '--consumer-cache', CONSUMER_CACHE]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('tsconfig.json');
      expect(run.stderr).toContain('nativewind');
    } finally {
      rmSync(noTsconfig, { recursive: true, force: true });
    }

    // Missing prerequisite: the whole source package removed.
    const noPackage = makeCorpusCopy('no-package');
    try {
      rmSync(join(noPackage, 'packages/docs-snippets/uniwind'), {
        recursive: true,
        force: true,
      });
      const run = runGate(['--root', noPackage, '--consumer-cache', CONSUMER_CACHE]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('uniwind');
      expect(run.stderr).toContain('packages/docs-snippets/uniwind');
    } finally {
      rmSync(noPackage, { recursive: true, force: true });
    }

    // Missing prerequisite: a required installed dependency removed from the
    // real assembled consumer — the compiler must name it, never fabricate.
    const reactNativeDir = join(nativewindCache, 'node_modules', 'react-native');
    try {
      rmSync(reactNativeDir, { recursive: true, force: true });
      const run = runGate(['--root', corpus, '--consumer-cache', CONSUMER_CACHE]);
      expect(run.exit).not.toBe(0);
      expect(run.stderr).toContain('react-native');
      expect(run.stderr).toContain('quickstart.mdx');
    } finally {
      // Restore the real dependency tree from the committed manifest.
      const restore = spawnSync('pnpm', ['install'], {
        cwd: nativewindCache,
        encoding: 'utf8',
        timeout: 600_000,
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, COREPACK_ENABLE_STRICT: '0' },
      });
      expect(restore.status, `pnpm install restore failed:\n${restore.stdout}`).toBe(0);
      expect(existsSync(join(reactNativeDir, 'package.json'))).toBe(true);
    }

    // Restored nativewind and uniwind sources pass again with exit 0.
    const restored = runGate(['--root', corpus, '--consumer-cache', CONSUMER_CACHE]);
    expect(restored.exit, `restored run failed:\n${restored.stderr}`).toBe(0);
    const restoredReport = parseReport(restored);
    for (const receipt of restoredReport.compilerReceipts) {
      expect(receipt.exit).toBe(0);
    }
  });
});
