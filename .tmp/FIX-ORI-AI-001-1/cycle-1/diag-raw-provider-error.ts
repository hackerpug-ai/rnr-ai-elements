/**
 * Diagnostic (not product code): after reproducing the endpoint-loss retry
 * state with the real SDK classes against the real owned backend, replay the
 * damaged `chat.messages` through the SAME provider conversion the server
 * route performs (convertToModelMessages + streamText + openai.responses) and
 * print the RAW provider error — the server record only carries a sanitized
 * errorText, and the rejection shape varies run to run. Absolute-path SDK
 * imports per the recorded ORI-RN-004 workaround.
 */
import { fileURLToPath } from 'node:url';

const WORKTREE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const AI_DIST = `${WORKTREE_ROOT}apps/example/node_modules/ai/dist/index.js`;
const OPENAI_DIST = `${WORKTREE_ROOT}apps/example/node_modules/@ai-sdk/openai/dist/index.js`;
const REACT_DIST = `${WORKTREE_ROOT}apps/example/node_modules/@ai-sdk/react/dist/index.js`;
const SERVER_CHAT = `${WORKTREE_ROOT}apps/example/server/chat.ts`;

const { convertToModelMessages, streamText } = await import(AI_DIST);
const { createOpenAI } = await import(OPENAI_DIST);
const { Chat } = await import(REACT_DIST);
const { DefaultChatTransport } = await import(AI_DIST);
const { launchOwnedBackend } = await import(
  `${WORKTREE_ROOT}tests/sprint-05-orient-search/support/live-backend.ts`
);
const { CHAT_INSTRUCTIONS } = await import(SERVER_CHAT);

const NONCE = `FIX-ORI-AI-001-1:diag:${Date.now().toString(36)}`;
const SEED = `Remember the nonce ${NONCE}. Repeat it and give three short facts about rain.`;
const ESSAY =
  'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs. Do not summarize, do not decline, and do not stop early.';
const PROBE = 'Reply with the single word pineapple.';

async function waitForStatus(chat: InstanceType<typeof Chat>, want: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (chat.status === want) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

async function waitForDeparture(chat: InstanceType<typeof Chat>, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (chat.status !== 'ready') return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return chat.status !== 'ready';
}

async function main(): Promise<void> {
  let backend = await launchOwnedBackend({ port: 4022, maxOutputTokens: 4096 });
  if (!backend.started) throw new Error('backend failed');

  const chat = new Chat({
    transport: new DefaultChatTransport({ api: `http://127.0.0.1:${backend.port}/api/chat` }),
    throttle: 50,
  });

  const send = async (text: string): Promise<void> => {
    chat.sendMessage({ text });
    await waitForDeparture(chat, 15_000);
    if (!(await waitForStatus(chat, 'ready', 120_000))) {
      throw new Error(`turn failed: ${chat.error?.message ?? chat.status}`);
    }
  };

  await send(SEED);
  console.log('seed ok');

  chat.sendMessage({ text: ESSAY });
  await new Promise((r) => setTimeout(r, 1500));
  chat.stop();
  await waitForStatus(chat, 'ready', 30_000);
  console.log('abort ok');

  await backend.stop();
  chat.sendMessage({ text: PROBE });
  await waitForDeparture(chat, 15_000);
  await waitForStatus(chat, 'error', 30_000);
  console.log('endpoint loss ok:', chat.error?.message);

  // Dump the damaged state, then replay it through the provider directly.
  const messages = chat.messages;
  console.log(
    'state shape:',
    JSON.stringify(
      messages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: message.parts.map((part) => ({
          type: part.type,
          state: (part as { state?: unknown }).state,
          itemId: (part as { providerMetadata?: { openai?: { itemId?: unknown } } })
            .providerMetadata?.openai?.itemId,
          text: part.type === 'text' ? (part as { text: string }).text.slice(0, 50) : undefined,
        })),
      })),
      null,
      1,
    ),
  );
  const allIds = messages.flatMap((message) =>
    message.parts
      .map(
        (part) =>
          (part as { providerMetadata?: { openai?: { itemId?: unknown } } }).providerMetadata
            ?.openai?.itemId,
      )
      .filter((id): id is string => typeof id === 'string'),
  );
  const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
  console.log('state itemIds:', allIds.length, 'duplicate itemId count:', dupes.length);

  const modelMessages = await convertToModelMessages(messages);
  console.log('model message roles:', modelMessages.map((m) => m.role).join(','));

  // Apply the REAL hook sanitize to the damaged state and replay.
  const { sanitizeOutgoingChatMessages } = await import(
    `${WORKTREE_ROOT}apps/example/lib/use-live-chat.ts`
  );
  const sanitized = sanitizeOutgoingChatMessages(messages);
  console.log(
    'sanitized state shape:',
    JSON.stringify(
      sanitized.map((message) => ({
        id: message.id,
        role: message.role,
        parts: message.parts.map((part) => ({
          type: part.type,
          state: (part as { state?: unknown }).state,
          itemId: (part as { providerMetadata?: { openai?: { itemId?: unknown } } })
            .providerMetadata?.openai?.itemId,
        })),
      })),
    ),
  );
  const sanitizedModelMessages = await convertToModelMessages(sanitized);
  const provider2 = createOpenAI({ apiKey: process.env.OPENAI_API_KEY }).responses(
    'gpt-4.1-mini-2025-04-14',
  );
  const result2 = streamText({
    model: provider2,
    instructions: CHAT_INSTRUCTIONS,
    messages: sanitizedModelMessages,
    maxOutputTokens: 1024,
    maxRetries: 0,
    onError: ({ error }) => {
      console.log(
        'SANITIZED REPLAY RAW ERROR:',
        error instanceof Error ? error.message : String(error),
      );
    },
  });
  try {
    let text = '';
    for await (const part of result2.stream) {
      if (part.type === 'text-delta') text += part.text;
    }
    console.log('SANITIZED REPLAY OK; answer:', text.slice(0, 80));
  } catch (error) {
    console.log('sanitized replay threw:', error instanceof Error ? error.message : String(error));
  }

  const provider = createOpenAI({ apiKey: process.env.OPENAI_API_KEY }).responses(
    'gpt-4.1-mini-2025-04-14',
  );
  const result = streamText({
    model: provider,
    instructions: CHAT_INSTRUCTIONS,
    messages: modelMessages,
    maxOutputTokens: 1024,
    maxRetries: 0,
    onError: ({ error }) => {
      console.log('RAW PROVIDER ERROR:', error instanceof Error ? error.message : String(error));
    },
  });
  try {
    for await (const _ of result.stream) {
      // drain
    }
    console.log('direct replay finished, finish:', (await result.response).id);
  } catch (error) {
    console.log('stream threw:', error instanceof Error ? error.message : String(error));
  }

  await backend.stop();
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
