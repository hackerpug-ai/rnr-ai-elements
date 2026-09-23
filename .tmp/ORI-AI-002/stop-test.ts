import { launchOwnedBackend } from '../../tests/sprint-05-orient-search/support/live-backend';
const backend = await launchOwnedBackend({ host: '127.0.0.1', port: 4998, model: 'gpt-4.1-mini-2025-04-14', maxOutputTokens: 64 });
console.log('started:', backend.started, 'pid:', backend.pid);
await backend.stop();
console.log('after stop — exitCode:', backend.exitCode, 'signal:', backend.exitSignal);
await new Promise((r) => setTimeout(r, 1000));
try {
  const res = await fetch('http://127.0.0.1:4998/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: 'x', messages: [] }) });
  console.log('UNEXPECTED alive, status:', res.status);
} catch (e) {
  console.log('dead as expected:', e instanceof Error ? e.message : String(e));
}
