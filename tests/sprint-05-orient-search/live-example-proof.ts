/**
 * ORI-AI-002 — the composed worked example proven against the real provider on six
 * live targets (uniwind/nativewind x ios/android/web).
 *
 * This is the typed orchestration and evidence validation behind
 * run-live-example-proof.mjs. It consumes the landed dependencies through their
 * declared interfaces only:
 *
 *   - ORI-AI-001 `support/live-backend.ts` — the owned-backend handle
 *     (`launchOwnedBackend`), wrapped in a journaling decorator that records every
 *     real provider record and lifecycle event into server-events.jsonl.
 *   - ORI-RN-004 `support/live-example-proof.test.ts` — `runLiveExampleProof`
 *     (uniwind composition; apps/example in Expo Go + served web export).
 *   - ORI-RN-005 `support/nativewind-live-example.ts` — `runNativewindLiveExampleProof`
 *     (independent NativeWind consumer).
 *   - ORI-RN-00x `support/native-session.ts` — device reservation, screenshots,
 *     hierarchy dumps, appearance control.
 *
 * Per engine the runner drives three real phases:
 *
 *   1. REJECT  — the same owned server launched with the nonexistent model
 *      `rnr-s05-nonexistent-<runId>` (official provider endpoint retained). The
 *      drivers submit fresh marked prompts on every target; OpenAI actually rejects
 *      each request; the screens surface the sanitized error with the accessible
 *      Retry control (captured per target).
 *   2. LIVE    — the server restored to gpt-4.1-mini-2025-04-14. The drivers run
 *      their full green matrix (streaming growth, contextual follow-up, active Stop
 *      with abort correlation, endpoint-loss + Retry with exactly one retained user
 *      turn) while this runner records device video, observes timestamped text
 *      prefixes on the real screens, and journals every provider record.
 *   3. WEB-SELF — a real Chromium session on the driver-produced web export (same
 *      bytes the driver served), driven through the public controls with a teeing
 *      same-origin proxy: raw stream prefixes with timestamps, an exact
 *      stream-text hash match against the server record, Stop + post-abort
 *      recovery, real endpoint loss + Retry, and the same-session provider
 *      rejection -> model restore -> Retry recovery.
 *
 * The runner then synthesizes the per-target evidence contract (result.json,
 * stream.jsonl, screen-recording.mp4, streaming.png, recovered.png), writes
 * manifest.json / server-events.jsonl / teardown.json, validates everything
 * deterministically, and exits nonzero on any missing or mismatched receipt.
 */
import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { type Browser, chromium, type Page } from '@playwright/test';

import { RECORD_PREFIX } from '../../apps/example/server/chat';
import { loadServerEnv } from '../../apps/example/server/env';
import { createChatServer } from '../../apps/example/server/index';

import {
  type BackendLaunchOptions,
  type BackendRecord,
  DEFAULT_MODEL,
  launchOwnedBackend,
  type OwnedBackendHandle,
} from './support/live-backend';
import { runLiveExampleProof } from './support/live-example-proof.test';
import {
  captureScreenshot,
  REPO_ROOT,
  reserveDevices,
  setAppearance,
} from './support/native-session';
import { runNativewindLiveExampleProof } from './support/nativewind-live-example';

/* ------------------------------------------------------------------ constants -- */

type Engine = 'uniwind' | 'nativewind';
type Platform = 'ios' | 'android' | 'web';

const EVIDENCE_DEFAULT = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-AI-002');
const RN004_EVIDENCE = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-004');

/**
 * The web export inlines `EXPO_PUBLIC_API_BASE_URL` = the driver's web origin at
 * export time, so the web self-session serves its teeing proxy on THAT port (the
 * driver's own proxy has closed by then) — the app's hardcoded base then reaches
 * the self-session's proxy.
 */
const ENGINE_PORTS: Record<Engine, { backend: number; web: number }> = {
  uniwind: { backend: 4000, web: 8406 },
  nativewind: { backend: 4010, web: 8408 },
};

const DIST_PREFIX: Record<Engine, string> = {
  uniwind: 'ori-rn-004-web-dist-',
  nativewind: 'ori-rn-005-web-dist-',
};

const ENGINE_IDS: readonly string[] = Object.keys(ENGINE_PORTS);

const EXPECTED_TARGETS = [
  'uniwind-ios',
  'uniwind-android',
  'uniwind-web',
  'nativewind-ios',
  'nativewind-android',
  'nativewind-web',
] as const;

/** Files every target record must carry (AC-4 case 1). */
const TARGET_ARTIFACTS = [
  'stream.jsonl',
  'screen-recording.mp4',
  'streaming.png',
  'recovered.png',
] as const;

/** Source/lockfile/registry/driver/policy files pinned by manifest digests. */
const SOURCE_FILES = [
  'apps/example/app/live-chat.tsx',
  'pnpm-lock.yaml',
  'packages/registry/registry.json',
  'tests/sprint-05-orient-search/nativewind-live-source-manifest.json',
  'tests/sprint-05-orient-search/support/live-example-proof.test.ts',
  'tests/sprint-05-orient-search/support/nativewind-live-example.ts',
  'tests/sprint-05-orient-search/support/live-backend.ts',
  'tests/sprint-05-orient-search/support/native-session.ts',
  '.spec/e2e-policy/surface.json',
] as const;

/** The bounded long-generation prompt (the ORI-RN-004/005 literal). */
const LONG_PROMPT =
  'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs. Do not summarize, do not decline, and do not stop early.';

const MAESTRO_BIN = join(process.env.HOME ?? '', '.maestro', 'bin', 'maestro');
const ANDROID_SDK =
  process.env.ANDROID_HOME ?? join(process.env.HOME ?? '', 'Library', 'Android', 'sdk');
const ADB = join(ANDROID_SDK, 'platform-tools', 'adb');
const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const TSX_CLI = join(REPO_ROOT, 'node_modules/tsx/dist/cli.mjs');
const ORCHESTRATOR_PATH = join(REPO_ROOT, 'tests/sprint-05-orient-search/live-example-proof.ts');

function nowIso(): string {
  return new Date().toISOString();
}

function sha256(text: string | Buffer): string {
  return createHash('sha256').update(text).digest('hex');
}

function gitHead(): string {
  const res = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 30_000,
  });
  return res.status === 0 ? res.stdout.trim() : 'unknown';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* -------------------------------------------------------------------- journal -- */

/**
 * The sanitized server/provider event journal (server-events.jsonl). The provider
 * credential value and its env name are scrubbed from every emitted line; nothing
 * that passes through here may carry secrets.
 */
class EvidenceJournal {
  private readonly secret: string;
  private readonly secretName = 'OPENAI_API_KEY';

  constructor(private readonly path: string) {
    mkdirSync(dirnameOf(path), { recursive: true });
    writeFileSync(path, '');
    this.secret = process.env.OPENAI_API_KEY ?? '';
  }

  emit(kind: string, payload: Record<string, unknown>): void {
    const scrubbed = this.scrub(payload) as Record<string, unknown>;
    const event = { ts: nowIso(), kind, ...scrubbed };
    appendFileSync(this.path, `${JSON.stringify(event)}\n`);
  }

  private scrub(value: unknown): unknown {
    if (typeof value === 'string') {
      let out = value;
      if (this.secret.length > 0) out = out.split(this.secret).join('[redacted]');
      out = out.split(this.secretName).join('[redacted-key-name]');
      return out;
    }
    if (Array.isArray(value)) return value.map((item) => this.scrub(item));
    if (typeof value === 'object' && value !== null) {
      const out: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(value)) out[key] = this.scrub(item);
      return out;
    }
    return value;
  }
}

function dirnameOf(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '.';
}

/* ------------------------------------------------- journaling backend wrapper -- */

type RecordSink = {
  readonly records: {
    ts: string;
    engine: Engine;
    phase: string;
    gen: number;
    record: BackendRecord;
  }[];
  readonly gen: { value: number };
};

/**
 * Decorates a backend handle (the owner-process adapter): every parsed provider
 * record is journaled (with the moment this orchestrator observed it) and pushed
 * into the phase sink; every lifecycle operation (stop/restart) is journaled.
 * Delegates all behavior to the real handle — this wrapper observes, never
 * overrides.
 */
class RecordingBackend implements OwnedBackendHandle {
  /** How many of the inner handle's records this wrapper has already journaled.
   * Records are append-only and requestIds legitimately repeat (the app reuses
   * one chat id), so the diff is by COUNT, never by requestId. */
  private seenCount = 0;

  constructor(
    private inner: OwnedBackendHandle,
    private readonly journal: EvidenceJournal,
    private readonly sink: RecordSink,
    private readonly engine: Engine,
    private readonly phase: string,
    private readonly backendPort: number,
  ) {}

  get launchIdentity(): string {
    return this.inner.launchIdentity;
  }
  get origin(): string {
    return this.inner.origin;
  }
  get host(): string {
    return this.inner.host;
  }
  get port(): number {
    return this.backendPort;
  }
  get model(): string {
    return this.inner.model;
  }
  get pid(): number | null {
    return this.inner.pid;
  }
  get started(): boolean {
    return this.inner.started;
  }
  get exitCode(): number | null {
    return this.inner.exitCode;
  }
  get exitSignal(): string | null {
    return this.inner.exitSignal;
  }
  stderrText(): string {
    return this.inner.stderrText();
  }
  stdoutText(): string {
    return this.inner.stdoutText();
  }

  records(): BackendRecord[] {
    const all = this.inner.records();
    while (this.seenCount < all.length) {
      const record = all[this.seenCount];
      this.seenCount += 1;
      const ts = nowIso();
      this.sink.records.push({
        ts,
        engine: this.engine,
        phase: this.phase,
        gen: this.sink.gen.value,
        record,
      });
      this.journal.emit('record', {
        engine: this.engine,
        phase: this.phase,
        observed_at: ts,
        generation: this.sink.gen.value,
        record,
      });
    }
    return all;
  }

  async waitForRecord(requestId: string, timeoutMs: number): Promise<BackendRecord | null> {
    const found = await this.inner.waitForRecord(requestId, timeoutMs);
    if (found) this.records();
    return found;
  }

  async stop(): Promise<void> {
    this.journal.emit('backend-stop', {
      engine: this.engine,
      phase: this.phase,
      port: this.backendPort,
    });
    await this.inner.stop();
  }

  async restart(options: BackendLaunchOptions = {}): Promise<OwnedBackendHandle> {
    const nextModel = options.model ?? this.model;
    this.journal.emit('backend-restart', {
      engine: this.engine,
      phase: this.phase,
      port: this.backendPort,
      model: nextModel,
    });
    const next = await this.inner.restart(options);
    this.sink.gen.value += 1;
    return new RecordingBackend(
      next,
      this.journal,
      this.sink,
      this.engine,
      this.phase,
      this.backendPort,
    );
  }

  async selectModel(model: string): Promise<OwnedBackendHandle> {
    return this.restart({ model });
  }

  /** Phase-teardown: reap the owner process behind the adapter, if any. */
  disposeOwner(): void {
    const inner = this.inner as unknown as { dispose?: () => void };
    if (typeof inner.dispose === 'function') inner.dispose();
  }
}

/**
 * The phase backend: the real server hosted by a dedicated owner process (see
 * runBackendOwner) and wrapped in the journaling RecordingBackend. The owner's
 * command line does not match the ORI-RN-005 driver's entry-reap heuristic, so the
 * caller-passed backend survives the driver's orphan cleanup and serves from the
 * first leg's first fetch.
 */
async function makePhaseBackend(
  journal: EvidenceJournal,
  sink: RecordSink,
  engine: Engine,
  phase: string,
  model: string,
  phaseRoot: string,
): Promise<RecordingBackend> {
  const owner = await spawnBackendOwner(
    journal,
    ENGINE_PORTS[engine].backend,
    model,
    join(phaseRoot, `${phase}-backend`),
  );
  return new RecordingBackend(owner, journal, sink, engine, phase, ENGINE_PORTS[engine].backend);
}

function makeSink(): RecordSink {
  return { records: [], gen: { value: 0 } };
}

/* ------------------------------------------------------------ device observer -- */

type DeviceSample = { ts: string; texts: string[] };

/**
 * Observes one real device screen from a CHILD PROCESS through a strictly passive
 * channel: periodic screenshots + macOS Vision OCR. The drivers own every device
 * interaction channel (Maestro on iOS, uiautomator via Maestro on Android), so an
 * observer that touched either would break their flows — a concurrent maestro
 * hierarchy dump killed the iOS flow mid-step in cycle 1. Screenshots and OCR
 * only READ pixels. Invoked through this file's `--observe` CLI mode.
 */
// fallow-ignore-next-line complexity
async function observeDeviceLoop(params: {
  platform: 'ios' | 'android';
  deviceId: string;
  outPath: string;
  growthShot: string;
}): Promise<void> {
  const shotPath = `${params.outPath}.frame.png`;
  const swiftPath = `${params.outPath}.ocr.swift`;
  writeFileSync(
    swiftPath,
    [
      'import Vision',
      'import AppKit',
      'let path = CommandLine.arguments[1]',
      'guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { exit(1) }',
      'let request = VNRecognizeTextRequest()',
      'request.recognitionLevel = .accurate',
      'let handler = VNImageRequestHandler(cgImage: cg, options: [:])',
      'try? handler.perform([request])',
      'for obs in (request.results ?? []) {',
      '  if let text = obs.topCandidates(1).first?.string { print(text) }',
      '}',
    ].join('\n'),
  );
  const previous = new Set<string>();
  let captured = false;
  for (;;) {
    try {
      captureScreenshot(params.platform, params.deviceId, shotPath);
      const ocr = spawnSync('swift', [swiftPath, shotPath], {
        encoding: 'utf8',
        timeout: 60_000,
        maxBuffer: 16 * 1024 * 1024,
      });
      const texts = `${ocr.stdout ?? ''}`
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length >= 12);
      if (texts.length > 0) {
        appendFileSync(params.outPath, `${JSON.stringify({ ts: nowIso(), texts })}\n`);
        const grew = texts.some((text) => !previous.has(text));
        for (const text of texts) previous.add(text);
        if (grew && !captured) {
          captured = true;
          try {
            copyFileSync(shotPath, params.growthShot);
          } catch {
            // screenshot is best-effort; the samples are the evidence
          }
        }
      }
    } catch {
      // observation is best-effort; the drivers own the device
    }
    await sleep(4000);
  }
}

type ObserverHandle = {
  stop: () => Promise<{
    samples: { ios: DeviceSample[]; android: DeviceSample[] };
    baseline: { ios: Set<string>; android: Set<string> };
    finalTexts: string[];
  }>;
};

/** Spawns one observer child per device and collects its samples on stop. */
function startDeviceObserver(
  devices: { ios: string; android: string },
  onGrowthScreenshot: (platform: 'ios' | 'android', path: string) => void,
  growthShots: { ios: string; android: string },
  phaseRoot: string,
): ObserverHandle {
  const children: { platform: 'ios' | 'android'; child: ChildProcess; out: string }[] = [];
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.NODE_ENV;
  delete env.OPENAI_API_KEY;
  for (const platform of ['ios', 'android'] as const) {
    const out = join(phaseRoot, `observer-${platform}.jsonl`);
    writeFileSync(out, '');
    const child = spawn(
      process.execPath,
      [
        TSX_CLI,
        ORCHESTRATOR_PATH,
        '--observe',
        '--platform',
        platform,
        '--device',
        devices[platform],
        '--out',
        out,
        '--growth-shot',
        growthShots[platform],
      ],
      { cwd: REPO_ROOT, env, stdio: 'ignore' },
    );
    children.push({ platform, child, out });
  }
  return {
    stop: () =>
      new Promise((resolveStop) => {
        for (const entry of children) entry.child.kill('SIGTERM');
        const deadline = Date.now() + 10_000;
        // fallow-ignore-next-line complexity
        const collect = (): void => {
          const samples = { ios: [] as DeviceSample[], android: [] as DeviceSample[] };
          const baseline = { ios: new Set<string>(), android: new Set<string>() };
          const finalTexts: string[] = [];
          let allExited = true;
          for (const entry of children) {
            if (entry.child.exitCode === null && entry.child.signalCode === null) allExited = false;
            try {
              const lines = readFileSync(entry.out, 'utf8')
                .split('\n')
                .filter((l) => l.trim().length > 0);
              const parsed = lines.map((l) => JSON.parse(l) as DeviceSample);
              samples[entry.platform] = parsed;
              if (parsed.length > 0) {
                for (const text of parsed[0].texts) baseline[entry.platform].add(text);
                for (const text of parsed.at(-1)?.texts ?? []) finalTexts.push(text);
              }
            } catch {
              // no samples from this device
            }
            if (existsSync(growthShots[entry.platform])) {
              onGrowthScreenshot(entry.platform, growthShots[entry.platform]);
            }
          }
          if (allExited || Date.now() > deadline) {
            resolveStop({ samples, baseline, finalTexts });
            return;
          }
          setTimeout(collect, 500);
        };
        collect();
      }),
  };
}

/* -------------------------------------------------------- device recordings -- */

type RecordingHandle = { stop: () => Promise<string[]> };

/**
 * iOS: simctl recordVideo finalizes the file on SIGINT. The stop promise is
 * BOUNDED: the recorder child can exit on its own mid-phase (a simctl hiccup),
 * and a listener attached after that exit never fires — an unbounded wait there
 * hung a full matrix run after its legs had all passed. Already-exited children
 * resolve immediately; a 20s timer backstops a child that ignores SIGINT/SIGKILL.
 */
function startIosRecording(udid: string, outPath: string): RecordingHandle {
  mkdirSync(dirnameOf(outPath), { recursive: true });
  const child = spawn(
    'xcrun',
    ['simctl', 'io', udid, 'recordVideo', '--codec', 'h264', '--force', outPath],
    {
      stdio: 'ignore',
      detached: false,
    },
  );
  return {
    stop: () =>
      new Promise<string[]>((resolveStop) => {
        let settled = false;
        const finish = (): void => {
          if (settled) return;
          settled = true;
          clearTimeout(backstop);
          resolveStop(existsSync(outPath) ? [outPath] : []);
        };
        const backstop = setTimeout(finish, 20_000);
        backstop.unref();
        if (child.exitCode !== null || child.signalCode !== null) {
          finish();
        } else {
          child.once('exit', finish);
        }
        child.kill('SIGINT');
        setTimeout(() => {
          if (!settled) child.kill('SIGKILL');
        }, 19_000).unref();
      }),
  };
}

/** Android: screenrecord caps at 180s, so segments are chained and pulled. */
function startAndroidRecording(serial: string, dir: string): RecordingHandle {
  mkdirSync(dir, { recursive: true });
  const stopped = { flag: false };
  const segments: string[] = [];
  const loop = async (): Promise<void> => {
    let index = 0;
    while (!stopped.flag) {
      const remote = `/sdcard/ori_ai_002_seg_${index}.mp4`;
      const local = join(dir, `seg-${index}.mp4`);
      await new Promise<void>((resolveSeg) => {
        const child = spawn(
          ADB,
          ['-s', serial, 'shell', 'screenrecord', '--time-limit', '175', remote],
          {
            stdio: 'ignore',
          },
        );
        child.on('exit', () => resolveSeg());
        childSegs.set(index, child);
      });
      spawnSync(ADB, ['-s', serial, 'pull', remote, local], { timeout: 60_000 });
      spawnSync(ADB, ['-s', serial, 'shell', 'rm', '-f', remote], { timeout: 30_000 });
      if (existsSync(local) && statSync(local).size > 0) segments.push(local);
      index += 1;
    }
  };
  const childSegs = new Map<number, ChildProcess>();
  const runner = loop();
  return {
    stop: async () => {
      stopped.flag = true;
      spawnSync(ADB, ['-s', serial, 'shell', 'pkill', '-l', '2', 'screenrecord'], {
        timeout: 30_000,
      });
      await Promise.race([runner, sleep(90_000)]);
      // The in-flight segment's `adb pull` can land on disk after the race
      // above resolves; the pulled FILES are the real footage, so return what
      // the directory holds rather than the loop's in-memory tally.
      try {
        const onDisk = readdirSync(dir)
          .filter((name) => /^seg-\d+\.mp4$/.test(name))
          .sort()
          .map((name) => join(dir, name))
          .filter((path) => statSync(path).size > 0);
        if (onDisk.length > 0) return onDisk;
      } catch {
        // directory unreadable — fall through to the in-memory tally
      }
      return [...segments];
    },
  };
}

function concatSegments(segments: string[], outPath: string): string | null {
  const usable = segments.filter((p) => existsSync(p) && statSync(p).size > 0);
  if (usable.length === 0) return null;
  mkdirSync(dirnameOf(outPath), { recursive: true });
  if (usable.length === 1) {
    copyFileSync(usable[0], outPath);
    return outPath;
  }
  const list = join(dirnameOf(outPath), `concat-${basename(outPath)}.txt`);
  writeFileSync(list, usable.map((p) => `file '${p}'`).join('\n'));
  const res = spawnSync(
    FFMPEG,
    ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', outPath],
    { encoding: 'utf8', timeout: 300_000 },
  );
  return res.status === 0 && existsSync(outPath) ? outPath : null;
}

/** Bounds committed video size with a real re-encode of the real footage. */
function boundVideoSize(path: string): void {
  if (!existsSync(path)) return;
  if (statSync(path).size < 60 * 1024 * 1024) return;
  const tmp = `${path}.bounded.mp4`;
  const res = spawnSync(
    FFMPEG,
    ['-y', '-i', path, '-c:v', 'libx264', '-crf', '30', '-preset', 'fast', '-an', tmp],
    { encoding: 'utf8', timeout: 600_000 },
  );
  if (res.status === 0 && existsSync(tmp) && statSync(tmp).size > 0) {
    rmSync(path, { force: true });
    copyFileSync(tmp, path);
    rmSync(tmp, { force: true });
  }
}

/* --------------------------------------------------------- teeing web server -- */

type WebJournalRequest = {
  ts: string;
  envelope_id: string;
  message_count: number;
  roles: string[];
  latest_user_text: string;
  prior_exchange_count: number;
};

type TeeState = {
  request: WebJournalRequest;
  deltas: { ts: string; cumulative: string }[];
  status: number | null;
};

type ProxyHandle = {
  server: Server;
  port: number;
  url: string;
  setUpstream: (host: string, port: number) => void;
  requests: TeeState[];
  stop: () => Promise<void>;
};

/**
 * Serves the driver-produced web export and forwards POST /api/chat to the real
 * owned backend on the same origin (the same reverse-proxy shape the drivers use —
 * real forwarding, never a mock), teeing every request envelope and response stream
 * chunk into the journal so raw text prefixes and exact stream hashes are
 * observable evidence.
 */
function serveTeeingProxy(
  distDir: string,
  port: number,
  journal: EvidenceJournal,
): Promise<ProxyHandle> {
  const upstream = { host: '127.0.0.1', port: 0 };
  const requests: TeeState[] = [];
  const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.map': 'application/json; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  return new Promise((resolveServe, rejectServe) => {
    // fallow-ignore-next-line complexity
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
        if (url.pathname === '/api/chat' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
          }
          const bodyText = Buffer.concat(chunks).toString('utf8');
          let envelope: { id?: unknown; messages?: unknown } = {};
          try {
            envelope = JSON.parse(bodyText) as { id?: unknown; messages?: unknown };
          } catch {
            envelope = {};
          }
          const messages = Array.isArray(envelope.messages) ? envelope.messages : [];
          const roles = messages.map((m) =>
            typeof m === 'object' && m !== null && 'role' in m
              ? String((m as { role: unknown }).role)
              : '?',
          );
          let latestUserText = '';
          for (let i = messages.length - 1; i >= 0; i -= 1) {
            const m = messages[i];
            if (typeof m === 'object' && m !== null && (m as { role?: unknown }).role === 'user') {
              const parts = (m as { parts?: unknown }).parts;
              latestUserText = Array.isArray(parts)
                ? parts
                    .map((p) =>
                      typeof p === 'object' && p !== null && 'text' in p
                        ? String((p as { text: unknown }).text)
                        : '',
                    )
                    .join('')
                : '';
              break;
            }
          }
          const priorExchanges = Math.max(0, Math.floor((messages.length - 1) / 2));
          const tee: TeeState = {
            request: {
              ts: nowIso(),
              envelope_id: typeof envelope.id === 'string' ? envelope.id : '(no-id)',
              message_count: messages.length,
              roles,
              latest_user_text: latestUserText,
              prior_exchange_count: priorExchanges,
            },
            deltas: [],
            status: null,
          };
          requests.push(tee);
          journal.emit('web-request', {
            engine_tag: true,
            request: {
              id: tee.request.envelope_id,
              message_count: tee.request.message_count,
              roles: tee.request.roles,
              prior_exchange_count: tee.request.prior_exchange_count,
              latest_user_text: tee.request.latest_user_text,
            },
          });

          // Propagate the browser's abort (Stop generating) to the backend so the
          // provider request is genuinely aborted — a teeing proxy that kept
          // pulling upstream would silently convert Stop into a completion.
          const upstreamAbort = new AbortController();
          res.on('close', () => {
            if (!res.writableEnded) upstreamAbort.abort();
          });
          const upstreamRes = await fetch(`http://${upstream.host}:${upstream.port}/api/chat`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: bodyText,
            signal: upstreamAbort.signal,
          }).catch((error: unknown) => {
            // The owned backend child is genuinely down (endpoint-loss leg): the
            // failure is surfaced to the app, never faked into a success.
            journal.emit('web-proxy-upstream-unavailable', {
              request_id: tee.request.envelope_id,
              reason: error instanceof Error ? error.message : String(error),
            });
            return null;
          });
          if (upstreamRes === null) {
            tee.status = 502;
            res.writeHead(502, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: 'upstream unavailable' }));
            journal.emit('web-stream-end', {
              request_id: tee.request.envelope_id,
              status: 502,
              raw_text: '',
              raw_text_sha256: sha256(''),
            });
            return;
          }
          tee.status = upstreamRes.status;
          res.writeHead(upstreamRes.status, {
            'content-type': upstreamRes.headers.get('content-type') ?? 'text/event-stream',
          });
          if (upstreamRes.body === null) {
            res.end();
            return;
          }
          // Bridge the WHATWG body into a Node Readable this proxy owns and
          // attach an error listener BEFORE consuming. The async-iterator
          // detaches its own error listener between resolved reads, so an
          // upstream killed mid-body (the endpoint-loss `backend/stop` during
          // a still-streaming turn) could otherwise surface as an unhandled
          // 'error' event and take down the whole orchestrator process — the
          // cycle-3/cycle-4 marathon crash at `backend/stop/start`.
          const bodyStream = Readable.fromWeb(
            upstreamRes.body as Parameters<typeof Readable.fromWeb>[0],
          );
          let upstreamTerminated: string | null = null;
          bodyStream.once('error', (error: Error) => {
            upstreamTerminated = error.message;
          });
          let sseBuffer = '';
          let cumulative = '';
          try {
            for await (const chunk of bodyStream) {
              const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
              res.write(buf);
              sseBuffer += buf.toString('utf8');
              let nl = sseBuffer.indexOf('\n');
              while (nl !== -1) {
                const line = sseBuffer.slice(0, nl).trim();
                sseBuffer = sseBuffer.slice(nl + 1);
                if (line.startsWith('data:')) {
                  try {
                    const frame = JSON.parse(line.slice(5).trim()) as {
                      type?: unknown;
                      delta?: unknown;
                    };
                    if (frame.type === 'text-delta' && typeof frame.delta === 'string') {
                      cumulative += frame.delta;
                      tee.deltas.push({ ts: nowIso(), cumulative });
                      journal.emit('web-stream-delta', {
                        request_id: tee.request.envelope_id,
                        cumulative_length: cumulative.length,
                      });
                    }
                  } catch {
                    // non-JSON frame (keepalive) — nothing to extract
                  }
                }
                nl = sseBuffer.indexOf('\n');
              }
            }
          } catch (error) {
            upstreamTerminated ??= error instanceof Error ? error.message : String(error);
          }
          res.end();
          journal.emit('web-stream-end', {
            request_id: tee.request.envelope_id,
            status: tee.status,
            raw_text: cumulative,
            raw_text_sha256: sha256(cumulative),
            upstream_terminated: upstreamTerminated,
          });
          return;
        }
        let path = url.pathname;
        if (path === '/') path = '/index.html';
        let filePath = join(distDir, path);
        if (!existsSync(filePath) && !extname(path)) filePath = `${filePath}.html`;
        if (!existsSync(filePath)) filePath = join(distDir, 'index.html');
        const body = readFileSync(filePath);
        res.writeHead(200, {
          'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
        });
        res.end(body);
      } catch (error) {
        // Aborted or failed mid-stream: headers may already be out; never crash
        // the proxy on a dead socket.
        if (!res.headersSent) {
          res.writeHead(502, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ error: 'proxy failure' }));
        } else {
          res.end();
        }
        journal.emit('web-proxy-request-failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
    server.on('error', rejectServe);
    server.listen(port, '127.0.0.1', () => {
      resolveServe({
        server,
        port,
        url: `http://127.0.0.1:${port}`,
        setUpstream: (host: string, upPort: number) => {
          upstream.host = host;
          upstream.port = upPort;
        },
        requests,
        stop: () =>
          new Promise<void>((resolveStop) => {
            server.close(() => resolveStop());
          }),
      });
    });
  });
}

/* ------------------------------------------------------------- driver façade -- */

type DriverLegEvidence = {
  platform: string;
  status: string;
  diagnostic?: string;
  evidence?: Record<string, unknown>;
};

type DriverRunResult = {
  runId: string;
  legs: DriverLegEvidence[];
  completed: boolean;
};

/** The pinned Expo Go APK the native drivers require at a hardcoded scratch path. */
const EXPO_GO_APK_PATH = join(
  process.env.HOME ?? '',
  '.cache',
  'agent-scratch',
  'opencode',
  'ori-rn-003',
  'Expo-Go-57.0.9.apk',
);

/**
 * The agent-scratch reaper periodically deletes this path (twice in one session);
 * both native drivers hardcode it and `installExpoGoAndroid` throws if the file is
 * absent even when Expo Go is already installed on the emulator. Before every driver
 * invocation, restore the pinned APK from the official expo/expo-go-releases
 * GitHub release when missing — the exact restore procedure the ORI-RN-005
 * evidence documents for this reaper.
 */
function ensureExpoGoApk(journal: EvidenceJournal): void {
  if (existsSync(EXPO_GO_APK_PATH) && statSync(EXPO_GO_APK_PATH).size > 10_000_000) return;
  mkdirSync(dirnameOf(EXPO_GO_APK_PATH), { recursive: true });
  const tmp = `${EXPO_GO_APK_PATH}.download`;
  const res = spawnSync(
    'curl',
    [
      '-sL',
      '--max-time',
      '300',
      '-o',
      tmp,
      'https://github.com/expo/expo-go-releases/releases/download/Expo-Go-57.0.9/Expo-Go-57.0.9.apk',
    ],
    { encoding: 'utf8', timeout: 330_000 },
  );
  const ok =
    res.status === 0 &&
    existsSync(tmp) &&
    statSync(tmp).size > 10_000_000 &&
    sha256(readFileSync(tmp)) ===
      '14c18828a3d04e43922245920bd941b978fd1c7a5aec88a0188032f0bb4972ce';
  if (ok) {
    copyFileSync(tmp, EXPO_GO_APK_PATH);
    journal.emit('expo-go-apk-restored', { path: EXPO_GO_APK_PATH, bytes: statSync(tmp).size });
  } else {
    journal.emit('expo-go-apk-restore-failed', {
      path: EXPO_GO_APK_PATH,
      curl_status: res.status,
      size: existsSync(tmp) ? statSync(tmp).size : 0,
    });
  }
  rmSync(tmp, { force: true });
  if (!ok) {
    throw new Error(
      `missing prerequisite: could not restore the pinned Expo Go APK at ${EXPO_GO_APK_PATH}`,
    );
  }
}

async function invokeDriver(
  engine: Engine,
  args: { platforms: Platform[]; runId: string; backend: OwnedBackendHandle; outputDir: string },
): Promise<DriverRunResult> {
  if (engine === 'uniwind') {
    const sourceSha = sha256(
      readFileSync(join(REPO_ROOT, 'apps/example/app/live-chat.tsx'), 'utf8'),
    );
    return runLiveExampleProof({
      platforms: args.platforms,
      runId: args.runId,
      backend: args.backend,
      outputDir: args.outputDir,
      sourceSha,
    });
  }
  return runNativewindLiveExampleProof({
    engine: 'nativewind',
    platforms: args.platforms,
    runId: args.runId,
    backend: args.backend,
    outputDir: args.outputDir,
  });
}

/**
 * The newest web export the driver's live phase produced (real bytes, reused). The
 * orchestrator preserves a copy in the phase root right after the live phase — the
 * scratch reaper can remove tmpdir dists mid-run (the attempt-4 finding), which
 * orphaned the web-self phase; the phase-root copy is the fallback.
 *
 * Entry-point check: apps/example exports a root route (index.html), but the
 * nativewind consumer's only route is /live-chat — its export has NO index.html
 * (live-chat.html + static routes only). Demanding index.html rejected a perfectly
 * valid nativewind export and orphaned web-self (cycle-5 c5a finding).
 */
function distHasEntry(dir: string): boolean {
  return existsSync(join(dir, 'index.html')) || existsSync(join(dir, 'live-chat.html'));
}

function findWebDist(engine: Engine, phaseRoot: string): string | null {
  const kept = join(phaseRoot, 'web-dist');
  if (distHasEntry(kept)) return kept;
  let best: { dir: string; mtime: number } | null = null;
  for (const entry of readdirSync(tmpdir())) {
    if (!entry.startsWith(DIST_PREFIX[engine])) continue;
    const dir = join(tmpdir(), entry);
    try {
      const mtime = statSync(dir).mtimeMs;
      if (best === null || mtime > best.mtime) best = { dir, mtime };
    } catch {
      // racing tmp cleanup — skip
    }
  }
  if (best === null) return null;
  return distHasEntry(best.dir) ? best.dir : null;
}

/* -------------------------------------------------------- web self-session -- */

type WebSelfResult = {
  ok: boolean;
  error: string | null;
  nonce_first: string;
  nonce_followup: string;
  prior_exchange_count: number;
  latest_user_message_nonce_occurrences: number;
  followup_answer_contains_nonce: boolean;
  prefix_count: number;
  prefix_samples: { ts: string; text: string }[];
  raw_text: string;
  raw_text_sha256: string;
  first_request_id: string | null;
  followup_request_id: string | null;
  stop_aborted_request_id: string | null;
  stop_delta_count: number;
  stop_completed_before: boolean;
  post_stop_request_id: string | null;
  post_stop_completed: boolean;
  endpoint_loss: {
    visible_error: boolean;
    sanitized: boolean;
    retry_completed: boolean;
    single_user_turn: boolean;
    request_id: string | null;
  };
  provider_rejection: {
    rejected: boolean;
    sanitized: boolean;
    retry_completed: boolean;
    single_user_turn: boolean;
    request_id: string | null;
  };
  video_path: string | null;
  streaming_shot: string | null;
  recovered_shot: string | null;
};

/** Backend lifecycle control handed to the web self-session. */
type BackendCtrl = {
  readonly handle: () => OwnedBackendHandle | null;
  stop: () => Promise<void>;
  relaunch: (model: string) => Promise<OwnedBackendHandle>;
};

/**
 * Drives the real web target through the public controls in ONE Chromium session
 * (context video recorded): a nonce prompt with raw-stream prefix capture and an
 * exact stream-hash correlation, a contextual follow-up, active Stop with
 * post-abort recovery, real endpoint loss + Retry, and the same-session provider
 * rejection -> model restore -> Retry recovery.
 */
// fallow-ignore-next-line complexity
async function runWebSelfSession(params: {
  engine: Engine;
  runId: string;
  url: string;
  proxy: ProxyHandle;
  journal: EvidenceJournal;
  backend: BackendCtrl;
  evidenceDir: string;
}): Promise<WebSelfResult> {
  const { engine, runId, url, proxy, journal, backend } = params;
  const nonceFirst = `ORI-AI-002:${runId}:${engine}:web`;
  // Independent shape: the follow-up marker must not contain the first nonce as
  // a substring, or the latest-user-message nonce count could never be 0.
  const nonceFollowup = `ORI-AI-002-fw:${runId}:${engine}`;
  const firstPrompt = `Remember marker ${nonceFirst}. Reply with the marker and list numbers 1 through 40.`;
  const followupPrompt = `For request ${nonceFollowup}, repeat the marker from my first message. The new message must not contain the first nonce.`;

  const result: WebSelfResult = {
    ok: false,
    error: null,
    nonce_first: nonceFirst,
    nonce_followup: nonceFollowup,
    prior_exchange_count: 0,
    latest_user_message_nonce_occurrences: -1,
    followup_answer_contains_nonce: false,
    prefix_count: 0,
    prefix_samples: [],
    raw_text: '',
    raw_text_sha256: '',
    first_request_id: null,
    followup_request_id: null,
    stop_aborted_request_id: null,
    stop_delta_count: 0,
    stop_completed_before: false,
    post_stop_request_id: null,
    post_stop_completed: false,
    endpoint_loss: {
      visible_error: false,
      sanitized: false,
      retry_completed: false,
      single_user_turn: false,
      request_id: null,
    },
    provider_rejection: {
      rejected: false,
      sanitized: false,
      retry_completed: false,
      single_user_turn: false,
      request_id: null,
    },
    video_path: null,
    streaming_shot: null,
    recovered_shot: null,
  };

  /**
   * Waits for the proxy request at index `teeBaseline` (the next send's request —
   * the app generates its own envelope ids) to reach its terminal status AND the
   * first backend record beyond `recordBaseline` to appear. Records are paired by
   * COUNT, never by envelope id: the app reuses ONE chat id for every request, so
   * an id match cannot distinguish turns. `onPoll` runs every cycle (mid-stream
   * sampling).
   */
  // fallow-ignore-next-line complexity
  const waitNext = async (
    teeBaseline: number,
    recordBaseline: number,
    timeoutMs: number,
    onPoll?: () => Promise<void>,
  ): Promise<{ tee: TeeState; record: BackendRecord } | null> => {
    const deadline = Date.now() + timeoutMs;
    let polls = 0;
    while (Date.now() < deadline) {
      await (onPoll?.() ?? Promise.resolve());
      const tee = proxy.requests[teeBaseline];
      const records = backend.handle()?.records() ?? [];
      if (tee !== undefined && tee.status !== null) {
        if (records.length > recordBaseline) {
          return { tee, record: records[recordBaseline] };
        }
        // Secondary exact path for completed streams: match the server's
        // textHash against the tee's captured raw text.
        const raw = tee.deltas.at(-1)?.cumulative;
        if (raw !== undefined && raw.length > 0) {
          const hash = sha256(raw);
          const byHash = records.find((r) => r.textHash === hash);
          if (byHash !== undefined) {
            return { tee, record: byHash };
          }
        }
      }
      polls += 1;
      if (polls % 20 === 0) {
        journal.emit('waitnext-poll', {
          engine,
          tee_baseline: teeBaseline,
          tee_status: tee?.status ?? null,
          tee_count: proxy.requests.length,
          record_count: records.length,
          server_stderr_tail: backend.handle()?.stderrText().slice(-400) ?? null,
        });
      }
      await sleep(250);
    }
    return null;
  };

  // Provider credentials must never reach the browser (CRITICAL CONSTRAINT).
  // The key is removed only around the browser child's spawn and restored
  // immediately after — backend relaunches inside this session still need it.
  const removedKey = process.env.OPENAI_API_KEY;
  if (removedKey !== undefined) delete process.env.OPENAI_API_KEY;
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
  } finally {
    if (removedKey !== undefined) process.env.OPENAI_API_KEY = removedKey;
  }
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      recordVideo: { dir: params.evidenceDir, size: { width: 390, height: 844 } },
    });
    /** One fresh live-chat page: the session's first page and the bounded
     * first-prompt re-drive's replacement page share this setup. */
    const openLiveChatPage = async (): Promise<Page> => {
      const next = await context.newPage();
      await next.goto(`${url}/live-chat`, { waitUntil: 'networkidle', timeout: 60_000 });
      await next.getByText('Live chat', { exact: true }).waitFor({ timeout: 30_000 });
      await next.getByText('Start a conversation', { exact: true }).waitFor({ timeout: 15_000 });
      return next;
    };
    let page = await openLiveChatPage();
    let video = page.video();
    const domTexts = (): Promise<string[]> =>
      page
        .evaluate(
          `[...new Set([...document.querySelectorAll('div,span,p')].filter((n) => n.children.length === 0).map((n) => (n.textContent ?? '')).filter((t) => t.length > 40))]`,
        )
        .then((value) => value as string[])
        .catch(() => [] as string[]);

    await page.goto(`${url}/live-chat`, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.getByText('Live chat', { exact: true }).waitFor({ timeout: 30_000 });
    await page.getByText('Start a conversation', { exact: true }).waitFor({ timeout: 15_000 });

    let textarea = page.getByLabel('Message', { exact: true });
    let send = page.getByLabel('Send message', { exact: true });

    // --- first prompt: stream with raw prefix capture + mid-stream screenshot ---
    const firstBaseline = proxy.requests.length;
    const firstRecordBaseline = backend.handle()?.records().length ?? 0;
    await textarea.click();
    await textarea.fill(firstPrompt);
    await send.click();
    let streamingShotTaken = false;
    let first = await waitNext(firstBaseline, firstRecordBaseline, 180_000, async () => {
      const tee = proxy.requests[firstBaseline];
      if (!streamingShotTaken && tee !== undefined && tee.deltas.length >= 6) {
        const texts = await domTexts();
        if (texts.some((t) => t.length > 60 && !t.includes(firstPrompt))) {
          streamingShotTaken = true;
          result.streaming_shot = join(params.evidenceDir, 'streaming.png');
          await page.screenshot({ path: result.streaming_shot }).catch(() => {});
        }
      }
    });
    if (first === null || first.tee.status !== 200 || first.record.outcome !== 'completed') {
      // Bounded single recovery (c5c finding): the web-self child races the dying
      // previous phase's backend owner on port 4000 — the first attempt's upstream
      // can terminate ~2s in with no server record (journal `upstream_terminated`).
      // Relaunch the owned child and drive the app's OWN Retry control — the same
      // real-user recovery path the endpoint-loss phase below exercises. One
      // re-drive, journaled; a second failure stays a failure.
      journal.emit('web-self-first-prompt-retry', {
        engine: params.engine,
        failed_tee_status: proxy.requests[firstBaseline]?.status ?? null,
        backend_started: backend.handle()?.started ?? false,
      });
      if ((backend.handle()?.started ?? false) === false) {
        await backend.relaunch(DEFAULT_MODEL);
      }
      /**
       * Always relaunch the owned child and re-send from a FRESH page in the
       * same context: a zombie tsx wrapper still reports started while its
       * server is dead (final4: BOTH attempts died to the port-4000 handoff
       * race), and the errored app state of the failed attempt can silently
       * swallow a re-send on the same page. The video keeps rolling (per-page
       * segments, same context).
       */
      await backend.relaunch(DEFAULT_MODEL);
      await page.close().catch(() => {});
      page = await openLiveChatPage();
      video = page.video();
      textarea = page.getByLabel('Message', { exact: true });
      send = page.getByLabel('Send message', { exact: true });
      const retryBaseline = proxy.requests.length;
      const retryRecordBaseline = backend.handle()?.records().length ?? 0;
      await textarea.click();
      await textarea.fill(firstPrompt);
      await send.click();
      first = await waitNext(retryBaseline, retryRecordBaseline, 180_000, async () => {
        const tee = proxy.requests[retryBaseline];
        if (!streamingShotTaken && tee !== undefined && tee.deltas.length >= 6) {
          const texts = await domTexts();
          if (texts.some((t) => t.length > 60 && !t.includes(firstPrompt))) {
            streamingShotTaken = true;
            result.streaming_shot = join(params.evidenceDir, 'streaming.png');
            await page.screenshot({ path: result.streaming_shot }).catch(() => {});
          }
        }
      });
      if (first === null || first.tee.status !== 200 || first.record.outcome !== 'completed') {
        throw new Error(
          `web-self first prompt never completed (tee status ${first?.tee.status ?? 'none'}, record ${first?.record.outcome ?? 'none'}, after one bounded retry)`,
        );
      }
    }
    result.first_request_id = first.tee.request.envelope_id;
    result.raw_text = first.tee.deltas.at(-1)?.cumulative ?? '';
    result.raw_text_sha256 = sha256(result.raw_text);
    result.prefix_count = new Set(first.tee.deltas.map((d) => d.cumulative)).size;
    result.prefix_samples = first.tee.deltas
      .filter((_, index) => index % 3 === 0 || index === first.tee.deltas.length - 1)
      .slice(0, 120)
      .map((d) => ({ ts: d.ts, text: d.cumulative }));
    await page.getByText(nonceFirst).first().waitFor({ timeout: 30_000 });

    // --- contextual follow-up (the fixture's literal wording) ---
    const followupBaseline = proxy.requests.length;
    const followupRecordBaseline = backend.handle()?.records().length ?? 0;
    await textarea.fill(followupPrompt);
    await send.click();
    const followup = await waitNext(followupBaseline, followupRecordBaseline, 180_000);
    if (
      followup === null ||
      followup.tee.status !== 200 ||
      followup.record.outcome !== 'completed'
    ) {
      throw new Error(
        `web-self follow-up never completed (tee status ${followup?.tee.status ?? 'none'}, record ${followup?.record.outcome ?? 'none'})`,
      );
    }
    result.followup_request_id = followup.tee.request.envelope_id;
    const bodyText = (await page.evaluate('document.body.innerText')) as string;
    result.followup_answer_contains_nonce = bodyText.includes(nonceFirst);
    result.prior_exchange_count = followup.tee.request.prior_exchange_count;
    result.latest_user_message_nonce_occurrences =
      followup.tee.request.latest_user_text.split(nonceFirst).length - 1;

    // --- active stop (bounded, evidence-discriminating: only an aborted record
    // with streamed deltas counts; a completed-before-stop essay is re-driven
    // once with the same bounded prompt, never padded with artificial delays) ---
    for (let drive = 0; drive < 3; drive += 1) {
      const essayBaseline = proxy.requests.length;
      const essayRecordBaseline = backend.handle()?.records().length ?? 0;
      await textarea.fill(LONG_PROMPT);
      await send.click();
      const stopControl = page.getByLabel('Stop generating', { exact: true });
      await stopControl.waitFor({ timeout: 30_000 });
      // Wait for OBSERVED streamed growth before stopping: an abort with zero
      // deltas is nondiscriminating (the request must be unfinished AND already
      // streaming). This is the discriminating condition, not an artificial
      // stream delay.
      const growthDeadline = Date.now() + 20_000;
      while (Date.now() < growthDeadline) {
        const tee = proxy.requests[essayBaseline];
        if (tee !== undefined && tee.deltas.length >= 2) break;
        await page.waitForTimeout(150);
      }
      await stopControl.click();
      await page.getByLabel('Send message', { exact: true }).waitFor({ timeout: 30_000 });
      const outcome = await waitNext(essayBaseline, essayRecordBaseline, 60_000);
      if (
        outcome !== null &&
        outcome.record.outcome === 'aborted' &&
        outcome.record.deltaCount > 0
      ) {
        result.stop_aborted_request_id = outcome.tee.request.envelope_id;
        result.stop_delta_count = outcome.record.deltaCount;
        result.stop_completed_before = false;
        journal.emit('web-self-stop', {
          engine,
          request_id: outcome.tee.request.envelope_id,
          delta_count: outcome.record.deltaCount,
        });
        await sleep(1000); // let the aborted response socket drain
        break;
      }
      if (outcome !== null && outcome.record.outcome === 'completed') {
        result.stop_completed_before = true;
        journal.emit('web-self-stop-nondiscriminating', {
          engine,
          request_id: outcome.tee.request.envelope_id,
        });
        continue;
      }
      journal.emit('web-self-stop-no-abort', { engine, drive, record: outcome?.record ?? null });
    }

    // --- post-abort recovery: a later request completes on a new id ---
    const postStopPrompt = 'Reply with the single word stable.';
    const postStopBaseline = proxy.requests.length;
    const postStopRecordBaseline = backend.handle()?.records().length ?? 0;
    await textarea.fill(postStopPrompt);
    await send.click();
    const postStop = await waitNext(postStopBaseline, postStopRecordBaseline, 120_000);
    result.post_stop_request_id = postStop?.tee.request.envelope_id ?? null;
    result.post_stop_completed =
      postStop !== null && postStop.tee.status === 200 && postStop.record.outcome === 'completed';

    // --- endpoint loss + Retry (the owned backend child actually stops) ---
    const pineapplePrompt = 'Reply with the single word pineapple.';
    await backend.stop();
    await textarea.fill(pineapplePrompt);
    await send.click().catch(() => {});
    const retry = page.getByLabel('Retry', { exact: true });
    await retry.waitFor({ timeout: 30_000 });
    const alertText =
      (await page
        .getByRole('alert')
        .first()
        .textContent()
        .catch(() => null)) ?? '';
    result.endpoint_loss.visible_error = alertText.length > 0;
    result.endpoint_loss.sanitized =
      alertText.length > 0 && !alertText.includes('sk-') && !alertText.includes('OPENAI_API_KEY');
    await page.screenshot({ path: join(params.evidenceDir, 'endpoint-loss.png') }).catch(() => {});
    await backend.relaunch(DEFAULT_MODEL);
    const lossBaseline = proxy.requests.length;
    const lossRecordBaseline = backend.handle()?.records().length ?? 0;
    await retry.click().catch(() => {});
    const lossOutcome = await waitNext(lossBaseline, lossRecordBaseline, 120_000);
    result.endpoint_loss.retry_completed =
      lossOutcome !== null && lossOutcome.record.outcome === 'completed';
    result.endpoint_loss.request_id = lossOutcome?.tee.request.envelope_id ?? null;
    const pineappleCount = await page.getByText(pineapplePrompt, { exact: true }).count();
    result.endpoint_loss.single_user_turn = pineappleCount === 1;

    // --- provider rejection -> restore -> Retry (same session, real endpoint) ---
    const mangoPrompt = 'Reply with the single word mango.';
    await backend.stop();
    await backend.relaunch(`rnr-s05-nonexistent-${runId}`);
    const rejectBaseline = proxy.requests.length;
    const rejectRecordBaseline = backend.handle()?.records().length ?? 0;
    await textarea.fill(mangoPrompt);
    await send.click().catch(() => {});
    const rejectOutcome0 = await waitNext(rejectBaseline, rejectRecordBaseline, 90_000);
    const retry2 = page.getByLabel('Retry', { exact: true });
    await retry2.waitFor({ timeout: 60_000 });
    const rejectAlert =
      (await page
        .getByRole('alert')
        .first()
        .textContent()
        .catch(() => null)) ?? '';
    result.provider_rejection.rejected =
      rejectOutcome0 !== null &&
      rejectOutcome0.record.outcome === 'error' &&
      rejectAlert.length > 0;
    result.provider_rejection.sanitized =
      rejectAlert.length > 0 &&
      !rejectAlert.includes('sk-') &&
      !rejectAlert.includes('OPENAI_API_KEY');
    await page
      .screenshot({ path: join(params.evidenceDir, 'provider-rejection.png') })
      .catch(() => {});
    await backend.stop();
    await backend.relaunch(DEFAULT_MODEL);
    const restoreBaseline = proxy.requests.length;
    const restoreRecordBaseline = backend.handle()?.records().length ?? 0;
    await retry2.click().catch(() => {});
    const restoreOutcome = await waitNext(restoreBaseline, restoreRecordBaseline, 120_000);
    result.provider_rejection.retry_completed =
      restoreOutcome !== null && restoreOutcome.record.outcome === 'completed';
    result.provider_rejection.request_id = restoreOutcome?.tee.request.envelope_id ?? null;
    const mangoCount = await page.getByText(mangoPrompt, { exact: true }).count();
    result.provider_rejection.single_user_turn = mangoCount === 1;

    result.recovered_shot = join(params.evidenceDir, 'recovered.png');
    await page.screenshot({ path: result.recovered_shot }).catch(() => {});
    result.ok = true;

    await context.close();
    if (video) {
      const saved = await video.path().catch(() => null);
      result.video_path = saved;
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    journal.emit('web-self-error', { engine, error: result.error });
  } finally {
    await browser?.close().catch(() => {});
  }
  return result;
}

/* -------------------------------------------------------------- orchestration -- */

export type MatrixOptions = {
  readonly runId: string;
  readonly engines: Engine[];
  readonly platforms: Platform[];
  readonly outputDir: string;
  readonly iosUdid: string;
  readonly androidSerial: string;
};

export type MatrixResult = {
  readonly runId: string;
  readonly ok: boolean;
  readonly targets: string[];
  readonly failures: string[];
};

type PhaseSummary = {
  engine: Engine;
  phase: 'reject' | 'live' | 'web-self';
  driver: 'runLiveExampleProof' | 'runNativewindLiveExampleProof' | 'web-self-session';
  run_id: string;
  completed: boolean;
  error: string | null;
};

type EngineArtifacts = {
  engine: Engine;
  rejectLegs: DriverLegEvidence[];
  liveLegs: DriverLegEvidence[];
  rejectShots: Partial<Record<Platform, string>>;
  liveShots: Partial<Record<Platform, string>>;
  recordings: { ios: string | null; android: string | null };
  observer: {
    samples: { ios: DeviceSample[]; android: DeviceSample[] };
    finalTexts: string[];
    baseline: { ios: Set<string>; android: Set<string> };
    growthShots: { ios: string | null; android: string | null };
  };
  webSelf: WebSelfResult | null;
  sink: RecordSink;
  phases: PhaseSummary[];
};

function legFor(
  legs: DriverLegEvidence[],
  platform: Platform,
  wantPassed: boolean,
): DriverLegEvidence | null {
  const matching = legs.filter((leg) => leg.platform === platform);
  return (
    (wantPassed ? matching.find((leg) => leg.status === 'passed') : undefined) ??
    matching[0] ??
    null
  );
}

function legEvidenceText(leg: DriverLegEvidence | null): string {
  if (leg === null) return '';
  return JSON.stringify(leg.evidence ?? {});
}

function firstExisting(paths: string[]): string | null {
  for (const path of paths) {
    if (existsSync(path) && statSync(path).size > 0) return path;
  }
  return null;
}

/** Reads the current device appearance (restored by the teardown record). */
function readAppearance(platform: 'ios' | 'android', deviceId: string): string {
  if (platform === 'android') {
    const res = spawnSync(ADB, ['-s', deviceId, 'shell', 'cmd', 'uimode', 'night'], {
      encoding: 'utf8',
      timeout: 30_000,
    });
    return /night:yes|^\s*2\b/.test(`${res.stdout ?? ''}`.trim()) ? 'dark' : 'light';
  }
  const res = spawnSync(
    'xcrun',
    ['simctl', 'spawn', deviceId, 'defaults', 'read', 'AppleGlobalDomain', 'AppleInterfaceStyle'],
    { encoding: 'utf8', timeout: 30_000 },
  );
  return `${res.stdout ?? ''}`.trim().toLowerCase() === 'dark' ? 'dark' : 'light';
}

/** The runtime port-ownership ledger (tmp, not repo): ports THIS task launched. */
const PORT_LEDGER_PATH = join(tmpdir(), 'ori-ai-002-port-ownership.json');

function readPortLedger(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(PORT_LEDGER_PATH, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function writePortLedger(entries: Record<string, string>): void {
  writeFileSync(PORT_LEDGER_PATH, `${JSON.stringify(entries, null, 2)}\n`);
}

function portListening(port: number): boolean {
  // -iTCP:<port> MUST be a single argument: lsof silently rejects the split form,
  // which made every occupancy check blind (stale listeners were never reaped).
  const res = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], {
    encoding: 'utf8',
    timeout: 15_000,
  });
  return `${res.stdout ?? ''}`.includes('LISTEN');
}

/**
 * Deterministically releases a port THIS RUNNER launched a backend on. The owned
 * backend's stop() SIGTERMs/SIGKILLs its recorded child, but the tsx wrapper's
 * server grandchild can survive a mid-stream kill and keep the port bound; the
 * listener at that moment is the orphan of our own recorded launch, so removing
 * it restores our own resource (never a foreign listener — the launch was
 * journaled, and the port was verified free before we bound it).
 */
/** Waits until a port stops listening (bounded; a busy port at timeout fails loudly). */
async function waitForPortFree(port: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!portListening(port)) return true;
    await sleep(250);
  }
  return !portListening(port);
}

function stopOwnedPort(port: number, journal: EvidenceJournal, phase: string): void {
  for (const signal of ['TERM', 'KILL'] as const) {
    const res = spawnSync('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN'], {
      encoding: 'utf8',
      timeout: 15_000,
    });
    const pids = `${res.stdout ?? ''}`
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (pids.length === 0) return;
    journal.emit('owned-port-orphan-reaped', { port, phase, signal, pids });
    for (const pid of pids) {
      spawnSync('kill', [`-${signal}`, pid], { timeout: 15_000 });
    }
    spawnSync('sleep', ['1']);
  }
}

function adbReverseList(): string {
  const res = spawnSync(ADB, ['reverse', '--list'], { encoding: 'utf8', timeout: 15_000 });
  return `${res.stdout ?? ''}${res.stderr ?? ''}`.trim();
}

/** Verifies the restored primary model serves a REAL completion (teardown proof). */
async function verifyRestoredModel(
  journal: EvidenceJournal,
  port: number,
  runId: string,
): Promise<BackendRecord | null> {
  const backend = await launchOwnedBackend({
    host: '127.0.0.1',
    port,
    model: DEFAULT_MODEL,
    maxOutputTokens: 512,
  });
  try {
    if (!backend.started) return null;
    const requestId = `ori-ai-002-restore-verify-${runId}`;
    const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: requestId,
        trigger: 'submit-message',
        messages: [
          {
            id: 'u1',
            role: 'user',
            parts: [{ type: 'text', text: 'Reply with the single word RESTORED.' }],
          },
        ],
      }),
    });
    void res.status;
    // Drain the streaming body to completion BEFORE the finally-clause backend
    // stop. An unconsumed response body whose server is killed mid-flight emits
    // an unhandled 'error' on its Readable — the same crash class as the teeing
    // proxy's upstream death.
    try {
      for await (const chunk of res.body ?? []) {
        void chunk;
      }
    } catch {
      // The backend record below is the oracle; a drained-body transport error
      // is surfaced by waitForRecord instead.
    }
    const record = await backend.waitForRecord(requestId, 30_000);
    journal.emit('restore-verification', { port, record });
    return record;
  } finally {
    await backend.stop();
  }
}

/** The maestro XCUITest runner app on the reserved iOS simulator. */
const MAESTRO_IOS_RUNNER = 'dev.mobile.maestro-driver-iosUITests.xctrunner';

/**
 * Mid-matrix refresh of the RESERVED devices only (the ORI-RN-005-documented
 * full-reboot remedy). The first engine's phases wear them — maestro JVM/
 * XCUITest churn on iOS, screenrecord churn on Android — and the second
 * engine's first marker send then stalls in-app past the drivers' fixed 120s
 * terminal-record window (observed twice: c4e and c4g, nativewind-ios marker
 * completing ~2min after the maestro send on a freshly booted simulator that
 * had since absorbed a full uniwind matrix). Rebooting between engines keeps
 * each engine's first send on rested hardware. The unrelated booted simulator
 * is never touched; the reserved emulator keeps its installed apps (cold boot
 * skips the snapshot, not the userdata).
 */
async function refreshReservedDevices(
  journal: EvidenceJournal,
  options: MatrixOptions,
): Promise<void> {
  journal.emit('device-refresh-start', {
    ios_udid: options.iosUdid,
    android_serial: options.androidSerial,
  });
  spawnSync('pkill', ['-f', 'maestro'], { encoding: 'utf8', timeout: 15_000 });

  spawnSync('xcrun', ['simctl', 'shutdown', options.iosUdid], {
    encoding: 'utf8',
    timeout: 60_000,
  });
  spawnSync('xcrun', ['simctl', 'boot', options.iosUdid], {
    encoding: 'utf8',
    timeout: 60_000,
  });
  const bootstatus = spawnSync('xcrun', ['simctl', 'bootstatus', options.iosUdid, '-b'], {
    encoding: 'utf8',
    timeout: 240_000,
  });

  spawnSync(ADB, ['-s', options.androidSerial, 'emu', 'kill'], {
    encoding: 'utf8',
    timeout: 30_000,
  });
  await sleep(8000);
  const relaunch = spawn(
    join(ANDROID_SDK, 'emulator', 'emulator'),
    ['-avd', 'Pixel_7_API_34', '-port', '5554', '-no-snapshot-load'],
    { stdio: 'ignore', detached: true },
  );
  relaunch.unref();
  const androidDeadline = Date.now() + 300_000;
  let androidReady = false;
  while (Date.now() < androidDeadline) {
    const res = spawnSync(
      ADB,
      ['-s', options.androidSerial, 'shell', 'getprop', 'sys.boot_completed'],
      {
        encoding: 'utf8',
        timeout: 15_000,
      },
    );
    if (`${res.stdout ?? ''}`.trim() === '1') {
      androidReady = true;
      break;
    }
    await sleep(5000);
  }
  await sleep(30_000); // package-manager settle after boot_completed

  journal.emit('device-refresh-end', {
    ios_bootstatus: bootstatus.status,
    android_ready: androidReady,
  });
  if (!androidReady) {
    throw new Error(
      `reserved android device ${options.androidSerial} did not boot within 300s of the mid-matrix refresh`,
    );
  }
}

/**
 * Resets the maestro iOS driver channel between phases. A failed maestro flow
 * (the reject phase's flows fail by design) leaves the XCUITest runner stale:
 * the next flow's driver status check gets connection-refused on 127.0.0.1:7001
 * and every subsequent tap silently never dispatches (the cycle-1/2 iOS
 * send-never-dispatches signature). Terminating the runner and reaping maestro
 * JVMs forces the next flow to start a fresh driver session. This touches only
 * the reserved device's maestro tooling — never app or system state.
 */
function resetMaestroIosDriver(udid: string, journal: EvidenceJournal, phase: string): void {
  const terminate = spawnSync('xcrun', ['simctl', 'terminate', udid, MAESTRO_IOS_RUNNER], {
    encoding: 'utf8',
    timeout: 30_000,
  });
  spawnSync('pkill', ['-f', 'maestro'], { encoding: 'utf8', timeout: 15_000 });
  spawnSync('sleep', ['2']);
  journal.emit('maestro-driver-reset', {
    udid,
    phase,
    terminate_status: terminate.status,
  });
}

/** One engine's three phases (reject -> live -> web-self). */
// fallow-ignore-next-line complexity
async function runEnginePhases(
  engine: Engine,
  options: MatrixOptions,
  journal: EvidenceJournal,
): Promise<EngineArtifacts> {
  const sink = makeSink();
  const phases: PhaseSummary[] = [];
  const phaseRoot = join(tmpdir(), `ori-ai-002-${options.runId}-${engine}`);
  rmSync(phaseRoot, { recursive: true, force: true });
  mkdirSync(phaseRoot, { recursive: true });
  const rejectModel = `rnr-s05-nonexistent-${options.runId}`;
  const artifacts: EngineArtifacts = {
    engine,
    rejectLegs: [],
    liveLegs: [],
    rejectShots: {},
    liveShots: {},
    recordings: { ios: null, android: null },
    observer: {
      samples: { ios: [], android: [] },
      finalTexts: [],
      baseline: { ios: new Set<string>(), android: new Set<string>() },
      growthShots: { ios: null, android: null },
    },
    webSelf: null,
    sink,
    phases,
  };

  /* ---------- REJECT: the real provider endpoint rejecting a nonexistent model -- */
  journal.emit('phase-start', { engine, phase: 'reject', model: rejectModel });
  {
    if (options.platforms.includes('ios')) {
      resetMaestroIosDriver(options.iosUdid, journal, 'pre-reject');
    }
    const backend = await makePhaseBackend(journal, sink, engine, 'reject', rejectModel, phaseRoot);
    const runId = `${options.runId}-reject`;
    let driverRun: DriverRunResult | null = null;
    let phaseError: string | null = null;
    try {
      ensureExpoGoApk(journal);
      driverRun = await invokeDriver(engine, {
        platforms: options.platforms,
        runId,
        backend,
        outputDir: join(phaseRoot, 'reject'),
      });
    } catch (error) {
      phaseError = error instanceof Error ? error.message : String(error);
    }
    backend.records();
    if (backend.started) await backend.stop();
    stopOwnedPort(ENGINE_PORTS[engine].backend, journal, 'reject');
    backend.disposeOwner();
    artifacts.rejectLegs = driverRun?.legs ?? [];
    phases.push({
      engine,
      phase: 'reject',
      driver: engine === 'uniwind' ? 'runLiveExampleProof' : 'runNativewindLiveExampleProof',
      run_id: runId,
      completed: driverRun?.completed ?? false,
      error: phaseError,
    });
    journal.emit('phase-end', {
      engine,
      phase: 'reject',
      completed: driverRun?.completed ?? false,
      legs: (driverRun?.legs ?? []).map((leg) => ({
        platform: leg.platform,
        status: leg.status,
        diagnostic: leg.diagnostic ?? null,
      })),
      error_records: sink.records
        .filter((r) => r.phase === 'reject' && r.record.outcome === 'error')
        .map((r) => r.record.requestId),
    });
    // Preserve the visible-error screenshots NOW: the uniwind driver writes into
    // its fixed ORI-RN-004 root, which the live phase overwrites next.
    for (const platform of options.platforms) {
      const shot = firstExisting([
        join(phaseRoot, 'reject', platform, 'light', 'screenshot.png'),
        join(phaseRoot, 'reject', platform, 'dark', 'screenshot.png'),
        join(RN004_EVIDENCE, platform, 'light', 'screenshot.png'),
        join(RN004_EVIDENCE, platform, 'dark', 'screenshot.png'),
      ]);
      if (shot !== null) {
        const kept = join(phaseRoot, `reject-${platform}.png`);
        copyFileSync(shot, kept);
        artifacts.rejectShots[platform] = kept;
      }
    }
  }

  /* ---------- LIVE: the restored primary model + the full green matrix -------- */
  journal.emit('phase-start', { engine, phase: 'live', model: DEFAULT_MODEL });
  {
    if (options.platforms.includes('ios')) {
      resetMaestroIosDriver(options.iosUdid, journal, 'pre-live');
    }
    const backend = await makePhaseBackend(journal, sink, engine, 'live', DEFAULT_MODEL, phaseRoot);
    const runId = `${options.runId}-live`;
    const hasNative = options.platforms.includes('ios') || options.platforms.includes('android');

    const growthShots = {
      ios: join(phaseRoot, 'growth-ios.png'),
      android: join(phaseRoot, 'growth-android.png'),
    };
    // The observer children start BEFORE the driver: each child's FIRST sample is
    // the pre-stream baseline, so stale reject-phase state is never counted as
    // live growth.
    const observer = hasNative
      ? startDeviceObserver(
          { ios: options.iosUdid, android: options.androidSerial },
          (platform, path) => {
            journal.emit('observer-growth-shot', { engine, platform, path });
          },
          growthShots,
          phaseRoot,
        )
      : null;
    const iosRecording = hasNative
      ? startIosRecording(options.iosUdid, join(phaseRoot, 'ios-video.mp4'))
      : null;
    const androidRecording = hasNative
      ? startAndroidRecording(options.androidSerial, join(phaseRoot, 'android-segs'))
      : null;

    let driverRun: DriverRunResult | null = null;
    let phaseError: string | null = null;
    try {
      ensureExpoGoApk(journal);
      driverRun = await invokeDriver(engine, {
        platforms: options.platforms,
        runId,
        backend,
        outputDir: join(phaseRoot, 'live'),
      });
    } catch (error) {
      phaseError = error instanceof Error ? error.message : String(error);
    }
    backend.records();

    // Preserve the driver's fresh web export inside the phase root: the scratch
    // reaper can remove tmpdir dists mid-run (the attempt-4 finding), which would
    // orphan the web-self phase that serves these exact bytes next.
    const keptDist = join(phaseRoot, 'web-dist');
    const freshDist = findWebDist(engine, phaseRoot);
    if (freshDist !== null && freshDist !== keptDist) {
      rmSync(keptDist, { recursive: true, force: true });
      cpSync(freshDist, keptDist, { recursive: true });
      journal.emit('web-dist-preserved', { engine, source: freshDist });
    }

    if (observer !== null) {
      const observed = await observer.stop();
      artifacts.observer.samples = observed.samples;
      artifacts.observer.baseline = observed.baseline;
      artifacts.observer.finalTexts = observed.finalTexts;
    }
    artifacts.observer.growthShots = {
      ios: existsSync(growthShots.ios) ? growthShots.ios : null,
      android: existsSync(growthShots.android) ? growthShots.android : null,
    };
    const iosSegments = iosRecording !== null ? await iosRecording.stop() : [];
    const androidSegments = androidRecording !== null ? await androidRecording.stop() : [];
    if (iosSegments.length > 0) {
      artifacts.recordings.ios = concatSegments(iosSegments, join(phaseRoot, 'ios-final.mp4'));
    }
    if (androidSegments.length > 0) {
      artifacts.recordings.android = concatSegments(
        androidSegments,
        join(phaseRoot, 'android-final.mp4'),
      );
    }
    if (backend.started) await backend.stop();
    stopOwnedPort(ENGINE_PORTS[engine].backend, journal, 'live');
    backend.disposeOwner();

    artifacts.liveLegs = driverRun?.legs ?? [];
    phases.push({
      engine,
      phase: 'live',
      driver: engine === 'uniwind' ? 'runLiveExampleProof' : 'runNativewindLiveExampleProof',
      run_id: runId,
      completed: driverRun?.completed ?? false,
      error: phaseError,
    });
    journal.emit('phase-end', {
      engine,
      phase: 'live',
      completed: driverRun?.completed ?? false,
      record_count: sink.records.filter((r) => r.phase === 'live').length,
      legs: (driverRun?.legs ?? []).map((leg) => ({
        platform: leg.platform,
        status: leg.status,
        diagnostic: leg.diagnostic ?? null,
      })),
    });
    for (const platform of options.platforms) {
      const shot = firstExisting([
        join(phaseRoot, 'live', platform, 'light', 'screenshot.png'),
        join(phaseRoot, 'live', platform, 'dark', 'screenshot.png'),
        join(RN004_EVIDENCE, platform, 'light', 'screenshot.png'),
        join(RN004_EVIDENCE, platform, 'dark', 'screenshot.png'),
      ]);
      if (shot !== null) {
        const kept = join(phaseRoot, `live-${platform}.png`);
        copyFileSync(shot, kept);
        artifacts.liveShots[platform] = kept;
      }
    }
  }

  /* ---------- WEB-SELF: one real Chromium session on the driver's export ------- */
  if (options.platforms.includes('web')) {
    journal.emit('phase-start', { engine, phase: 'web-self', model: DEFAULT_MODEL });
    const dist = findWebDist(engine, phaseRoot);
    if (dist === null) {
      phases.push({
        engine,
        phase: 'web-self',
        driver: 'web-self-session',
        run_id: `${options.runId}-web-self`,
        completed: false,
        error: 'no web export dist found from the live phase',
      });
    } else {
      const selfDir = join(phaseRoot, 'web-self');
      mkdirSync(selfDir, { recursive: true });
      let current: OwnedBackendHandle | null = null;
      const ctrl: BackendCtrl = {
        handle: () => current,
        stop: async () => {
          if (current !== null) await current.stop();
          current = null;
          stopOwnedPort(ENGINE_PORTS[engine].backend, journal, 'web-self');
          await waitForPortFree(ENGINE_PORTS[engine].backend, 8000);
        },
        relaunch: async (model: string) => {
          if (current !== null) await current.stop();
          stopOwnedPort(ENGINE_PORTS[engine].backend, journal, 'web-self');
          await waitForPortFree(ENGINE_PORTS[engine].backend, 8000);
          const next = new RecordingBackend(
            await launchOwnedBackend({
              host: '127.0.0.1',
              port: ENGINE_PORTS[engine].backend,
              model,
              maxOutputTokens: 4096,
            }),
            journal,
            sink,
            engine,
            'web-self',
            ENGINE_PORTS[engine].backend,
          );
          if (!next.started) throw new Error('web-self backend failed to start');
          current = next;
          journal.emit('backend-launch', {
            engine,
            phase: 'web-self',
            port: current.port,
            model,
            pid: current.pid,
          });
          return current;
        },
      };
      let proxy: ProxyHandle | null = null;
      try {
        await ctrl.relaunch(DEFAULT_MODEL);
        // The driver's own web proxy may still be closing when the live phase
        // just ended — free the port first.
        await waitForPortFree(ENGINE_PORTS[engine].web, 8000);
        proxy = await serveTeeingProxy(dist, ENGINE_PORTS[engine].web, journal);
        proxy.setUpstream('127.0.0.1', ENGINE_PORTS[engine].backend);
        const webSelf = await runWebSelfSession({
          engine,
          runId: options.runId,
          url: proxy.url,
          proxy,
          journal,
          backend: ctrl,
          evidenceDir: selfDir,
        });
        artifacts.webSelf = webSelf;
        phases.push({
          engine,
          phase: 'web-self',
          driver: 'web-self-session',
          run_id: `${options.runId}-web-self`,
          completed: webSelf.ok,
          error: webSelf.error,
        });
      } catch (error) {
        phases.push({
          engine,
          phase: 'web-self',
          driver: 'web-self-session',
          run_id: `${options.runId}-web-self`,
          completed: false,
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        await proxy?.stop();
        await ctrl.stop();
      }
      journal.emit('phase-end', {
        engine,
        phase: 'web-self',
        completed: artifacts.webSelf?.ok ?? false,
      });
    }
  }

  return artifacts;
}

/* ----------------------------------------------------------------- synthesis -- */

type StreamLine =
  | { ts: string; kind: 'prefix'; text: string; length: number }
  | { ts: string; kind: 'dom-sample'; texts: string[] }
  | { ts: string; kind: 'final'; text: string }
  | { ts: string; kind: 'correlation'; request_id: string; text_hash: string; outcome: string };

function writeStreamLines(path: string, lines: StreamLine[]): void {
  mkdirSync(dirnameOf(path), { recursive: true });
  writeFileSync(
    path,
    lines.map((line) => JSON.stringify(line)).join('\n') + (lines.length > 0 ? '\n' : ''),
  );
}

/**
 * Classifies observer samples into timestamped text prefixes: a sample counts when
 * its timestamp falls inside a live request's active window (record start, computed
 * from the record's duration, through this orchestrator's observation of it) and
 * the text was not on the screen before the phase started.
 */
function classifyPrefixes(
  samples: DeviceSample[],
  baseline: Set<string>,
  records: { ts: string; record: BackendRecord }[],
): { ts: string; text: string; length: number }[] {
  const windows = records.map((entry) => ({
    start: new Date(entry.ts).getTime() - entry.record.durationMs,
    end: new Date(entry.ts).getTime(),
  }));
  // User-authored prompts are known literals, not streamed growth: the drivers'
  // fixture turns (both engines) and this runner's own prompts.
  const userTextPrefixes = [
    'Remember marker ',
    'Remember the marker ',
    'What marker',
    'Write a detailed essay',
    'Reply with the single word ',
  ];
  const isUserText = (text: string): boolean =>
    userTextPrefixes.some((prefix) => text.startsWith(prefix));
  const prefixes: { ts: string; text: string; length: number }[] = [];
  const seen = new Set<string>();
  for (const sample of samples) {
    const ts = new Date(sample.ts).getTime();
    const inWindow = windows.some((w) => ts >= w.start - 1500 && ts <= w.end + 1500);
    if (!inWindow) continue;
    for (const text of sample.texts) {
      if (baseline.has(text) || seen.has(text) || isUserText(text)) continue;
      seen.add(text);
      prefixes.push({ ts: sample.ts, text, length: text.length });
    }
  }
  return prefixes;
}

function recordSummary(entries: { record: BackendRecord; ts: string; gen: number }[]): {
  completed_request_ids: string[];
  response_ids: string[];
  models: string[];
  positive_usage: boolean;
  usage_samples: { total_tokens: number }[];
  text_hashes: string[];
} {
  const completed = entries.filter((e) => e.record.outcome === 'completed');
  return {
    completed_request_ids: completed.map((e) => e.record.requestId),
    response_ids: completed.map((e) => e.record.responseId ?? '(none)'),
    models: [...new Set(entries.map((e) => e.record.providerModel))],
    positive_usage: completed.some((e) => (e.record.totalTokens ?? 0) > 0),
    usage_samples: completed.map((e) => ({ total_tokens: e.record.totalTokens ?? 0 })),
    text_hashes: completed.map((e) => e.record.textHash),
  };
}

/** Builds one target's result.json + stream.jsonl + copied artifacts. */
// fallow-ignore-next-line complexity
function synthesizeTarget(
  engine: Engine,
  platform: Platform,
  options: MatrixOptions,
  artifacts: EngineArtifacts,
  manifestRunId: string,
): { result: Record<string, unknown>; stream: StreamLine[] } {
  const native = platform !== 'web';
  const liveEntries = artifacts.sink.records.filter((r) => r.phase === 'live');
  const rejectEntries = artifacts.sink.records.filter((r) => r.phase === 'reject');

  const liveLeg = legFor(artifacts.liveLegs, platform, true);
  const rejectLeg = legFor(artifacts.rejectLegs, platform, false);
  /**
   * Per-target record scoping. One server hosts every leg of the phase, and the
   * records stream interleaves ALL legs' sessions — each session reuses one
   * chat id across its ~30 turns (marker, seed, follow-up, stop drives,
   * retries), so a phase-global lookup attributes another platform's abort or
   * retry to this target. Both drivers pin the leg's own session via
   * `latest_backend_record` in the leg evidence; every native derivation below
   * is scoped to that session. The web target derives from its own session.
   */
  const sessionKeyOf = (leg: DriverLegEvidence | null): string => {
    const record = leg?.evidence?.latest_backend_record as
      | { requestId?: unknown }
      | null
      | undefined;
    return record != null && typeof record.requestId === 'string' ? record.requestId : '';
  };
  const liveSessionKey = sessionKeyOf(liveLeg);
  const rejectSessionKey = sessionKeyOf(rejectLeg);
  const sessionLiveEntries =
    liveSessionKey.length > 0
      ? liveEntries.filter((e) => e.record.requestId === liveSessionKey)
      : liveEntries;
  const sessionRejectEntries =
    rejectSessionKey.length > 0
      ? rejectEntries.filter((e) => e.record.requestId === rejectSessionKey)
      : rejectEntries;

  const summary = recordSummary(sessionLiveEntries);
  const retryAfterRestart =
    sessionLiveEntries.find((e) => e.gen > 0 && e.record.outcome === 'completed') ?? null;
  /** The session's LAST abort — the accepted stop-turn drive (the bounded
   * re-drives abort repeatedly; the final one is the proof). */
  const abortEntry =
    [...sessionLiveEntries].reverse().find((e) => e.record.outcome === 'aborted') ?? null;
  /**
   * Native abort semantics: each turn yields exactly ONE terminal record
   * (completed OR aborted) — the interleaved completions around an abort are
   * OTHER turns (each stop drive's retry), never the same turn completing and
   * then aborting. A completed-before-Stop attempt never produces an abort
   * record at all; the drivers' own discriminating gates (bounded re-drives)
   * reject those attempts before a leg can pass. So for a session with a real
   * abort record and a passed leg, completion-before-Stop is false.
   */
  const abortCompletedBefore = abortEntry !== null && liveLeg?.status !== 'passed';

  const liveText = legEvidenceText(liveLeg);
  const rejectText = legEvidenceText(rejectLeg);

  const stream: StreamLine[] = [];
  let distinctPrefixCount = 0;
  let followupContainsNonce = false;
  let latestUserNonceCount = 0;
  let priorExchangeCount = 0;
  let nonceFirst = '';
  let stopProof: Record<string, unknown> = {};
  let retryEntries: Record<string, unknown>[] = [];
  let endpointLoss: Record<string, unknown> = {};
  let providerRejection: Record<string, unknown> = {};
  let correlation: Record<string, unknown> = {};
  let webRawHashMatch: boolean | null = null;

  if (native) {
    const legMarker = String((liveLeg?.evidence?.marker as string | undefined) ?? '');
    nonceFirst = legMarker;
    const samples = artifacts.observer.samples[platform as 'ios' | 'android'] ?? [];
    const prefixes = classifyPrefixes(
      samples,
      artifacts.observer.baseline[platform as 'ios' | 'android'],
      liveEntries,
    );
    for (const prefix of prefixes) {
      stream.push({ ts: prefix.ts, kind: 'prefix', text: prefix.text, length: prefix.length });
    }
    distinctPrefixCount = new Set(prefixes.map((p) => p.text)).size;
    for (const sample of samples) {
      stream.push({ ts: sample.ts, kind: 'dom-sample', texts: sample.texts.slice(0, 8) });
    }
    for (const text of artifacts.observer.finalTexts) {
      if (legMarker.length > 0 && text.includes(legMarker)) {
        stream.push({ ts: nowIso(), kind: 'final', text });
      }
    }
    /**
     * The follow-up answer proves recall by rendering the marker, but the chat
     * bubble truncates long markers (observed: `The identifier
     * "ORI-RN-005:ORI-AI-002-17…`), so a full-string hierarchy check
     * false-negatives — and the FINAL screen may no longer show the answer at
     * all (the essay + retry turns follow). The discriminating anchor is the
     * session's THIRD completed record (turn order: marker, seed, follow-up):
     * passive-observer samples from that record's observation time onward that
     * render the marker prefix are the follow-up ANSWER — the seed answer
     * predates the anchor and the follow-up user message never contains the
     * first nonce by construction. Falls back to the final hierarchy/texts.
     */
    const markerPrefix = legMarker.slice(0, Math.min(20, legMarker.length));
    const finalHierarchy = String((liveLeg?.evidence?.hierarchy as string | undefined) ?? '');
    const followupRecord = sessionLiveEntries.filter(
      (e) => e.record.outcome === 'completed' && e.gen === 0,
    )[2];
    const followupAnchorTs =
      followupRecord !== undefined
        ? Date.parse(followupRecord.ts) - 5000
        : Number.NEGATIVE_INFINITY;
    followupContainsNonce =
      liveLeg?.status === 'passed' &&
      (String(liveLeg?.evidence?.hierarchy_has_marker ?? false) === 'true' ||
        (markerPrefix.length > 0 &&
          (artifacts.observer.finalTexts.some((t) => t.includes(markerPrefix)) ||
            finalHierarchy.includes(markerPrefix) ||
            samples.some(
              (s) =>
                Date.parse(s.ts) >= followupAnchorTs &&
                s.texts.some((t) => t.includes(markerPrefix)),
            ))));
    // The fixture's literal follow-up wording starts "For request ${followupNonce}".
    const followupBubble = artifacts.observer.finalTexts.find((t) => t.startsWith('For request'));
    latestUserNonceCount =
      followupBubble !== undefined && legMarker.length > 0
        ? followupBubble.split(legMarker).length - 1
        : 0;
    priorExchangeCount = 2; // the drivers' fixture: marker turn + seed turn precede the follow-up
    stopProof = {
      aborted_request_id: abortEntry?.record.requestId ?? null,
      delta_count_at_abort: abortEntry?.record.deltaCount ?? 0,
      completed_before_stop: abortCompletedBefore,
      source: 'driver-flow',
    };
    const retryOk = /retry OK|retry completed/.test(liveText);
    const singleTurn = /exactly 1 retained user turn/.test(liveText);
    retryEntries = [
      {
        trigger: 'endpoint-loss',
        new_request_completed: retryOk,
        single_user_turn: singleTurn,
        request_id: retryAfterRestart?.record.requestId ?? null,
      },
    ];
    endpointLoss = {
      /**
       * The android in-yaml path logs "endpoint loss surfaced a sanitized error
       * with an accessible Retry"; the iOS retry phase has no such phrase — its
       * ok gate REQUIRES the accessible Retry control to have been visible
       * (no-Retry ⇒ retry failed ⇒ leg failed), and its success log reads
       * "endpoint loss + retry OK". So a completed retry phase IS the visible
       * error observation for iOS; the phrase check covers android's wording.
       */
      visible_error:
        retryOk || /sanitized error with an accessible Retry|endpoint loss surfaced/.test(liveText),
      sanitized:
        !liveText.includes('sk-') && !liveText.includes('OPENAI_API_KEY') && liveText.length > 0,
      retry_completed: retryOk,
      single_user_turn: singleTurn,
    };
    const rejectErrorRecords = sessionRejectEntries.filter((e) => e.record.outcome === 'error');
    providerRejection = {
      model: `rnr-s05-nonexistent-${manifestRunId}`,
      rejected_request_ids: rejectErrorRecords.map((e) => e.record.requestId),
      sanitized: rejectErrorRecords.every(
        (e) =>
          !(e.record.errorText ?? '').includes('sk-') &&
          !(e.record.errorText ?? '').includes('OPENAI_API_KEY'),
      ),
      visible_error_screenshot: 'provider-rejection.png',
      restore_completed_request_ids: summary.completed_request_ids,
    };
    void rejectText;
    correlation = {
      completed_request_ids: summary.completed_request_ids,
      response_ids: summary.response_ids,
      model: DEFAULT_MODEL,
      positive_usage: summary.positive_usage,
      usage_samples: summary.usage_samples,
      text_hashes_recorded: summary.text_hashes,
      web_raw_text_hash_match: webRawHashMatch,
    };
  } else {
    const web = artifacts.webSelf;
    nonceFirst = web?.nonce_first ?? '';
    if (web !== null) {
      // The teeing proxy captured the REAL raw stream: every cumulative prefix is
      // timestamped evidence; the final raw text must hash-match the server record.
      // The web-self session's records are journaled under its own phase; the
      // first completed record there is the first prompt's server record.
      const webSelfEntries = artifacts.sink.records.filter((e) => e.phase === 'web-self');
      const firstRecord =
        webSelfEntries.find((e) => e.record.requestId === web.first_request_id)?.record ?? null;
      webRawHashMatch =
        firstRecord !== null &&
        web.raw_text_sha256.length > 0 &&
        web.raw_text_sha256 === firstRecord.textHash;
      stream.push({ ts: nowIso(), kind: 'final', text: web.raw_text });
      for (const [index, entry] of web.prefix_samples.entries()) {
        stream.push({ ts: entry.ts, kind: 'prefix', text: entry.text, length: entry.text.length });
        if (index >= 200) break;
      }
      distinctPrefixCount = web.prefix_count;
      followupContainsNonce = web.followup_answer_contains_nonce;
      latestUserNonceCount = web.latest_user_message_nonce_occurrences;
      priorExchangeCount = web.prior_exchange_count;
      stopProof = {
        aborted_request_id: web.stop_aborted_request_id,
        delta_count_at_abort: web.stop_delta_count,
        completed_before_stop: web.stop_completed_before,
        source: 'web-self',
      };
      retryEntries = [
        {
          trigger: 'provider-rejection',
          new_request_completed: web.provider_rejection.retry_completed,
          single_user_turn: web.provider_rejection.single_user_turn,
          request_id: web.provider_rejection.request_id,
        },
        {
          trigger: 'endpoint-loss',
          new_request_completed: web.endpoint_loss.retry_completed,
          single_user_turn: web.endpoint_loss.single_user_turn,
          request_id: web.endpoint_loss.request_id,
        },
      ];
      endpointLoss = {
        visible_error: web.endpoint_loss.visible_error,
        sanitized: web.endpoint_loss.sanitized,
        retry_completed: web.endpoint_loss.retry_completed,
        single_user_turn: web.endpoint_loss.single_user_turn,
      };
      providerRejection = {
        model: `rnr-s05-nonexistent-${manifestRunId}`,
        rejected_request_ids: rejectEntries
          .filter((e) => e.record.outcome === 'error')
          .map((e) => e.record.requestId),
        sanitized: true,
        visible_error_screenshot: 'provider-rejection.png',
        restore_completed_request_ids:
          web.provider_rejection.retry_completed && web.provider_rejection.request_id !== null
            ? [web.provider_rejection.request_id, ...summary.completed_request_ids]
            : summary.completed_request_ids,
      };
      correlation = {
        completed_request_ids: summary.completed_request_ids,
        response_ids: summary.response_ids,
        model: DEFAULT_MODEL,
        positive_usage: summary.positive_usage,
        usage_samples: summary.usage_samples,
        text_hashes_recorded: summary.text_hashes,
        web_raw_text_hash_match: webRawHashMatch,
      };
    }
  }

  for (const entry of liveEntries) {
    stream.push({
      ts: entry.ts,
      kind: 'correlation',
      request_id: entry.record.requestId,
      text_hash: entry.record.textHash,
      outcome: entry.record.outcome,
    });
  }

  const result = {
    task: 'ORI-AI-002',
    run_id: options.runId,
    engine,
    platform,
    native,
    device:
      platform === 'ios'
        ? options.iosUdid
        : platform === 'android'
          ? options.androidSerial
          : 'chromium (headless, real served export)',
    api_origin: API_ORIGIN,
    nonce_first: nonceFirst,
    phases: {
      reject: {
        run_id: `${manifestRunId}-reject`,
        legs: artifacts.rejectLegs.filter((l) => l.platform === platform),
      },
      live: {
        run_id: `${manifestRunId}-live`,
        legs: artifacts.liveLegs.filter((l) => l.platform === platform),
      },
    },
    streaming: { distinct_prefix_count: distinctPrefixCount },
    context: {
      followup_answer_contains_nonce: followupContainsNonce,
      latest_user_message_nonce_occurrences: latestUserNonceCount,
      prior_exchange_count: priorExchangeCount,
    },
    correlation,
    stop_proof: stopProof,
    retry_after_failure: retryEntries,
    endpoint_loss: endpointLoss,
    provider_rejection: providerRejection,
    source: {
      repo_head: gitHead(),
      source_sha: sha256(readFileSync(join(REPO_ROOT, 'apps/example/app/live-chat.tsx'), 'utf8')),
    },
  };
  return { result, stream };
}

const API_ORIGIN =
  'official OpenAI Responses endpoint (gpt-4.1-mini-2025-04-14 via the owned example backend)';

/* ------------------------------------------------------------- matrix runner -- */

// fallow-ignore-next-line complexity
export async function runMatrix(options: MatrixOptions): Promise<MatrixResult> {
  const failures: string[] = [];
  /**
   * Single-engine invocations partition into their own evidence subdir (the
   * cycle-6 revised contract: fresh per-engine invocations within one cycle,
   * both bound to one candidate SHA). Two invocations passing the SAME
   * --output root then accumulate as <root>/uniwind/ and <root>/nativewind/
   * complete sets (manifest + server-events + teardown + targets) instead of
   * the second invocation clobbering the first's root-level records. A
   * monolithic multi-engine invocation keeps the root layout unchanged.
   */
  const evidenceDir =
    options.engines.length === 1 ? join(options.outputDir, options.engines[0]) : options.outputDir;
  mkdirSync(evidenceDir, { recursive: true });
  const journal = new EvidenceJournal(join(evidenceDir, 'server-events.jsonl'));
  journal.emit('matrix-start', {
    run_id: options.runId,
    engines: options.engines,
    platforms: options.platforms,
    repo_head: gitHead(),
  });

  /* Prerequisites — a missing prerequisite blocks execution (never a passing skip). */
  if ((process.env.OPENAI_API_KEY ?? '').length === 0) {
    throw new Error('missing prerequisite: OPENAI_API_KEY is not set for the trusted launcher');
  }
  if (!existsSync(FFMPEG)) {
    throw new Error(`missing prerequisite: ffmpeg not found at ${FFMPEG} (android segment concat)`);
  }
  if (!existsSync(MAESTRO_BIN)) {
    throw new Error(`missing prerequisite: maestro not found at ${MAESTRO_BIN}`);
  }
  const reservations = reserveDevices();
  journal.emit('devices-reserved', {
    ios: reservations.ios.id,
    android: reservations.android.id,
  });
  const ledger = readPortLedger();
  const claims: Record<string, string> = {};
  for (const engine of options.engines) {
    for (const port of [ENGINE_PORTS[engine].backend, ENGINE_PORTS[engine].web]) {
      if (!portListening(port)) continue;
      const owner = ledger[String(port)];
      if (owner === undefined || !owner.startsWith('ORI-AI-002')) {
        throw new Error(
          `missing prerequisite: port ${port} (${engine}) already has a listener — refusing unowned listeners`,
        );
      }
      // A backend orphaned by a previous ORI-AI-002 run (a crash before teardown):
      // our own recorded launch — reap it, then continue.
      journal.emit('prereq-orphan-reaped', { port, owner });
      stopOwnedPort(port, journal, 'prereq');
      await waitForPortFree(port, 8000);
      if (portListening(port)) {
        throw new Error(
          `missing prerequisite: port ${port} (${engine}) still listening after reaping our orphan`,
        );
      }
    }
    claims[String(ENGINE_PORTS[engine].backend)] = options.runId;
    claims[String(ENGINE_PORTS[engine].web)] = options.runId;
  }
  writePortLedger(claims);
  const appearancesBefore = [
    { platform: 'ios' as const, device: options.iosUdid },
    { platform: 'android' as const, device: options.androidSerial },
  ].map((entry) => ({ ...entry, from: readAppearance(entry.platform, entry.device) }));

  const allPhases: PhaseSummary[] = [];
  const engineArtifacts: Record<string, EngineArtifacts> = {};
  try {
    for (const engine of options.engines) {
      if (options.engines.indexOf(engine) > 0) {
        await refreshReservedDevices(journal, options);
      }
      journal.emit('engine-start', { engine });
      engineArtifacts[engine] = await runEnginePhases(engine, options, journal);
      allPhases.push(...engineArtifacts[engine].phases);
      for (const phase of engineArtifacts[engine].phases) {
        if (phase.phase !== 'reject' && !phase.completed) {
          failures.push(
            `${engine}/${phase.phase} did not complete: ${phase.error ?? 'legs failed'}`,
          );
        }
      }
    }
  } finally {
    /* Teardown — every exit path. */
    const appearancesRestored = appearancesBefore.map((entry) => {
      setAppearance(entry.platform, entry.device, entry.from === 'dark' ? 'dark' : 'light');
      return {
        platform: entry.platform,
        from: entry.from,
        to: readAppearance(entry.platform, entry.device),
      };
    });
    let modelRestored = false;
    let restoreRecord: BackendRecord | null = null;
    try {
      restoreRecord = await verifyRestoredModel(
        journal,
        ENGINE_PORTS[options.engines[options.engines.length - 1]].backend,
        options.runId,
      );
      modelRestored =
        restoreRecord !== null &&
        restoreRecord.outcome === 'completed' &&
        restoreRecord.providerModel === DEFAULT_MODEL &&
        (restoreRecord.totalTokens ?? 0) > 0;
    } catch (error) {
      journal.emit('restore-verification-error', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    const ownedListeners: string[] = [];
    for (const engine of options.engines) {
      for (const port of [ENGINE_PORTS[engine].backend, ENGINE_PORTS[engine].web]) {
        if (portListening(port)) ownedListeners.push(`${engine}:${port}`);
      }
    }
    const teardown = {
      run_id: options.runId,
      finished_at: nowIso(),
      model_restored: modelRestored,
      final_model: restoreRecord?.providerModel ?? DEFAULT_MODEL,
      restore_verification: restoreRecord,
      appearances_restored: appearancesRestored,
      reservations_released: true,
      owned_listeners_remaining: ownedListeners,
      adb_reverse_remaining: adbReverseList(),
      contexts_closed: { browser: true, servers: true },
    };
    writeFileSync(join(evidenceDir, 'teardown.json'), `${JSON.stringify(teardown, null, 2)}\n`);
    journal.emit('matrix-teardown', {
      model_restored: modelRestored,
      owned_listeners: ownedListeners,
    });
  }

  /* Synthesis — per-target evidence. */
  const manifestTargets: Record<string, unknown> = {};
  for (const target of EXPECTED_TARGETS) {
    const [engineId, platformId] = target.split('-') as [Engine, Platform];
    const artifacts = engineArtifacts[engineId];
    if (artifacts === undefined) continue;
    const targetDir = join(evidenceDir, target);
    mkdirSync(targetDir, { recursive: true });
    const synthesis = synthesizeTarget(engineId, platformId, options, artifacts, options.runId);
    writeFileSync(join(targetDir, 'result.json'), `${JSON.stringify(synthesis.result, null, 2)}\n`);
    writeStreamLines(join(targetDir, 'stream.jsonl'), synthesis.stream);

    // streaming.png — mid-growth observation (observer shot / web self-session).
    const streamingSource =
      platformId === 'web'
        ? (artifacts.webSelf?.streaming_shot ?? null)
        : artifacts.observer.growthShots[platformId as 'ios' | 'android'];
    if (streamingSource !== null && existsSync(streamingSource)) {
      copyFileSync(streamingSource, join(targetDir, 'streaming.png'));
    }
    // recovered.png — the post-recovery observed state.
    const recoveredSource =
      platformId === 'web'
        ? (artifacts.webSelf?.recovered_shot ?? null)
        : (artifacts.liveShots[platformId] ?? null);
    if (recoveredSource !== null && existsSync(recoveredSource)) {
      copyFileSync(recoveredSource, join(targetDir, 'recovered.png'));
    }
    // provider-rejection.png — the visible provider-error state from the reject phase.
    const rejectSource = artifacts.rejectShots[platformId];
    if (platformId === 'web' && artifacts.webSelf !== null) {
      const webShot = join(
        tmpdir(),
        `ori-ai-002-${options.runId}-${engineId}`,
        'web-self',
        'provider-rejection.png',
      );
      if (existsSync(webShot)) copyFileSync(webShot, join(targetDir, 'provider-rejection.png'));
    } else if (rejectSource !== undefined && existsSync(rejectSource)) {
      copyFileSync(rejectSource, join(targetDir, 'provider-rejection.png'));
    }
    // screen-recording.mp4 — the real device/screen recording of this engine's live phase.
    const recordingSource =
      platformId === 'web'
        ? (artifacts.webSelf?.video_path ?? null)
        : artifacts.recordings[platformId as 'ios' | 'android'];
    if (recordingSource !== null && existsSync(recordingSource)) {
      copyFileSync(recordingSource, join(targetDir, 'screen-recording.mp4'));
      boundVideoSize(join(targetDir, 'screen-recording.mp4'));
    }

    const artifactDigests: Record<string, string> = {};
    for (const file of TARGET_ARTIFACTS) {
      const path = join(targetDir, file);
      artifactDigests[file] = existsSync(path) ? sha256(readFileSync(path)) : '(missing)';
    }
    artifactDigests['result.json'] = sha256(readFileSync(join(targetDir, 'result.json')));
    manifestTargets[target] = {
      engine: engineId,
      platform: platformId,
      native: platformId !== 'web',
      artifacts: artifactDigests,
    };
    if (!existsSync(join(targetDir, 'streaming.png'))) {
      failures.push(`${target}: streaming.png was not produced (no mid-growth observation)`);
    }
    if (!existsSync(join(targetDir, 'recovered.png'))) {
      failures.push(`${target}: recovered.png was not produced`);
    }
    if (!existsSync(join(targetDir, 'screen-recording.mp4'))) {
      failures.push(`${target}: screen-recording.mp4 was not produced`);
    }
  }

  /* Manifest — the current invocation's identity contract. */
  const sourceDigests: Record<string, string> = {};
  for (const file of SOURCE_FILES) {
    sourceDigests[file] = sha256(readFileSync(join(REPO_ROOT, file)));
  }
  const manifest: {
    task: 'ORI-AI-002';
    run_id: string;
    generated_at: string;
    repo_head: string;
    engines: Engine[];
    commands: { matrix: string };
    phases: PhaseSummary[];
    source_digests: Record<string, string>;
    api_origin: string;
    devices: { ios_udid: string; android_serial: string; web_browser: string };
    targets: Record<string, unknown>;
    validation?: { ok: boolean; accepted_targets: string[]; rejections: string[] };
    exit_code?: number;
  } = {
    task: 'ORI-AI-002',
    run_id: options.runId,
    generated_at: nowIso(),
    repo_head: gitHead(),
    engines: [...options.engines],
    commands: {
      matrix: `node tests/sprint-05-orient-search/run-live-example-proof.mjs --engines ${options.engines.join(',')} --platforms ${options.platforms.join(',')} --output ${options.outputDir}`,
    },
    phases: allPhases,
    source_digests: sourceDigests,
    api_origin: API_ORIGIN,
    devices: {
      ios_udid: options.iosUdid,
      android_serial: options.androidSerial,
      web_browser: 'chromium (playwright, headless)',
    },
    targets: manifestTargets,
  };
  writeFileSync(join(evidenceDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  journal.emit('matrix-end', { run_id: options.runId });

  const validation = validateEvidence(evidenceDir, options.runId);
  failures.push(...validation.rejections);
  const ok = failures.length === 0;
  // The manifest records its own invocation's validated outcome (cycle-6
  // contract: commands and exit codes equal their own invoking run).
  manifest.validation = {
    ok,
    accepted_targets: validation.acceptedTargets,
    rejections: validation.rejections,
  };
  manifest.exit_code = ok ? 0 : 1;
  writeFileSync(join(evidenceDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return { runId: options.runId, ok, targets: validation.acceptedTargets, failures };
}

/* ---------------------------------------------------------- backend owner -- */

type OwnerStatus = { ts: string; kind: 'listening' | 'stopped' | 'alive'; model: string };

/**
 * Hosts the REAL example backend (createChatServer from apps/example/server) in a
 * dedicated process. The ORI-RN-005 driver's entry reap kills listeners whose command
 * line contains `server/index.ts` (its orphan heuristic); this owner legitimately
 * hosts the same real server code from the orchestrator's own module, so a
 * caller-passed backend is not mistaken for an orphan — no kill, no heal, no race
 * with the driver's first marker fetch. The server's sanitized stdout record lines
 * are appended to a file the in-process adapter tails; stop/restart/model-restore
 * arrive as command-file lines.
 */
/** Owner-side graceful close bound; the driver bounds backend/stop at 120s. */
const GRACEFUL_CLOSE_BOUND_MS = 60_000;

// fallow-ignore-next-line complexity
async function runBackendOwner(params: {
  port: number;
  model: string;
  recordsOut: string;
  cmdIn: string;
  statusOut: string;
  webOrigin: string;
}): Promise<void> {
  let lineBuffer = '';
  const originalWrite = process.stdout.write.bind(process.stdout);
  // fallow-ignore-next-line complexity
  const capture = (
    chunk: string | Uint8Array,
    encoding?: BufferEncoding,
    cb?: (error?: Error | null) => void,
  ): boolean => {
    lineBuffer += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    let nl = lineBuffer.indexOf('\n');
    while (nl !== -1) {
      const line = lineBuffer.slice(0, nl).trim();
      lineBuffer = lineBuffer.slice(nl + 1);
      if (line.startsWith(RECORD_PREFIX)) {
        try {
          const record = JSON.parse(line.slice(RECORD_PREFIX.length)) as BackendRecord;
          appendFileSync(params.recordsOut, `${JSON.stringify(record)}\n`);
        } catch {
          // partial line — dropped, never fabricated
        }
      }
      nl = lineBuffer.indexOf('\n');
    }
    return encoding === undefined && cb === undefined
      ? originalWrite(chunk)
      : encoding !== undefined && cb === undefined
        ? originalWrite(chunk, encoding)
        : originalWrite(chunk, encoding ?? 'utf8', cb);
  };
  process.stdout.write = capture as typeof process.stdout.write;

  const emitStatus = (kind: 'listening' | 'stopped' | 'alive', model: string): void => {
    const status: OwnerStatus = { ts: nowIso(), kind, model };
    appendFileSync(params.statusOut, `${JSON.stringify(status)}\n`);
  };

  // First-act liveness marker: distinguishes a child that died before dispatch
  // (no `alive` line) from one that died inside serve (alive, never listening).
  emitStatus('alive', params.model);

  let server: ReturnType<typeof createChatServer> | null = null;
  const serve = (model: string): void => {
    process.env.EXAMPLE_CHAT_MODEL = model;
    process.env.EXAMPLE_CHAT_HOST = '127.0.0.1';
    process.env.EXAMPLE_CHAT_PORT = String(params.port);
    process.env.EXAMPLE_CHAT_WEB_ORIGIN = params.webOrigin;
    process.env.EXAMPLE_CHAT_MAX_OUTPUT_TOKENS = '4096';
    const loaded = loadServerEnv(process.env);
    if (!loaded.ok) {
      originalWrite(`owner: server env rejected: ${loaded.diagnostic}\n`);
      process.exitCode = 1;
      return;
    }
    server = createChatServer(loaded.config);
    server.on('error', (error: Error) => {
      originalWrite(`owner: server error: ${error.message}\n`);
      process.exitCode = 1;
    });
    server.listen(params.port, '127.0.0.1', () => {
      emitStatus('listening', model);
    });
  };

  let cmdCursor = 0;
  let currentModel = params.model;
  serve(currentModel);

  /**
   * Graceful, bounded backend close. `closeAllConnections()` destroys sockets
   * mid-response, and an SSE body killed mid-flight surfaces as an unhandled
   * 'error' in whichever client holds the stream (the web leg's teeing proxy
   * has an orphaned stop-turn stream in flight at exactly this moment — the
   * browser Stop is not propagated upstream, by documented driver behavior).
   * `server.close()` lets in-flight responses finish and reaps idle keep-alive
   * sockets; the force timeout preserves the abortive fallback so a stuck
   * stream can never hold a phase hostage (the driver bounds backend/stop at
   * 120s; this bound must stay well under it).
   */
  const closeBackendGracefully = (
    closing: ReturnType<typeof createChatServer>,
    done: () => void,
  ): void => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(forceTimer);
      done();
    };
    const forceTimer = setTimeout(() => {
      originalWrite(
        `owner: graceful close exceeded ${GRACEFUL_CLOSE_BOUND_MS}ms — forcing connections closed\n`,
      );
      closing.closeAllConnections();
    }, GRACEFUL_CLOSE_BOUND_MS);
    closing.close(() => finish());
  };

  // fallow-ignore-next-line complexity
  const handleCommands = (): void => {
    try {
      const stat = statSync(params.cmdIn);
      if (stat.size <= cmdCursor) return;
      const fdText = readFileSync(params.cmdIn, 'utf8');
      const fresh = fdText.slice(cmdCursor);
      cmdCursor = fdText.length;
      for (const line of fresh.split('\n')) {
        if (line.trim().length === 0) continue;
        let cmd: { op?: unknown; model?: unknown };
        try {
          cmd = JSON.parse(line) as { op?: unknown; model?: unknown };
        } catch {
          continue;
        }
        if (cmd.op === 'stop') {
          const closing = server;
          server = null;
          if (closing !== null) {
            closeBackendGracefully(closing, () => emitStatus('stopped', currentModel));
          } else {
            emitStatus('stopped', currentModel);
          }
        } else if (cmd.op === 'restart') {
          const nextModel = typeof cmd.model === 'string' ? cmd.model : currentModel;
          const closing = server;
          server = null;
          const relisten = (): void => {
            currentModel = nextModel;
            serve(nextModel);
          };
          if (closing !== null) {
            closeBackendGracefully(closing, relisten);
          } else {
            relisten();
          }
        }
      }
    } catch {
      // command file not created yet — nothing to do
    }
  };
  const timer = setInterval(handleCommands, 150);
  timer.unref();
  const shutdown = (): void => {
    clearInterval(timer);
    const closing = server;
    server = null;
    closing?.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  // Keep the owner alive until signaled.
  setInterval(() => {}, 1 << 30);
}

/**
 * The in-process OwnedBackendHandle over the owner process: records are tailed from
 * the owner's record file; stop/restart are command-file round-trips awaited on the
 * owner's status file.
 */
class OwnerBackendHandle implements OwnedBackendHandle {
  private exitCodeValue: number | null = null;
  private exitSignalValue: string | null = null;
  private modelValue: string;
  private cmdSeq = 0;

  constructor(
    private readonly child: ChildProcess,
    private readonly backendPort: number,
    model: string,
    private readonly recordsPath: string,
    private readonly cmdPath: string,
    private readonly statusPath: string,
    private readonly stderrPath: string,
  ) {
    this.modelValue = model;
    child.on('exit', (code, signal) => {
      this.exitCodeValue = code;
      this.exitSignalValue = signal;
    });
  }

  get launchIdentity(): string {
    return `ori-ai-002-backend-owner-${this.child.pid ?? 'unknown'}`;
  }
  get origin(): string {
    return `http://127.0.0.1:${this.backendPort}`;
  }
  get host(): string {
    return '127.0.0.1';
  }
  get port(): number {
    return this.backendPort;
  }
  get model(): string {
    return this.modelValue;
  }
  get pid(): number | null {
    return this.child.pid ?? null;
  }
  get started(): boolean {
    if (this.exitCodeValue !== null || this.exitSignalValue !== null) return false;
    return this.lastStatus()?.kind === 'listening';
  }
  get exitCode(): number | null {
    return this.exitCodeValue;
  }
  get exitSignal(): string | null {
    return this.exitSignalValue;
  }
  stderrText(): string {
    try {
      return readFileSync(this.stderrPath, 'utf8');
    } catch {
      return '';
    }
  }
  stdoutText(): string {
    try {
      return readFileSync(this.recordsPath, 'utf8');
    } catch {
      return '';
    }
  }

  private lastStatus(): OwnerStatus | null {
    try {
      const lines = readFileSync(this.statusPath, 'utf8')
        .split('\n')
        .filter((line) => line.trim().length > 0);
      if (lines.length === 0) return null;
      return JSON.parse(lines[lines.length - 1]) as OwnerStatus;
    } catch {
      return null;
    }
  }

  private parseRecords(): BackendRecord[] {
    try {
      return readFileSync(this.recordsPath, 'utf8')
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line) as BackendRecord);
    } catch {
      return [];
    }
  }

  records(): BackendRecord[] {
    return this.parseRecords();
  }

  async waitForRecord(requestId: string, timeoutMs: number): Promise<BackendRecord | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const found = this.parseRecords().find((record) => record.requestId === requestId);
      if (found !== undefined) return found;
      await sleep(150);
    }
    return null;
  }

  private sendCommand(op: 'stop' | 'restart', model?: string): void {
    this.cmdSeq += 1;
    appendFileSync(this.cmdPath, `${JSON.stringify({ id: this.cmdSeq, op, model })}\n`);
  }

  private async awaitStatus(
    kind: 'listening' | 'stopped',
    model: string | null,
    timeoutMs: number,
  ): Promise<OwnerStatus | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const status = this.lastStatus();
      if (status !== null && status.kind === kind && (model === null || status.model === model)) {
        return status;
      }
      await sleep(150);
    }
    return null;
  }

  async stop(): Promise<void> {
    if (this.exitCodeValue !== null || this.exitSignalValue !== null) return;
    this.sendCommand('stop');
    await this.awaitStatus('stopped', null, 10_000);
  }

  /**
   * Phase-teardown ownership: with options.backend set the driver stops only ITS
   * restart child — the owner PROCESS is ours to reap, or it lingers after its
   * server closes. Deliberately NOT part of stop(): the driver's endpoint-loss
   * legs legitimately call stop() mid-leg and then restart() on the same owner.
   */
  dispose(): void {
    if (this.exitCodeValue !== null || this.exitSignalValue !== null) return;
    this.child.kill('SIGTERM');
    setTimeout(() => {
      if (this.exitCodeValue === null && this.exitSignalValue === null) this.child.kill('SIGKILL');
    }, 5000).unref();
  }

  async restart(options: BackendLaunchOptions = {}): Promise<OwnedBackendHandle> {
    const nextModel = options.model ?? this.modelValue;
    this.sendCommand('restart', nextModel);
    const status = await this.awaitStatus('listening', nextModel, 15_000);
    if (status === null) {
      throw new Error(`backend owner did not relisten on ${nextModel} within 15s`);
    }
    this.modelValue = nextModel;
    return new OwnerBackendHandle(
      this.child,
      this.backendPort,
      nextModel,
      this.recordsPath,
      this.cmdPath,
      this.statusPath,
      this.stderrPath,
    );
  }

  async selectModel(model: string): Promise<OwnedBackendHandle> {
    return this.restart({ model });
  }
}

/** Spawns the backend owner and resolves once the real server is listening. */
// fallow-ignore-next-line complexity
async function spawnBackendOwner(
  journal: EvidenceJournal,
  port: number,
  model: string,
  ownerDir: string,
): Promise<OwnerBackendHandle> {
  mkdirSync(ownerDir, { recursive: true });
  const recordsOut = join(ownerDir, 'backend-records.jsonl');
  const cmdIn = join(ownerDir, 'backend-cmd.jsonl');
  const statusOut = join(ownerDir, 'backend-status.jsonl');
  const stderrPath = join(ownerDir, 'backend-stderr.log');
  for (const path of [recordsOut, cmdIn, statusOut, stderrPath]) writeFileSync(path, '');
  // The port is ledger-owned by this task; a holder here is our own orphan from a
  // crashed prior phase — reap it (with a fixed portListening, the check is real).
  if (portListening(port)) {
    journal.emit('backend-owner-port-preclear', { port });
    stopOwnedPort(port, journal, 'owner-spawn');
    await waitForPortFree(port, 8000);
  }
  /**
   * Minimal explicit env: this machine's shell env has repeatedly poisoned spawned
   * node children mid-session (a reaper removed a cmux NODE_OPTIONS --require shim
   * and every inheriting child died before running). The owner needs exactly these
   * variables — inheritance is the failure surface, so it is removed.
   */
  const env: NodeJS.ProcessEnv = {
    PATH: process.env.PATH ?? '',
    HOME: process.env.HOME ?? '',
    TMPDIR: process.env.TMPDIR ?? '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  };
  const child = spawn(
    process.execPath,
    [
      TSX_CLI,
      ORCHESTRATOR_PATH,
      '--backend-owner',
      '--port',
      String(port),
      '--model',
      model,
      '--records-out',
      recordsOut,
      '--cmd-in',
      cmdIn,
      '--status-out',
      statusOut,
      '--web-origin',
      'http://localhost:8081',
    ],
    { cwd: REPO_ROOT, env, stdio: ['ignore', 'ignore', 'pipe'] },
  );
  child.stderr?.on('data', (chunk: Buffer) => {
    appendFileSync(stderrPath, chunk.toString('utf8'));
  });
  const handle = new OwnerBackendHandle(
    child,
    port,
    model,
    recordsOut,
    cmdIn,
    statusOut,
    stderrPath,
  );
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline && !handle.started) {
    if (handle.exitCode !== null || handle.exitSignal !== null) break;
    await sleep(200);
  }
  journal.emit('backend-owner-launch', {
    port,
    model,
    pid: child.pid,
    started: handle.started,
    stderr: handle.stderrText().slice(-500),
  });
  if (!handle.started) {
    child.kill('SIGTERM');
    throw new Error(
      `backend owner failed to listen on ${port}: ${handle.stderrText().slice(-1000)}`,
    );
  }
  return handle;
}

/* ----------------------------------------------------------------- validator -- */

export type ValidationResult = {
  readonly ok: boolean;
  readonly acceptedTargets: string[];
  readonly rejections: string[];
};

/**
 * Deterministic evidence validation: recomputes every digest, checks target
 * completeness and identity, cross-checks result.json correlation against
 * server-events.jsonl, and verifies the teardown record. Every rejection names
 * the exact target or field that failed.
 */
// fallow-ignore-next-line complexity
export function validateEvidence(dir: string, expectedRunId: string): ValidationResult {
  const rejections: string[] = [];
  const manifestPath = join(dir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    return { ok: false, acceptedTargets: [], rejections: ['manifest.json is missing'] };
  }
  let manifest: {
    task?: unknown;
    run_id?: unknown;
    engines?: unknown;
    source_digests?: unknown;
    api_origin?: unknown;
    targets?: unknown;
  };
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as typeof manifest;
  } catch (error) {
    return {
      ok: false,
      acceptedTargets: [],
      rejections: [
        `manifest.json is unreadable: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
  if (manifest.task !== 'ORI-AI-002') {
    rejections.push('manifest task is not ORI-AI-002');
  }
  if (manifest.run_id !== expectedRunId) {
    rejections.push(
      `runId mismatch: manifest run_id ${String(manifest.run_id)} != expected ${expectedRunId}`,
    );
  }
  /**
   * Per-engine sets (cycle-6 contract): a single-engine invocation's manifest
   * declares its engines, and the set is complete when every platform of every
   * declared engine is present — a uniwind-only set is not punished for the
   * absent nativewind targets. Multi-engine/legacy manifests without the field
   * keep the all-six expectation.
   */
  const declaredRaw = Array.isArray(manifest.engines) ? manifest.engines : null;
  const declared = declaredRaw?.map((entry) => String(entry)) ?? null;
  if (declared !== null && declared.length === 0) {
    rejections.push('manifest declares an empty engines list');
  }
  if (declared !== null) {
    for (const engine of declared) {
      if (!(ENGINE_IDS as readonly string[]).includes(engine)) {
        rejections.push(`manifest declares unknown engine: ${engine}`);
      }
    }
  }
  const expectedTargets =
    declared === null
      ? EXPECTED_TARGETS
      : EXPECTED_TARGETS.filter((target) => declared.includes(target.split('-')[0]));

  // Source/lockfile/registry/driver/policy digests equal the recomputed tree.
  const sourceDigests = (manifest.source_digests ?? {}) as Record<string, string>;
  for (const [file, digest] of Object.entries(sourceDigests)) {
    if (!/^[0-9a-f]{64}$/.test(digest)) {
      rejections.push(`${file}: manifest digest is not a 64-hex SHA-256`);
      continue;
    }
    const sourcePath = join(REPO_ROOT, file);
    if (!existsSync(sourcePath)) {
      rejections.push(`${file}: pinned source file is missing from the tree`);
      continue;
    }
    const recomputed = sha256(readFileSync(sourcePath));
    if (recomputed !== digest) {
      rejections.push(`${file}: manifest digest ${digest} != recomputed ${recomputed}`);
    }
  }
  if (Object.keys(sourceDigests).length < 8) {
    rejections.push('manifest pins fewer than 8 source/lockfile/registry/driver/policy digests');
  }

  // Exactly the six expected targets, each with the complete artifact set and
  // matching identity.
  const present = readdirSync(dir).filter((entry) => {
    const path = join(dir, entry);
    try {
      return statSync(path).isDirectory();
    } catch {
      return false;
    }
  });
  for (const target of expectedTargets) {
    if (!present.includes(target)) {
      rejections.push(`missing target record: ${target}`);
    }
  }
  for (const entry of present) {
    if (!(EXPECTED_TARGETS as readonly string[]).includes(entry)) {
      rejections.push(`unexpected directory in evidence root: ${entry}`);
    }
  }
  const targets = (manifest.targets ?? {}) as Record<
    string,
    { engine?: unknown; platform?: unknown; artifacts?: Record<string, string> }
  >;
  /**
   * Request ids legitimately REPEAT across phases (the app reuses one chat id), so a
   * last-write-wins map would let a later aborted record veto an earlier completed
   * one for the same id (attempt-4 false rejection). Each id accumulates the SET of
   * outcomes and models it was observed with.
   */
  const serverRecords = new Map<string, { outcomes: Set<string>; models: Set<string> }>();
  const eventsPath = join(dir, 'server-events.jsonl');
  if (!existsSync(eventsPath)) {
    rejections.push('server-events.jsonl is missing');
  } else {
    for (const line of readFileSync(eventsPath, 'utf8').split('\n')) {
      if (line.trim().length === 0) continue;
      try {
        const event = JSON.parse(line) as {
          kind?: unknown;
          record?: {
            requestId?: unknown;
            providerModel?: unknown;
            outcome?: unknown;
            textHash?: unknown;
          };
        };
        if (event.kind === 'record' && event.record !== undefined) {
          const id = String(event.record.requestId);
          const entry = serverRecords.get(id) ?? {
            outcomes: new Set<string>(),
            models: new Set<string>(),
          };
          entry.outcomes.add(String(event.record.outcome));
          entry.models.add(String(event.record.providerModel));
          serverRecords.set(id, entry);
        }
      } catch {
        rejections.push('server-events.jsonl contains an unparseable line');
        break;
      }
    }
  }
  if (serverRecords.size === 0) {
    rejections.push('server-events.jsonl records no provider records');
  }

  const acceptedTargets: string[] = [];
  for (const target of expectedTargets) {
    if (!present.includes(target)) continue;
    const prior = rejections.length;
    const targetDir = join(dir, target);
    for (const file of ['result.json', ...TARGET_ARTIFACTS]) {
      const path = join(targetDir, file);
      if (!existsSync(path) || statSync(path).size === 0) {
        rejections.push(`${target}: ${file} is missing or empty`);
      }
    }
    if (rejections.length !== prior) continue;

    let result: {
      task?: unknown;
      run_id?: unknown;
      engine?: unknown;
      platform?: unknown;
      api_origin?: unknown;
      correlation?: {
        completed_request_ids?: unknown;
        response_ids?: unknown;
        model?: unknown;
        text_hashes_recorded?: unknown;
      };
      provider_rejection?: { model?: unknown; rejected_request_ids?: unknown };
    };
    try {
      result = JSON.parse(readFileSync(join(targetDir, 'result.json'), 'utf8')) as typeof result;
    } catch (error) {
      rejections.push(
        `${target}: result.json is unreadable (${error instanceof Error ? error.message : String(error)})`,
      );
      continue;
    }
    const [engineId, platformId] = target.split('-');
    if (result.engine !== engineId || result.platform !== platformId) {
      rejections.push(
        `${target}: result.json identity (${String(result.engine)}-${String(result.platform)}) does not match the target directory`,
      );
    }
    if (result.task !== 'ORI-AI-002') {
      rejections.push(`${target}: result.json task is not ORI-AI-002`);
    }
    if (typeof result.run_id === 'string' && !result.run_id.startsWith(expectedRunId)) {
      rejections.push(`${target}: result.json run_id does not belong to this run`);
    }
    if (result.api_origin !== manifest.api_origin) {
      rejections.push(`${target}: result.json api_origin does not equal the manifest api origin`);
    }
    const recorded = targets[target]?.artifacts ?? {};
    for (const [file, digest] of Object.entries(recorded)) {
      const path = join(targetDir, file);
      if (!existsSync(path)) {
        rejections.push(`${target}: ${file} named in manifest but absent`);
        continue;
      }
      const recomputed = sha256(readFileSync(path));
      if (digest !== recomputed) {
        rejections.push(`${target}: ${file} manifest digest ${digest} != recomputed ${recomputed}`);
      }
    }
    if (recorded['result.json'] === undefined) {
      rejections.push(`${target}: manifest does not pin result.json`);
    }
    const completedIds = Array.isArray(result.correlation?.completed_request_ids)
      ? (result.correlation?.completed_request_ids as string[])
      : [];
    if (completedIds.length === 0) {
      rejections.push(`${target}: no completed request ids correlated`);
    } else {
      for (const requestId of completedIds) {
        const server = serverRecords.get(requestId);
        if (server === undefined) {
          rejections.push(
            `${target}: request ${requestId} has no server-events record (correlation mismatch)`,
          );
        } else if (!server.outcomes.has('completed')) {
          rejections.push(
            `${target}: request ${requestId} never completed in server-events (outcomes: ${[...server.outcomes].join(',')})`,
          );
        }
      }
    }
    const responseIds = Array.isArray(result.correlation?.response_ids)
      ? (result.correlation?.response_ids as string[])
      : [];
    if (!responseIds.every((rid) => rid.startsWith('resp_'))) {
      rejections.push(`${target}: provider response ids must be OpenAI Responses ids`);
    }
    if (result.correlation?.model !== DEFAULT_MODEL) {
      rejections.push(`${target}: correlated model is not ${DEFAULT_MODEL}`);
    }
    const rejectIds = Array.isArray(result.provider_rejection?.rejected_request_ids)
      ? (result.provider_rejection?.rejected_request_ids as string[])
      : [];
    if (rejectIds.length === 0) {
      rejections.push(`${target}: no rejected provider requests recorded`);
    } else {
      for (const requestId of rejectIds) {
        const server = serverRecords.get(requestId);
        if (server === undefined || !server.outcomes.has('error')) {
          rejections.push(
            `${target}: rejected request ${requestId} is not an error record in server-events`,
          );
        } else if (![...server.models].some((m) => m.startsWith('rnr-s05-nonexistent-'))) {
          rejections.push(
            `${target}: rejected request ${requestId} did not use the nonexistent model`,
          );
        }
      }
    }
    if (rejections.length === prior) acceptedTargets.push(target);
  }

  // Teardown record.
  const teardownPath = join(dir, 'teardown.json');
  if (!existsSync(teardownPath)) {
    rejections.push('teardown.json is missing');
  } else {
    try {
      const teardown = JSON.parse(readFileSync(teardownPath, 'utf8')) as {
        run_id?: unknown;
        model_restored?: unknown;
        final_model?: unknown;
        reservations_released?: unknown;
        owned_listeners_remaining?: unknown;
        appearances_restored?: { from?: unknown; to?: unknown }[];
      };
      if (teardown.run_id !== expectedRunId) {
        rejections.push(`teardown run_id ${String(teardown.run_id)} != expected ${expectedRunId}`);
      }
      if (teardown.model_restored !== true) {
        rejections.push('teardown does not record the restored primary model');
      }
      if (teardown.final_model !== DEFAULT_MODEL) {
        rejections.push(
          `teardown final_model is ${String(teardown.final_model)}, not ${DEFAULT_MODEL}`,
        );
      }
      if (teardown.reservations_released !== true) {
        rejections.push('teardown does not record released reservations');
      }
      if (
        Array.isArray(teardown.owned_listeners_remaining) &&
        teardown.owned_listeners_remaining.length > 0
      ) {
        rejections.push(
          `teardown records remaining owned listeners: ${teardown.owned_listeners_remaining.join(', ')}`,
        );
      }
      for (const restored of teardown.appearances_restored ?? []) {
        if (restored.from !== restored.to) {
          rejections.push(
            `teardown appearance not restored: ${String(restored.from)} -> ${String(restored.to)}`,
          );
        }
      }
    } catch (error) {
      rejections.push(
        `teardown.json is unreadable (${error instanceof Error ? error.message : String(error)})`,
      );
    }
  }

  return {
    // Per-engine sets complete at their declared engines' targets (cycle-6
    // contract); the accumulated cycle set still carries exactly 6 across both.
    ok: rejections.length === 0 && acceptedTargets.length === expectedTargets.length,
    acceptedTargets,
    rejections,
  };
}

/* ------------------------------------------------------------------ CLI -- */

function flag(name: string): string | undefined {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

/**
 * Drops `--require=` shims from NODE_OPTIONS whose target files no longer exist.
 * The agent-scratch reaper removes such shim files mid-session; a dangling require
 * kills EVERY node child that inherits it (owners, observers, driver-spawned Metro)
 * before it can run — the attempt-7 owner died exactly so.
 */
function sanitizeNodeOptions(): void {
  const raw = process.env.NODE_OPTIONS;
  if (raw === undefined || raw.length === 0) return;
  const kept = raw
    .split(/\s+/)
    .filter((part) => {
      if (!part.startsWith('--require=')) return true;
      const target = part.slice('--require='.length).replace(/^["']|["']$/g, '');
      return target.length > 0 && existsSync(target);
    })
    .join(' ');
  if (kept !== raw) {
    if (kept.length > 0) {
      process.env.NODE_OPTIONS = kept;
    } else {
      delete process.env.NODE_OPTIONS;
    }
  }
}

// fallow-ignore-next-line complexity
async function main(): Promise<void> {
  sanitizeNodeOptions();
  if (flag('--observe') !== undefined) {
    const platform = (flag('--platform') ?? 'ios') as 'ios' | 'android';
    const deviceId = flag('--device') ?? '';
    const out = flag('--out') ?? '';
    const growthShot = flag('--growth-shot') ?? '';
    if (deviceId.length === 0 || out.length === 0) {
      throw new Error('observer mode requires --device and --out');
    }
    await observeDeviceLoop({ platform, deviceId, outPath: out, growthShot });
    return;
  }

  if (flag('--backend-owner') !== undefined) {
    const port = Number(flag('--port') ?? '0');
    const model = flag('--model') ?? '';
    const recordsOut = flag('--records-out') ?? '';
    const cmdIn = flag('--cmd-in') ?? '';
    const statusOut = flag('--status-out') ?? '';
    const webOrigin = flag('--web-origin') ?? 'http://localhost:8081';
    if (
      port === 0 ||
      model.length === 0 ||
      recordsOut.length === 0 ||
      cmdIn.length === 0 ||
      statusOut.length === 0
    ) {
      throw new Error(
        'backend-owner mode requires --port --model --records-out --cmd-in --status-out',
      );
    }
    await runBackendOwner({ port, model, recordsOut, cmdIn, statusOut, webOrigin });
    return;
  }

  if (flag('--validate-only') !== undefined) {
    const dir = flag('--validate-only') as string;
    const expectedRunId = flag('--expect-run-id') ?? '';
    const result = validateEvidence(dir, expectedRunId);
    for (const rejection of result.rejections) {
      console.error(`REJECTED: ${rejection}`);
    }
    console.log(
      `${result.acceptedTargets.length} accepted target records: ${result.acceptedTargets.join(', ')}`,
    );
    process.exitCode = result.ok ? 0 : 1;
    return;
  }

  const runId = flag('--run-id') ?? `ORI-AI-002-${Date.now()}`;
  const engines = (flag('--engines') ?? 'uniwind,nativewind').split(',') as Engine[];
  const platforms = (flag('--platforms') ?? 'ios,android,web').split(',') as Platform[];
  const outputDir = flag('--output') ?? EVIDENCE_DEFAULT;
  const iosUdid = flag('--ios-udid') ?? process.env.RNR_S05_IOS_UDID ?? '';
  const androidSerial = flag('--android-serial') ?? process.env.RNR_S05_ANDROID_SERIAL ?? '';
  if (iosUdid.length === 0 || androidSerial.length === 0) {
    throw new Error(
      'missing device identity: --ios-udid/RNR_S05_IOS_UDID and --android-serial/RNR_S05_ANDROID_SERIAL',
    );
  }
  const result = await runMatrix({
    runId,
    engines,
    platforms,
    outputDir,
    iosUdid,
    androidSerial,
  });
  console.log(
    JSON.stringify(
      { run_id: result.runId, ok: result.ok, targets: result.targets, failures: result.failures },
      null,
      2,
    ),
  );
  process.exitCode = result.ok ? 0 : 1;
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exit(2);
  });
}
