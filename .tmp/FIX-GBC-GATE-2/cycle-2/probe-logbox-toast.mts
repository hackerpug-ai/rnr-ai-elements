/**
 * Reproduces the dev-only LogBox toast that swallowed the composer tap on
 * uniwind/android/light, then runs a quickstart Maestro flow against it on a real
 * Expo Go session.
 *
 * The toast is forced on a DISPOSABLE consumer only: one module-level console.error
 * carrying Expo Router's exact message is prepended to the consumer's app/index.tsx.
 * No committed source changes. Everything else is the driver's own library.
 *
 *   up                              prepare the consumer, inject the error, start Metro
 *   leg <ios|android> <flow> <out>  open Expo Go, record the toast, run <flow>, write <out>.json
 *   down                            stop Metro, delete the consumer
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
  captureHierarchy,
  captureScreenshot,
  cleanupConsumerRoot,
  type MetroHandle,
  OLDER_SEED,
  openExpoGo,
  type Platform,
  prepareConsumer,
  reserveDevices,
  setAppearance,
  startMetro,
  stopMetro,
} from '../../../tests/sprint-05-orient-search/support/native-session.ts';

const HERE = import.meta.dirname;
const SESSION = join(HERE, 'session.json');
const MAESTRO_BIN = join(process.env.HOME ?? '', '.maestro', 'bin', 'maestro');
const TOAST =
  "Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously tries to update the component. Move this work to useEffect instead.";

type Session = { root: string; metro: MetroHandle };

function up(): void {
  const consumer = prepareConsumer('uniwind');
  if (consumer.scriptExit !== 0 || consumer.tscExit !== 0) {
    cleanupConsumerRoot(consumer.root);
    throw new Error(`consumer prep failed: script=${consumer.scriptExit} tsc=${consumer.tscExit}`);
  }
  const entry = join(consumer.root, 'app/index.tsx');
  writeFileSync(entry, `console.error(${JSON.stringify(TOAST)});\n${readFileSync(entry, 'utf8')}`);
  const metro = startMetro(consumer.root, 8094, join(HERE, 'metro.log'));
  writeFileSync(SESSION, `${JSON.stringify({ root: consumer.root, metro }, null, 2)}\n`);
  console.log(`up: ${consumer.root} on ${metro.openUrl}`);
}

function leg(platform: Platform, flowArg: string, outArg: string): void {
  const { metro } = JSON.parse(readFileSync(SESSION, 'utf8')) as Session;
  const flow = resolve(flowArg);
  const out = resolve(outArg);
  mkdirSync(dirname(out), { recursive: true });
  const device = reserveDevices()[platform];

  setAppearance(platform, device.id, 'light');
  openExpoGo(platform, device.id, metro.openUrl);

  // Wait for the seed screen, then record what is on it BEFORE the flow touches it.
  let before = '';
  for (let i = 0; i < 30 && !before.includes('Seed turn 24'); i += 1) {
    spawnSync('sleep', ['3']);
    before = captureHierarchy(device.id);
  }
  writeFileSync(`${out}.before.hierarchy.txt`, before);
  captureScreenshot(platform, device.id, `${out}.before.png`);

  const marker = `FIX-GBC-GATE-2:${platform}:${Date.now()}`;
  const res = spawnSync(
    MAESTRO_BIN,
    [
      '--udid',
      device.id,
      'test',
      '--no-ansi',
      '-e',
      `MARKER=${marker}`,
      '-e',
      `OLDER_SEED=${OLDER_SEED}`,
      flow,
    ],
    { encoding: 'utf8', timeout: 300_000, maxBuffer: 64 * 1024 * 1024 },
  );
  captureScreenshot(platform, device.id, `${out}.after.png`);
  const after = captureHierarchy(device.id);

  const result = {
    platform,
    device: device.id,
    flow: flowArg,
    flow_sha256: createHash('sha256').update(readFileSync(flow)).digest('hex'),
    seed_screen_loaded: before.includes('Seed turn 24'),
    toast_on_screen_before_flow: before.includes("Can't perform a React state update"),
    marker,
    maestro_exit: res.status,
    marker_in_transcript_after: after.includes(marker),
    maestro_output_tail: `${res.stdout ?? ''}${res.stderr ?? ''}`.slice(-1800),
  };
  writeFileSync(`${out}.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ ...result, maestro_output_tail: undefined }));
}

function down(): void {
  const { root, metro } = JSON.parse(readFileSync(SESSION, 'utf8')) as Session;
  stopMetro(metro);
  cleanupConsumerRoot(root);
  console.log(`down: ${root}`);
}

const [command, ...rest] = process.argv.slice(2);
if (command === 'up') up();
else if (command === 'leg') leg(rest[0] as Platform, rest[1], rest[2]);
else if (command === 'down') down();
else throw new Error('usage: up | leg <ios|android> <flow> <out> | down');
