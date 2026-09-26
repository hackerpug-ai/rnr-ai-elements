/**
 * FIX-ORI-CONT-004-1 — the react-native-web 0.21.2 pin proof.
 *
 * Root cause (ORI-CONT-004 cycle-1 blocked report, commit 78f88b07): react-native-web
 * 0.21.3 (published 2026-09-25T15:00Z, inside the templates' `~0.21.0` range) adds an
 * InputAccessoryView export that uniwind 1.11.0's incomplete package.json exports map
 * cannot resolve, so `expo export --platform web` fails inside every fresh uniwind
 * consumer under withUniwindConfig Metro with `Unable to resolve module
 * ./exports/InputAccessoryView`. The fix is the bare exact pin `0.21.2` in both
 * committed consumer templates — every range-operator form (~, ^, >=) still spans
 * 0.21.3 and re-drifts on the next fresh install.
 *
 * Three lanes, all real surfaces (no mocks, no authored receipts):
 *  A. registry resolution — the real `npm view react-native-web@<committed-spec>
 *     version --json` over the public npm registry;
 *  B. fresh public consumer per engine — the reused ORI-RN-001 `prepareConsumer`
 *     (the committed recipe verbatim: pnpm install, npx expo install, the literal
 *     public CLI adds from rnraielements.com, tsc, expo-doctor), with the resolved
 *     react-native-web version read from the consumer's OWN
 *     node_modules/react-native-web/package.json;
 *  C. real export — the reused ORI-RN-003 `exportWeb`
 *     (`npx expo export --platform web` through the template's own Metro).
 *
 * Modes (CLI only — the vitest process never spawns these):
 *   pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts --mode red
 *     Runs lanes A-C for uniwind against the PRE-PIN manifests and writes
 *     .tmp/FIX-ORI-CONT-004-1/red.json. Exits 0 only when the broken state is fully
 *     observed (registry candidate set including 0.21.3, resolved exactly 0.21.3,
 *     export exit != 0, the literal module error in the export log). An export that
 *     unexpectedly passes pre-pin means the root-cause claim is wrong: exit 1.
 *   pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts
 *     Default GREEN mode: lane A for the exact pin, lanes B-C for BOTH engines,
 *     the pinned manifest-form assertion (bare 0.21.2, 0 range operators), and the
 *     static gates; writes green.json and merges run.json. Exits 0 only when every
 *     leg resolves exactly 0.21.2 and both exports exit 0 within the 90 min budget.
 *
 * The vitest-visible suite at the bottom is the network-free guard: it fails pre-pin
 * (honest aggregate RED), passes post-pin, and proves the heavyweight lanes stay
 * gated behind the direct-invocation check.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  type ConsumerReceipt,
  cleanupConsumer,
  prepareConsumer,
  REPO_ROOT,
  run,
  sha256,
} from './support/quickstart-consumer';
import { exportWeb, type WebExportReceipt } from './support/quickstart-web';

type Engine = 'nativewind' | 'uniwind';
const ENGINES: Engine[] = ['nativewind', 'uniwind'];

const TASK_TMP = join(REPO_ROOT, '.tmp', 'FIX-ORI-CONT-004-1');
const MANIFESTS: Record<Engine, string> = {
  nativewind: join(REPO_ROOT, 'packages/docs-snippets/nativewind/package.json'),
  uniwind: join(REPO_ROOT, 'packages/docs-snippets/uniwind/package.json'),
};
/** The ORI-RN-001 install evidence the reused helper rewrites in place (side effect). */
const INSTALL_EVIDENCE: Record<Engine, string> = {
  nativewind: join(
    REPO_ROOT,
    'tests/sprint-05-orient-search/evidence/ORI-RN-001/nativewind-install.txt',
  ),
  uniwind: join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-001/uniwind-install.txt'),
};

const PIN = '0.21.2';
/** The candidate set the pre-pin `~0.21.0` range must span at RED time. */
const PRE_PIN_CANDIDATES = ['0.21.0', '0.21.1', '0.21.2', '0.21.3'];
const DRIFTED_VERSION = '0.21.3';
const MODULE_ERROR = 'Unable to resolve module ./exports/InputAccessoryView';
const LITERAL_COMMAND = 'pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts';
const GREEN_BUDGET_MS = 90 * 60_000;

/** One named pass/fail observation — the modes' verdicts are `every(check.pass)`. */
type Check = { name: string; pass: boolean };

/** The only chars that can widen a semver spec past an exact version. */
const RANGE_OPERATOR = /[~^<>=*]/g;

function countRangeOperators(spec: string): number {
  return (spec.match(RANGE_OPERATOR) ?? []).length;
}

/** The committed react-native-web dependency spec of one consumer template. */
function readRnwSpec(engine: Engine): string {
  const pkg = JSON.parse(readFileSync(MANIFESTS[engine], 'utf8')) as {
    dependencies: Record<string, string>;
  };
  return pkg.dependencies['react-native-web'];
}

/** The resolved version from the consumer's OWN node_modules — never the lockfile. */
function readResolvedRnw(root: string): { version: string; readPath: string } {
  const readPath = join(root, 'node_modules', 'react-native-web', 'package.json');
  if (!existsSync(readPath)) return { version: 'missing', readPath };
  const pkg = JSON.parse(readFileSync(readPath, 'utf8')) as { version?: string };
  return { version: pkg.version ?? 'missing', readPath };
}

/* ------------------------------------------------------------ lane A: registry */

type RegistryLane = {
  command: string;
  spec: string;
  exit: number;
  candidates: string[];
  raw: string;
};

/** Real `npm view react-native-web@<spec> version --json` over the public registry. */
function registryCandidates(spec: string): RegistryLane {
  const command = `npm view 'react-native-web@${spec}' version --json`;
  const res = run(command, REPO_ROOT, 180_000);
  // npm emits `npm warn` config lines on stderr; the JSON payload is the remainder.
  const jsonText = res.output.replace(/^npm warn .*$/gm, '').trim();
  let candidates: string[] = [];
  try {
    const parsed: unknown = JSON.parse(jsonText);
    candidates = Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : typeof parsed === 'string'
        ? [parsed]
        : [];
  } catch {
    candidates = [];
  }
  return { command, spec, exit: res.exit, candidates, raw: jsonText };
}

/* ------------------------------------------------------- env hygiene + binding */

/**
 * The established hygiene (ORI-RN-005 cycle-2 / ORI-CONT-004): a vitest/Playwright
 * worker's NODE_ENV=test breaks expo install, and the long worktree TMPDIR overflows
 * tsx IPC pipes while the agent-scratch reaper deletes mid-run dists. Set before any
 * pnpm/npx/expo child spawns.
 */
function envHygiene(): string {
  delete process.env.NODE_ENV;
  const scratch = '/tmp/fix-ori-cont-004-1-scratch';
  mkdirSync(scratch, { recursive: true });
  process.env.TMPDIR = scratch;
  return scratch;
}

function gitHead(): string {
  const res = run('git rev-parse HEAD', REPO_ROOT, 30_000);
  return res.exit === 0 ? res.output.trim() : `unknown (git failed: ${res.output.trim()})`;
}

function mergeJson(path: string, patch: Record<string, unknown>): Record<string, unknown> {
  const current = existsSync(path)
    ? (JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>)
    : {};
  const merged = { ...current, ...patch };
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(merged, null, 2)}\n`);
  return merged;
}

/** Appends one run-identity binding to run.json (both modes merge here). */
function recordRun(entry: Record<string, unknown>): void {
  const path = join(TASK_TMP, 'run.json');
  const current = existsSync(path)
    ? (JSON.parse(readFileSync(path, 'utf8')) as { runs?: Record<string, unknown>[] })
    : {};
  const runs = [...(current.runs ?? []), entry];
  mergeJson(path, {
    task: 'FIX-ORI-CONT-004-1',
    candidate_head_sha: entry.candidate_head_sha,
    literal_command: LITERAL_COMMAND,
    runs,
  });
}

/** Install-log binding: the verbatim log lands in the refreshed ORI-RN-001 evidence. */
function installBinding(engine: Engine, receipt: ConsumerReceipt): Record<string, unknown> {
  return {
    recipe_script_exit: receipt.scriptExit,
    install_log_bytes: receipt.installLog.length,
    install_log_sha256: sha256(receipt.installLog),
    install_log_evidence: INSTALL_EVIDENCE[engine],
    install_log_evidence_exists: existsSync(INSTALL_EVIDENCE[engine]),
    install_log_head: receipt.installLog.split('\n').slice(0, 3).join('\n'),
    install_log_tail: receipt.installLog.split('\n').slice(-8).join('\n'),
  };
}

/** Export-log binding; full verbatim when small (RED failure logs), digest + tail when huge. */
function exportBinding(receipt: WebExportReceipt): Record<string, unknown> {
  const log = receipt.exportLog;
  const base: Record<string, unknown> = {
    command: 'npx expo export --platform web --output-dir <scratch>',
    dist_dir: receipt.distDir,
    export_exit: receipt.exportExit,
    export_log_bytes: log.length,
    export_log_sha256: sha256(log),
  };
  if (log.length <= 60_000) {
    return { ...base, export_log: log };
  }
  return { ...base, export_log_tail: log.slice(-4000) };
}

/** Teardown on every exit path: the consumer root, then the scratch dist dir. */
function teardown(dists: string[], roots: string[]): void {
  for (const dist of dists) rmSync(dist, { recursive: true, force: true });
  for (const root of roots) cleanupConsumer(root);
}

/* ------------------------------------------------------------------- RED mode */

type RedCapture = {
  laneA: RegistryLane;
  receipt: ConsumerReceipt | null;
  exportReceipt: WebExportReceipt | null;
  resolved: { version: string; readPath: string };
  failure: string | null;
};

/** Lanes A-C for the pre-pin uniwind consumer; teardown runs on every exit path. */
function captureRedLanes(committedSpec: string): RedCapture {
  const capture: RedCapture = {
    laneA: registryCandidates(committedSpec),
    receipt: null,
    exportReceipt: null,
    resolved: { version: 'missing', readPath: '' },
    failure: null,
  };
  try {
    capture.receipt = prepareConsumer('uniwind');
    // Read the resolved version BEFORE teardown removes the consumer root.
    capture.resolved = readResolvedRnw(capture.receipt.root);
    capture.exportReceipt = exportWeb('uniwind', capture.receipt.root);
  } catch (e) {
    capture.failure = e instanceof Error ? (e.stack ?? String(e)) : String(e);
  } finally {
    teardown(
      capture.exportReceipt ? [capture.exportReceipt.distDir] : [],
      capture.receipt ? [capture.receipt.root] : [],
    );
  }
  return capture;
}

/** The RED verdict is data-driven: the broken state is proven only when all pass. */
function redChecks(c: RedCapture): Check[] {
  return [
    { name: 'no_lane_failure', pass: c.failure === null },
    { name: 'consumer_prepared', pass: c.receipt !== null },
    { name: 'export_ran', pass: c.exportReceipt !== null },
    { name: 'registry_exit_0', pass: c.laneA.exit === 0 },
    {
      name: 'candidates_span_drift',
      pass: PRE_PIN_CANDIDATES.every((v) => c.laneA.candidates.includes(v)),
    },
    { name: 'recipe_exit_0', pass: c.receipt?.scriptExit === 0 },
    { name: 'resolved_drifted_version', pass: c.resolved.version === DRIFTED_VERSION },
    { name: 'export_failed', pass: c.exportReceipt !== null && c.exportReceipt.exportExit !== 0 },
    {
      name: 'module_error_literal',
      pass: (c.exportReceipt?.exportLog ?? '').includes(MODULE_ERROR),
    },
  ];
}

function redEvidence(
  capture: RedCapture,
  checks: Check[],
  bindings: { startedAt: string; durationMs: number; scratch: string; committedSpec: string },
): Record<string, unknown> {
  const { laneA, receipt, exportReceipt, resolved, failure } = capture;
  return {
    task: 'FIX-ORI-CONT-004-1',
    mode: 'red',
    candidate_head_sha: gitHead(),
    command: `${LITERAL_COMMAND} --mode red`,
    committed_spec_at_red: bindings.committedSpec,
    scratch_root: bindings.scratch,
    started_at: bindings.startedAt,
    duration_ms: bindings.durationMs,
    registry_lane: laneA,
    consumer: receipt
      ? {
          engine: 'uniwind',
          root: receipt.root,
          cli_version: receipt.cliVersion,
          ...installBinding('uniwind', receipt),
        }
      : null,
    resolved_version_read: resolved.readPath,
    observations: {
      registry_candidates: laneA.candidates,
      registry_exit: laneA.exit,
      registry_command: laneA.command,
      resolved_rnw_version: resolved.version,
      export_exit: exportReceipt?.exportExit ?? null,
      module_error_present: (exportReceipt?.exportLog ?? '').includes(MODULE_ERROR),
    },
    export: exportReceipt ? exportBinding(exportReceipt) : null,
    harness_sha256: sha256(readFileSync(fileURLToPath(import.meta.url), 'utf8')),
    checks,
    red_capture_ok: checks.every((c) => c.pass),
    failure,
  };
}

/** Writes red.json + the run.json binding; returns the capture verdict. */
function writeRedEvidence(
  capture: RedCapture,
  bindings: { startedAt: string; durationMs: number; scratch: string; committedSpec: string },
): boolean {
  const checks = redChecks(capture);
  const redOk = checks.every((c) => c.pass);
  const evidence = redEvidence(capture, checks, bindings);
  writeFileSync(join(TASK_TMP, 'red.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  recordRun({
    candidate_head_sha: evidence.candidate_head_sha,
    command: evidence.command,
    mode: 'red',
    exit: redOk ? 0 : 1,
    started_at: bindings.startedAt,
    duration_ms: bindings.durationMs,
    consumer_root: capture.receipt?.root ?? null,
    resolved_version_read_path: capture.resolved.readPath || null,
    registry_candidates: capture.laneA.candidates,
    export_exit: capture.exportReceipt?.exportExit ?? null,
    red_capture_ok: redOk,
  });
  console.log(JSON.stringify({ red_capture_ok: redOk, checks }, null, 2));
  return redOk;
}

function modeRed(): void {
  const startedAt = new Date().toISOString();
  const stopwatch = Date.now();
  const scratch = envHygiene();
  mkdirSync(TASK_TMP, { recursive: true });

  const committedSpec = readRnwSpec('uniwind');
  if (committedSpec === PIN) {
    console.error(
      'RED precondition failed: the committed uniwind manifest already carries the pin — ' +
        'functional RED requires the pre-pin ~0.21.0 range.',
    );
    process.exitCode = 2;
    return;
  }

  const capture = captureRedLanes(committedSpec);
  const redOk = writeRedEvidence(capture, {
    startedAt,
    durationMs: Date.now() - stopwatch,
    scratch,
    committedSpec,
  });
  if (!redOk) {
    console.error(
      'RED capture incomplete — see red.json. If the pre-pin export exited 0, the ' +
        'root-cause claim is wrong and the task must stop.',
    );
    process.exitCode = 1;
  }
}

/* ----------------------------------------------------------------- GREEN mode */

/** One static gate (AC-3): the real command, exit, and an output tail for the record. */
function gate(command: string, timeoutMs: number): Record<string, unknown> {
  const res = run(command, REPO_ROOT, timeoutMs);
  return { command, exit: res.exit, output_tail: res.output.slice(-1500) };
}

/** The static gates; the biome gate retries via the direct binary when the pnpm-wrapped
 *  invocation dies with the known shim exit 254 (environmental, not a gate failure). */
function staticGates(): Record<string, Record<string, unknown>> {
  const gates: Record<string, Record<string, unknown>> = {
    guard_selector: gate(
      'pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts',
      10 * 60_000,
    ),
    typecheck: gate('pnpm typecheck', 15 * 60_000),
  };
  const scoped = 'tests/sprint-05-orient-search/rnw-pin-proof.test.ts';
  const biomePnpm = run(`pnpm exec biome ci ${scoped}`, REPO_ROOT, 5 * 60_000);
  if (biomePnpm.exit !== 0 && /254|abnormally/i.test(biomePnpm.output)) {
    const direct = gate(`node_modules/.bin/biome ci ${scoped}`, 5 * 60_000);
    gates.biome_ci_scoped = {
      ...direct,
      pnpm_wrapped_attempt: { command: biomePnpm.command, exit: biomePnpm.exit },
    };
  } else {
    gates.biome_ci_scoped = {
      command: biomePnpm.command,
      exit: biomePnpm.exit,
      output_tail: biomePnpm.output.slice(-1500),
    };
  }
  return gates;
}

type GreenLeg = {
  engine: Engine;
  ok: boolean;
  record: Record<string, unknown> | null;
  /** Typed copies of the record's summary numbers for the console summary. */
  summary: { resolved: string; export_exit: number | null };
  error?: string;
};

/** Lanes B + C for one engine: exactly one fresh install, one export, own teardown. */
function runEngineLeg(engine: Engine): GreenLeg {
  try {
    const receipt = prepareConsumer(engine);
    const resolved = readResolvedRnw(receipt.root);
    const exportReceipt = exportWeb(engine, receipt.root);
    teardown([exportReceipt.distDir], [receipt.root]);
    const ok =
      receipt.scriptExit === 0 && resolved.version === PIN && exportReceipt.exportExit === 0;
    return {
      engine,
      ok,
      summary: { resolved: resolved.version, export_exit: exportReceipt.exportExit },
      record: {
        engine,
        root: receipt.root,
        cli_version: receipt.cliVersion,
        ...installBinding(engine, receipt),
        resolved_rnw_version: resolved.version,
        resolved_version_read: resolved.readPath,
        export: exportBinding(exportReceipt),
        leg_ok: ok,
      },
    };
  } catch (e) {
    return {
      engine,
      ok: false,
      summary: { resolved: 'missing', export_exit: null },
      record: null,
      error: e instanceof Error ? (e.stack ?? String(e)) : String(e),
    };
  }
}

/** The GREEN verdict is data-driven: registry, form, legs, gates, and budget. */
function greenChecks(context: {
  specs: Record<Engine, string>;
  rangeOperatorCount: number;
  laneA: RegistryLane;
  legs: Record<Engine, GreenLeg>;
  gates: Record<string, Record<string, unknown>>;
  budgetOk: boolean;
}): Check[] {
  const { specs, rangeOperatorCount, laneA, legs, gates, budgetOk } = context;
  return [
    {
      name: 'pinned_form',
      pass: rangeOperatorCount === 0 && ENGINES.every((e) => specs[e] === PIN),
    },
    {
      name: 'registry_exact_pin',
      pass: laneA.exit === 0 && laneA.candidates.length === 1 && laneA.candidates[0] === PIN,
    },
    ...ENGINES.map((e) => ({
      name: `leg_${e}`,
      pass: legs[e].ok && legs[e].record !== null,
    })),
    {
      name: 'static_gates',
      pass: Object.values(gates).every((g) => g.exit === 0),
    },
    { name: 'budget', pass: budgetOk },
  ];
}

function modeGreen(): void {
  const startedAt = new Date().toISOString();
  const stopwatch = Date.now();
  const scratch = envHygiene();
  mkdirSync(TASK_TMP, { recursive: true });

  // Pinned manifest form: both templates carry the bare pin, 0 range operators.
  const specs = { nativewind: readRnwSpec('nativewind'), uniwind: readRnwSpec('uniwind') };
  const rangeOperatorCount =
    countRangeOperators(specs.nativewind) + countRangeOperators(specs.uniwind);
  if (rangeOperatorCount !== 0 || specs.nativewind !== PIN || specs.uniwind !== PIN) {
    console.error(
      `GREEN precondition failed: the committed manifests must carry the bare ${PIN} pin — ` +
        `found ${JSON.stringify(specs)}. Apply the two-line pin before the GREEN run.`,
    );
    process.exitCode = 2;
    return;
  }

  const laneA = registryCandidates(PIN);
  const legs = {
    nativewind: runEngineLeg('nativewind'),
    uniwind: runEngineLeg('uniwind'),
  };
  const gates = staticGates();
  const elapsedMs = Date.now() - stopwatch;
  const budgetOk = elapsedMs <= GREEN_BUDGET_MS;
  const checks = greenChecks({ specs, rangeOperatorCount, laneA, legs, gates, budgetOk });
  const greenOk = checks.every((c) => c.pass);

  const evidence = {
    task: 'FIX-ORI-CONT-004-1',
    mode: 'green',
    candidate_head_sha: gitHead(),
    command: LITERAL_COMMAND,
    committed_specs: specs,
    range_operator_count: rangeOperatorCount,
    scratch_root: scratch,
    started_at: startedAt,
    duration_ms: elapsedMs,
    green_budget_ms: GREEN_BUDGET_MS,
    budget_ok: budgetOk,
    registry_lane: laneA,
    legs: Object.fromEntries(ENGINES.map((e) => [e, legs[e].record])),
    skipped_legs: ENGINES.filter((e) => legs[e].record === null),
    fresh_installs_per_engine: 1,
    static_gates: gates,
    harness_sha256: sha256(readFileSync(fileURLToPath(import.meta.url), 'utf8')),
    checks,
    green_proof_ok: greenOk,
    failures: checks.filter((c) => !c.pass).map((c) => c.name),
  };
  writeFileSync(join(TASK_TMP, 'green.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  recordRun({
    candidate_head_sha: evidence.candidate_head_sha,
    command: LITERAL_COMMAND,
    mode: 'green',
    exit: greenOk ? 0 : 1,
    started_at: startedAt,
    duration_ms: elapsedMs,
    static_gates: Object.fromEntries(
      Object.entries(gates).map(([name, g]) => [name, { command: g.command, exit: g.exit }]),
    ),
    green_proof_ok: greenOk,
    failures: evidence.failures,
  });

  console.log(
    JSON.stringify(
      {
        green_proof_ok: greenOk,
        registry_candidates: laneA.candidates,
        range_operator_count: rangeOperatorCount,
        legs: Object.fromEntries(ENGINES.map((e) => [e, legs[e].summary])),
        duration_ms: elapsedMs,
      },
      null,
      2,
    ),
  );
  if (!greenOk) {
    console.error(`GREEN proof incomplete:\n${evidence.failures.join('\n')}`);
    process.exitCode = 1;
  }
}

/* --------------------------------------------------------- CLI entry + export */

async function main(): Promise<void> {
  const arg = process.argv[2];
  const value =
    arg === '--mode' ? process.argv[3] : arg?.startsWith('--mode=') ? arg.slice(7) : arg;
  if (value === undefined || value === 'green') {
    modeGreen();
    return;
  }
  if (value === 'red') {
    modeRed();
    return;
  }
  console.error(`unknown mode: ${value ?? '(none)'} — use --mode red or the default green`);
  process.exitCode = 2;
}

/** The task's TEST_FUNCTION: the default GREEN proof (registry + both engines + gates). */
async function runRnwPinProof(): Promise<void> {
  await main();
}

/** The heavyweight lanes run only when this file is the direct CLI target. */
// biome-ignore lint/suspicious/noExportsInTest: FIX-ORI-CONT-004-1 contract exports the gate check for the guard suite
export function directInvocationCheck(argv1: string | undefined): boolean {
  return argv1 !== undefined && resolve(argv1) === resolve(fileURLToPath(import.meta.url));
}

if (directInvocationCheck(process.argv[1])) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.stack : String(e));
    process.exit(2);
  });
}

// biome-ignore lint/suspicious/noExportsInTest: FIX-ORI-CONT-004-1 TEST_FUNCTION runRnwPinProof stays exported per the task contract
export { runRnwPinProof };

/* ------------------------------------------------- vitest guard (network-free) */

/**
 * The aggregate-safe tier: filesystem reads + a pure function only. No network, no
 * spawns, no installs. Fails pre-pin (the honest aggregate RED for AC-1/AC-2), passes
 * post-pin, and pins the CLI gate so the heavyweight lanes can never fire under vitest.
 *
 * Registration is guarded: describe() needs a live vitest runner context and crashes
 * when the file is executed directly by tsx (the CLI lanes never reach this branch).
 */
if (!directInvocationCheck(process.argv[1])) {
  describe('FIX-ORI-CONT-004-1 rnw pin guard (network-free)', () => {
    it('both committed consumer templates pin react-native-web at the bare exact 0.21.2', () => {
      for (const engine of ENGINES) {
        const spec = readRnwSpec(engine);
        expect(spec, `${engine} template must declare the bare exact pin`).toBe(PIN);
        expect(countRangeOperators(spec), `${engine} pin must carry 0 range operators`).toBe(0);
      }
    });

    it('the heavyweight lanes stay CLI-gated behind the direct-invocation check', () => {
      // Under the vitest runner argv[1] is vitest's own binary — the gate must be closed.
      expect(directInvocationCheck(process.argv[1])).toBe(false);
      // The only shape that opens the gate is this file itself as the CLI target.
      expect(directInvocationCheck(fileURLToPath(import.meta.url))).toBe(true);
      expect(directInvocationCheck(undefined)).toBe(false);
    });
  });
}
