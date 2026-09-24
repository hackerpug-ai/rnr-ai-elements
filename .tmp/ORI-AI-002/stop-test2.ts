import { launchOwnedBackend } from '../../tests/sprint-05-orient-search/support/live-backend';
const backend = await launchOwnedBackend({ host: '127.0.0.1', port: 4997, model: 'gpt-4.1-mini-2025-04-14', maxOutputTokens: 4096 });
console.log('started:', backend.started, 'pid:', backend.pid);
const essay = 'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs.';
// start a LONG streaming request (do NOT await it)
const longReq = fetch('http://127.0.0.1:4997/api/chat', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ id: 'essay-1', trigger: 'submit-message', messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: essay }] }] }),
}).then(async (res) => { for await (const _ of res.body) { void _; } return res.status; });
await new Promise((r) => setTimeout(r, 1500));
console.log('stopping while essay streams...');
await backend.stop();
console.log('stop returned — exitCode:', backend.exitCode, 'signal:', backend.exitSignal);
const longStatus = await longReq.catch((e) => `longReq failed: ${e instanceof Error ? e.message : String(e)}`);
console.log('long request ended with:', longStatus);
await new Promise((r) => setTimeout(r, 500));
try {
  const res = await fetch('http://127.0.0.1:4997/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: 'after', trigger: 'submit-message', messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'hi' }] }] }) });
  console.log('PORT STILL ALIVE after stop — status:', res.status, await res.text().catch(() => ''));
} catch (e) {
  console.log('port dead as expected:', e instanceof Error ? e.message : String(e));
}
