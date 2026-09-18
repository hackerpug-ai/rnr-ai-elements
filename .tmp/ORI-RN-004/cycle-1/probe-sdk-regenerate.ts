/**
 * Diagnostic probe #3 (not product code): reproduce the native retry-leg failure
 * using the REAL SDK client (headless Chat + DefaultChatTransport, the same
 * classes useLiveChat wraps) against the REAL owned backend. Sequence mirrors the
 * app: marker/seed/follow-up turns, an aborted long turn, endpoint loss on the
 * probe, restart, then regenerate() — printing the message state and the server's
 * sanitized record incl. errorText.
 */
// 'ai'/'@ai-sdk/react' are apps/example dependencies (pnpm hoists per-package);
// resolve them by absolute path from the example app's node_modules. The headless
// chat class the hook drives is exported as Chat from @ai-sdk/react.
import { DefaultChatTransport } from '/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-RN-004/apps/example/node_modules/ai/dist/index.js';
import { Chat } from '/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-RN-004/apps/example/node_modules/@ai-sdk/react/dist/index.js';

import { launchOwnedBackend } from '../../../tests/sprint-05-orient-search/support/live-backend';

const MARKER = 'ORI-RN-004:probe3:ios';
const SEED = `Remember the marker ${MARKER}. Repeat it and give three short facts about rain.`;
const FOLLOW_UP = 'What marker did I ask you to remember?';
const LONG =
  'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs. Do not summarize, do not decline, and do not stop early.';
const PROBE = 'Reply with the single word pineapple.';

function transportFor(port: number): DefaultChatTransport {
  const loggingFetch: typeof fetch = (input, init) => {
    if (init?.body && String(init.body).includes('pineapple')) {
      console.log(
        '>>> captured request body:',
        typeof init.body === 'string' ? init.body : '<non-string>',
      );
    }
    return fetch(input, init);
  };
  return new DefaultChatTransport({
    api: `http://127.0.0.1:${port}/api/chat`,
    fetch: loggingFetch,
  });
}

async function waitForStatus(chat: Chat, want: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (chat.status === want) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function main(): Promise<void> {
  let backend = await launchOwnedBackend({ maxOutputTokens: 4096 });
  if (!backend.started) throw new Error('backend failed');

  // Construct like useChat does (NO initial messages array — passing one switches
  // the headless Chat into a mode that duplicated messages in the earlier probe).
  const chat = new Chat({ transport: transportFor(backend.port), throttle: 50 });

  const send = async (text: string): Promise<void> => {
    chat.sendMessage({ text });
    if (!(await waitForStatus(chat, 'ready', 120_000))) {
      throw new Error(`turn did not return to ready: ${text.slice(0, 30)}`);
    }
  };

  await send(MARKER);
  console.log('turn1 ok');
  await send(SEED);
  console.log('turn2 ok');
  await send(FOLLOW_UP);
  console.log('turn3 ok');

  // Aborted long turn.
  chat.sendMessage({ text: LONG });
  await new Promise((r) => setTimeout(r, 1500));
  chat.stop();
  await waitForStatus(chat, 'ready', 30_000);
  console.log('turn4 (aborted) ok');

  // Endpoint loss on the probe.
  await backend.stop();
  chat.sendMessage({ text: PROBE });
  await new Promise((r) => setTimeout(r, 1500));
  console.log('probe error state:', chat.error?.message ?? '(none)');

  console.log(
    'messages before regenerate:',
    JSON.stringify(
      chat.messages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: m.parts.map((p) => ({ type: p.type, len: p.type === 'text' ? p.text.length : 0 })),
      })),
      null,
      1,
    ),
  );

  // Restart the endpoint, then retry exactly like the screen: clearError+regenerate.
  backend = await backend.restart({ maxOutputTokens: 4096 });
  if (!backend.started) throw new Error('backend restart failed');
  await new Promise((r) => setTimeout(r, 500));

  chat.clearError();
  chat.regenerate();
  const completed = await waitForStatus(chat, 'ready', 120_000);
  console.log('regenerate settled:', completed, 'error:', chat.error?.message ?? '(none)');
  console.log(
    'final transcript (last message):',
    JSON.stringify(chat.messages.at(-1), null, 1)?.slice(0, 600),
  );

  await new Promise((r) => setTimeout(r, 1000));
  for (const record of backend.allRecords?.() ?? backend.records()) {
    console.log({
      outcome: record.outcome,
      deltaCount: record.deltaCount,
      durationMs: record.durationMs,
      errorText: record.errorText,
    });
  }
  await backend.stop();
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
