/**
 * Diagnostic orchestrator (not product code): capture the APP'S literal retry
 * request body. Runs the real backend on 4001, a logging reverse proxy on 4000
 * (the address Metro inlines), boots Expo Go on the reserved simulator, drives
 * the main live-chat flow, then the endpoint-loss + Retry sequence, and dumps
 * every captured request body to .tmp/ORI-RN-004/cycle-1/app-bodies/.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';

import { launchOwnedBackend } from '../../../tests/sprint-05-orient-search/support/live-backend';
import {
  captureHierarchy,
  installExpoGoIos,
  openExpoGo,
  REPO_ROOT,
  reserveDevices,
  setAppearance,
  startMetro,
  stopMetro,
  type MetroHandle,
} from '../../../tests/sprint-05-orient-search/support/native-session';

const EXAMPLE_ROOT = join(REPO_ROOT, 'apps/example');
const MAESTRO_BIN = join(process.env.HOME ?? '', '.maestro', 'bin', 'maestro');
const MAESTRO_FLOW = join(REPO_ROOT, 'tests/sprint-05-orient-search/live-example.maestro.yaml');
const BODIES_DIR = join(REPO_ROOT, '.tmp/ORI-RN-004/cycle-1/app-bodies');
const PROXY_PORT = 4000;
const BACKEND_PORT = 4001;

const MARKER = 'ORI-RN-004:cap:ios';
const SEED = `Remember the marker ${MARKER}. Repeat it and give three short facts about rain.`;
const LONG =
  'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs. Do not summarize, do not decline, and do not stop early.';
const PROBE = 'Reply with the single word pineapple.';

let proxyServer: ReturnType<typeof createServer> | null = null;
let proxyUp = true;

function startLoggingProxy(): Promise<void> {
  return new Promise((resolve) => {
    proxyServer = createServer(async (req, res) => {
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
        }
        const body = Buffer.concat(chunks);
        if (proxyUp && body.length > 0) {
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          writeFileSync(join(BODIES_DIR, `${stamp}-${body.length}.json`), body);
        }
        if (!proxyUp || !existsSync(`/dev/null`)) {
          res.writeHead(502);
          res.end('down');
          return;
        }
        const upstream = await fetch(`http://127.0.0.1:${BACKEND_PORT}/api/chat`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
        });
        res.writeHead(upstream.status, {
          'content-type': upstream.headers.get('content-type') ?? 'text/event-stream',
        });
        if (upstream.body) {
          const reader = upstream.body.getReader();
          const pump = async (): Promise<void> => {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              const ok = res.write(Buffer.from(value));
              if (!ok) await new Promise<void>((r) => res.once('drain', () => r()));
            }
            res.end();
          };
          await pump().catch(() => res.end());
        } else {
          res.end();
        }
      } catch {
        res.writeHead(502);
        res.end('proxy error');
      }
    });
    proxyServer.listen(PROXY_PORT, '127.0.0.1', () => resolve());
  });
}

function stopLoggingProxy(): Promise<void> {
  return new Promise((resolve) => {
    if (!proxyServer) return resolve();
    proxyServer.close(() => resolve());
    proxyServer = null;
  });
}

function maestroFlow(deviceId: string, env: Record<string, string>): number {
  const args = ['--udid', deviceId, 'test', '--no-ansi'];
  for (const [k, v] of Object.entries(env)) args.push('-e', `${k}=${v}`);
  args.push(MAESTRO_FLOW);
  const res = spawnSync(MAESTRO_BIN, args, {
    encoding: 'utf8',
    timeout: 600_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return res.status ?? -1;
}

function maestroTap(deviceId: string, selector: string): boolean {
  const flowPath = join(BODIES_DIR, `tap-${Date.now()}.yaml`);
  writeFileSync(flowPath, `appId: host.exp.Exponent\n---\n- tapOn: ${JSON.stringify(selector)}\n`);
  const res = spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return res.status === 0;
}

function maestroTypeAndSend(deviceId: string, text: string): boolean {
  const flowPath = join(BODIES_DIR, `type-${Date.now()}.yaml`);
  writeFileSync(
    flowPath,
    [
      'appId: host.exp.Exponent',
      '---',
      '- tapOn: "Message.*"',
      `- inputText: ${JSON.stringify(text)}`,
      '- tapOn: "Send message"',
    ].join('\n'),
  );
  const res = spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return res.status === 0;
}

function waitForText(deviceId: string, needle: string, timeoutMs: number): boolean {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (captureHierarchy(deviceId).includes(needle)) return true;
    spawnSync('sleep', ['2']);
  }
  return false;
}

async function main(): Promise<void> {
  mkdirSync(BODIES_DIR, { recursive: true });
  const backend = await launchOwnedBackend({ port: BACKEND_PORT, maxOutputTokens: 4096 });
  if (!backend.started) throw new Error('backend failed');
  await startLoggingProxy();
  console.log('backend+proxy up');

  const reservations = reserveDevices();
  installExpoGoIos(reservations.ios.id);
  const prevEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = `http://127.0.0.1:${PROXY_PORT}`;
  let metro: MetroHandle | null = null;
  try {
    metro = startMetro(EXAMPLE_ROOT, 8095, join(BODIES_DIR, 'metro.log'));
    setAppearance('ios', reservations.ios.id, 'light');
    openExpoGo('ios', reservations.ios.id, `exp://127.0.0.1:${metro.port}/--/live-chat`);

    const flow = maestroFlow(reservations.ios.id, {
      MARKER: MARKER,
      SEED_PROMPT: SEED,
      FOLLOW_UP_PROMPT: 'What marker did I ask you to remember?',
      LONG_PROMPT: LONG,
    });
    console.log('main flow exit:', flow);

    // Endpoint loss: kill the proxy the app talks to (backend stays recorded).
    proxyUp = false;
    await stopLoggingProxy();
    if (!maestroTypeAndSend(reservations.ios.id, PROBE)) console.log('WARN: probe flow failed');
    console.log('Retry visible:', waitForText(reservations.ios.id, 'Retry', 60_000));

    // Restart the proxy, then tap Retry.
    await startLoggingProxy();
    proxyUp = true;
    console.log('retry tapped:', maestroTap(reservations.ios.id, 'Retry'));
    spawnSync('sleep', ['8']);
    console.log(
      'backend records:',
      JSON.stringify(
        backend.records().map((r) => ({
          outcome: r.outcome,
          deltas: r.deltaCount,
          err: r.errorText,
          ms: r.durationMs,
        })),
      ),
    );
  } finally {
    if (metro) stopMetro(metro);
    await stopLoggingProxy();
    await backend.stop();
    if (prevEnv === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = prevEnv;
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
