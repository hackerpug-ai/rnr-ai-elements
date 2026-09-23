/**
 * Minimal repro of the ORI-AI-002 cycle-3/cycle-4 orchestrator crash:
 * the teeing proxy consumes `fetch(...).body` with a `for await` while writing
 * each chunk into the downstream Node response. When the upstream server dies
 * mid-body, undici can emit 'error' on its internal Readable while the consumer
 * is parked in res.write() (no pending read, no error listener) -> the whole
 * process dies with "Unhandled 'error' event / TypeError: terminated".
 *
 * Modes:
 *   raw       — the exact consumption shape from live-example-proof.ts (expect crash)
 *   fromweb   — consume via Readable.fromWeb(...) with an error listener attached
 *   reader    — consume via body.getReader() read() loop with cancel-on-catch
 */
import { createServer } from 'node:http';
import { Readable } from 'node:stream';

const mode = process.argv[2] ?? 'raw';
const upstreamPort = 4571;
const clientPort = 4572;

function startUpstream() {
  return new Promise<ReturnType<typeof createServer>>((resolve) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      let i = 0;
      const timer = setInterval(() => {
        i += 1;
        res.write(`data: {"delta":"chunk-${i}-${'x'.repeat(200)}}\n\n`);
      }, 25);
      res.on('close', () => clearInterval(timer));
    });
    server.listen(upstreamPort, '127.0.0.1', () => resolve(server));
  });
}

const upstream = await startUpstream();

const proxy = createServer(async (req, res) => {
  try {
    const upstreamRes = await fetch(`http://127.0.0.1:${upstreamPort}${req.url}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
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
          const ok = res.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
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
    // mode === 'raw': the exact shape from live-example-proof.ts:818
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

function journal(line: string) {
  console.log(`[repro] ${line}`);
}

await new Promise<void>((r) => proxy.listen(clientPort, '127.0.0.1', r));
journal(`proxy up (mode=${mode})`);

// Drive the proxy as a client that reads slowly enough to create backpressure.
const clientReq = fetch(`http://127.0.0.1:${clientPort}/api/chat`, { method: 'POST' });
void clientReq.then(async (res) => {
  try {
    for await (const _ of res.body) {
      void _;
    }
    journal('client body ended cleanly');
  } catch (error) {
    journal(`client body errored (expected): ${(error as Error).message}`);
  }
});

await new Promise((r) => setTimeout(r, 500));
journal('killing upstream mid-stream...');
upstream.closeAllConnections();
upstream.close();

await new Promise((r) => setTimeout(r, 2000));
journal('SURVIVED 2s after upstream death (no unhandled error)');
process.exit(0);
