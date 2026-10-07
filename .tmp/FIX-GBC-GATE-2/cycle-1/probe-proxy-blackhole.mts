/**
 * Posts one real /api/chat through serveWithChatProxy while the upstream
 * accepts the TCP connection and never writes a response. This is the
 * keep-alive hang shape. The proxy must still answer in about 4s with 502.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  BackendSession,
  serveWithChatProxy,
  stopServer,
} from '../../../tests/sprint-05-orient-search/support/live-example-proof.test.ts';

const CLIENT_BOUND_MS = 8_000;

function listen(server: Server): Promise<number> {
  return new Promise((resolvePort, rejectPort) => {
    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        rejectPort(new Error('listen did not bind a TCP port'));
        return;
      }
      resolvePort(address.port);
    });
  });
}

async function main(): Promise<void> {
  const outPath = process.argv[2];
  if (outPath === undefined || outPath.length === 0) {
    throw new Error('usage: probe-proxy-blackhole.mts <output.json>');
  }
  const blackhole = createServer(() => {
    /* accept and never respond — headers never arrive */
  });
  const upstreamPort = await listen(blackhole);
  const proxyHolder = createServer();
  const proxyPort = await listen(proxyHolder);
  await new Promise<void>((resolveClose) => proxyHolder.close(() => resolveClose()));
  const distDir = mkdtempSync(join(tmpdir(), 'fix-gbc-gate-2-blackhole-'));
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
      body: JSON.stringify({ id: 'fix-gbc-gate-2-blackhole', messages: [] }),
      signal: AbortSignal.timeout(CLIENT_BOUND_MS),
    });
    status = response.status;
    body = await response.text();
  } catch (caught) {
    error = caught instanceof Error ? `${caught.name}: ${caught.message}` : String(caught);
  }
  const elapsedMs = Date.now() - started;
  await stopServer(served);
  await new Promise<void>((resolveClose) => blackhole.close(() => resolveClose()));
  const record = {
    upstream: `127.0.0.1:${upstreamPort}`,
    upstreamBehavior: 'accept-and-never-respond',
    proxy: served.url,
    status,
    body,
    elapsedMs,
    error,
    clientBoundMs: CLIENT_BOUND_MS,
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(record, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

await main();
