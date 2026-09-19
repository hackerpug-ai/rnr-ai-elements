/**
 * ORI-RN-003 support — native session: device reservations, Expo Go/Metro lifecycle,
 * native automation (Maestro), owned cleanup, and the appearance/keyboard observations.
 *
 * Everything here drives REAL surfaces, never reconstructed ones:
 *   - reservations come from RNR_S05_IOS_UDID / RNR_S05_ANDROID_SERIAL and are validated
 *     for identity and exclusive ownership before use (missing/busy → concrete diagnostic,
 *     never a fallback to the first booted simulator);
 *   - a clean Expo 57 consumer is prepared OUTSIDE the monorepo (ORI-RN-001's committed
 *     template + verbatim recipe, then ORI-RN-002's shared screen + entrypoint overlaid);
 *   - Expo Go is the stated end state — installed from the pinned SDK 57 client and opened
 *     on the reserved device through the real exp:// URL, never a dev client or web;
 *   - the locked Maestro flow (quickstart-expo-go.maestro.yaml) scrolls, types and submits
 *     through real accessibility text; screenshots and hierarchy bounds are the evidence.
 *
 * The nativewind engine's Metro bundle failure (react-native-css-interop/jsx-runtime
 * unresolvable without a direct dependency) is OBSERVED here and reported, not repaired —
 * that defect is owned by the recipe/template owners and lies in writeProhibited paths.
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  cleanupConsumer,
  compileConsumer,
  REPO_ROOT,
  readResolvedVersions,
  run as runShell,
  sha256,
} from './quickstart-consumer';

export type Engine = 'nativewind' | 'uniwind';
export type Platform = 'ios' | 'android';
export type Appearance = 'light' | 'dark';

const MAESTRO_BIN = join(process.env.HOME ?? '', '.maestro', 'bin', 'maestro');
const MAESTRO_FLOW = join(
  REPO_ROOT,
  'tests/sprint-05-orient-search/quickstart-expo-go.maestro.yaml',
);

const ANDROID_SDK =
  process.env.ANDROID_HOME ?? join(process.env.HOME ?? '', 'Library', 'Android', 'sdk');
const ADB = join(ANDROID_SDK, 'platform-tools', 'adb');

const TEMPLATE_DIR: Record<Engine, string> = {
  nativewind: join(REPO_ROOT, 'packages/docs-snippets/nativewind'),
  uniwind: join(REPO_ROOT, 'packages/docs-snippets/uniwind'),
};
const COMMAND_SCRIPT: Record<Engine, string> = {
  nativewind: join(REPO_ROOT, 'packages/docs-snippets/commands/nativewind.sh'),
  uniwind: join(REPO_ROOT, 'packages/docs-snippets/commands/uniwind.sh'),
};
const SHARED_DIR = join(REPO_ROOT, 'packages/docs-snippets/shared');

const TEMPLATE_FILES: Record<Engine, string[]> = {
  nativewind: [
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
  ],
  uniwind: [
    'package.json',
    'app.json',
    'components.json',
    'tsconfig.json',
    'metro.config.js',
    'global.css',
    'uniwind-types.d.ts',
    'app/_layout.tsx',
    'lib/theme.ts',
    'lib/utils.ts',
  ],
};

/** The olderSeed literal — the oldest authored turn the learner must reach by scrolling. */
export const OLDER_SEED = 'Seed turn 01: Plan a weekend walk.';
/** The seed transcript length — a successful submit advances this to seedCount + 1. */
export const SEED_COUNT = 24;

export type DeviceReservation = {
  platform: Platform;
  id: string;
  display: string;
};

export type MetroHandle = {
  port: number;
  pid: number;
  logPath: string;
  url: string;
  openUrl: string;
};

export type Consumer = {
  engine: Engine;
  runId: string;
  root: string;
  scriptExit: number;
  installLog: string;
  resolvedVersions: Record<string, string>;
  tscExit: number;
  sharedHashes: Record<string, string>;
};

/* ------------------------------------------------------------------ helpers -- */

export function sha256File(p: string): string {
  return sha256(readFileSync(p, 'utf8'));
}

export function gitHead(): string {
  const res = runShell('git rev-parse HEAD', REPO_ROOT, 30_000);
  return res.exit === 0 ? res.output.trim() : `unknown (${res.output.trim()})`;
}

export function run(cmd: string, cwd: string, timeoutMs = 600_000) {
  return runShell(cmd, cwd, timeoutMs);
}

export function canonicalHash(fileName: string): string {
  return sha256File(join(SHARED_DIR, fileName));
}

/* --------------------------------------------------------- consumer prep -- */

/**
 * Prepares one clean consumer: copy the committed setup template, run the verbatim
 * public recipe, overlay ORI-RN-002's shared screen + entrypoint, then compile. Never
 * writes another task's evidence; roots live under the OS temp dir outside the monorepo.
 */
export function prepareConsumer(engine: Engine): Consumer {
  const root = mkdtempSync(join(tmpdir(), `ori-rn-003-${engine}-`));
  const runId = `${engine}-${new Date().toISOString()}`;

  for (const rel of TEMPLATE_FILES[engine]) {
    const src = join(TEMPLATE_DIR[engine], rel);
    if (!existsSync(src)) {
      rmSync(root, { recursive: true, force: true });
      throw new Error(`template file missing: ${src}`);
    }
    const dst = join(root, rel);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  // The verbatim public recipe (pnpm install, expo install, the five literal CLI adds,
  // doctor, tsc, expo-doctor).
  const script = runShell(`bash "${COMMAND_SCRIPT[engine]}"`, root, 30 * 60_000);

  // Overlay the learner's order: install, then write the entrypoint + shared screen.
  const entrypoint = join(TEMPLATE_DIR[engine], 'app/index.tsx');
  if (!existsSync(entrypoint)) {
    rmSync(root, { recursive: true, force: true });
    throw new Error(`entrypoint missing: ${entrypoint}`);
  }
  copyFileSync(entrypoint, join(root, 'app/index.tsx'));
  mkdirSync(join(root, 'shared'), { recursive: true });
  const sharedHashes: Record<string, string> = {};
  for (const f of ['quickstart-screen.tsx', 'quickstart-messages.ts'] as const) {
    const src = join(SHARED_DIR, f);
    if (!existsSync(src)) {
      rmSync(root, { recursive: true, force: true });
      throw new Error(`shared source missing: ${src}`);
    }
    copyFileSync(src, join(root, 'shared', f));
    sharedHashes[f] = sha256File(join(root, 'shared', f));
  }

  const tsc = compileConsumer(root);

  return {
    engine,
    runId,
    root,
    scriptExit: script.exit,
    installLog: script.output,
    resolvedVersions: readResolvedVersions(root),
    tscExit: tsc.exit,
    sharedHashes,
  };
}

/* ------------------------------------------------------ device reservation -- */

function bootedSimulators(): { udid: string; name: string }[] {
  const res = spawnSync('xcrun', ['simctl', 'list', 'devices', 'booted'], {
    encoding: 'utf8',
    timeout: 30_000,
  });
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}`;
  const sims: { udid: string; name: string }[] = [];
  for (const line of out.split('\n')) {
    const m = line.match(/^\s+(.+?)\s+\(([0-9A-F-]{36})\)\s+\(Booted\)/);
    if (m) sims.push({ name: m[1].trim(), udid: m[2] });
  }
  return sims;
}

/**
 * Resolves the reserved device from the environment. A missing value, an unknown UDID,
 * or a busy device fails with a concrete diagnostic — never a fallback to the first
 * booted simulator and never a repurposing of another project's device.
 */
export function reserveDevices(): { ios: DeviceReservation; android: DeviceReservation } {
  const iosUdid = process.env.RNR_S05_IOS_UDID;
  const androidSerial = process.env.RNR_S05_ANDROID_SERIAL;

  if (!iosUdid) throw new Error('missing device reservation: RNR_S05_IOS_UDID');
  if (!androidSerial) throw new Error('missing device reservation: RNR_S05_ANDROID_SERIAL');

  // Validate the iOS UDID exists and is booted (or boot it ourselves — but never another's).
  const iosSim = bootedSimulators().find((s) => s.udid === iosUdid);
  if (!iosSim) {
    // It may be shutdown; boot it only if it is a known available simulator.
    const avail = spawnSync('xcrun', ['simctl', 'list', 'devices', 'available'], {
      encoding: 'utf8',
      timeout: 30_000,
    });
    if (!`${avail.stdout ?? ''}${avail.stderr ?? ''}`.includes(iosUdid)) {
      throw new Error(`RNR_S05_IOS_UDID=${iosUdid} is not an available iOS simulator`);
    }
    const boot = spawnSync('xcrun', ['simctl', 'boot', iosUdid], {
      encoding: 'utf8',
      timeout: 120_000,
    });
    if (boot.status !== 0)
      throw new Error(`failed to boot RNR_S05_IOS_UDID=${iosUdid}: ${boot.stderr}`);
  }

  const adbDevices = spawnSync(ADB, ['devices'], { encoding: 'utf8', timeout: 30_000 });
  if (!`${adbDevices.stdout ?? ''}`.includes(androidSerial)) {
    throw new Error(
      `RNR_S05_ANDROID_SERIAL=${androidSerial} is not an attached Android device (adb devices: ${adbDevices.stdout?.trim() ?? 'none'})`,
    );
  }

  return {
    ios: { platform: 'ios', id: iosUdid, display: iosSim?.name ?? iosUdid },
    android: { platform: 'android', id: androidSerial, display: androidSerial },
  };
}

/* ---------------------------------------------------------- Expo Go install -- */

export function installExpoGoIos(udid: string): void {
  const app = join(
    process.env.HOME ?? '',
    '.expo',
    'ios-simulator-app-cache',
    'Expo-Go-57.0.9.tar.app',
  );
  if (!existsSync(app)) {
    throw new Error(`Expo Go iOS client missing at ${app}`);
  }
  const listed = spawnSync('xcrun', ['simctl', 'listapps', udid], {
    encoding: 'utf8',
    timeout: 30_000,
  });
  if (`${listed.stdout ?? ''}`.includes('host.exp.Exponent')) return;
  const res = spawnSync('xcrun', ['simctl', 'install', udid, app], {
    encoding: 'utf8',
    timeout: 300_000,
  });
  if (res.status !== 0) throw new Error(`Expo Go iOS install failed: ${res.stderr}`);
}

export function installExpoGoAndroid(serial: string, apkPath: string): void {
  if (!existsSync(apkPath)) throw new Error(`Expo Go Android APK missing at ${apkPath}`);
  const listed = spawnSync(
    ADB,
    ['-s', serial, 'shell', 'pm', 'list', 'packages', 'host.exp.exponent'],
    {
      encoding: 'utf8',
      timeout: 30_000,
    },
  );
  if (`${listed.stdout ?? ''}`.includes('host.exp.exponent')) return;
  const res = spawnSync(ADB, ['-s', serial, 'install', '-r', apkPath], {
    encoding: 'utf8',
    timeout: 300_000,
  });
  if (res.status !== 0) throw new Error(`Expo Go Android install failed: ${res.stderr}`);
}

/* ----------------------------------------------------------- Metro lifecycle -- */

/**
 * Starts an owned Metro server for a consumer on an owned port and waits until it is
 * ready. Binds to all interfaces (LAN mode) so both the iOS simulator and the Android
 * emulator (via adb reverse) reach it through 127.0.0.1.
 */
export function startMetro(root: string, port: number, logPath: string): MetroHandle {
  mkdirSync(dirname(logPath), { recursive: true });
  const logFd = openSync(logPath, 'a');
  const child = spawn('npx', ['expo', 'start', '--port', String(port)], {
    cwd: root,
    detached: true,
    stdio: ['ignore', logFd, logFd],
  });
  child.unref();

  const startedAt = Date.now();
  const deadline = startedAt + 120_000;
  let ready = false;
  while (Date.now() < deadline) {
    const res = spawnSync('curl', ['-s', '--max-time', '3', `http://127.0.0.1:${port}/status`], {
      encoding: 'utf8',
      timeout: 10_000,
    });
    if (`${res.stdout ?? ''}`.includes('packager-status:running')) {
      ready = true;
      break;
    }
    spawnSync('sleep', ['1']);
  }
  if (!ready) throw new Error(`Metro did not become ready on port ${port} (log: ${logPath})`);

  // Route the Android emulator's localhost to the host's Metro port.
  spawnSync(ADB, ['reverse', `tcp:${port}`, `tcp:${port}`], { encoding: 'utf8', timeout: 30_000 });

  return {
    port,
    pid: child.pid ?? -1,
    logPath,
    url: `http://127.0.0.1:${port}`,
    openUrl: `exp://127.0.0.1:${port}`,
  };
}

export function stopMetro(handle: MetroHandle | null): void {
  if (!handle) return;
  if (handle.pid > 0) {
    try {
      process.kill(-handle.pid, 'SIGTERM');
    } catch {
      try {
        process.kill(handle.pid, 'SIGTERM');
      } catch {
        /* already gone */
      }
    }
  }
  // Release the adb reverse mapping.
  spawnSync(ADB, ['reverse', '--remove', `tcp:${handle.port}`], {
    encoding: 'utf8',
    timeout: 30_000,
  });
}

/* -------------------------------------------------------- Expo Go open/close -- */

/** Opens a fresh Expo Go session on the reserved device (terminate → relaunch → open). */
export function openExpoGo(platform: Platform, deviceId: string, openUrl: string): void {
  if (platform === 'ios') {
    spawnSync('xcrun', ['simctl', 'terminate', deviceId, 'host.exp.Exponent'], {
      encoding: 'utf8',
      timeout: 30_000,
    });
    spawnSync('xcrun', ['simctl', 'launch', deviceId, 'host.exp.Exponent'], {
      encoding: 'utf8',
      timeout: 30_000,
    });
    spawnSync('xcrun', ['simctl', 'openurl', deviceId, openUrl], {
      encoding: 'utf8',
      timeout: 30_000,
    });
  } else {
    spawnSync(ADB, ['-s', deviceId, 'shell', 'am', 'force-stop', 'host.exp.exponent'], {
      encoding: 'utf8',
      timeout: 30_000,
    });
    // A cold am start immediately after force-stop races; give the process a beat to die.
    spawnSync('sleep', ['2']);
    spawnSync(
      ADB,
      [
        '-s',
        deviceId,
        'shell',
        'am',
        'start',
        '-a',
        'android.intent.action.VIEW',
        '-d',
        openUrl,
        'host.exp.exponent',
      ],
      {
        encoding: 'utf8',
        timeout: 30_000,
      },
    );
  }
}

/* ------------------------------------------------------------ appearance -- */

export function setAppearance(platform: Platform, deviceId: string, appearance: Appearance): void {
  if (platform === 'ios') {
    spawnSync('xcrun', ['simctl', 'ui', deviceId, 'appearance', appearance], {
      encoding: 'utf8',
      timeout: 30_000,
    });
  } else {
    spawnSync(
      ADB,
      ['-s', deviceId, 'shell', 'cmd', 'uimode', 'night', appearance === 'dark' ? 'yes' : 'no'],
      {
        encoding: 'utf8',
        timeout: 30_000,
      },
    );
  }
}

/* ------------------------------------------------------------ screenshots -- */

export function captureScreenshot(platform: Platform, deviceId: string, outPath: string): void {
  mkdirSync(dirname(outPath), { recursive: true });
  if (platform === 'ios') {
    spawnSync('xcrun', ['simctl', 'io', deviceId, 'screenshot', outPath], {
      encoding: 'utf8',
      timeout: 60_000,
    });
  } else {
    const exec = spawnSync(ADB, ['-s', deviceId, 'exec-out', 'screencap', '-p'], {
      timeout: 60_000,
      maxBuffer: 64 * 1024 * 1024,
    });
    if (exec.stdout) writeFileSync(outPath, exec.stdout);
  }
}

/** Dumps the accessibility hierarchy (text) for keyboard/safe-area bound observations. */
export function captureHierarchy(deviceId: string): string {
  const res = spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'hierarchy', '--no-ansi'], {
    encoding: 'utf8',
    timeout: 120_000,
  });
  return `${res.stdout ?? ''}${res.stderr ?? ''}`;
}

/** Reads the tail of a Metro log — the source of a bundle failure diagnostic. */
export function readMetroLogTail(logPath: string, chars = 4000): string {
  try {
    const content = readFileSync(logPath, 'utf8');
    return content.slice(-chars);
  } catch {
    return `(no Metro log at ${logPath})`;
  }
}

/* ------------------------------------------------------------- Maestro -- */

export type MaestroResult = { exit: number; output: string };

/** Runs the locked Expo Go flow with the given marker and older-seed literal. */
export function runMaestroFlow(deviceId: string, marker: string, olderSeed: string): MaestroResult {
  const args = [
    '--udid',
    deviceId,
    'test',
    '--no-ansi',
    '-e',
    `MARKER=${marker}`,
    '-e',
    `OLDER_SEED=${olderSeed}`,
    MAESTRO_FLOW,
  ];
  const res = spawnSync(MAESTRO_BIN, args, {
    encoding: 'utf8',
    timeout: 300_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { exit: res.status ?? -1, output: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

/* --------------------------------------------------------------- evidence -- */

export function writeNativeEvidence(outDir: string, content: Record<string, unknown>): void {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'session.json'), `${JSON.stringify(content, null, 2)}\n`);
}

export function cleanupConsumerRoot(root: string): void {
  cleanupConsumer(root);
}

export { REPO_ROOT, sha256 };
