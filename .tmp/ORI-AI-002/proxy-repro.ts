import { createServer } from 'node:http';
import { launchOwnedBackend } from '../../tests/sprint-05-orient-search/support/live-backend';

const backend = await launchOwnedBackend({ host: '127.0.0.1', port: 4996, model: 'gpt-4.1-mini-2025-04-14', maxOutputTokens: 512 });

const proxy = createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const bodyText = Buffer.concat(chunks).toString('utf8');
  const upstreamAbort = new AbortController();
  res.on('close', () => { if (!res.writableEnded) upstreamAbort.abort(); });
  try {
    const upstreamRes = await fetch('http://127.0.0.1:4996/api/chat', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: bodyText, signal: upstreamAbort.signal,
    });
    res.writeHead(upstreamRes.status, { 'content-type': upstreamRes.headers.get('content-type') ?? 'text/event-stream' });
    if (upstreamRes.body === null) { res.end(); return; }
    for await (const chunk of upstreamRes.body) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      res.write(buf);
    }
    res.end();
    console.log('PROXY: response finished');
  } catch (e) {
    console.log('PROXY: upstream error', e instanceof Error ? e.message : String(e));
    if (!res.headersSent) { res.writeHead(502); res.end('up'); }
  }
});
await new Promise<void>((r) => proxy.listen(4995, '127.0.0.1', r));
console.log('proxy up');

async function send(label: string, messages: unknown[]): Promise<void> {
  const res = await fetch('http://127.0.0.1:4995/api/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 'chat-1', trigger: 'submit-message', messages }),
  });
  let raw = '';
  for await (const chunk of res.body) raw += Buffer.from(chunk).toString('utf8');
  console.log(label, 'status', res.status, 'bytes', raw.length);
}

await send('first', [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Remember marker XYZ123. Reply with the marker.' }] }]);
const r1 = await backend.waitForRecord('chat-1', 20_000);
console.log('record 1:', r1?.outcome, r1?.deltaCount);
await send('followup', [
  { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Remember marker XYZ123. Reply with the marker.' }] },
  { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'XYZ123' }] },
  { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'What marker did I give?' }] },
]);
const r2 = await backend.waitForRecord('chat-1', 20_000);
console.log('record 2:', r2?.outcome, r2?.deltaCount, 'total records:', backend.records().length);
proxy.close();
await backend.stop();
process.exit(0);
