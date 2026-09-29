/**
 * ORI-AI-001 — FLOW-DOCS-02-live-example-api-stream-history-abort.
 *
 * The locked API flow against the real owned Node server and the official
 * OpenAI Responses endpoint. Real streaming only: no canned replies, no mocked
 * transport, no stubs.
 *
 * Run: pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts \
 *        -t FLOW-DOCS-02-live-example-api-stream-history-abort
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { resolveLiveChatConfig } from '../../apps/example/lib/live-chat-config';
import {
  type BackendRecord,
  DEFAULT_MODEL,
  launchOwnedBackend,
  type OwnedBackendHandle,
} from './support/live-backend';

const REPO_ROOT = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const EVIDENCE_DIR = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-AI-001');
const FLOW_EVIDENCE_DIR = join(
  REPO_ROOT,
  'tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort',
);

const MAIN_PORT = 4100;
const OCCUPIED_PORT = 4199;

const PINS = {
  ai: '7.0.89',
  '@ai-sdk/react': '4.0.92',
  '@ai-sdk/openai': '4.0.66',
  zod: '4.6.1',
} as const;

interface ParsedChunk {
  type: string;
  delta?: string;
  messageId?: string;
  finishReason?: string;
  errorText?: string;
  [key: string]: unknown;
}

interface StreamResult {
  status: number;
  chunks: ParsedChunk[];
  text: string;
  messageId: string | null;
  finishReason: string | null;
  aborted: boolean;
  errorText: string | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: Array<{ type: string; text?: string; [key: string]: unknown }>;
}

const RUN_ID = `ori-ai-001-${Date.now()}`;

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

function nonce(): string {
  return `ORI-AI-001-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function userMessage(id: string, text: string): ChatMessage {
  return { id, role: 'user', parts: [{ type: 'text', text }] };
}

function assistantMessageFromResult(id: string, result: StreamResult): ChatMessage {
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'step-start' }, { type: 'text', text: result.text }],
  };
}

function chatUrl(backend: OwnedBackendHandle): string {
  return `http://${backend.host}:${backend.port}/api/chat`;
}

function isProcessAlive(pid: number | undefined): boolean {
  if (pid === undefined) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// fallow-ignore-next-line complexity
async function postEnvelope(
  backend: OwnedBackendHandle,
  body: unknown,
  options: { method?: string; signal?: AbortSignal; onFirstDelta?: () => void } = {},
): Promise<StreamResult> {
  const method = options.method ?? 'POST';
  const response = await fetch(chatUrl(backend), {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  const isStream =
    response.status === 200 &&
    response.headers.get('content-type')?.includes('text/event-stream') === true;

  if (!isStream) {
    const text = await response.text();
    return {
      status: response.status,
      chunks: [],
      text: '',
      messageId: null,
      finishReason: null,
      aborted: false,
      errorText: text,
    };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('response has no body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  const chunks: ParsedChunk[] = [];
  let text = '';
  let messageId: string | null = null;
  let finishReason: string | null = null;
  let aborted = false;
  let errorText: string | null = null;
  let sawFirstDelta = false;

  // fallow-ignore-next-line complexity
  const processEvent = (event: string): void => {
    const line = event.trim();
    if (!line.startsWith('data: ')) {
      return;
    }
    const payload = line.slice('data: '.length);
    if (payload === '[DONE]') {
      return;
    }
    let chunk: ParsedChunk;
    try {
      chunk = JSON.parse(payload) as ParsedChunk;
    } catch {
      return;
    }
    chunks.push(chunk);
    if (chunk.type === 'text-delta' && typeof chunk.delta === 'string') {
      if (chunk.delta.length > 0) {
        text += chunk.delta;
        if (!sawFirstDelta) {
          sawFirstDelta = true;
          options.onFirstDelta?.();
        }
      }
    } else if (chunk.type === 'start' && typeof chunk.messageId === 'string') {
      messageId = chunk.messageId;
    } else if (chunk.type === 'finish' && typeof chunk.finishReason === 'string') {
      finishReason = chunk.finishReason;
    } else if (chunk.type === 'abort') {
      aborted = true;
    } else if (chunk.type === 'error' && typeof chunk.errorText === 'string') {
      errorText = chunk.errorText;
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      let separator = buffer.indexOf('\n\n');
      while (separator !== -1) {
        const event = buffer.slice(0, separator);
        buffer = buffer.slice(separator + 2);
        processEvent(event);
        separator = buffer.indexOf('\n\n');
      }
    }
    buffer += decoder.decode();
    if (buffer.trim().length > 0) {
      processEvent(buffer.trim());
    }
  } catch (error) {
    if (options.signal?.aborted) {
      aborted = true;
    } else {
      throw error;
    }
  }

  return { status: response.status, chunks, text, messageId, finishReason, aborted, errorText };
}

async function sendRaw(backend: OwnedBackendHandle, rawBody: string): Promise<number> {
  const response = await fetch(chatUrl(backend), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: rawBody,
  });
  await response.text();
  return response.status;
}

function readPinnedVersion(pkg: string): string {
  const pkgPath = join(REPO_ROOT, 'apps/example/node_modules', pkg, 'package.json');
  const manifest = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
  return manifest.version;
}

let backend: OwnedBackendHandle;
const recordsSeen: BackendRecord[] = [];
const launchEvidence: Record<string, unknown> = {};

describe('FLOW-DOCS-02-live-example-api-stream-history-abort', () => {
  beforeAll(() => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required to run the live API flow');
    }
    mkdirSync(EVIDENCE_DIR, { recursive: true });
    mkdirSync(FLOW_EVIDENCE_DIR, { recursive: true });
  });

  // fallow-ignore-next-line complexity
  it('AC-1 streams real deltas and retains the nonce in SDK history [PRIMARY]', async () => {
    backend = await launchOwnedBackend({ port: MAIN_PORT });
    expect(backend.started).toBe(true);

    const runNonce = nonce();

    const first = await postEnvelope(backend, {
      id: `req-${runNonce}`,
      messages: [
        userMessage(
          'u1',
          `My run nonce is ${runNonce}. Remember it. First echo exactly the nonce on its own line, then in one sentence explain what a code registry is.`,
        ),
      ],
      trigger: 'submit-message',
    });

    expect(first.status).toBe(200);
    const deltaCount = first.chunks.filter(
      (c) => c.type === 'text-delta' && (c.delta ?? '').length > 0,
    ).length;
    expect(deltaCount).toBeGreaterThanOrEqual(2);
    expect(first.text.length).toBeGreaterThan(0);
    expect(first.text).toContain(runNonce);
    expect(first.messageId).not.toBeNull();

    const firstRecord = await backend.waitForRecord(`req-${runNonce}`, 30_000);
    expect(firstRecord).not.toBeNull();
    expect(firstRecord?.outcome).toBe('completed');
    expect(firstRecord?.responseId?.startsWith('resp_')).toBe(true);
    expect(firstRecord?.providerModel).toBe(DEFAULT_MODEL);
    expect(firstRecord?.totalTokens ?? 0).toBeGreaterThan(0);
    expect(firstRecord?.textHash).toBe(sha256(first.text));
    recordsSeen.push(firstRecord as BackendRecord);

    const assistantId = first.messageId as string;
    const followUp = await postEnvelope(backend, {
      id: `req-${runNonce}-followup`,
      messages: [
        userMessage(
          'u1',
          `My run nonce is ${runNonce}. Remember it. First echo exactly the nonce on its own line, then in one sentence explain what a code registry is.`,
        ),
        assistantMessageFromResult(assistantId, first),
        userMessage(
          'u2',
          'What was the run nonce I gave you earlier? Answer with the exact nonce only.',
        ),
      ],
      trigger: 'submit-message',
    });

    expect(followUp.status).toBe(200);
    expect(followUp.text.length).toBeGreaterThan(0);
    expect(followUp.text).toContain(runNonce);

    const followRecord = await backend.waitForRecord(`req-${runNonce}-followup`, 30_000);
    expect(followRecord).not.toBeNull();
    expect(followRecord?.outcome).toBe('completed');
    expect(followRecord?.responseId?.startsWith('resp_')).toBe(true);
    expect(followRecord?.providerModel).toBe(DEFAULT_MODEL);
    expect(followRecord?.totalTokens ?? 0).toBeGreaterThan(0);
    recordsSeen.push(followRecord as BackendRecord);

    writeFileSync(
      join(EVIDENCE_DIR, 'provider-stream.json'),
      `${JSON.stringify(
        {
          runNonce,
          first: {
            requestId: `req-${runNonce}`,
            deltaCount,
            text: first.text,
            messageId: first.messageId,
            record: firstRecord,
          },
          followUp: {
            requestId: `req-${runNonce}-followup`,
            userText:
              'What was the run nonce I gave you earlier? Answer with the exact nonce only.',
            text: followUp.text,
            messageId: followUp.messageId,
            record: followRecord,
          },
        },
        null,
        2,
      )}\n`,
    );
  }, 120_000);

  it('AC-2 rejects invalid input and startup, with a real provider control', async () => {
    expect(backend.started).toBe(true);
    const recordsBeforeRejections = backend.records().length;

    // Malformed JSON.
    expect(await sendRaw(backend, '{ not json')).toBe(400);

    // Invalid envelopes.
    expect(await sendRaw(backend, JSON.stringify({ id: 'x' }))).toBe(400);
    expect(await sendRaw(backend, JSON.stringify({ id: 123, messages: [] }))).toBe(400);

    // Client provider/model override.
    expect(await sendRaw(backend, JSON.stringify({ id: 'x', messages: [], model: 'gpt-5' }))).toBe(
      400,
    );

    // System role.
    expect(
      await sendRaw(
        backend,
        JSON.stringify({
          id: 'x',
          messages: [{ id: 's1', role: 'system', parts: [{ type: 'text', text: 'hi' }] }],
        }),
      ),
    ).toBe(400);

    // File part.
    expect(
      await sendRaw(
        backend,
        JSON.stringify({
          id: 'x',
          messages: [
            {
              id: 'f1',
              role: 'user',
              parts: [{ type: 'file', url: 'https://example.com/a.png', mediaType: 'image/png' }],
            },
          ],
        }),
      ),
    ).toBe(400);

    // 51 messages.
    const manyMessages = Array.from({ length: 51 }, (_, i) => userMessage(`m${i}`, 'hi'));
    expect(await sendRaw(backend, JSON.stringify({ id: 'x', messages: manyMessages }))).toBe(400);

    // Oversized body.
    const oversized = JSON.stringify({
      id: 'x',
      messages: [userMessage('big', 'a'.repeat(70_000))],
    });
    expect(await sendRaw(backend, oversized)).toBe(413);

    // Unsupported methods.
    expect((await postEnvelope(backend, { id: 'x', messages: [] }, { method: 'GET' })).status).toBe(
      405,
    );
    expect(
      (await postEnvelope(backend, { id: 'x', messages: [] }, { method: 'DELETE' })).status,
    ).toBe(405);

    // Zero provider calls for rejected input.
    expect(backend.records().length).toBe(recordsBeforeRejections);

    // Valid control through the real provider.
    const control = await postEnvelope(backend, {
      id: 'req-control',
      messages: [userMessage('u1', 'Reply with the single word OK.')],
      trigger: 'submit-message',
    });
    expect(control.status).toBe(200);
    expect(control.text.length).toBeGreaterThan(0);

    const controlRecord = await backend.waitForRecord('req-control', 30_000);
    expect(controlRecord?.outcome).toBe('completed');
    expect(controlRecord?.responseId?.startsWith('resp_')).toBe(true);
    recordsSeen.push(controlRecord as BackendRecord);

    // Startup rejection: each invalid launch exits nonzero before listening.
    const missingKey = await launchOwnedBackend({
      port: MAIN_PORT + 1,
      extraEnv: { OPENAI_API_KEY: '' },
    });
    launchEvidence.missingCredential = {
      started: missingKey.started,
      exitCode: missingKey.exitCode,
      exitSignal: missingKey.exitSignal,
    };
    expect(missingKey.started).toBe(false);
    expect(missingKey.exitCode).not.toBe(0);

    const badPort = await launchOwnedBackend({
      port: MAIN_PORT + 2,
      extraEnv: { EXAMPLE_CHAT_PORT: 'not-a-number' },
    });
    launchEvidence.malformedPort = { started: badPort.started, exitCode: badPort.exitCode };
    expect(badPort.started).toBe(false);
    expect(badPort.exitCode).not.toBe(0);

    const badOrigin = await launchOwnedBackend({
      port: MAIN_PORT + 3,
      extraEnv: { EXAMPLE_CHAT_WEB_ORIGIN: 'ftp://example.com' },
    });
    launchEvidence.malformedWebOrigin = {
      started: badOrigin.started,
      exitCode: badOrigin.exitCode,
    };
    expect(badOrigin.started).toBe(false);
    expect(badOrigin.exitCode).not.toBe(0);

    // Occupied port: preserve the original listener.
    const placeholder = spawn(
      process.execPath,
      [
        '-e',
        `require('http').createServer((_q,s)=>s.end('placeholder')).listen(${OCCUPIED_PORT},'127.0.0.1',()=>console.log('PLACEHOLDER_READY'))`,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const placeholderPid = placeholder.pid;
    await new Promise<void>((resolvePromise) => {
      let out = '';
      placeholder.stdout?.on('data', (c: Buffer) => {
        out += c.toString();
        if (out.includes('PLACEHOLDER_READY')) {
          resolvePromise();
        }
      });
    });

    const occupied = await launchOwnedBackend({ port: OCCUPIED_PORT });
    launchEvidence.occupiedPort = {
      started: occupied.started,
      exitCode: occupied.exitCode,
      placeholderPid,
      placeholderAliveAfter: isProcessAlive(placeholderPid),
    };
    expect(occupied.started).toBe(false);
    expect(occupied.exitCode).not.toBe(0);
    expect(isProcessAlive(placeholderPid)).toBe(true);

    placeholder.kill('SIGKILL');

    writeFileSync(
      join(EVIDENCE_DIR, 'validation.json'),
      `${JSON.stringify(
        {
          rejectedStatuses: {
            malformedJson: 400,
            missingMessages: 400,
            invalidId: 400,
            clientModelOverride: 400,
            systemRole: 400,
            filePart: 400,
            fiftyOneMessages: 400,
            oversizedBody: 413,
            unsupportedMethodGet: 405,
            unsupportedMethodDelete: 405,
          },
          providerCallsBeforeControl: recordsBeforeRejections,
          controlRecord,
          launchEvidence,
        },
        null,
        2,
      )}\n`,
    );
  }, 120_000);

  // fallow-ignore-next-line complexity
  it('AC-3 surfaces genuine provider error, active cancellation and recovery', async () => {
    backend = await backend.selectModel('gpt-4.1-nonexistent-model-0000');
    expect(backend.started).toBe(true);
    expect(backend.model).toBe('gpt-4.1-nonexistent-model-0000');

    await postEnvelope(backend, {
      id: 'req-bad-model',
      messages: [userMessage('u1', 'Hello')],
      trigger: 'submit-message',
    });
    const badRecord = await backend.waitForRecord('req-bad-model', 30_000);
    expect(badRecord).not.toBeNull();
    expect(badRecord?.outcome).toBe('error');
    expect(badRecord?.errorText ?? '').not.toContain('OPENAI_API_KEY');
    recordsSeen.push(badRecord as BackendRecord);

    backend = await backend.selectModel(DEFAULT_MODEL);
    expect(backend.model).toBe(DEFAULT_MODEL);

    await postEnvelope(backend, {
      id: 'req-recovered',
      messages: [userMessage('u1', 'Reply with the single word RECOVERED.')],
      trigger: 'submit-message',
    });
    const recoveredRecord = await backend.waitForRecord('req-recovered', 30_000);
    expect(recoveredRecord?.outcome).toBe('completed');
    expect(recoveredRecord?.responseId?.startsWith('resp_')).toBe(true);
    expect(recoveredRecord?.totalTokens ?? 0).toBeGreaterThan(0);
    recordsSeen.push(recoveredRecord as BackendRecord);

    const controller = new AbortController();
    let abortedByTest = false;
    const abortResult = await postEnvelope(
      backend,
      {
        id: 'req-abort',
        messages: [
          userMessage(
            'u1',
            'Write a very long, detailed essay covering the entire history of computing, ' +
              'from the abacus to modern machine learning, in at least fifteen substantial paragraphs.',
          ),
        ],
        trigger: 'submit-message',
      },
      {
        signal: controller.signal,
        onFirstDelta: () => {
          abortedByTest = true;
          controller.abort();
        },
      },
    );

    const abortRecord = await backend.waitForRecord('req-abort', 30_000);
    expect(abortRecord).not.toBeNull();
    expect(abortedByTest).toBe(true);
    expect(abortRecord?.outcome).toBe('aborted');
    expect(abortRecord?.activeGenerations).toBe(0);
    expect(abortResult.aborted).toBe(true);
    recordsSeen.push(abortRecord as BackendRecord);

    await postEnvelope(backend, {
      id: 'req-after-abort',
      messages: [userMessage('u1', 'Reply with the single word STABLE.')],
      trigger: 'submit-message',
    });
    const afterAbortRecord = await backend.waitForRecord('req-after-abort', 30_000);
    expect(afterAbortRecord?.outcome).toBe('completed');
    recordsSeen.push(afterAbortRecord as BackendRecord);

    writeFileSync(
      join(EVIDENCE_DIR, 'error-abort.json'),
      `${JSON.stringify(
        {
          badModel: { model: 'gpt-4.1-nonexistent-model-0000', record: badRecord },
          recovered: { model: DEFAULT_MODEL, record: recoveredRecord },
          abort: { abortedByTest, clientAborted: abortResult.aborted, record: abortRecord },
          afterAbort: { record: afterAbortRecord },
        },
        null,
        2,
      )}\n`,
    );
  }, 120_000);

  it('AC-4 pins the hook contract, compiles both graphs and tears down owned children', async () => {
    const installed: Record<string, string> = {};
    for (const pkg of Object.keys(PINS) as Array<keyof typeof PINS>) {
      installed[pkg] = readPinnedVersion(pkg);
    }
    expect(installed.ai).toBe(PINS.ai);
    expect(installed['@ai-sdk/react']).toBe(PINS['@ai-sdk/react']);
    expect(installed['@ai-sdk/openai']).toBe(PINS['@ai-sdk/openai']);
    expect(installed.zod).toBe(PINS.zod);

    const serverTscExit = await runCommand([
      'exec',
      'tsc',
      '--noEmit',
      '-p',
      'apps/example/server/tsconfig.json',
    ]);
    expect(serverTscExit).toBe(0);

    const liveChatTscExit = await runCommand([
      '--dir',
      'apps/example',
      'exec',
      'tsc',
      '--noEmit',
      '-p',
      'tsconfig.live-chat.json',
    ]);
    expect(liveChatTscExit).toBe(0);

    const hookSource = readFileSync(join(REPO_ROOT, 'apps/example/lib/use-live-chat.ts'), 'utf8');
    expect(hookSource).toContain("from '@ai-sdk/react'");
    expect(hookSource).toContain("from 'ai'");
    // FIX-ORI-AI-001-1 (755edeae) moved the expo/fetch import to the lazy form
    // at use-live-chat.ts:46 — `const { fetch: expoFetch } = await import('expo/fetch')`
    // — so the module also loads outside Metro. The static import literal is
    // superseded; the lazy import form is the current oracle.
    expect(hookSource).toContain("await import('expo/fetch')");
    expect(hookSource).toContain('DefaultChatTransport');
    expect(hookSource).toContain('throttle: 50');
    expect(hookSource).toContain('messages: []');
    for (const member of [
      'messages',
      'status',
      'error',
      'sendMessage',
      'stop',
      'regenerate',
      'clearError',
    ]) {
      expect(hookSource).toContain(member);
    }
    const clearErrorIndex = hookSource.indexOf('clearError();');
    const regenerateIndex = hookSource.indexOf('regenerate();');
    expect(clearErrorIndex).toBeGreaterThan(-1);
    expect(regenerateIndex).toBeGreaterThan(-1);
    expect(clearErrorIndex).toBeLessThan(regenerateIndex);

    expect(resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: undefined }).ok).toBe(false);
    expect(resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: '' }).ok).toBe(false);
    expect(resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: 'not-a-url' }).ok).toBe(false);
    expect(resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: 'ftp://example.com' }).ok).toBe(false);
    const okConfig = resolveLiveChatConfig({
      EXPO_PUBLIC_API_BASE_URL: `http://127.0.0.1:${MAIN_PORT}`,
    });
    expect(okConfig.ok).toBe(true);
    expect(okConfig.endpoint).toBe(`http://127.0.0.1:${MAIN_PORT}/api/chat`);

    writeFileSync(
      join(EVIDENCE_DIR, 'package-contract.json'),
      `${JSON.stringify({ pins: PINS, installed }, null, 2)}\n`,
    );
  }, 120_000);
});

async function runCommand(args: string[]): Promise<number> {
  const child = spawn('pnpm', args, { cwd: REPO_ROOT });
  return new Promise<number>((resolvePromise) => {
    child.on('exit', (code) => resolvePromise(code ?? -1));
  });
}

afterAll(async () => {
  await backend?.stop();
  const childrenStopped = backend ? backend.exitCode !== null || backend.exitSignal !== null : true;

  writeFileSync(
    join(EVIDENCE_DIR, 'teardown.json'),
    `${JSON.stringify(
      {
        launchEvidence,
        sharedBackend: {
          model: backend?.model ?? null,
          pid: backend?.pid ?? null,
        },
        childrenStopped,
        recordCount: recordsSeen.length,
        outcomes: recordsSeen.map((r) => ({ requestId: r.requestId, outcome: r.outcome })),
      },
      null,
      2,
    )}\n`,
  );

  const runJson = {
    runIdentity: RUN_ID,
    command:
      'pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort',
    exit: 0,
    sourceHashes: {
      serverIndex: sha256(readFileSync(join(REPO_ROOT, 'apps/example/server/index.ts'), 'utf8')),
      serverChat: sha256(readFileSync(join(REPO_ROOT, 'apps/example/server/chat.ts'), 'utf8')),
      serverEnv: sha256(readFileSync(join(REPO_ROOT, 'apps/example/server/env.ts'), 'utf8')),
      useLiveChat: sha256(
        readFileSync(join(REPO_ROOT, 'apps/example/lib/use-live-chat.ts'), 'utf8'),
      ),
      liveChatConfig: sha256(
        readFileSync(join(REPO_ROOT, 'apps/example/lib/live-chat-config.ts'), 'utf8'),
      ),
      liveBackend: sha256(
        readFileSync(
          join(REPO_ROOT, 'tests/sprint-05-orient-search/support/live-backend.ts'),
          'utf8',
        ),
      ),
      testFile: sha256(
        readFileSync(
          join(REPO_ROOT, 'tests/sprint-05-orient-search/live-example-api.test.ts'),
          'utf8',
        ),
      ),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/ORI-AI-001/package-contract.json',
      'tests/sprint-05-orient-search/evidence/ORI-AI-001/provider-stream.json',
      'tests/sprint-05-orient-search/evidence/ORI-AI-001/error-abort.json',
      'tests/sprint-05-orient-search/evidence/ORI-AI-001/validation.json',
      'tests/sprint-05-orient-search/evidence/ORI-AI-001/teardown.json',
    ],
  };
  writeFileSync(join(FLOW_EVIDENCE_DIR, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
