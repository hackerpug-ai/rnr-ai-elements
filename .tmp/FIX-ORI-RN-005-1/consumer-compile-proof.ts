/**
 * FIX-ORI-RN-005-1 — the independent NativeWind consumer compile proof.
 *
 * Selector (identical pre-fix and post-fix):
 *
 *   pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts
 *
 * Real surfaces only, mirroring ORI-RN-005's consumer shape at this task's
 * dependency position (pattern reference `git show
 * 20f4b6a6:tests/sprint-05-orient-search/support/nativewind-live-example.ts`
 * — never imported, never a dependency): a fresh NativeWind/Tailwind v3 Expo 57
 * consumer materialized OUTSIDE the monorepo from ORI-RN-001's committed twelve
 * template files, the literal public recipe (packages/docs-snippets/commands/
 * nativewind.sh — real `npx @react-native-reusables/cli@latest add
 * https://rnraielements.com/r/nativewind/…` installs over HTTPS) run verbatim
 * with cwd at the consumer root, the ORI-AI-001-proven hook pins installed
 * through Expo's resolver (`npx expo install ai@7.0.89 @ai-sdk/react@4.0.92`),
 * the five canonical app sources copied byte-identical with SHA-256 pair
 * validation before the classified compile, then the consumer's own
 * `pnpm exec tsc --noEmit` and `pnpm exec expo-doctor`.
 *
 * Self-classifying oracle:
 *   - tsc fails -> RED candidate. The RED is functional only when the capture
 *     holds exactly TS2307 'uniwind' at components/live-chat-screen.tsx and
 *     TS2459 'THEME' on the '@/lib/theme' import, with zero other errors and
 *     all five copy pairs matching. Evidence -> red.json, process exit 1.
 *     Any third error class is reported (exit 2), never absorbed.
 *   - tsc passes -> GREEN. Requires expo-doctor exit 0 and no uniwind anywhere
 *     in the consumer dependency tree, then runs the three preserved repository
 *     commands (scoped live-chat tsc, root pnpm typecheck, scoped biome ci with
 *     the files.includes omission detected and real coverage supplied through a
 *     task-owned scratch config). Evidence -> green.json, preserved-checks.json,
 *     run.json, process exit 0.
 *
 * The consumer root is removed on every exit path. No credentials, no provider
 * calls: install + compile only.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TEMPLATE_DIR = join(REPO_ROOT, 'packages/docs-snippets/nativewind');
const RECIPE_SCRIPT = join(REPO_ROOT, 'packages/docs-snippets/commands/nativewind.sh');
const EVIDENCE_DIR = join(REPO_ROOT, '.tmp/FIX-ORI-RN-005-1');
const HARNESS_PATH = join(EVIDENCE_DIR, 'consumer-compile-proof.ts');

/** ORI-RN-001's committed template files copied into the fresh consumer. */
const TEMPLATE_FILES = [
  'package.json',
  'app.json',
  'components.json',
  'tsconfig.json',
  'metro.config.js',
  'babel.config.js',
  'tailwind.config.js',
  'global.css',
  'nativewind-env.d.ts',
  'app/_layout.tsx',
  'lib/theme.ts',
  'lib/utils.ts',
];

/** The five canonical app sources — byte-identical copies into their mapped targets. */
const CANONICAL_SOURCES = [
  { source: 'apps/example/app/live-chat.tsx', target: 'app/live-chat.tsx' },
  {
    source: 'apps/example/components/live-chat-screen.tsx',
    target: 'components/live-chat-screen.tsx',
  },
  {
    source: 'apps/example/components/live-chat-message.tsx',
    target: 'components/live-chat-message.tsx',
  },
  { source: 'apps/example/lib/live-chat-config.ts', target: 'lib/live-chat-config.ts' },
  { source: 'apps/example/lib/use-live-chat.ts', target: 'lib/use-live-chat.ts' },
];

/** ORI-AI-001's proven live-hook pins, installed through Expo's resolver. */
const HOOK_PINS_INSTALL = 'npx expo install ai@7.0.89 @ai-sdk/react@4.0.92';

const PRESERVED_COMMANDS = [
  'pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json',
  'pnpm typecheck',
  'pnpm exec biome ci apps/example/components/live-chat-screen.tsx packages/docs-snippets/nativewind/lib/theme.ts',
];

const REGISTRY_ITEMS = ['conversation', 'message', 'prompt-input', 'item', 'sheet'];

const LINTED_FILES = [
  'apps/example/components/live-chat-screen.tsx',
  'packages/docs-snippets/nativewind/lib/theme.ts',
];

/* ------------------------------------------------------------- utilities -- */

export type CommandResult = { command: string; exit: number; output: string };

export type CopyPair = {
  source: string;
  target: string;
  sourceSha256: string;
  targetSha256: string;
  match: boolean;
};

export type TscClassification = {
  tscExit: number;
  errorLines: string[];
  ts2307Uniwind: string[];
  ts2459Theme: string[];
  otherErrors: string[];
};

export type PreservedCheck = CommandResult & {
  label: string;
  /** Parsed from biome's "Checked N files" summary; absent for tsc commands. */
  filesChecked?: number;
  /** True when biome reports the explicitly-passed paths as ignored by config. */
  pathsIgnored?: boolean;
};

function nowIso(): string {
  return new Date().toISOString();
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function sha256File(path: string): string {
  return sha256(readFileSync(path, 'utf8'));
}

/** Head+tail bounded capture so evidence stays bounded on long install logs. */
function bound(text: string, head = 6000, tail = 6000): string {
  if (text.length <= head + tail + 200) return text;
  return `${text.slice(0, head)}\n…[truncated ${text.length - head - tail} chars]…\n${text.slice(-tail)}`;
}

/* --------------------------------------------------- credential hygiene -- */
/**
 * No credential-shaped env key may reach the installs, the CLI, the compiler or
 * the linter. Node snapshots process.env at each spawn, so removing the keys
 * immediately before the call and restoring them immediately after keeps every
 * other child unaffected (proven pattern from ORI-RN-005's driver).
 */
const CREDENTIAL_ENV_PATTERN = /(API_KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL)/i;

function stripCredentialEnv(): Record<string, string> {
  const removed: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (CREDENTIAL_ENV_PATTERN.test(key) && !key.startsWith('EXPO_PUBLIC_')) {
      removed[key] = process.env[key] as string;
      delete process.env[key];
    }
  }
  return removed;
}

/** Runs a credential-free command, capturing exit + combined output. Never throws. */
function runClean(command: string, cwd: string, timeoutMs: number): CommandResult {
  const removed = stripCredentialEnv();
  try {
    const res = spawnSync('/bin/sh', ['-c', command], {
      cwd,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env },
    });
    const output = `${res.stdout ?? ''}${res.stderr ?? ''}`;
    if (res.error) {
      return { command, exit: -1, output: `${output}\nspawn error: ${res.error.message}` };
    }
    return { command, exit: res.status ?? -1, output };
  } finally {
    for (const [key, value] of Object.entries(removed)) {
      process.env[key] = value;
    }
  }
}

/* ---------------------------------------------------------- classification */

export function classifyTsc(tsc: CommandResult): TscClassification {
  const errorLines = tsc.output.match(/^.*error TS\d+:.*$/gm) ?? [];
  const ts2307Uniwind = errorLines.filter((l) => l.includes('TS2307') && l.includes('uniwind'));
  const ts2459Theme = errorLines.filter((l) => l.includes('TS2459') && l.includes('THEME'));
  const otherErrors = errorLines.filter((l) => !ts2307Uniwind.includes(l) && !ts2459Theme.includes(l));
  return { tscExit: tsc.exit, errorLines, ts2307Uniwind, ts2459Theme, otherErrors };
}

/* --------------------------------------------------- lint coverage escape -- */

/**
 * biome.json's files.includes omits both touched paths, so the literal preserved
 * biome command cannot process any file — and biome 2.5.11's `ci` makes that a
 * LOUD exit 1 ("No files were processed in the specified paths"), not the silent
 * exit 0 the charter anticipated. To make lint coverage explicit, the harness
 * also lints the same two real paths under a task-owned scratch config (inside
 * the .tmp allowlist) using the repository's linter rule set (recommended) with
 * the formatter and import-organizer disabled — those would demand reformatting
 * a file the repository deliberately keeps unlinted, which the task's
 * "nothing else changes" boundary forbids. Both runs are recorded; only the
 * explicit one is trusted as coverage.
 */
function writeScratchLintConfig(): string {
  const dir = join(EVIDENCE_DIR, 'lint');
  mkdirSync(dir, { recursive: true });
  const config = {
    $schema: 'https://biomejs.dev/schemas/2.5.11/schema.json',
    files: { includes: LINTED_FILES },
    formatter: { enabled: false },
    linter: { enabled: true, rules: { recommended: true } },
    assist: { actions: { source: { organizeImports: 'off' } } },
  };
  const configPath = join(dir, 'biome.json');
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  return dir;
}

function parseBiomeCoverage(result: CommandResult): PreservedCheck {
  const checked = result.output.match(/Checked (\d+) files?/);
  return {
    ...result,
    label: 'biome',
    filesChecked: checked ? Number(checked[1]) : undefined,
    pathsIgnored: result.output.includes('These paths were provided but ignored'),
  };
}

/* ------------------------------------------------------------ provenance -- */

function gitHead(): string {
  const res = runClean('git rev-parse HEAD', REPO_ROOT, 30_000);
  return res.exit === 0 ? res.output.trim() : `unknown (${bound(res.output, 200)})`;
}

function resolveCliVersion(): string {
  const res = runClean(
    'npx --yes @react-native-reusables/cli@latest --version',
    REPO_ROOT,
    180_000,
  );
  const match = res.output.match(/\d+\.\d+\.\d+/);
  return res.exit === 0 && match ? match[0] : `unresolved (${bound(res.output, 400)})`;
}

function readPkgVersion(root: string, pkg: string): string {
  const p = join(root, 'node_modules', pkg, 'package.json');
  if (!existsSync(p)) return 'missing';
  try {
    return (JSON.parse(readFileSync(p, 'utf8')) as { version?: string }).version ?? 'missing';
  } catch {
    return 'unreadable';
  }
}

function publicRegistryHashes(): Record<string, string> {
  const hashes: Record<string, string> = {};
  for (const item of REGISTRY_ITEMS) {
    const local = join(REPO_ROOT, 'public/r/nativewind', `${item}.json`);
    hashes[`https://rnraielements.com/r/nativewind/${item}.json`] = existsSync(local)
      ? sha256File(local)
      : 'missing';
  }
  return hashes;
}

/* -------------------------------------------------------------- the proof -- */

export type ConsumerCompileReceipt = {
  runId: string;
  startedAt: string;
  candidate: {
    commitSha: string;
    harnessSha256: string;
    sourceSha256: Record<string, string>;
  };
  consumer: {
    root: string;
    recipe: CommandResult;
    hookPins: CommandResult;
    copyPairs: CopyPair[];
    tsc: CommandResult;
    expoDoctor: CommandResult;
    resolvedVersions: Record<string, string>;
    uniwindInDependencyTree: boolean;
    cliVersion: string;
    registrySha256: Record<string, string>;
  };
  classification: TscClassification;
  verdict: string;
};

/**
 * Materializes the prescribed consumer, runs the verbatim recipe, installs the
 * hook pins, copies the five canonical sources byte-identical, then runs the
 * consumer's own compiler and doctor. Returns the full receipt; the consumer
 * root is removed before returning (and by the CLI wrapper on any throw).
 */
/** The live consumer root, tracked so the CLI wrapper can tear it down on a throw. */
let activeConsumerRoot: string | null = null;

export function runConsumerCompileProof(): ConsumerCompileReceipt {
  const runId = `${nowIso()}-${Math.random().toString(36).slice(2, 8)}`;
  const root = mkdtempSync(join(tmpdir(), 'fix-ori-rn-005-1-'));
  activeConsumerRoot = root;

  for (const rel of TEMPLATE_FILES) {
    const src = join(TEMPLATE_DIR, rel);
    if (!existsSync(src)) {
      throw new Error(`template file missing: ${src}`);
    }
    const dst = join(root, rel);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  // The literal public recipe — real pnpm/expo/RNR-CLI/registry/tsc/expo-doctor
  // runs against the bare committed template (which must compile clean on its
  // own, before the canonical sources are overlaid).
  const recipe = runClean(`bash "${RECIPE_SCRIPT}"`, root, 30 * 60_000);

  // The ORI-AI-001-proven hook pins through Expo's own resolver.
  const hookPins = runClean(HOOK_PINS_INSTALL, root, 10 * 60_000);

  // The five canonical sources — byte-identical copies validated before the
  // classified compile runs.
  const copyPairs: CopyPair[] = [];
  for (const mapping of CANONICAL_SOURCES) {
    const src = join(REPO_ROOT, mapping.source);
    if (!existsSync(src)) {
      throw new Error(`canonical source missing: ${src}`);
    }
    const dst = join(root, mapping.target);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    const sourceSha256 = sha256File(src);
    copyPairs.push({
      source: mapping.source,
      target: mapping.target,
      sourceSha256,
      targetSha256: sha256File(dst),
      match: sourceSha256 === sha256File(dst),
    });
  }

  // The consumer's own compiler and doctor over the full overlaid graph.
  const tsc = runClean('pnpm exec tsc --noEmit', root, 5 * 60_000);
  const expoDoctor = runClean('pnpm exec expo-doctor', root, 5 * 60_000);

  const uniwindInDependencyTree =
    existsSync(join(root, 'node_modules/uniwind')) ||
    readFileSync(join(root, 'package.json'), 'utf8').includes('uniwind');

  const receipt: ConsumerCompileReceipt = {
    runId,
    startedAt: nowIso(),
    candidate: {
      commitSha: gitHead(),
      harnessSha256: sha256File(HARNESS_PATH),
      sourceSha256: Object.fromEntries(
        CANONICAL_SOURCES.map((m) => [m.source, sha256File(join(REPO_ROOT, m.source))]),
      ),
    },
    consumer: {
      root,
      recipe: { ...recipe, output: bound(recipe.output) },
      hookPins: { ...hookPins, output: bound(hookPins.output) },
      copyPairs,
      tsc,
      expoDoctor: { ...expoDoctor, output: bound(expoDoctor.output) },
      resolvedVersions: {
        expo: readPkgVersion(root, 'expo'),
        'react-native': readPkgVersion(root, 'react-native'),
        react: readPkgVersion(root, 'react'),
        typescript: readPkgVersion(root, 'typescript'),
        nativewind: readPkgVersion(root, 'nativewind'),
        tailwindcss: readPkgVersion(root, 'tailwindcss'),
        ai: readPkgVersion(root, 'ai'),
        '@ai-sdk/react': readPkgVersion(root, '@ai-sdk/react'),
        uniwind: readPkgVersion(root, 'uniwind'),
      },
      uniwindInDependencyTree,
      cliVersion: resolveCliVersion(),
      registrySha256: publicRegistryHashes(),
    },
    classification: classifyTsc(tsc),
    verdict: 'pending',
  };

  rmSync(root, { recursive: true, force: true });
  activeConsumerRoot = null;
  return receipt;
}

/* ------------------------------------------------------- preserved checks -- */

export function runPreservedChecks(): {
  scopedLiveChatTsc: CommandResult;
  rootTypecheck: CommandResult;
  scopedBiomeLiteral: PreservedCheck;
  scopedBiomeExplicit: PreservedCheck;
} {
  const scopedLiveChatTsc = runClean(PRESERVED_COMMANDS[0], REPO_ROOT, 5 * 60_000);
  const rootTypecheck = runClean(PRESERVED_COMMANDS[1], REPO_ROOT, 10 * 60_000);
  const scopedBiomeLiteral = parseBiomeCoverage(runClean(PRESERVED_COMMANDS[2], REPO_ROOT, 120_000));
  const lintConfigDir = writeScratchLintConfig();
  const scopedBiomeExplicit = parseBiomeCoverage(
    runClean(
      `pnpm exec biome ci --config-path=${lintConfigDir} ${LINTED_FILES.join(' ')}`,
      REPO_ROOT,
      120_000,
    ),
  );
  return { scopedLiveChatTsc, rootTypecheck, scopedBiomeLiteral, scopedBiomeExplicit };
}

/* ------------------------------------------------------------------- CLI -- */

function writeJson(name: string, payload: unknown): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(join(EVIDENCE_DIR, name), `${JSON.stringify(payload, null, 2)}\n`);
}

function main(): void {
  let receipt: ConsumerCompileReceipt;
  try {
    receipt = runConsumerCompileProof();
  } catch (error) {
    if (activeConsumerRoot) {
      rmSync(activeConsumerRoot, { recursive: true, force: true });
      activeConsumerRoot = null;
    }
    throw error;
  }

  const { classification, consumer } = receipt;
  const pairsMatch = consumer.copyPairs.every((p) => p.match);

  if (classification.tscExit !== 0) {
    receipt.verdict =
      classification.ts2307Uniwind.length === 1 &&
      classification.ts2459Theme.length === 1 &&
      classification.otherErrors.length === 0 &&
      pairsMatch
        ? 'FUNCTIONAL_RED'
        : 'THIRD_ERROR_CLASS';
    writeJson('red.json', receipt);
    console.error(`[FIX-ORI-RN-005-1] RED candidate ${receipt.candidate.commitSha}`);
    console.error(
      `[FIX-ORI-RN-005-1] tsc exit ${classification.tscExit}: ` +
        `${classification.ts2307Uniwind.length}x TS2307-uniwind, ` +
        `${classification.ts2459Theme.length}x TS2459-THEME, ` +
        `${classification.otherErrors.length} other; pairs ${pairsMatch ? '5/5' : 'MISMATCH'}`,
    );
    for (const line of classification.errorLines) {
      console.error(`  error> ${line}`);
    }
    process.exitCode = receipt.verdict === 'FUNCTIONAL_RED' ? 1 : 2;
    if (receipt.verdict === 'THIRD_ERROR_CLASS') {
      console.error(
        '[FIX-ORI-RN-005-1] THIRD ERROR CLASS — the blocked report\'s scope was incomplete; orchestrator decision required.',
      );
    }
    return;
  }

  // GREEN path — the compile is clean; demand the full green contract. The
  // literal scoped biome command is recorded but not gated on its exit: with
  // both paths outside biome.json's files.includes it processes zero files and
  // biome 2.5.11's `ci` exits 1 on that by design. The gated lint oracle is the
  // explicit scratch-config run over the same two real paths.
  const checks = runPreservedChecks();
  const literalCaveatConfirmed =
    checks.scopedBiomeLiteral.pathsIgnored === true &&
    (checks.scopedBiomeLiteral.filesChecked ?? 0) === 0;
  const biomeCoverageOk =
    checks.scopedBiomeExplicit.exit === 0 && (checks.scopedBiomeExplicit.filesChecked ?? 0) >= 2;
  const green =
    consumer.expoDoctor.exit === 0 &&
    consumer.recipe.exit === 0 &&
    consumer.hookPins.exit === 0 &&
    !consumer.uniwindInDependencyTree &&
    pairsMatch &&
    classification.errorLines.length === 0 &&
    checks.scopedLiveChatTsc.exit === 0 &&
    checks.rootTypecheck.exit === 0 &&
    literalCaveatConfirmed &&
    biomeCoverageOk;

  receipt.verdict = green ? 'GREEN' : 'GREEN_FAILED';
  writeJson('green.json', receipt);
  writeJson('preserved-checks.json', {
    runId: receipt.runId,
    candidate: receipt.candidate.commitSha,
    scopedLiveChatTsc: checks.scopedLiveChatTsc,
    rootTypecheck: { ...checks.rootTypecheck, output: bound(checks.rootTypecheck.output) },
    scopedBiomeLiteral: {
      ...checks.scopedBiomeLiteral,
      output: bound(checks.scopedBiomeLiteral.output),
      coverageCaveat:
        'biome.json files.includes omits both paths, so this literal command processes 0 files and biome 2.5.11 ci exits 1 on "No files were processed" by design — not a lint failure; coverage supplied by the explicit scratch-config run below',
      caveatConfirmed: literalCaveatConfirmed,
    },
    scopedBiomeExplicit: {
      ...checks.scopedBiomeExplicit,
      output: bound(checks.scopedBiomeExplicit.output),
      config: '.tmp/FIX-ORI-RN-005-1/lint/biome.json',
      coverage: `${checks.scopedBiomeExplicit.filesChecked ?? 0} files checked (linter rules: recommended; formatter/organizeImports off — see harness doc)`,
    },
  });

  // run.json binds the green run to the earlier RED evidence when present.
  let red: { runId?: string; candidate?: { commitSha?: string } } = {};
  const redPath = join(EVIDENCE_DIR, 'red.json');
  if (existsSync(redPath)) {
    try {
      red = JSON.parse(readFileSync(redPath, 'utf8')) as typeof red;
    } catch {
      red = {};
    }
  }
  writeJson('run.json', {
    runId: receipt.runId,
    task: 'FIX-ORI-RN-005-1',
    selector: 'pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts',
    finishedAt: nowIso(),
    verdict: receipt.verdict,
    candidate: receipt.candidate,
    consumerSummary: {
      cliVersion: consumer.cliVersion,
      resolvedVersions: consumer.resolvedVersions,
      uniwindInDependencyTree: consumer.uniwindInDependencyTree,
      copyPairsAllMatch: pairsMatch,
      tscExit: classification.tscExit,
      expoDoctorExit: consumer.expoDoctor.exit,
    },
    preserved: {
      scopedLiveChatTscExit: checks.scopedLiveChatTsc.exit,
      rootTypecheckExit: checks.rootTypecheck.exit,
      scopedBiomeLiteralExit: checks.scopedBiomeLiteral.exit,
      scopedBiomeLiteralCaveatConfirmed: literalCaveatConfirmed,
      scopedBiomeExplicitExit: checks.scopedBiomeExplicit.exit,
      scopedBiomeExplicitFilesChecked: checks.scopedBiomeExplicit.filesChecked ?? 0,
    },
    redEvidence: existsSync(redPath)
      ? { file: 'red.json', runId: red.runId ?? null, candidate: red.candidate?.commitSha ?? null }
      : null,
  });

  console.error(`[FIX-ORI-RN-005-1] GREEN candidate ${receipt.candidate.commitSha}`);
  console.error(
    `[FIX-ORI-RN-005-1] tsc 0, doctor ${consumer.expoDoctor.exit}, ` +
      `uniwind-in-tree ${consumer.uniwindInDependencyTree}, ` +
      `preserved: scoped ${checks.scopedLiveChatTsc.exit} typecheck ${checks.rootTypecheck.exit} ` +
      `biome(literal ${checks.scopedBiomeLiteral.exit}/${checks.scopedBiomeLiteral.filesChecked ?? 0} files) ` +
      `biome(explicit ${checks.scopedBiomeExplicit.exit}/${checks.scopedBiomeExplicit.filesChecked ?? 0} files)`,
  );
  process.exitCode = green ? 0 : 1;
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main();
}
