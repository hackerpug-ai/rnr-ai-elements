/**
 * Client-side endpoint resolution for the worked example's live chat.
 *
 * This module is imported by the example app (client graph). It must never
 * import `@ai-sdk/openai`, the server, or any credential-bearing module.
 */

/** The server route appended to the configured base URL. */
const CHAT_ENDPOINT_PATH = '/api/chat';

export interface LiveChatConfig {
  readonly ok: boolean;
  readonly apiBaseUrl: string | null;
  readonly endpoint: string | null;
  readonly error: string | null;
}

/**
 * Validates the absolute `EXPO_PUBLIC_API_BASE_URL` and derives the `/api/chat`
 * endpoint. A missing or invalid value yields a non-ok config with a visible
 * error; the hook uses that to refuse sending.
 */
export function resolveLiveChatConfig(env: {
  EXPO_PUBLIC_API_BASE_URL?: string | undefined;
}): LiveChatConfig {
  const raw = env.EXPO_PUBLIC_API_BASE_URL;
  if (raw === undefined || raw.trim() === '') {
    return {
      ok: false,
      apiBaseUrl: null,
      endpoint: null,
      error: 'EXPO_PUBLIC_API_BASE_URL is not configured',
    };
  }

  const trimmed = raw.trim();

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return {
      ok: false,
      apiBaseUrl: null,
      endpoint: null,
      error: 'EXPO_PUBLIC_API_BASE_URL must be an absolute URL',
    };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return {
      ok: false,
      apiBaseUrl: null,
      endpoint: null,
      error: 'EXPO_PUBLIC_API_BASE_URL must use http or https',
    };
  }

  const baseUrl = trimmed.replace(/\/+$/, '');
  return {
    ok: true,
    apiBaseUrl: baseUrl,
    endpoint: `${baseUrl}${CHAT_ENDPOINT_PATH}`,
    error: null,
  };
}

/** Reads the ambient Expo environment (inlined `EXPO_PUBLIC_*` value). */
export function getLiveChatConfig(): LiveChatConfig {
  const env = process.env;
  return resolveLiveChatConfig({
    EXPO_PUBLIC_API_BASE_URL: env.EXPO_PUBLIC_API_BASE_URL,
  });
}
