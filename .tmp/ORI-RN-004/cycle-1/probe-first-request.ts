/**
 * Diagnostic probe (not product code): launch the owned backend, then send the
 * FIRST request immediately (as the retry leg does after a restart) and print the
 * sanitized record incl. errorText. Reproduces the native retry-leg 'error'
 * records from run ORI-RN-004-R2B-1789552900.
 */
import { launchOwnedBackend } from '../../../tests/sprint-05-orient-search/support/live-backend';

async function main(): Promise<void> {
  const backend = await launchOwnedBackend({ maxOutputTokens: 4096 });
  if (!backend.started) {
    console.error('backend failed:', backend.stderrText().slice(-2000));
    process.exit(1);
  }
  console.log('backend up on', backend.host, backend.port);
  const body = JSON.stringify({
    id: 'probe-1',
    messages: [
      { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Reply with the single word pineapple.' }] },
    ],
  });
  const res = await fetch(`http://${backend.host}:${backend.port}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
  console.log('HTTP', res.status, res.headers.get('content-type'));
  const text = await res.text();
  console.log('body (first 400):', text.slice(0, 400).replace(/\n/g, '\\n'));
  await new Promise((r) => setTimeout(r, 1500));
  console.log('records:', JSON.stringify(backend.records(), null, 2));
  await backend.stop();
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
