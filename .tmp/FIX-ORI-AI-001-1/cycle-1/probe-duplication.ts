/**
 * Diagnostic probe (not product code): reproduce the regenerate-payload
 * duplication headlessly with the hook's exact installed SDK classes
 * (Chat from @ai-sdk/react 4.0.92, DefaultChatTransport from ai 7.0.89,
 * throttle 50) against the real owned backend, pre-fix. Mirrors the
 * ORI-RN-004 cycle-1 probe pattern: absolute-path SDK imports because `ai`
 * resolves only from apps/example's node_modules in a pnpm layout.
 *
 * Sequence under test (minimal candidate): seed nonce turn -> stop owned
 * backend -> probe turn fails client-side -> restart -> clearError +
 * regenerate. Prints the outgoing regenerate body's itemId duplication
 * stats and the server's sanitized records.
 */
import { fileURLToPath } from 'node:url';

// ORI-RN-004 cycle-1 recorded workaround: `ai` resolves only from
// apps/example's node_modules (pnpm per-package layout), so import the SDK by
// absolute worktree path.
const WORKTREE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const AI_DIST = `${WORKTREE_ROOT}apps/example/node_modules/ai/dist/index.js`;
const REACT_DIST = `${WORKTREE_ROOT}apps/example/node_modules/@ai-sdk/react/dist/index.js`;
const LIVE_BACKEND = `${WORKTREE_ROOT}tests/sprint-05-orient-search/support/live-backend.ts`;

const { DefaultChatTransport } = await import(AI_DIST);
const { Chat } = await import(REACT_DIST);
const { launchOwnedBackend } = await import(LIVE_BACKEND);

const NONCE = `FIX-ORI-AI-001-1:probe:${Date.now().toString(36)}`;
const SEED = `Remember the nonce ${NONCE}. Repeat it and give three short facts about rain.`;
const PROBE = 'Reply with the single word pineapple.';

interface CapturedBody {
  trigger: string;
  id: string;
  messages: Array<{
    id: string;
    role: string;
    itemIds: string[];
    textLength: number;
  }>;
  raw: string;
}

function itemIdsOf(message: { parts: Array<{ providerMetadata?: unknown }> }): string[] {
  const ids: string[] = [];
  for (const part of message.parts) {
    const meta = part.providerMetadata as { openai?: { itemId?: unknown } } | undefined;
    const itemId = meta?.openai?.itemId;
    if (typeof itemId === 'string') {
      ids.push(itemId);
    }
  }
  return ids;
}

async function waitForStatus(chat: Chat, want: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (chat.status === want) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

async function main(): Promise<void> {
  const captured: CapturedBody[] = [];
  let backend = await launchOwnedBackend({ maxOutputTokens: 4096 });
  if (!backend.started) throw new Error(`backend failed: ${backend.stderrText().slice(-500)}`);

  const loggingFetch: typeof fetch = (input, init) => {
    if (init?.body && typeof init.body === 'string') {
      try {
        const parsed = JSON.parse(init.body) as {
          id: string;
          trigger: string;
          messages: Array<{ id: string; role: string; parts: Array<{ type: string; text?: string; providerMetadata?: unknown }> }>;
        };
        captured.push({
          trigger: parsed.trigger,
          id: parsed.id,
          messages: parsed.messages.map((m) => ({
            id: m.id,
            role: m.role,
            itemIds: itemIdsOf(m as { parts: Array<{ providerMetadata?: unknown }> }),
            textLength: m.parts.reduce((n, p) => n + (p.type === 'text' ? (p.text ?? '').length : 0), 0),
          })),
          raw: init.body,
        });
      } catch {
        // non-JSON body — ignore
      }
    }
    return fetch(input, init);
  };

  const chat = new Chat({
    transport: new DefaultChatTransport({
      api: `http://127.0.0.1:${backend.port}/api/chat`,
      fetch: loggingFetch,
    }),
    throttle: 50,
  });

  const send = async (text: string): Promise<void> => {
    chat.sendMessage({ text });
    if (!(await waitForStatus(chat, 'ready', 120_000))) {
      throw new Error(`turn did not return to ready: status=${chat.status} error=${chat.error?.message ?? 'none'}`);
    }
  };

  await send(SEED);
  console.log('seed turn ok');

  // Aborted long turn: submit, let it stream briefly, then stop mid-stream.
  chat.sendMessage({
    text:
      'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs. Do not summarize, do not decline, and do not stop early.',
  });
  await new Promise((r) => setTimeout(r, 1500));
  chat.stop();
  await waitForStatus(chat, 'ready', 30_000);
  console.log('aborted long turn ok');

  // Endpoint loss: stop the owned backend, then submit the probe turn.
  await backend.stop();
  chat.sendMessage({ text: PROBE });
  for (let i = 0; i < 20; i += 1) {
    await new Promise((r) => setTimeout(r, 500));
    if (chat.status !== 'submitted' && chat.status !== 'streaming') break;
  }
  console.log(
    'probe state after endpoint loss: status=', chat.status,
    'error=', chat.error?.message?.slice(0, 140) ?? '(none)',
  );

  backend = await backend.restart({ maxOutputTokens: 4096 });
  if (!backend.started) throw new Error('backend restart failed');
  await new Promise((r) => setTimeout(r, 300));

  // The hook's retry path, verbatim: clearError then regenerate.
  chat.clearError();
  chat.regenerate();
  const settled = await waitForStatus(chat, 'ready', 120_000);
  console.log('regenerate settled to ready:', settled, 'error:', chat.error?.message?.slice(0, 200) ?? '(none)');

  await new Promise((r) => setTimeout(r, 500));
  const regen = captured.filter((c) => c.trigger === 'regenerate-message').at(-1);
  if (regen) {
    const allItemIds = regen.messages.flatMap((m) => m.itemIds);
    const dupes = allItemIds.filter((id, i) => allItemIds.indexOf(id) !== i);
    const userTurns = regen.messages.filter((m) => m.role === 'user' && m.textLength > 0);
    const probeTurns = regen.messages.filter((m) => m.role === 'user');
    console.log('regenerate body: messages=', regen.messages.length, 'itemIds=', allItemIds.length, 'dupItemIds=', dupes.length, 'userMsgs=', probeTurns.length, 'nonEmptyUser=', userTurns.length);
    console.log('regenerate message list:', JSON.stringify(regen.messages.map((m) => ({ id: m.id, role: m.role, items: m.itemIds.length, len: m.textLength }))));
  } else {
    console.log('no regenerate body captured');
  }
  for (const record of backend.records()) {
    console.log('record:', { requestId: record.requestId, outcome: record.outcome, deltas: record.deltaCount, responseId: record.responseId, error: record.errorText?.slice(0, 140) });
  }
  await backend.stop();
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
