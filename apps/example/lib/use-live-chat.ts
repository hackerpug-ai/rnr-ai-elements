import { useChat } from '@ai-sdk/react';
import {
  type ChatStatus,
  DefaultChatTransport,
  type PrepareSendMessagesRequest,
  type ProviderMetadata,
  type UIMessage,
} from 'ai';
import { useMemo } from 'react';

import { getLiveChatConfig, type LiveChatConfig } from './live-chat-config';

/**
 * Retry for a retained failed or interrupted turn: clear the error first, then
 * regenerate the last assistant message. The order is significant — clearing
 * first releases the error state so the regeneration can be submitted.
 */
export function createRetry(clearError: () => void, regenerate: () => unknown): () => void {
  return () => {
    clearError();
    regenerate();
  };
}

/** Coerces a fetch `RequestInfo | URL` input to a URL string for `expo/fetch`. */
function inputUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}

/**
 * The stable fetch implementation for the transport. `expo/fetch` returns a
 * `FetchResponse` (which implements `Response`) and accepts a narrower input
 * union, so the input is normalized to a URL string at the boundary.
 *
 * The import is lazy so the module also loads outside Expo (the published
 * `expo/fetch` entry only resolves inside Metro); inside Expo the resolved
 * module and the fetch behavior are identical to a static import.
 */
export const chatFetch: typeof fetch = async (input, init) => {
  const { fetch: expoFetch } = await import('expo/fetch');
  // The init types differ only by typing-lib skew (undici RequestInit vs
  // expo's FetchRequestInit); the runtime shapes are the same.
  return expoFetch(inputUrl(input), init as Parameters<typeof expoFetch>[1]);
};

/** The OpenAI Responses item id carried by a single part, if any. */
function openAiItemId(part: UIMessage['parts'][number]): string | null {
  if (!('providerMetadata' in part)) {
    return null;
  }
  const itemId = part.providerMetadata?.openai?.itemId;
  return typeof itemId === 'string' ? itemId : null;
}

/** The OpenAI Responses item ids carried by a message's parts, in order. */
function openAiItemIds(message: UIMessage): string[] {
  const itemIds: string[] = [];
  for (const part of message.parts) {
    const itemId = openAiItemId(part);
    if (itemId !== null) {
      itemIds.push(itemId);
    }
  }
  return itemIds;
}

/** Whether every itemId on the message was already sent by an earlier entry. */
function carriesOnlySeenItemIds(itemIds: readonly string[], seen: ReadonlySet<string>): boolean {
  return itemIds.length > 0 && itemIds.every((itemId) => seen.has(itemId));
}

/** Removes the stale `openai.itemId` entry from provider metadata (copied). */
function withoutOpenAiItemId(metadata: ProviderMetadata): ProviderMetadata {
  const openai = metadata.openai;
  if (openai === undefined || !('itemId' in openai)) {
    return metadata;
  }
  const nextOpenai = { ...openai };
  delete nextOpenai.itemId;
  return { ...metadata, openai: nextOpenai };
}

/**
 * Drops a message's stale OpenAI item references. A text part still in
 * `state: 'streaming'` never finished (aborted or interrupted turn): its
 * itemId points at a provider item that was never persisted, and with server
 * `store` enabled the provider replaces the part's content with an item
 * reference — so the stale id both discards the partial text and makes the
 * whole request fail with "Item with id ... not found". Stripping the id
 * sends the partial text as ordinary content instead.
 */
function stripUnfinishedItemIds<UI_MESSAGE extends UIMessage>(message: UI_MESSAGE): UI_MESSAGE {
  let changed = false;
  const parts = message.parts.map((part) => {
    if (part.type !== 'text' || part.state !== 'streaming') {
      return part;
    }
    changed = true;
    return { ...part, providerMetadata: withoutOpenAiItemId(part.providerMetadata ?? {}) };
  });
  return changed ? { ...message, parts } : message;
}

/**
 * Sanitizes the outgoing chat history for the OpenAI Responses endpoint.
 *
 * After a failed turn (endpoint loss) or an aborted stream, the SDK-side
 * message state can carry duplicated assistant entries whose parts repeat
 * provider item ids, plus item ids from streams that never completed. The
 * endpoint rejects both shapes. This transform keeps the first occurrence of
 * each item id and strips the stale duplicates, and removes item ids from
 * parts that never reached `state: 'done'` (their text is sent as content).
 * It never invents item ids and never removes message text or parts:
 * untouched messages keep their identity, so legitimate unique metadata
 * passes through unchanged.
 */
// fallow-ignore-next-line unused-export
export function sanitizeOutgoingChatMessages<UI_MESSAGE extends UIMessage>(
  messages: readonly UI_MESSAGE[],
): UI_MESSAGE[] {
  const seenItemIds = new Set<string>();
  const sanitized: UI_MESSAGE[] = [];
  for (const message of messages) {
    const itemIds = openAiItemIds(message);
    if (carriesOnlySeenItemIds(itemIds, seenItemIds)) {
      continue;
    }
    for (const itemId of itemIds) {
      seenItemIds.add(itemId);
    }
    sanitized.push(stripUnfinishedItemIds(message));
  }
  return sanitized;
}

/**
 * The transport-level sanitize seam: returns the default request body with
 * the outgoing history run through {@link sanitizeOutgoingChatMessages}, so
 * every request the hook sends (regenerate included) carries provider-
 * acceptable history. Untouched histories serialize identically to the
 * default body.
 */
// fallow-ignore-next-line unused-export
export const prepareSanitizedSendMessagesRequest: PrepareSendMessagesRequest<UIMessage> = ({
  id,
  messages,
  trigger,
  messageId,
  body,
}) => ({
  body: {
    ...body,
    id,
    messages: sanitizeOutgoingChatMessages(messages),
    trigger,
    messageId,
  },
});

export interface UseLiveChatResult {
  readonly messages: UIMessage[];
  readonly status: ChatStatus;
  readonly error: Error | undefined;
  readonly sendMessage: (text: string) => void;
  readonly stop: () => void;
  readonly regenerate: () => void;
  readonly clearError: () => void;
  readonly retry: () => void;
  readonly config: LiveChatConfig;
  readonly isConfigured: boolean;
}

/**
 * The worked example's live chat hook.
 *
 * Uses `useChat` from `@ai-sdk/react` over a stable `DefaultChatTransport`
 * pointed at the validated `/api/chat` endpoint, with `expo/fetch`, a 50 ms
 * throttle, and an empty initial transcript. Input state and component
 * composition stay with ORI-RN-004.
 */
export function useLiveChat(): UseLiveChatResult {
  const config = useMemo(() => getLiveChatConfig(), []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: config.endpoint ?? '',
        fetch: chatFetch,
        prepareSendMessagesRequest: prepareSanitizedSendMessagesRequest,
      }),
    [config.endpoint],
  );

  const chat = useChat({
    transport,
    throttle: 50,
    messages: [],
  });

  const sendMessage = useMemo(
    () =>
      (text: string): void => {
        if (!config.ok) {
          return;
        }
        void chat.sendMessage({ text });
      },
    [chat, config.ok],
  );

  const stop = useMemo(() => (): void => void chat.stop(), [chat]);

  const regenerate = useMemo(() => (): void => void chat.regenerate(), [chat]);

  const clearError = useMemo(() => (): void => chat.clearError(), [chat]);

  const retry = useMemo(() => createRetry(clearError, regenerate), [clearError, regenerate]);

  return {
    messages: chat.messages,
    status: chat.status,
    error: chat.error,
    sendMessage,
    stop,
    regenerate,
    clearError,
    retry,
    config,
    isConfigured: config.ok,
  };
}
