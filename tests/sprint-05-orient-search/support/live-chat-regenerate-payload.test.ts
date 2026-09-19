/**
 * FIX-ORI-AI-001-1 scoped real-stack driver: the regenerate-payload
 * itemId-uniqueness fix for the worked example's live chat hook.
 *
 * Drives the REAL installed SDK classes (Chat from @ai-sdk/react 4.0.92,
 * DefaultChatTransport from ai 7.0.89 — the hook's exact stack) headlessly
 * against the REAL owned backend (support/live-backend.ts) and the REAL
 * OpenAI Responses endpoint (gpt-4.1-mini-2025-04-14). No mocked Chat,
 * transport, fetch, server or provider anywhere: the capture wrapper only
 * observes the prepared body and delegates to the real fetch.
 *
 * The installed SDK classes and the hook module are loaded at RUNTIME
 * through computed specifiers: static or type-only imports would pull the
 * apps/example packages' global DOM augmentations into the root tsc program
 * and break unrelated spec files, so each loaded namespace is bounded by a
 * local structural surface declared here (mirroring the real signatures the
 * runs exercise). `ai`/`@ai-sdk/react` resolve only from apps/example's
 * node_modules in the pnpm layout — the recorded ORI-RN-004 workaround.
 *
 * Legs:
 *  - AC-1 retry leg: nonce seed turn, aborted long turn, owned-endpoint loss,
 *    restart, then the hook's retry (createRetry = clearError then
 *    regenerate). Pre-fix this fails functionally: the regenerate payload
 *    carries stale/duplicated assistant provider itemIds and the server
 *    emits an error record with 0 deltas.
 *  - AC-2 happy path: contextual follow-up retains the nonce, every captured
 *    outgoing body keeps itemIds unique, the public hook surface is intact,
 *    and the scoped live-chat compiler exits 0.
 */
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, test } from 'vitest';

import { resolveLiveChatConfig } from '../../../apps/example/lib/live-chat-config';
import { type BackendRecord, launchOwnedBackend, type OwnedBackendHandle } from './live-backend';

const WORKTREE_ROOT = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const EVIDENCE_DIR = join(WORKTREE_ROOT, '.tmp', 'FIX-ORI-AI-001-1');
const HOOK_SOURCE = join(WORKTREE_ROOT, 'apps/example/lib/use-live-chat.ts');
const BACKEND_PORT = 4021;

/** Structural surface of a UIMessage as this driver reads it. */
interface ChatMessage {
  readonly id: string;
  readonly role: string;
  readonly parts: ReadonlyArray<object>;
}

/** Structural surface of the headless `Chat` class from @ai-sdk/react. */
interface ChatInstance {
  sendMessage(input: { readonly text: string }): unknown;
  stop(): void;
  regenerate(): void;
  clearError(): void;
  readonly status: string;
  readonly error: Error | undefined;
  readonly messages: ReadonlyArray<ChatMessage>;
}

type ChatFactory = new (init: { readonly transport: object }) => ChatInstance;

/** Structural surface of the `prepareSendMessagesRequest` transport seam. */
type PrepareSendMessagesRequestSurface = (options: {
  readonly id: string;
  readonly messages: ChatMessage[];
  readonly trigger: string;
  readonly messageId: string | undefined;
  readonly body: Record<string, unknown>;
}) => { readonly body: object };

type DefaultChatTransportFactory = new (init: {
  readonly api: string;
  readonly fetch: typeof fetch;
  readonly prepareSendMessagesRequest?: PrepareSendMessagesRequestSurface;
}) => object;

interface AiSurface {
  readonly DefaultChatTransport: DefaultChatTransportFactory;
}

interface ReactSurface {
  readonly Chat: ChatFactory;
}

/** Structural surface of the hook module this driver consumes. */
interface HookSurface {
  readonly createRetry: (clearError: () => void, regenerate: () => unknown) => () => void;
  readonly prepareSanitizedSendMessagesRequest?: PrepareSendMessagesRequestSurface;
  readonly useLiveChat: () => unknown;
  readonly chatFetch: typeof fetch;
}

/** A sanitized summary of one message in a captured outgoing request body. */
interface OutgoingMessage {
  readonly id: string;
  readonly role: string;
  readonly itemIds: string[];
  readonly textLength: number;
  readonly textPreview: string;
}

/** A sanitized summary of one captured outgoing request body. */
interface OutgoingBody {
  readonly trigger: string;
  readonly requestId: string;
  readonly messages: OutgoingMessage[];
}

/** Everything the retry-leg assertions judge, gathered from the real run. */
interface RetryLegOutcome {
  readonly terminalStatus: 'ready' | 'error' | 'timeout';
  readonly retryOrder: ReadonlyArray<'clearError' | 'regenerate'>;
  readonly record: BackendRecord | null;
  readonly regenerateBody: OutgoingBody | null;
  readonly stateBeforeRetry: OutgoingMessage[];
}

const NONCE = `FIX-ORI-AI-001-1:${createHash('sha256')
  .update(`${Date.now()}:${process.pid}`)
  .digest('hex')
  .slice(0, 12)}`;
const SEED_PROMPT = `Remember the nonce ${NONCE}. Repeat it and give three short facts about rain.`;
const ESSAY_PROMPT =
  'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs. Do not summarize, do not decline, and do not stop early.';
const PROBE_PROMPT = 'Reply with the single word pineapple.';
const FOLLOW_UP_PROMPT = 'What nonce did I ask you to remember?';

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function textOfParts(parts: readonly object[]): string {
  let text = '';
  for (const part of parts) {
    if (
      'type' in part &&
      typeof part.type === 'string' &&
      part.type === 'text' &&
      'text' in part &&
      typeof part.text === 'string'
    ) {
      text += part.text;
    }
  }
  return text;
}

function itemIdsOfParts(parts: readonly object[]): string[] {
  const itemIds: string[] = [];
  for (const part of parts) {
    if (!('providerMetadata' in part)) {
      continue;
    }
    const providerMetadata: unknown = part.providerMetadata;
    if (typeof providerMetadata !== 'object' || providerMetadata === null) {
      continue;
    }
    const openai: unknown = (providerMetadata as Record<string, unknown>)['openai'];
    if (typeof openai !== 'object' || openai === null) {
      continue;
    }
    const itemId: unknown = (openai as Record<string, unknown>)['itemId'];
    if (typeof itemId === 'string') {
      itemIds.push(itemId);
    }
  }
  return itemIds;
}

function summarizeMessage(id: string, role: string, parts: readonly object[]): OutgoingMessage {
  const text = textOfParts(parts);
  return {
    id,
    role,
    itemIds: itemIdsOfParts(parts),
    textLength: text.length,
    textPreview: text.slice(0, 60),
  };
}

function duplicateItemIds(messages: ReadonlyArray<{ itemIds: string[] }>): string[] {
  const seen: string[] = [];
  const duplicated: string[] = [];
  for (const message of messages) {
    for (const itemId of message.itemIds) {
      if (seen.includes(itemId)) {
        duplicated.push(itemId);
      } else {
        seen.push(itemId);
      }
    }
  }
  return duplicated;
}

function uniqueItemIds(messages: ReadonlyArray<{ itemIds: string[] }>): string[] {
  return [...new Set(messages.flatMap((message) => message.itemIds))];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function parseWireMessage(value: unknown): OutgoingMessage | null {
  const record = asRecord(value);
  if (record === null) {
    return null;
  }
  const id = record['id'];
  const role = record['role'];
  if (typeof id !== 'string' || typeof role !== 'string') {
    return null;
  }
  const parts = Array.isArray(record['parts']) ? record['parts'] : [];
  return summarizeMessage(id, role, parts);
}

/** Parses a captured outgoing request body into its sanitized summary. */
// fallow-ignore-next-line complexity
function parseOutgoingBody(raw: string): OutgoingBody | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const envelope = asRecord(parsed);
  if (envelope === null || !Array.isArray(envelope['messages'])) {
    return null;
  }
  const messages: OutgoingMessage[] = [];
  for (const value of envelope['messages']) {
    const message = parseWireMessage(value);
    if (message !== null) {
      messages.push(message);
    }
  }
  return {
    trigger: stringOr(envelope['trigger'], 'unknown'),
    requestId: stringOr(envelope['id'], 'unknown'),
    messages,
  };
}

function writeEvidence(name: string, data: unknown): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(join(EVIDENCE_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function sanitizeRecord(record: BackendRecord): Record<string, unknown> {
  return {
    requestId: record.requestId,
    outcome: record.outcome,
    responseId: record.responseId,
    deltaCount: record.deltaCount,
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    totalTokens: record.totalTokens,
    durationMs: record.durationMs,
    errorText: record.errorText,
  };
}

/** The AC-1 problem list — every retry-leg oracle in one collected verdict. */
// fallow-ignore-next-line complexity
function collectRetryProblems(
  outcome: RetryLegOutcome,
  recordsOnRestartedBackend: number,
): string[] {
  const { terminalStatus, retryOrder, record, regenerateBody } = outcome;
  const duplicated = regenerateBody === null ? [] : duplicateItemIds(regenerateBody.messages);
  const probeUserTurns =
    regenerateBody === null
      ? 0
      : regenerateBody.messages.filter(
          (message) => message.role === 'user' && message.textPreview.includes('pineapple'),
        ).length;
  const problems: string[] = [];
  if (terminalStatus !== 'ready') {
    problems.push(`retry terminal status=${terminalStatus} (expected ready)`);
  }
  if (retryOrder.join(',') !== 'clearError,regenerate') {
    problems.push(`retry order=${retryOrder.join(',')} (expected clearError,regenerate)`);
  }
  if (record?.outcome !== 'completed') {
    problems.push(`retry record outcome=${record?.outcome ?? 'none'} (expected completed)`);
  }
  if ((record?.deltaCount ?? 0) < 2) {
    problems.push(`retry record deltaCount=${record?.deltaCount ?? 0} (expected >= 2)`);
  }
  if (typeof record?.responseId !== 'string' || !record.responseId.startsWith('resp_')) {
    problems.push(`retry record responseId=${record?.responseId ?? 'none'} (expected resp_ id)`);
  }
  if (record !== null && (record.totalTokens ?? 0) + (record.inputTokens ?? 0) === 0) {
    problems.push('retry record usage missing (expected provider usage)');
  }
  if (duplicated.length > 0) {
    problems.push(`regenerate payload duplicatedItemIds=${duplicated.length} (expected 0)`);
  }
  if (probeUserTurns !== 1) {
    problems.push(`probe user turns in regenerate payload=${probeUserTurns} (expected exactly 1)`);
  }
  if (recordsOnRestartedBackend !== 1) {
    problems.push(
      `restarted backend records=${recordsOnRestartedBackend} (expected exactly 1 for the retried turn)`,
    );
  }
  return problems;
}

/**
 * Waits until the chat leaves the idle 'ready' status. Without this gate a
 * terminal wait can return the STALE 'ready' from before the turn even
 * started (the Chat sets 'submitted' asynchronously after sendMessage
 * returns), which would make every leg vacuously green.
 */
async function waitForDeparture(chat: ChatInstance, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (chat.status !== 'ready') {
      return true;
    }
    await sleep(50);
  }
  return chat.status !== 'ready';
}

async function waitForTerminalStatus(
  chat: ChatInstance,
  timeoutMs: number,
): Promise<'ready' | 'error' | 'timeout'> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (chat.status === 'ready') {
      return 'ready';
    }
    if (chat.status === 'error') {
      return 'error';
    }
    if (Date.now() > deadline) {
      return 'timeout';
    }
    // Async sleep only: the backend handle parses the server child's stdout
    // via data events, so a synchronous poll would starve record updates.
    await sleep(200);
  }
}

async function waitForRecordBeyond(
  handle: OwnedBackendHandle,
  baseline: number,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (handle.records().length > baseline) {
      return true;
    }
    await sleep(200);
  }
  return handle.records().length > baseline;
}

/**
 * Tracks the owned backend across the endpoint-loss/restart cycle.
 * `restart()` returns a NEW handle (the old child and its parsed records go
 * with it), so every handle is kept for the full-run tallies.
 */
class BackendSession {
  private readonly handles: OwnedBackendHandle[] = [];

  private currentHandle: OwnedBackendHandle;

  constructor(initial: OwnedBackendHandle) {
    this.currentHandle = initial;
    this.handles.push(initial);
  }

  get current(): OwnedBackendHandle {
    return this.currentHandle;
  }

  async stop(): Promise<void> {
    await this.currentHandle.stop();
  }

  async restart(): Promise<void> {
    this.currentHandle = await this.currentHandle.restart();
    this.handles.push(this.currentHandle);
  }

  allRecords(): BackendRecord[] {
    return this.handles.flatMap((handle) => handle.records());
  }

  async stopAll(): Promise<void> {
    for (const handle of this.handles) {
      await handle.stop();
    }
  }
}

// The proof itself is a linear scenario script (seed -> abort -> endpoint
// loss -> retry -> follow-up -> tallies -> surface -> compiler); its branch
// count is the scenario's, same as ORI-RN-004's proof driver.
// fallow-ignore-next-line complexity
test('runRegeneratePayloadProof', async () => {
  const startedAt = new Date().toISOString();
  expect(
    typeof process.env.OPENAI_API_KEY,
    'real-provider prerequisite: OPENAI_API_KEY must reach the server child',
  ).toBe('string');

  const AI_DIST_SPECIFIER: string = '../../../apps/example/node_modules/ai/dist/index.js';
  const REACT_DIST_SPECIFIER: string =
    '../../../apps/example/node_modules/@ai-sdk/react/dist/index.js';
  const [{ DefaultChatTransport }, { Chat }] = await Promise.all([
    import(AI_DIST_SPECIFIER).then((module) => module as AiSurface),
    import(REACT_DIST_SPECIFIER).then((module) => module as ReactSurface),
  ]);

  // Pre-fix, the shipped hook module cannot be imported headlessly: its
  // static `expo/fetch` import resolves only inside Expo/Metro (the module
  // entry requires a source tree the published package does not ship). The
  // RED phase therefore exercises the identical clearError-then-regenerate
  // calls directly on the real Chat, and the transport below is built exactly
  // as the shipped hook builds it (no prepareSendMessagesRequest). Post-fix —
  // the charter-sanctioned lazy expo/fetch import inside chatFetch — the
  // module loads and every hook assertion below runs against the real
  // exports, including the sanitize seam.
  const HOOK_MODULE_SPECIFIER: string = '../../../apps/example/lib/use-live-chat';
  let hookModule: HookSurface | null = null;
  try {
    hookModule = (await import(HOOK_MODULE_SPECIFIER)) as HookSurface;
  } catch {
    hookModule = null;
  }

  // The fix seam: post-fix the hook module exports the prepared-request
  // function its own transport construction uses.
  const sanitizedPrepare = hookModule?.prepareSanitizedSendMessagesRequest;

  const config = resolveLiveChatConfig({
    EXPO_PUBLIC_API_BASE_URL: `http://127.0.0.1:${BACKEND_PORT}`,
  });
  const outgoingBodies: OutgoingBody[] = [];
  const captureFetch: typeof fetch = (input, init) => {
    if (typeof init?.body === 'string') {
      const parsed = parseOutgoingBody(init.body);
      if (parsed !== null) {
        outgoingBodies.push(parsed);
      }
    }
    return globalThis.fetch(input, init);
  };

  const session = new BackendSession(
    await launchOwnedBackend({ port: BACKEND_PORT, maxOutputTokens: 4096 }),
  );
  expect(session.current.started, 'owned backend must be listening').toBe(true);

  // The headless Chat class takes ChatInit (transport-level options); the
  // hook's throttle-50 lives on the react useChat wrapper and has no ChatInit
  // field, so the driver constructs the class with the transport only — the
  // exact seam the fix targets.
  const chat = new Chat({
    transport: new DefaultChatTransport({
      api: config.endpoint ?? '',
      fetch: captureFetch,
      ...(sanitizedPrepare !== undefined ? { prepareSendMessagesRequest: sanitizedPrepare } : {}),
    }),
  });

  const sendTurn = async (text: string): Promise<'ready' | 'error' | 'timeout'> => {
    chat.sendMessage({ text });
    await waitForDeparture(chat, 15_000);
    return waitForTerminalStatus(chat, 120_000);
  };

  const evidence: Record<string, unknown> = {
    runId: `fix-ori-ai-001-1-${Date.now().toString(36)}`,
    startedAt,
    nonce: NONCE,
    backendPort: BACKEND_PORT,
    sourceSha256: {
      hook: sha256File(HOOK_SOURCE),
      driver: sha256File(fileURLToPath(new URL(import.meta.url))),
    },
    sanitizedTransportSeamActive: sanitizedPrepare !== undefined,
  };

  try {
    // ---- Leg 1: nonce seed turn (the fresh-session happy path). ----
    const seedStatus = await sendTurn(SEED_PROMPT);
    expect(seedStatus, `seed turn status: ${seedStatus}`).toBe('ready');

    // ---- Leg 2: aborted long turn (stop mid-stream). ----
    chat.sendMessage({ text: ESSAY_PROMPT });
    await sleep(1500);
    chat.stop();
    const abortStatus = await waitForTerminalStatus(chat, 30_000);
    expect(abortStatus, `aborted turn status: ${abortStatus}`).toBe('ready');

    // ---- Leg 3: owned-endpoint loss on the probe submission. ----
    await session.stop();
    chat.sendMessage({ text: PROBE_PROMPT });
    await waitForDeparture(chat, 15_000);
    const lossStatus = await waitForTerminalStatus(chat, 30_000);
    expect(lossStatus, `endpoint-loss turn status: ${lossStatus}`).toBe('error');
    expect(chat.error, 'endpoint loss must surface a client-side error').toBeDefined();
    const endpointLossErrorText = chat.error?.message ?? null;

    // ---- Leg 4: restart the same owned endpoint, then the hook's retry. ----
    await session.restart();
    expect(session.current.started, 'restarted owned backend must be listening').toBe(true);

    const stateBeforeRetry = chat.messages.map((message) =>
      summarizeMessage(message.id, message.role, message.parts),
    );

    const retryOrder: Array<'clearError' | 'regenerate'> = [];
    const clearError = (): void => {
      retryOrder.push('clearError');
      chat.clearError();
    };
    const regenerate = (): void => {
      retryOrder.push('regenerate');
      chat.regenerate();
    };
    if (hookModule !== null) {
      hookModule.createRetry(clearError, regenerate)();
    } else {
      clearError();
      regenerate();
    }

    await waitForDeparture(chat, 15_000);
    const retryStatus = await waitForTerminalStatus(chat, 120_000);
    // Sanitized records emit only at stream termination (server finally
    // block), which can lag the client's terminal status — await the record.
    await waitForRecordBeyond(session.current, 0, 30_000);
    const restartedRecordCount = session.current.records().length;
    const retryRecord = session.current.records().at(-1) ?? null;
    const retryBody =
      [...outgoingBodies].reverse().find((body) => body.trigger === 'regenerate-message') ?? null;

    writeEvidence('retry-recovery.json', {
      ...evidence,
      leg: 'endpoint-loss-retry',
      endpointLoss: {
        clientStatus: lossStatus,
        clientErrorText: endpointLossErrorText,
      },
      retry: {
        retryOrder,
        terminalStatus: retryStatus,
        record: retryRecord === null ? null : sanitizeRecord(retryRecord),
        regenerateBody: retryBody,
        duplicatedItemIds: retryBody === null ? [] : duplicateItemIds(retryBody.messages),
        probeUserTurns:
          retryBody === null
            ? 0
            : retryBody.messages.filter(
                (message) => message.role === 'user' && message.textPreview.includes('pineapple'),
              ).length,
      },
    });

    const retryOutcome: RetryLegOutcome = {
      terminalStatus: retryStatus,
      retryOrder,
      record: retryRecord,
      regenerateBody: retryBody,
      stateBeforeRetry,
    };

    // AC-1 PRIMARY assertion. Pre-fix this fails functionally on the real
    // stack: the provider rejects the stale-itemId payload and the server
    // records an error outcome with 0 deltas.
    expect(
      collectRetryProblems(retryOutcome, restartedRecordCount),
      `AC-1 retry recovery failed on the real stack. Observed server record: ${JSON.stringify(
        retryRecord === null ? null : sanitizeRecord(retryRecord),
      )}; terminal status: ${retryStatus}`,
    ).toEqual([]);

    // The retry is a NEW server-side request for the retained turn: its
    // request id is real and its provider correlation is fresh.
    expect(typeof retryRecord?.requestId).toBe('string');
    expect(retryRecord?.requestId ?? '').not.toBe('');

    // The sanitize never invents itemIds and keeps legitimate unique ones:
    // every outgoing itemId must come from the pre-retry state (the stale
    // unfinished-stream one is stripped, its text sent as content instead).
    const stateItemIds = new Set(uniqueItemIds(stateBeforeRetry));
    const outgoingItemIds = uniqueItemIds(retryBody?.messages ?? []);
    expect(outgoingItemIds.length, 'retained valid itemIds').toBeGreaterThan(0);
    for (const itemId of outgoingItemIds) {
      expect(stateItemIds.has(itemId), `outgoing itemId ${itemId} must not be invented`).toBe(true);
    }

    // ---- Leg 5: SDK-history contextual follow-up (nonce retention). ----
    const followUpBaseline = session.current.records().length;
    const followUpStatus = await sendTurn(FOLLOW_UP_PROMPT);
    await waitForRecordBeyond(session.current, followUpBaseline, 30_000);
    const followUpRecord = session.current.records().at(-1) ?? null;
    const followUpAnswer = [...chat.messages]
      .reverse()
      .find((message) => message.role === 'assistant');
    const followUpText = followUpAnswer === undefined ? '' : textOfParts(followUpAnswer.parts);
    const followUpProblems: string[] = [];
    if (followUpStatus !== 'ready') {
      followUpProblems.push(`follow-up status=${followUpStatus} (expected ready)`);
    }
    if (followUpRecord?.outcome !== 'completed') {
      followUpProblems.push(
        `follow-up record outcome=${followUpRecord?.outcome ?? 'none'} (expected completed)`,
      );
    }
    if (!followUpText.includes(NONCE)) {
      followUpProblems.push('follow-up answer lost the nonce (expected literal nonce retention)');
    }

    writeEvidence('happy-path.json', {
      ...evidence,
      leg: 'contextual-follow-up',
      followUp: {
        status: followUpStatus,
        record: followUpRecord === null ? null : sanitizeRecord(followUpRecord),
        answerContainsNonce: followUpText.includes(NONCE),
        answerTextLength: followUpText.length,
      },
    });

    expect(
      followUpProblems,
      `AC-2 happy path failed on the real stack. Observed record: ${JSON.stringify(
        followUpRecord === null ? null : sanitizeRecord(followUpRecord),
      )}; answer contains nonce: ${followUpText.includes(NONCE)}`,
    ).toEqual([]);

    // ---- Full-run tallies over the sanitized server records. ----
    const allRecords = session.allRecords();
    const completedRecords = allRecords.filter((record) => record.outcome === 'completed');
    const responseIds = completedRecords
      .map((record) => record.responseId)
      .filter((id): id is string => typeof id === 'string');

    writeEvidence('payload-bodies.json', {
      ...evidence,
      capturedBodies: outgoingBodies.map((body) => ({
        trigger: body.trigger,
        requestId: body.requestId,
        messageCount: body.messages.length,
        uniqueItemIds: uniqueItemIds(body.messages),
        duplicatedItemIds: duplicateItemIds(body.messages),
        messages: body.messages,
      })),
      records: allRecords.map((record) => sanitizeRecord(record)),
    });

    // AC-2: exactly 3 completed records (fresh nonce turn, post-retry
    // regenerated turn, contextual follow-up) with 3 distinct response ids,
    // the aborted essay as the only other outcome, and 0 duplicated itemIds
    // in every captured outgoing body.
    expect(completedRecords.length, 'completed record tally').toBe(3);
    expect(new Set(responseIds).size, 'distinct provider response ids').toBe(3);
    expect(allRecords.filter((r) => r.outcome === 'aborted').length, 'aborted tally').toBe(1);
    expect(allRecords.filter((r) => r.outcome === 'error').length, 'error tally').toBe(0);
    for (const body of outgoingBodies) {
      expect(
        duplicateItemIds(body.messages),
        `outgoing body (trigger=${body.trigger}) must carry 0 duplicated itemIds`,
      ).toEqual([]);
    }

    // ---- Public hook contract intact (ORI-AI-001 AC-4 surface). ----
    if (hookModule === null) {
      throw new Error(
        'hook module failed to import headlessly — post-fix it must load via the lazy expo/fetch enabler',
      );
    }
    expect(typeof hookModule.useLiveChat).toBe('function');
    expect(typeof hookModule.chatFetch).toBe('function');
    expect(typeof hookModule.createRetry).toBe('function');
    expect(typeof hookModule.prepareSanitizedSendMessagesRequest).toBe('function');
    expect(config.ok, 'transport config must validate').toBe(true);
    expect(config.endpoint).toBe(`http://127.0.0.1:${BACKEND_PORT}/api/chat`);

    // ---- Scoped live-chat compiler (credential-free child). ----
    const execFileAsync = promisify(execFile);
    const compilerEnv: NodeJS.ProcessEnv = { ...process.env };
    delete compilerEnv.OPENAI_API_KEY;
    let compilerExit = 0;
    let compilerOutput = '';
    try {
      const compiled = await execFileAsync(
        'pnpm',
        ['--dir', 'apps/example', 'exec', 'tsc', '--noEmit', '-p', 'tsconfig.live-chat.json'],
        { cwd: WORKTREE_ROOT, env: compilerEnv, timeout: 240_000, encoding: 'utf8' },
      );
      compilerOutput = `${compiled.stdout}${compiled.stderr}`.slice(-2000);
    } catch (error) {
      compilerExit = 1;
      const failure = error as { stdout?: string; stderr?: string; message?: string };
      compilerOutput =
        `${failure.stdout ?? ''}${failure.stderr ?? ''}${failure.message ?? ''}`.slice(-2000);
    }
    writeEvidence('scoped-compiler.json', { ...evidence, compilerExit, compilerOutput });
    expect(compilerExit, `scoped live-chat compiler must exit 0: ${compilerOutput}`).toBe(0);
  } finally {
    chat.stop();
    await session.stopAll();
    writeEvidence('run.json', {
      ...evidence,
      finishedAt: new Date().toISOString(),
      records: session.allRecords().map((record) => sanitizeRecord(record)),
    });
  }
}, 600_000);
