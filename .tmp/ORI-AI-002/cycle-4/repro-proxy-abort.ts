/**
 * Repro #2 — the exact abort path from live-example-proof.ts:
 * `res.on('close') -> upstreamAbort.abort()` + `signal: upstreamAbort.signal`,
 * with the client aborting mid-stream (the browser's Stop generating) while the
 * proxy loop is parked in res.write() backpressure.
 */
import { createServer } from 'node:http';
import { Readable } from 'node:stream';

const mode = process.argv[2] ?? 'raw';
const upstreamPort = 4581;
const clientPort = 4582;

function startUpstream() {
  return new Promise<ReturnType<typeof createServer>>((resolve) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      let i = 0;
      const timer = setInterval(() => {
        i += 1;
        // 1MB chunks force the proxy loop into a long drain-park window.
        res.write(`data: {"delta":"chunk-${i}-${'x'.repeat(1024 * 1024)}"}\n\n`);
      }, 5);
      res.on('close', () => clearInterval(timer));
    });
    server.listen(upstreamPort, '127.0.0.1', () => resolve(server));
  });
}

const upstream = await startUpstream();

function journal(line: string) {
  console.log(`[repro2] ${line}`);
}

const proxy = createServer(async (req, res) => {
  try {
    const upstreamAbort = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) upstreamAbort.abort();
    });
    const upstreamRes = await fetch(`http://127.0.0.1:${upstreamPort}${req.url}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: upstreamAbort.signal,
    });
    res.writeHead(upstreamRes.status, { 'content-type': 'text/event-stream' });
    if (upstreamRes.body === null) {
      res.end();
      return;
    }
    if (mode === 'fromweb') {
      const nodeBody = Readable.fromWeb(
        upstreamRes.body as Parameters<typeof Readable.fromWeb>[0],
      );
      nodeBody.once('error', (error: Error) => {
        journal(`fromweb body error listener: ${error.message}`);
      });
      try {
        for await (const chunk of nodeBody) {
          const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
          const ok = res.write(buf);
          if (!ok) await new Promise<void>((r) => res.once('drain', r));
        }
        res.end();
      } catch (error) {
        journal(`fromweb loop caught: ${(error as Error).message}`);
        res.end();
      }
      return;
    }
    if (mode === 'reader') {
      const reader = upstreamRes.body.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const ok = res.write(Buffer.from(value));
          if (!ok) await new Promise<void>((r) => res.once('drain', r));
        }
        res.end();
      } catch (error) {
        journal(`reader loop caught: ${(error as Error).message}`);
        await reader.cancel().catch(() => {});
        res.end();
      }
      return;
    }
    // raw: the exact live-example-proof.ts shape
    for await (const chunk of upstreamRes.body) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      res.write(buf);
    }
    res.end();
  } catch (error) {
    journal(`proxy caught: ${(error as Error).message}`);
    res.end();
  }
});

await new Promise<void>((r) => proxy.listen(clientPort, '127.0.0.1', r));
journal(`proxy up (mode=${mode})`);

// Client: fetch with AbortController; abort mid-stream = the browser Stop.
const clientAbort = new AbortController();
const clientRes = await fetch(`http://127.0.0.1:${clientPort}/api/chat`, {
  method: 'POST',
  signal: clientAbort.signal,
});
const reader = clientRes.body?.getReader();
void (async () => {
  try {
    for (;;) {
      // Slow client: park between reads so the proxy parks in drain awaits.
      await new Promise((r) => setTimeout(r, 20));
      const { done } = (await reader?.read()) ?? { done: true };
      if (done) break;
    }
    journal('client body ended cleanly');
  } catch (error) {
    journal(`client body errored (expected): ${(error as Error).message}`);
  }
})();

const trigger = process.argv[3] ?? 'client-abort';
await new Promise((r) => setTimeout(r, 400));
if (trigger === 'upstream-kill') {
  journal('killing upstream mid-stream (backend/stop)...');
  upstream.closeAllConnections();
  upstream.close();
} else {
  journal('client aborts mid-stream (Stop generating)...');
  clientAbort.abort();
}

await new Promise((r) => setTimeout(r, 2000));
journal('SURVIVED 2s after client abort (no unhandled error)');
process.exit(0);
