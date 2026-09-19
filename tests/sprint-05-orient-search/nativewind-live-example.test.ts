/**
 * ORI-RN-005 — the canonical live-chat source runs independently under NativeWind on
 * iOS, Android and Web, with real streaming, abort, error recovery and traceable
 * evidence.
 *
 * Every test here spawns the REAL driver
 * (tests/sprint-05-orient-search/support/nativewind-live-example.ts) as a child process
 * with the reserved device selectors in its environment, and asserts on its real exit
 * code and real captured observations. The driver does the actual work: it materializes
 * a fresh NativeWind/Tailwind v3 consumer outside the monorepo from ORI-RN-001's
 * committed template, runs the literal public recipe (real
 * `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/…`
 * installs), copies the five canonical app sources byte-identical, compiles with the
 * consumer's own TypeScript, runs expo-doctor, and — when that graph compiles — drives
 * the real /live-chat surface on the reserved iOS simulator, the reserved Android
 * emulator and a served web export against the owned backend and the official OpenAI
 * Responses endpoint. No mocks, no canned answers, no declaration shims.
 *
 * Tiering (task file): AC-1 and AC-4 are integration proofs; AC-2 and AC-3 are e2e
 * proofs over the real devices and the real provider.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

const REPO_ROOT = join(__dirname, '..', '..');
const DRIVER = join(REPO_ROOT, 'tests/sprint-05-orient-search/support/nativewind-live-example.ts');
const MANIFEST = join(
  REPO_ROOT,
  'tests/sprint-05-orient-search/nativewind-live-source-manifest.json',
);
const SCRATCH = join(REPO_ROOT, '.tmp/ORI-RN-005');

/** The reserved proof-owned device selectors (validated by the driver itself). NODE_ENV
 * is explicitly cleared: Vitest exports NODE_ENV=test into this process, RN's
 * dev-middleware refuses to boot Metro under it ("DefaultToolLauncher must be mocked
 * or overridden in tests"), and the inherited value silently killed the spawned
 * driver's Metro before any leg could run (cycle-2 AC-2 verify). */
const RESERVED_ENV: NodeJS.ProcessEnv = {
  ...process.env,
  RNR_S05_IOS_UDID: '81487B1E-A4D1-45AE-9BCE-D675802BACD1',
  RNR_S05_ANDROID_SERIAL: 'emulator-5554',
};
delete RESERVED_ENV.NODE_ENV;

/** The first leg diagnostic of a manifest — the "why" for a failed run. */
function firstDiagnostic(manifest: Record<string, unknown>): string {
  const legs = (manifest.legs ?? []) as { diagnostic?: string }[];
  return legs.find((leg) => leg.diagnostic)?.diagnostic?.slice(0, 1500) ?? '(no diagnostic)';
}

type DriverRun = { exit: number; stdout: string; stderr: string };

/** Spawns the real driver CLI. Real exit code, real output — never an interpretation.
 * The default timeout (60 min) must exceed a FULL three-platform live proof (~30-35
 * min): at exactly 30 min spawnSync SIGTERMs the child mid-leg, which presents as a
 * silent kill with no teardown (cycle-2's AC-2 verify lost two runs to this). */
function runDriver(
  args: string[],
  env: NodeJS.ProcessEnv = RESERVED_ENV,
  timeoutMs: number = 60 * 60_000,
): DriverRun {
  const res = spawnSync('pnpm', ['exec', 'tsx', DRIVER, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    env,
  });
  return {
    exit: res.status ?? -1,
    stdout: `${res.stdout ?? ''}`,
    stderr: `${res.stderr ?? ''}`,
  };
}

function outputOf(run: DriverRun): string {
  return `${run.stdout}${run.stderr}`;
}

/**
 * Runs the driver, retrying ONCE when the attempt was killed externally. The driver
 * writes teardown.json on EVERY concluded path (success, assertion-failing leg, and
 * even a thrown crash through its finally) — so a teardown whose finished_at predates
 * the attempt start (or no teardown at all) is the signature of an external kill
 * (cycle-2 lost several 30-minute runs this way: harness/API drops mid-web-leg leave
 * no output, no teardown, and orphaned children the next run reaps). A CONCLUDED
 * failed run never retries — a real red stays red.
 */
function runDriverWithKillRetry(args: string[], outDir: string): DriverRun {
  let last: DriverRun = { exit: -1, stdout: '', stderr: '' };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const startedAt = Date.now();
    last = runDriver([...args, '--out', outDir]);
    const teardownPath = join(outDir, 'teardown.json');
    if (!existsSync(teardownPath)) continue; // killed before ANY teardown could exist
    let finishedAt = 0;
    try {
      finishedAt = new Date(
        (JSON.parse(readFileSync(teardownPath, 'utf8')) as { finished_at: string }).finished_at,
      ).getTime();
    } catch {
      continue; // unreadable = do not trust; retry
    }
    if (Number.isFinite(finishedAt) && finishedAt >= startedAt - 2000) break; // concluded
  }
  return last;
}

it('ORI-RN-005-install-exact-source: five source pairs match and the clean Expo 57 consumer compiles', {
  timeout: 30 * 60_000,
}, () => {
  const out = join(SCRATCH, 'install-exact-source');
  const run = runDriver(['--case', 'ORI-RN-005-install-exact-source', '--out', out]);
  const receiptPath = join(out, 'install-exact-source.json');
  expect(
    existsSync(receiptPath),
    `driver must write its receipt (exit ${run.exit}):\n${outputOf(run).slice(-3000)}`,
  ).toBe(true);
  const receipt = JSON.parse(readFileSync(receiptPath, 'utf8')) as Record<string, unknown>;

  // The five canonical sources copied byte-identical into their mapped targets.
  expect(receipt.copy_pairs, 'exactly the five mapped sources').toHaveLength(5);
  for (const pair of receipt.copy_pairs as { source: string; match: boolean }[]) {
    expect(pair.match, `${pair.source} must copy byte-identical`).toBe(true);
  }
  expect(receipt.five_pairs_match, 'all five SHA-256 pairs match').toBe(true);

  // The literal public installation actually ran (registry provenance recorded).
  expect(receipt.cli_version, 'the real RNR CLI version is recorded').toMatch(/^\d+\.\d+\.\d+$/);
  expect(receipt.script_exit, 'the verbatim public recipe ran').toBeDefined();

  // The clean Expo 57 consumer compiles the exact copied source; doctor passes.
  expect(
    receipt.tsc,
    `the consumer compiler must accept the copied /live-chat graph:\n${JSON.stringify(receipt.tsc)}`,
  ).toMatchObject({ exit: 0 });
  expect(receipt.expo_doctor, 'expo-doctor must pass in the clean consumer').toMatchObject({
    exit: 0,
  });
  expect(
    receipt.passed,
    `install-exact-source must pass (observed tsc exit ${(receipt.tsc as { exit: number }).exit})`,
  ).toBe(true);
});

it('ORI-RN-005-live-three-platforms: iOS, Android and Web show incremental correlated nonce-preserving replies', {
  timeout: 75 * 60_000,
}, () => {
  const out = join(SCRATCH, 'live-three-platforms');
  const run = runDriverWithKillRetry(['--platforms', 'ios,android,web'], out);
  const manifestPath = join(out, 'manifest.json');
  expect(
    existsSync(manifestPath),
    `driver must write its run manifest (exit ${run.exit}):\n${outputOf(run).slice(-3000)}`,
  ).toBe(true);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;

  expect(
    manifest.completed,
    `all three platforms must pass in one run — first leg diagnostic:\n${firstDiagnostic(manifest)}`,
  ).toBe(true);
  const legs = manifest.legs as {
    platform: string;
    status: string;
    diagnostic?: string;
    evidence?: Record<string, unknown>;
  }[];
  expect(legs.filter((leg) => leg.platform === 'ios')).toHaveLength(2); // light + dark
  expect(legs.filter((leg) => leg.platform === 'android')).toHaveLength(2);
  expect(legs.filter((leg) => leg.platform === 'web')).toHaveLength(1);

  for (const leg of legs) {
    expect(leg.status, `${leg.platform} leg diagnostic: ${leg.diagnostic}`).toBe('passed');
    // AC-2: at least 2 distinct nonempty assistant text lengths before completion.
    const webResult = leg.evidence?.drive_result as { growthSamples?: number[] } | undefined;
    const growth = (leg.evidence?.assistant_text_growth ??
      webResult?.growthSamples ??
      []) as number[];
    expect(
      growth.filter((n) => n > 0).length,
      `${leg.platform} must show incremental assistant text growth (observed ${growth.join(', ')})`,
    ).toBeGreaterThanOrEqual(2);
  }

  // Provider correlation: every record names the pinned model over the owned backend.
  const correlationPath = join(out, 'provider-correlation.json');
  expect(existsSync(correlationPath), 'provider correlation is retained').toBe(true);
  const correlation = JSON.parse(readFileSync(correlationPath, 'utf8')) as {
    backend_records: { providerModel: string; outcome: string }[];
  };
  expect(correlation.backend_records.length, 'real provider records exist').toBeGreaterThan(0);
  for (const record of correlation.backend_records) {
    expect(record.providerModel).toBe('gpt-4.1-mini-2025-04-14');
  }
});

it('ORI-RN-005-abort-error-retry: active Stop and both failure/retry paths recover on three targets', {
  timeout: 75 * 60_000,
  // fallow-ignore-next-line complexity
}, () => {
  const out = join(SCRATCH, 'abort-error-retry');
  const run = runDriverWithKillRetry(['--platforms', 'ios,android,web'], out);
  const manifestPath = join(out, 'manifest.json');
  expect(
    existsSync(manifestPath),
    `driver must write its run manifest (exit ${run.exit}):\n${outputOf(run).slice(-3000)}`,
  ).toBe(true);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
  expect(
    manifest.completed,
    `all three platforms must pass in one run — first leg diagnostic:\n${firstDiagnostic(manifest)}`,
  ).toBe(true);

  // The interaction log of every native leg must record the active stop and the
  // sanitized endpoint-loss recovery with exactly one retained user turn.
  const legs = manifest.legs as {
    platform: string;
    evidence?: Record<string, unknown>;
    diagnostic?: string;
  }[];
  for (const leg of legs) {
    const log = String(
      leg.evidence?.flow_output ?? JSON.stringify(leg.evidence?.drive_result ?? {}),
    );
    if (leg.platform !== 'web') {
      // Native legs record their interaction log as text.
      expect(log, `${leg.platform} must abort an active stream`).toContain(
        'active stop aborted the stream',
      );
      expect(log, `${leg.platform} must surface a sanitized endpoint-loss error`).toContain(
        'sanitized error with an accessible Retry',
      );
      expect(log, `${leg.platform} must retry on a new provider request`).toContain(
        'retry completed on a new request',
      );
      expect(log, `${leg.platform} must retain exactly one user turn`).toContain(
        'exactly 1 retained user turn',
      );
    } else {
      // The web leg records discrete observed booleans, not log lines — assert the
      // same four behaviors through them.
      const drive = leg.evidence?.drive_result as Record<string, unknown>;
      expect(drive?.stopControlVisible, 'web must catch Stop generating mid-request').toBe(true);
      expect(drive?.retryControlVisible, 'web must surface an accessible Retry').toBe(true);
      expect(drive?.retryErrorSanitized, 'web endpoint-loss error must be sanitized').toBe(true);
      expect(drive?.retryCompleted, 'web retry must complete on a new provider request').toBe(true);
      expect(drive?.retrySingleUserTurn, 'web must retain exactly one user turn').toBe(true);
    }
  }

  // Provider correlation must hold real aborted records (the Stop was real) and
  // completed retry records on the restarted endpoint.
  const correlation = JSON.parse(readFileSync(join(out, 'provider-correlation.json'), 'utf8')) as {
    backend_records: { outcome: string }[];
  };
  expect(
    correlation.backend_records.filter((record) => record.outcome === 'aborted').length,
    'active stops correlate to aborted provider records',
  ).toBeGreaterThanOrEqual(3);
  expect(
    correlation.backend_records.filter((record) => record.outcome === 'completed').length,
    'retries correlate to completed provider records',
  ).toBeGreaterThanOrEqual(3);
});

it('ORI-RN-005-fail-closed-cleanup: invalid inputs fail explicitly and owned resources are released', {
  timeout: 75 * 60_000,
}, () => {
  // Case 1 — one mismatched source hash in an isolated manifest copy: the run must
  // exit nonzero BEFORE any target launch, naming the mapped path and both hashes.
  const isolated = join(SCRATCH, 'mismatched-manifest.json');
  const tampered = JSON.parse(readFileSync(MANIFEST, 'utf8')) as {
    mappings: { source: string; expected_source_sha256: string }[];
  };
  tampered.mappings[1].expected_source_sha256 = tampered.mappings[1].expected_source_sha256.replace(
    /^./,
    '0',
  );
  writeFileSync(isolated, `${JSON.stringify(tampered, null, 2)}\n`);
  const mismatchRun = runDriver([
    '--platforms',
    'ios',
    '--manifest',
    isolated,
    '--out',
    join(SCRATCH, 'fail-closed-hash-mismatch'),
  ]);
  expect(mismatchRun.exit, 'a mismatched source hash must fail the run').not.toBe(0);
  const mismatchOut = outputOf(mismatchRun);
  expect(mismatchOut, 'the failure must name the mapped path').toContain(
    'apps/example/components/live-chat-screen.tsx',
  );
  expect(mismatchOut, 'the failure must name the expected hash').toContain(
    tampered.mappings[1].expected_source_sha256,
  );
  // The ACTUAL hash is the real file's current digest (never a hardcoded value — the
  // source legitimately changed once already when FIX-ORI-RN-005-1 landed).
  const actualHash = createHash('sha256')
    .update(readFileSync(join(REPO_ROOT, 'apps/example/components/live-chat-screen.tsx')))
    .digest('hex');
  expect(mismatchOut, 'the failure must name the actual hash').toContain(`but found ${actualHash}`);
  expect(
    existsSync(join(SCRATCH, 'fail-closed-hash-mismatch', 'install-log.txt')),
    'no consumer may be built for a hash-mismatched run',
  ).toBe(false);

  // Case 2 — the requested proof-owned target is absent: nonzero naming its exact
  // selector, without substituting another device.
  const absentRun = runDriver(
    ['--platforms', 'ios', '--out', join(SCRATCH, 'fail-closed-absent-target')],
    {
      ...RESERVED_ENV,
      RNR_S05_IOS_UDID: '00000000-0000-0000-0000-000000000000',
    },
  );
  expect(absentRun.exit, 'an absent requested target must fail the run').not.toBe(0);
  expect(outputOf(absentRun), 'the failure must name the exact selector').toContain(
    'RNR_S05_IOS_UDID=00000000-0000-0000-0000-000000000000',
  );
  const absentTeardown = join(SCRATCH, 'fail-closed-absent-target', 'teardown.json');
  expect(existsSync(absentTeardown), 'the failed run still tears down owned resources').toBe(true);
  const absentRecord = JSON.parse(readFileSync(absentTeardown, 'utf8')) as {
    backend_stopped: boolean;
  };
  expect(absentRecord.backend_stopped, 'the owned backend is stopped on the failure path').toBe(
    true,
  );

  // Case 3 — after a REAL full run and the negative runs above, teardown.json records
  // appearances restored and reservations released, and no owned listener or adb
  // reverse mapping remains. The teardown must be THIS test's run (freshness pinned by
  // the recorded finished_at), never a stale earlier artifact.
  const out = join(SCRATCH, 'fail-closed-cleanup');
  const case3StartedAt = new Date();
  runDriverWithKillRetry(['--platforms', 'ios,android,web'], out);
  const teardownPath = join(out, 'teardown.json');
  expect(existsSync(teardownPath), 'the run writes its teardown record').toBe(true);
  const teardown = JSON.parse(readFileSync(teardownPath, 'utf8')) as {
    run_id: string;
    finished_at: string;
    backend_stopped: boolean;
    metro_stopped: boolean;
    consumer_removed: boolean;
    consumer_root: string | null;
    adb_reverse_remaining: string;
    appearances_restored: { platform: string; from: string; to: string }[];
    reservations_released: boolean;
  };
  expect(
    new Date(teardown.finished_at).getTime(),
    'teardown must come from THIS test run, not a stale artifact',
  ).toBeGreaterThan(case3StartedAt.getTime() - 1000);
  expect(teardown.backend_stopped, 'owned backend stopped').toBe(true);
  expect(teardown.consumer_removed, 'owned consumer removed').toBe(true);
  expect(teardown.consumer_root, 'consumer lived outside the monorepo').not.toContain(
    'rnr-ai-elements',
  );
  expect(teardown.adb_reverse_remaining, 'no owned adb reverse mapping remains').not.toContain(
    '4010',
  );
  expect(teardown.reservations_released, 'reservations released').toBe(true);
  for (const restored of teardown.appearances_restored) {
    expect(restored.to, `${restored.platform} appearance restored to ${restored.from}`).toBe(
      restored.from,
    );
  }
  // Prior-run evidence is retained (append-bounded, never overwritten away).
  expect(existsSync(join(out, 'manifest.json')), 'run evidence retained beside teardown').toBe(
    true,
  );
});
