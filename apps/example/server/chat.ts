// fallow-ignore-file unused-file
import { createHash } from 'node:crypto';
import type { ServerResponse } from 'node:http';

import { createOpenAI } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  generateId,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

import type { ServerConfig } from './env';

/**
 * System prompt for the worked-example backend. The consumer never supplies
 * instructions; this stays server-side and out of the client graph.
 */
// fallow-ignore-next-line unused-export
export const CHAT_INSTRUCTIONS =
  'You are a concise, helpful assistant for the rnr-ai-elements worked example. ' +
  'Answer directly and preserve any nonce or identifier the user gives you.';

/** Prefix for the single sanitized JSON record emitted per request on stdout. */
// fallow-ignore-next-line unused-export
export const RECORD_PREFIX = 'ORI_AI_001_RECORD ';

// fallow-ignore-next-line unused-export
export const MAX_MESSAGES = 50;
// fallow-ignore-next-line unused-export
export const MAX_BODY_BYTES = 65_536;

/** Client-supplied provider/model override keys are rejected before any call. */
const FORBIDDEN_ENVELOPE_KEYS = ['model', 'provider', 'providerOptions'] as const;

/** Part types accepted from user/assistant turns (text + SDK structural parts). */
const ALLOWED_PART_TYPES = new Set(['text', 'step-start', 'reasoning']);

export interface ChatEnvelope {
  readonly id: string;
  readonly messages: unknown[];
  readonly trigger?: unknown;
  readonly messageId?: unknown;
}

// fallow-ignore-next-line unused-export
export class ChatValidationError extends Error {
  readonly status: number;

  constructor(status: number, reason: string) {
    super(reason);
    this.name = 'ChatValidationError';
    this.status = status;
  }
}

export type ChatOutcome = 'completed' | 'error' | 'aborted';

export interface SanitizedRequestRecord {
  readonly requestId: string;
  readonly provider: 'openai';
  readonly providerModel: string;
  readonly responseId: string | null;
  readonly callId: string | null;
  readonly outcome: ChatOutcome;
  readonly deltaCount: number;
  readonly inputTokens: number | undefined;
  readonly outputTokens: number | undefined;
  readonly totalTokens: number | undefined;
  readonly textHash: string;
  readonly durationMs: number;
  readonly errorText: string | null;
}

export type ParseEnvelopeResult =
  | { readonly ok: true; readonly envelope: ChatEnvelope }
  | { readonly ok: false; readonly status: number; readonly reason: string };

/**
 * Validates a parsed JSON body into the DefaultChatTransport envelope shape:
 * `{ id, messages, trigger?, messageId? }`. Rejects malformed envelopes, an
 * over-limit message count, and any client-supplied provider/model config.
 */
// fallow-ignore-next-line unused-export, complexity
export function parseChatEnvelope(rawBody: unknown): ParseEnvelopeResult {
  if (typeof rawBody !== 'object' || rawBody === null || Array.isArray(rawBody)) {
    return { ok: false, status: 400, reason: 'body must be a JSON object' };
  }

  const body = rawBody as Record<string, unknown>;

  for (const key of FORBIDDEN_ENVELOPE_KEYS) {
    if (key in body) {
      return {
        ok: false,
        status: 400,
        reason: `client-supplied ${key} configuration is not allowed`,
      };
    }
  }

  if (typeof body.id !== 'string' || body.id.length === 0) {
    return { ok: false, status: 400, reason: 'envelope id must be a non-empty string' };
  }

  if (!Array.isArray(body.messages)) {
    return { ok: false, status: 400, reason: 'envelope messages must be an array' };
  }

  if (body.messages.length > MAX_MESSAGES) {
    return { ok: false, status: 400, reason: `too many messages (max ${MAX_MESSAGES})` };
  }

  const trigger = body.trigger;
  if (trigger !== undefined && trigger !== 'submit-message' && trigger !== 'regenerate-message') {
    return { ok: false, status: 400, reason: 'unsupported trigger value' };
  }

  const messageId = body.messageId;
  if (messageId !== undefined && typeof messageId !== 'string') {
    return { ok: false, status: 400, reason: 'messageId must be a string when present' };
  }

  return {
    ok: true,
    envelope: {
      id: body.id,
      messages: body.messages as unknown[],
      trigger,
      messageId,
    },
  };
}

/**
 * Rejects system roles and tool/file/data/source parts. User and assistant text
 * turns, reasoning, and the SDK's own `step-start` structural parts are accepted
 * so completed first-turn history round-trips unchanged.
 */
// fallow-ignore-next-line unused-export, complexity
export function rejectDisallowedMessageParts(messages: UIMessage[]): string | null {
  for (const message of messages) {
    if (message.role === 'system') {
      return `system role is not allowed (message ${message.id})`;
    }
    if (message.role !== 'user' && message.role !== 'assistant') {
      return `unsupported role "${message.role}" (message ${message.id})`;
    }
    for (const part of message.parts) {
      if (!ALLOWED_PART_TYPES.has(part.type)) {
        return `part type "${part.type}" is not allowed (message ${message.id})`;
      }
    }
  }
  return null;
}

/** Sanitized, client-safe error text. Never leaks raw provider errors. */
// fallow-ignore-next-line unused-export
export function sanitizeError(error: unknown): string {
  if (error instanceof ChatValidationError) {
    return error.message;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return 'The request was aborted.';
  }
  return 'An error occurred while generating the response.';
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// fallow-ignore-next-line complexity
function extractOpenAIResponseId(providerMetadata: unknown): string | null {
  if (typeof providerMetadata !== 'object' || providerMetadata === null) {
    return null;
  }
  const openai = (providerMetadata as Record<string, unknown>).openai;
  if (typeof openai !== 'object' || openai === null) {
    return null;
  }
  const responseId = (openai as Record<string, unknown>).responseId;
  return typeof responseId === 'string' ? responseId : null;
}

export interface StreamChatParams {
  readonly requestId: string;
  readonly messages: UIMessage[];
  readonly response: ServerResponse;
  readonly abortSignal: AbortSignal;
  readonly config: ServerConfig;
  readonly emitRecord: (record: SanitizedRequestRecord) => void;
}

/**
 * Runs the real OpenAI Responses generation and pipes it out as the SDK UI
 * message stream. The record emitted on completion is sanitized: request ID,
 * provider/model identifiers, response ID, timings, delta count, usage, and
 * terminal outcome only.
 */
// fallow-ignore-next-line unused-export, complexity
export async function streamChat(params: StreamChatParams): Promise<void> {
  const { requestId, messages, response, abortSignal, config, emitRecord } = params;

  const startedAt = Date.now();

  let deltaCount = 0;
  let finalText = '';
  let outcome: ChatOutcome = 'completed';
  let generationCompleted = false;
  let responseId: string | null = null;
  let callId: string | null = null;
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;
  let totalTokens: number | undefined;
  let errorText: string | null = null;

  try {
    const provider = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    }).responses(config.model);

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: provider,
      instructions: CHAT_INSTRUCTIONS,
      messages: modelMessages,
      abortSignal,
      maxOutputTokens: config.maxOutputTokens,
      maxRetries: 0,
      timeout: { totalMs: config.requestDeadlineMs },
      onChunk: ({ chunk }) => {
        if (chunk.type === 'text-delta') {
          deltaCount += 1;
        }
      },
      onError: ({ error }) => {
        outcome = 'error';
        errorText = sanitizeError(error);
      },
      onAbort: () => {
        outcome = 'aborted';
      },
// fallow-ignore-next-line complexity
      onEnd: (event) => {
        generationCompleted = true;
        finalText = event.text;
        callId = event.callId;
        responseId = extractOpenAIResponseId(event.providerMetadata) ?? event.response?.id ?? null;
        inputTokens = event.usage?.inputTokens;
        outputTokens = event.usage?.outputTokens;
        totalTokens = event.usage?.totalTokens;
      },
    });

    const uiStream = toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: generateId,
      sendReasoning: false,
      onError: sanitizeError,
    });

    // Pipe the stream to the response. When the client disconnects mid-stream,
    // `writeToServerResponse` can hang on its backpressure `drain` wait (the
    // socket is gone and `drain` never fires), so we race the pipe against the
    // response `close` event and always emit the record afterwards.
    const pipePromise = pipeUIMessageStreamToResponse({ response, stream: uiStream });
    pipePromise.catch(() => {
      // Rejection is observed via the race below; this branch prevents an
      // unhandled rejection if the client disconnected first.
    });
    const responseClosed = new Promise<void>((resolveClosed) => {
      response.once('close', () => resolveClosed());
    });

    try {
      await Promise.race([pipePromise, responseClosed]);
    } catch (error) {
      if (abortSignal.aborted) {
        outcome = 'aborted';
        errorText = sanitizeError(error);
      } else if (outcome === 'completed') {
        outcome = 'error';
        errorText = sanitizeError(error);
      }
    }
  } catch (error) {
    if (abortSignal.aborted) {
      outcome = 'aborted';
    } else {
      outcome = 'error';
    }
    errorText = sanitizeError(error);
  } finally {
    // A client disconnect aborts the signal before the provider's onAbort
    // callback necessarily runs; completed-before-cancellation must never be
    // reported as aborted.
    const resolvedOutcome: ChatOutcome = generationCompleted
      ? 'completed'
      : abortSignal.aborted
        ? 'aborted'
        : outcome;

    emitRecord({
      requestId,
      provider: 'openai',
      providerModel: config.model,
      responseId,
      callId,
      outcome: resolvedOutcome,
      deltaCount,
      inputTokens,
      outputTokens,
      totalTokens,
      textHash: sha256(finalText),
      durationMs: Date.now() - startedAt,
      errorText,
    });
  }
}
