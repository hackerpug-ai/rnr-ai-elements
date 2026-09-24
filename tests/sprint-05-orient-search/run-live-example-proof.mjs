// fallow-ignore-file unused-file
/**
 * ORI-AI-002 — deterministic command entrypoint.
 *
 * Spawns the typed orchestrator (tests/sprint-05-orient-search/live-example-proof.ts)
 * through the repository's tsx runtime. The orchestrator imports the REAL typed
 * driver exports in-process — runLiveExampleProof (ORI-RN-004, uniwind) and
 * runNativewindLiveExampleProof (ORI-RN-005, nativewind) — and drives the six live
 * targets against the real owned backend and the official OpenAI Responses
 * endpoint. No other native-driver path is invoked.
 *
 * Usage:
 *   node tests/sprint-05-orient-search/run-live-example-proof.mjs \
 *     --engines uniwind,nativewind --platforms ios,android,web \
 *     --output tests/sprint-05-orient-search/evidence/ORI-AI-002
 *   node tests/sprint-05-orient-search/run-live-example-proof.mjs \
 *     --validate <evidence-dir> --expect-run-id <runId>
 *
 * The reserved device selectors may arrive as flags or environment variables.
 * NODE_ENV is stripped from the child: Vitest exports NODE_ENV=test into its
 * processes, and Expo's dev-middleware refuses to boot Metro under it (the
 * ORI-RN-005 cycle-2 finding). The provider credential stays in the environment —
 * only the trusted launcher/backend ever read it.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const TSX_CLI = join(REPO_ROOT, 'node_modules/tsx/dist/cli.mjs');
const ORCHESTRATOR = join(HERE, 'live-example-proof.ts');

function flag(name) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

const validateDir = flag('--validate');
const args = [];
const env = { ...process.env };
delete env.NODE_ENV;

if (validateDir !== undefined) {
  args.push('--validate-only', validateDir);
  const expectRunId = flag('--expect-run-id');
  if (expectRunId !== undefined) args.push('--expect-run-id', expectRunId);
} else {
  args.push(
    '--engines', flag('--engines') ?? 'uniwind,nativewind',
    '--platforms', flag('--platforms') ?? 'ios,android,web',
    '--output', flag('--output') ?? join('tests/sprint-05-orient-search/evidence/ORI-AI-002'),
  );
  const runId = flag('--run-id');
  if (runId !== undefined) args.push('--run-id', runId);
  const iosUdid = flag('--ios-udid') ?? process.env.RNR_S05_IOS_UDID;
  const androidSerial = flag('--android-serial') ?? process.env.RNR_S05_ANDROID_SERIAL;
  if (iosUdid !== undefined) args.push('--ios-udid', iosUdid);
  if (androidSerial !== undefined) args.push('--android-serial', androidSerial);
}

const child = spawn(process.execPath, [TSX_CLI, ORCHESTRATOR, ...args], {
  cwd: REPO_ROOT,
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal !== null) {
    console.error(`[ORI-AI-002] runner terminated by ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
