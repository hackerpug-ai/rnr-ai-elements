// fallow-ignore-file unused-file
import { useChat } from '@ai-sdk/react';
import { type ChatStatus, DefaultChatTransport, type UIMessage } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
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
 */
export const chatFetch: typeof fetch = (input, init) => expoFetch(inputUrl(input), init);

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
