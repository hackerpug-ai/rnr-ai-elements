// fallow-ignore-file unused-file
import { z } from 'zod';

/**
 * Server-only configuration for the worked example's live chat backend.
 *
 * Credentials and provider configuration are read exclusively inside this
 * module. Nothing here is imported by the client (apps/example/lib) graph,
 * and nothing is ever surfaced through EXPO_PUBLIC variables, command
 * arguments, or captured evidence.
 *
 * The upstream base URL is deliberately fixed: an inherited OPENAI_BASE_URL
 * must never redirect credentials away from the official endpoint.
 */
// fallow-ignore-next-line unused-export
export const FIXED_OPENAI_BASE_URL = 'https://api.openai.com/v1';

// fallow-ignore-next-line unused-export
export const DEFAULT_HOST = '127.0.0.1';
// fallow-ignore-next-line unused-export
export const DEFAULT_PORT = 4000;
// fallow-ignore-next-line unused-export
export const DEFAULT_MAX_OUTPUT_TOKENS = 1024;
// fallow-ignore-next-line unused-export
export const DEFAULT_REQUEST_DEADLINE_MS = 90_000;

const nonemptyString = z.string().min(1, 'must be non-empty');

const portSchema = z.coerce
  .number()
  .int('must be an integer')
  .min(1, 'must be >= 1')
  .max(65535, 'must be <= 65535');

const webOriginSchema = z
  .string()
  .min(1, 'must be non-empty')
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'must be an absolute http(s) origin');

const envSchema = z.object({
  OPENAI_API_KEY: nonemptyString,
  EXAMPLE_CHAT_MODEL: nonemptyString,
  EXAMPLE_CHAT_HOST: z.string().min(1).default(DEFAULT_HOST),
  EXAMPLE_CHAT_PORT: portSchema.default(DEFAULT_PORT),
  EXAMPLE_CHAT_WEB_ORIGIN: webOriginSchema,
  EXAMPLE_CHAT_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(1).default(DEFAULT_MAX_OUTPUT_TOKENS),
  EXAMPLE_CHAT_REQUEST_DEADLINE_MS: z.coerce
    .number()
    .int()
    .min(1)
    .default(DEFAULT_REQUEST_DEADLINE_MS),
});

export interface ServerConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly host: string;
  readonly port: number;
  readonly webOrigin: string;
  readonly maxOutputTokens: number;
  readonly requestDeadlineMs: number;
  readonly baseUrl: string;
}

export type LoadEnvResult =
  | { readonly ok: true; readonly config: ServerConfig }
  | { readonly ok: false; readonly diagnostic: string };

/**
 * Validates process environment into a typed {@link ServerConfig}.
 *
 * A non-ok result names every invalid field and must cause the server to exit
 * nonzero before it ever listens.
 */
// fallow-ignore-next-line unused-export
export function loadServerEnv(env: NodeJS.ProcessEnv): LoadEnvResult {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    return { ok: false, diagnostic: `invalid server configuration: ${issues}` };
  }

  const value = parsed.data;

  return {
    ok: true,
    config: {
      apiKey: value.OPENAI_API_KEY,
      model: value.EXAMPLE_CHAT_MODEL,
      host: value.EXAMPLE_CHAT_HOST,
      port: value.EXAMPLE_CHAT_PORT,
      webOrigin: value.EXAMPLE_CHAT_WEB_ORIGIN,
      maxOutputTokens: value.EXAMPLE_CHAT_MAX_OUTPUT_TOKENS,
      requestDeadlineMs: value.EXAMPLE_CHAT_REQUEST_DEADLINE_MS,
      baseUrl: FIXED_OPENAI_BASE_URL,
    },
  };
}
