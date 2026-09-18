/**
 * Diagnostic probe #4 (not product code): send three history shapes to the real
 * backend to isolate which one the provider rejects (the regenerate failure):
 *  A. one trailing empty assistant (probe's placeholder)
 *  B. two consecutive empty assistants (the native app state at retry)
 *  C. consecutive users, no empty assistants (the suspected web state)
 */
import { launchOwnedBackend } from '../../../tests/sprint-05-orient-search/support/live-backend';

function u(id: string, text: string) {
  return { id, role: 'user', parts: [{ type: 'text', text }] };
}
function aEmpty(id: string) {
  return { id, role: 'assistant', parts: [] };
}

async function send(
  port: number,
  label: string,
  messages: unknown[],
): Promise<void> {
  const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: `shape-${label}`, messages }),
  });
  const body = await res.text();
  console.log(label, 'HTTP', res.status, 'sse-error-part:', /"type":"error"/.test(body));
}

async function main(): Promise<void> {
  const backend = await launchOwnedBackend({ maxOutputTokens: 4096 });
  if (!backend.started) throw new Error('backend failed');
  const base = [u('m1', 'hello'), { id: 'm2', role: 'assistant', parts: [{ type: 'text', text: 'Hi.' }] }];

  await send(backend.port, 'A-one-empty-assistant', [
    ...base,
    u('m3', 'Reply with the single word pineapple.'),
    aEmpty('m4'),
  ]);
  await send(backend.port, 'B-two-consecutive-empty', [
    ...base,
    u('m5', 'Write an essay.'),
    aEmpty('m6'),
    aEmpty('m7'),
    u('m8', 'Reply with the single word pineapple.'),
  ]);
  await send(backend.port, 'C-consecutive-users', [
    ...base,
    u('m9', 'Write an essay.'),
    u('m10', 'Reply with the single word pineapple.'),
  ]);

  await new Promise((r) => setTimeout(r, 1500));
  for (const r of backend.records()) {
    console.log({
      requestId: r.requestId,
      outcome: r.outcome,
      deltaCount: r.deltaCount,
      errorText: r.errorText,
      durationMs: r.durationMs,
    });
  }
  await backend.stop();
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
