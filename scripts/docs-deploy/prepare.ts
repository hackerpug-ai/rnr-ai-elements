/**
 * ORI-DEP-001 — bootstrap deployment preparation.
 *
 * The deterministic, host-side preparation entrypoint for the assets-only Workers
 * static-assets release. It does four things, in order, and fails closed:
 *
 *   1. SOURCE GATE   — the current HEAD must equal the `--source` release SHA,
 *      descend from the accepted base commit, and contain the reviewed ORI-RN-000
 *      correction; the tracked tree must be clean. Any mismatch exits nonzero
 *      BEFORE a command runs or a byte is written.
 *   2. BUILD GATE    — (fresh mode only) run the actual root quality checks, then
 *      the explicit ordered generation `registry:build` -> `gallery:manifest` ->
 *      docs-data `prebuild` -> `astro build`, recording every command, its text,
 *      working directory, and exit code. No implicit lifecycle inference.
 *   3. INTEGRITY     — hash every emitted dist asset plus `pnpm-lock.yaml` and
 *      `apps/docs/wrangler.jsonc` into `asset-manifest.json`. In re-verify mode
 *      (a frozen manifest already exists), re-hash and refuse any changed,
 *      missing, or stale asset by name — never re-baseline.
 *   4. RECORD        — write `build.json` (source identity, ordered commands,
 *      tool versions, exit codes, refusal observations) and `asset-manifest.json`
 *      under the evidence directory.
 *
 * The negative-control refusal paths (source mismatch, changed byte, missing file)
 * are exercised through this same entrypoint against owned disposable copies by
 * `tests/sprint-05-orient-search/public-http.test.ts --check preparation`. The
 * `--dist` override exists solely so those probes can hash a disposable copy of the
 * frozen build without touching the real one; it is the same hashing/refusal logic,
 * not a mocked transport.
 *
 * host-side node:fs/node:child_process only — no Workers runtime, no bindings.
 */
// CLI entry spawned by the lane test via tsx, never imported — see the same
// directive on scripts/docs-data/drill-item-count.ts.
// fallow-ignore-file unused-file
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST_DEFAULT = join(REPO_ROOT, 'apps', 'docs', 'dist');
const LOCKFILE = join(REPO_ROOT, 'pnpm-lock.yaml');
const WRANGLER_CONFIG = join(REPO_ROOT, 'apps', 'docs', 'wrangler.jsonc');

/** The accepted source base (sprint-04 gate) this release must descend from. */
export const BASE_COMMIT = '38034e972490945b684f5bd5a706bca0479dc659';
/** The reviewed ORI-RN-000 PromptInput correction this release must contain. */
export const CORRECTION_COMMIT = '6a33565b42129bcba253864ea5e380283fc33f58';
/** The two literal conversation endpoints the public verification consumes. */
export const CONVERSATION_ASSETS = [
  'r/nativewind/conversation.json',
  'r/uniwind/conversation.json',
] as const;

interface CommandRecord {
  label: string;
  command: string;
  cwd: string;
  exit_code: number;
  /** Tail of stdout (bounded) — retained only for failure diagnostics. */
  output?: string;
}

interface CliArgs {
  phase: string;
  source: string;
  evidence: string;
  dist: string;
}

function fail(message: string): never {
  console.error(`[docs-deploy] ${message}`);
  process.exit(1);
}

function sha256Bytes(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function sha256File(path: string): string {
  return sha256Bytes(readFileSync(path));
}

/** Deterministic, sorted list of every file under `dir`, relative to `dir`. */
// fallow-ignore-next-line complexity
function walkFiles(dir: string): string[] {
  const out: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(relative(dir, full).split(sep).join('/'));
    }
  }
  return out.sort();
}

/** Runs one command synchronously from the repo root, recording its exit code. */
// fallow-ignore-next-line complexity
function run(label: string, command: string, cwd = REPO_ROOT): CommandRecord {
  const result = spawnSync(command, {
    shell: true,
    cwd,
    encoding: 'utf8',
    env: process.env,
  });
  const stdout = (result.stdout ?? '').trim();
  const stderr = (result.stderr ?? '').trim();
  const tail = [stderr, stdout].filter(Boolean).join('\n').split('\n').slice(-30).join('\n');
  const record: CommandRecord = {
    label,
    command,
    cwd,
    exit_code: result.status ?? -1,
    output: tail.length > 0 ? tail : undefined,
  };
  return record;
}

/** git must be available and the working copy must be the expected source. */
// fallow-ignore-next-line complexity
function verifySource(source: string): void {
  const head = run('git rev-parse HEAD', 'git rev-parse HEAD').output?.trim();
  if (!head) {
    fail('source check: `git rev-parse HEAD` returned no output — is this a git worktree?');
  }
  if (head !== source) {
    fail(`source mismatch: HEAD is ${head}, but --source names ${source}`);
  }
  const isDescendant = run(
    'git merge-base --is-ancestor base HEAD',
    `git merge-base --is-ancestor ${BASE_COMMIT} HEAD`,
  );
  if (isDescendant.exit_code !== 0) {
    fail(`base mismatch: HEAD is not a descendant of the accepted base ${BASE_COMMIT}`);
  }
  const hasCorrection = run(
    'git merge-base --is-ancestor correction HEAD',
    `git merge-base --is-ancestor ${CORRECTION_COMMIT} HEAD`,
  );
  if (hasCorrection.exit_code !== 0) {
    fail(
      `correction mismatch: HEAD does not contain the reviewed ORI-RN-000 correction ${CORRECTION_COMMIT}`,
    );
  }
  // Tracked changes only: the evidence directory is written after this gate and is
  // untracked at fresh-build time, so it must not count against a clean tree.
  const status = run(
    'git status --porcelain --untracked-files=no',
    'git status --porcelain --untracked-files=no',
  );
  if (status.output && status.output.trim().length > 0) {
    fail(`dirty working tree (tracked changes present):\n${status.output.trim()}`);
  }
}

// fallow-ignore-next-line complexity
function collectToolVersions(): Record<string, string> {
  const versions: Record<string, string> = {};
  const node = run('node --version', 'node --version');
  if (node.exit_code === 0 && node.output) versions.node = node.output.trim();
  const pnpm = run('pnpm --version', 'pnpm --version');
  if (pnpm.exit_code === 0 && pnpm.output) versions.pnpm = pnpm.output.trim();
  const wrangler = run('wrangler --version', 'wrangler --version');
  // `wrangler --version` prints a leading "⛅️ wrangler" banner in some versions.
  if (wrangler.output) {
    const match = wrangler.output.match(/\d+\.\d+\.\d+/);
    if (match) versions.wrangler = match[0];
  }
  return versions;
}

// fallow-ignore-next-line complexity
function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    phase: '',
    source: '',
    evidence: '',
    dist: DIST_DEFAULT,
  };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const next = argv[i + 1];
    switch (flag) {
      case '--phase':
        args.phase = next ?? '';
        i++;
        break;
      case '--source':
        args.source = next ?? '';
        i++;
        break;
      case '--evidence':
        args.evidence = next ?? '';
        i++;
        break;
      case '--dist':
        args.dist = resolve(next ?? DIST_DEFAULT);
        i++;
        break;
      default:
        fail(`unknown argument: ${flag}`);
    }
  }
  if (args.phase !== 'bootstrap') {
    fail(`--phase must be 'bootstrap' (got '${args.phase}')`);
  }
  if (!/^[0-9a-f]{40}$/.test(args.source)) {
    fail(`--source must be a full 40-char SHA (got '${args.source}')`);
  }
  if (!args.evidence) {
    fail('--evidence is required (the ORI-DEP-001 evidence directory)');
  }
  return args;
}

// fallow-ignore-next-line complexity
function main(): void {
  const args = parseArgs(process.argv.slice(2));
  verifySource(args.source);

  const manifestPath = join(args.evidence, 'asset-manifest.json');
  const reVerify = existsSync(manifestPath);

  mkdirSync(args.evidence, { recursive: true });

  if (!reVerify) {
    // ---------- fresh preparation: hydrate generated inputs, then checks, then final build ----------
    // Generated-input hydration first: `pnpm typecheck` (tsc --noEmit) imports the
    // docs-data outputs (apps/docs/src/data/registry-items.json) which only exist
    // after registry:build -> gallery:manifest -> prebuild. Running the three
    // generators before the checks is the recorded hydration, not an inferred
    // lifecycle. The four build commands still appear in the required order.
    const commands: CommandRecord[] = [
      run('registry:build', 'pnpm registry:build'),
      run('gallery:manifest', 'pnpm gallery:manifest'),
      run('prebuild', 'pnpm --dir apps/docs run prebuild'),
      run('typecheck', 'pnpm typecheck'),
      run('lint', 'pnpm lint'),
      run('check:tokens', 'pnpm check:tokens'),
      run('check:contract', 'pnpm check:contract'),
      run('check:registry', 'pnpm check:registry'),
      run('astro build', 'pnpm --dir apps/docs exec astro build'),
    ];
    const failed = commands.filter((c) => c.exit_code !== 0);
    if (failed.length > 0) {
      for (const c of failed) {
        console.error(
          `[docs-deploy] FAILED: ${c.label}\n  command: ${c.command}\n  exit ${c.exit_code}\n${c.output ?? ''}`,
        );
      }
      fail(`preparation aborted: ${failed.length} command(s) exited nonzero`);
    }

    // Both conversation endpoints must exist in the emitted dist.
    for (const rel of CONVERSATION_ASSETS) {
      if (!existsSync(join(args.dist, rel))) {
        fail(`generated dist is missing ${rel}`);
      }
    }

    const manifest = buildManifest(args, reVerify);
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(
      join(args.evidence, 'build.json'),
      `${JSON.stringify(
        {
          task: 'ORI-DEP-001',
          release_sha: args.source,
          base_commit: BASE_COMMIT,
          correction_commit: CORRECTION_COMMIT,
          generated_at: new Date().toISOString(),
          mode: 'fresh',
          commands,
          tool_versions: collectToolVersions(),
          example_diagnostics: runExampleDiagnostics(),
          note_test_suite:
            'broad `pnpm test` (vitest run) is not executed in the implementer lane; the applicable test for this task is the preparation-proof and public-HTTP assertion set in tests/sprint-05-orient-search/public-http.test.ts.',
        },
        null,
        2,
      )}\n`,
    );
    console.log(
      `[docs-deploy] fresh preparation complete: ${Object.keys(manifest.assets).length} dist assets, ` +
        `release ${args.source}`,
    );
    return;
  }

  // ---------- re-verify: compare current bytes to the frozen manifest ----------
  const frozen = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    assets: Record<string, string>;
    release_sha?: string;
    lockfile_sha256?: string;
    config_sha256?: string;
  };
  if (frozen.release_sha && frozen.release_sha !== args.source) {
    fail(
      `release mismatch: frozen manifest binds ${frozen.release_sha}, but --source names ${args.source}`,
    );
  }
  const assets = hashAssets(args.dist);
  const frozenAssets: Record<string, string> = frozen.assets ?? {};
  for (const rel of Object.keys(frozenAssets)) {
    if (!(rel in assets)) {
      fail(`missing asset: ${rel}`);
    }
  }
  for (const rel of Object.keys(assets)) {
    const expected = frozenAssets[rel];
    if (expected === undefined) {
      fail(`unrecorded asset: ${rel} is not in the frozen manifest`);
    }
    if (expected !== assets[rel]) {
      fail(`asset hash mismatch: ${rel}`);
    }
  }
  const lock = sha256File(LOCKFILE);
  const config = sha256File(WRANGLER_CONFIG);
  if (frozen.lockfile_sha256 !== undefined && frozen.lockfile_sha256 !== lock) {
    fail('lockfile hash mismatch: pnpm-lock.yaml');
  }
  if (frozen.config_sha256 !== undefined && frozen.config_sha256 !== config) {
    fail('config hash mismatch: apps/docs/wrangler.jsonc');
  }
  console.log(`[docs-deploy] re-verify passed: ${Object.keys(assets).length} assets unchanged`);
}

/** Separate, non-gating diagnostic: the example app's own typecheck, honest exit code. */
function runExampleDiagnostics(): CommandRecord {
  return run('example:tsc --noEmit (diagnostic only)', 'pnpm --dir apps/example exec tsc --noEmit');
}

function hashAssets(dist: string): Record<string, string> {
  const assets: Record<string, string> = {};
  for (const rel of walkFiles(dist)) {
    assets[rel] = sha256File(join(dist, rel));
  }
  return assets;
}

function buildManifest(
  args: CliArgs,
  _reVerify: boolean,
): {
  task: string;
  release_sha: string;
  base_commit: string;
  correction_commit: string;
  generated_at: string;
  assets: Record<string, string>;
  lockfile_sha256: string;
  config_sha256: string;
  conversation_assets: Record<string, string>;
} {
  const assets = hashAssets(args.dist);
  const conversation: Record<string, string> = {};
  for (const rel of CONVERSATION_ASSETS) {
    conversation[rel] = assets[rel];
  }
  return {
    task: 'ORI-DEP-001',
    release_sha: args.source,
    base_commit: BASE_COMMIT,
    correction_commit: CORRECTION_COMMIT,
    generated_at: new Date().toISOString(),
    assets,
    lockfile_sha256: sha256File(LOCKFILE),
    config_sha256: sha256File(WRANGLER_CONFIG),
    conversation_assets: conversation,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
