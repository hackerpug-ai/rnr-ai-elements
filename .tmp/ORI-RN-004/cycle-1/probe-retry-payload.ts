/**
 * Diagnostic probe #2 (not product code): send a regenerate-shaped request that
 * mirrors the NATIVE retry-leg history — full multi-turn transcript INCLUDING the
 * partial assistant essay from the aborted Stop turn, then the failed probe user
 * turn — to a freshly restarted backend, and print the sanitized record with
 * errorText. Mirrors run ORI-RN-004-R2B-1789552900's native 'error' records.
 */
import { launchOwnedBackend } from '../../../tests/sprint-05-orient-search/support/live-backend';

const ESSAY =
  'The history of computing is a long story. It begins with the abacus, an ancient counting tool, and proceeds through mechanical calculators, the analytical engine imagined by Charles Babbage, and into the electronic era';

function msg(id: string, role: 'user' | 'assistant', text: string) {
  return { id, role, parts: [{ type: 'text', text }] };
}

async function main(): Promise<void> {
  const backend = await launchOwnedBackend({ maxOutputTokens: 4096 });
  if (!backend.started) {
    console.error('backend failed:', backend.stderrText().slice(-2000));
    process.exit(1);
  }
  const messages = [
    msg('m1', 'user', 'ORI-RN-004:probe:ios'),
    msg('m2', 'assistant', 'I will remember the marker ORI-RN-004:probe:ios.'),
    msg('m3', 'user', 'Remember the marker ORI-RN-004:probe:ios. Repeat it and give three short facts about rain.'),
    msg('m4', 'assistant', 'The marker is ORI-RN-004:probe:ios. Rain facts: it condenses, it erodes, it refreshes.'),
    msg('m5', 'user', 'What marker did I ask you to remember?'),
    msg('m6', 'assistant', 'You asked me to remember ORI-RN-004:probe:ios.'),
    msg('m7', 'user', 'Write a detailed essay on the history of computing. At least 1200 words.'),
    msg('m8', 'assistant', ESSAY), // the partial aborted essay
    msg('m9', 'user', 'Reply with the single word pineapple.'),
  ];
  const res = await fetch(`http://${backend.host}:${backend.port}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 'probe-retry', messages }),
  });
  console.log('HTTP', res.status, res.headers.get('content-type'));
  const text = await res.text();
  console.log('body (first 600):', text.slice(0, 600).replace(/\n/g, '\\n'));
  await new Promise((r) => setTimeout(r, 1500));
  for (const record of backend.records()) {
    console.log({
      outcome: record.outcome,
      deltaCount: record.deltaCount,
      responseId: record.responseId,
      errorText: record.errorText,
      durationMs: record.durationMs,
      inputTokens: record.inputTokens,
    });
  }
  await backend.stop();
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
