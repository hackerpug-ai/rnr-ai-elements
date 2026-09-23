import { join } from 'node:path';
import { launchOwnedBackend, DEFAULT_MODEL } from '../../tests/sprint-05-orient-search/support/live-backend';

const backend = await launchOwnedBackend({ host: '127.0.0.1', port: 4999, model: DEFAULT_MODEL, maxOutputTokens: 512 });
console.log('backend started:', backend.started, 'model:', backend.model);
const res = await fetch('http://127.0.0.1:4999/api/chat', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    id: 'smoke-1',
    trigger: 'submit-message',
    messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Reply with the single word SMOKE.' }] }],
  }),
});
console.log('status:', res.status, 'content-type:', res.headers.get('content-type'));
let raw = '';
for await (const chunk of res.body) {
  raw += Buffer.from(chunk).toString('utf8');
}
const deltas: string[] = [];
for (const line of raw.split('\n')) {
  const t = line.trim();
  if (t.startsWith('data:')) {
    try {
      const frame = JSON.parse(t.slice(5).trim()) as { type?: string; delta?: string };
      if (frame.type === 'text-delta' && typeof frame.delta === 'string') deltas.push(frame.delta);
    } catch { /* keepalive */ }
  }
}
const text = deltas.join('');
console.log('parsed deltas:', deltas.length, 'text:', JSON.stringify(text));
const record = await backend.waitForRecord('smoke-1', 15_000);
console.log('record outcome:', record?.outcome, 'textHash:', record?.textHash);
const { createHash } = await import('node:crypto');
console.log('hash-match:', record?.textHash === createHash('sha256').update(text).digest('hex'));
await backend.stop();
console.log('stopped');
