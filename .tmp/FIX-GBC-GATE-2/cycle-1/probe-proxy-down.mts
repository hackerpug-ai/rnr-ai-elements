/**
 * Posts one real /api/chat through the exported serveWithChatProxy while the
 * upstream port is not accepting connections. Records status, body, and elapsed
 * milliseconds. The client aborts at 8s so a hung proxy is still an observation.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  BackendSession,
  serveWithChatProxy,
  stopServer,
} from '../../../tests/sprint-05-orient-search/support/live-example-proof.test.ts';

const CLIENT_BOUND_MS = 8_000;

function reserveClosedPort(): Promise<number> {
  return new Promise((resolvePort, rejectPort) => {
    const holder = createServer();
    holder.once('error', rejectPort);
    holder.listen(0, '127.0.0.1', () => {
      const address = holder.address();
      if (address === null || typeof address === 'string') {
        rejectPort(new Error('listen did not bind a TCP port'));
        return;
      }
      const { port } = address;
      holder.close(() => resolvePort(port));
    });
  });
}

async function main(): Promise<void> {
  const outPath = process.argv[2];
  if (outPath === undefined || outPath.length === 0) {
    throw new Error('usage: probe-proxy-down.mts <output.json>');
  }
  const upstreamPort = await reserveClosedPort();
  const proxyPort = await reserveClosedPort();
  const distDir = mkdtempSync(join(tmpdir(), 'fix-gbc-gate-2-dist-'));
  const session = new BackendSession({
    host: '127.0.0.1',
    port: upstreamPort,
  } as never);
  const served = await serveWithChatProxy(distDir, proxyPort, session);
  const started = Date.now();
  let status: number | null = null;
  let body = '';
  let error: string | null = null;
  try {
    const response = await fetch(`${served.url}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'fix-gbc-gate-2', messages: [] }),
      signal: AbortSignal.timeout(CLIENT_BOUND_MS),
    });
    status = response.status;
    body = await response.text();
  } catch (caught) {
    error = caught instanceof Error ? `${caught.name}: ${caught.message}` : String(caught);
  }
  const elapsedMs = Date.now() - started;
  await stopServer(served);
  const record = {
    upstream: `127.0.0.1:${upstreamPort}`,
    proxy: served.url,
    status,
    body,
    elapsedMs,
    error,
    clientBoundMs: CLIENT_BOUND_MS,
  };
  mkdirSync(join(outPath, '..'), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(record, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

await main();
