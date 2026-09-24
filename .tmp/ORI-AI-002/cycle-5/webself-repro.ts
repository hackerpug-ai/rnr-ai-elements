/**
 * Isolated repro of the c5c uniwind web-self first-prompt termination:
 * launchOwnedBackend on 4000 (the web-self launch path), send one chat request
 * immediately, and watch whether the SSE terminates early — plus dump the
 * child's stderr if it does.
 */
import { launchOwnedBackend } from '../../../tests/sprint-05-orient-search/support/live-backend';

const backend = await launchOwnedBackend({
  host: '127.0.0.1',
  port: 4000,
  model: 'gpt-4.1-mini-2025-04-14',
  maxOutputTokens: 4096,
});
console.log('started:', backend.started, 'pid:', backend.pid);
if (!backend.started) {
  console.log('stderr:', backend.stderrText().slice(-800));
  process.exit(1);
}

const started = Date.now();
const res = await fetch('http://127.0.0.1:4000/api/chat', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    id: 'webself-repro-1',
    trigger: 'submit-message',
    messages: [
      {
        id: 'u1',
        role: 'user',
        parts: [{ type: 'text', text: 'Reply with the single word ALIVE and nothing else.' }],
      },
    ],
  }),
});
console.log('status:', res.status, 'after', Date.now() - started, 'ms');
let cumulative = '';
try {
  for await (const chunk of res.body ?? []) {
    cumulative += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
  }
  console.log('body ended cleanly after', Date.now() - started, 'ms, bytes:', cumulative.length);
} catch (error) {
  console.log('BODY TERMINATED after', Date.now() - started, 'ms:', (error as Error).message);
}
const rec = await backend.waitForRecord('webself-repro-1', 20_000).catch(() => null);
console.log('record:', rec ? `${rec.outcome} deltas=${rec.deltaCount}` : 'none');
console.log('child stderr tail:', backend.stderrText().slice(-400));
await backend.stop();
process.exit(0);
