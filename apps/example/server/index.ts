// fallow-ignore-file unused-file
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { type UIMessage, validateUIMessages } from 'ai';

import {
  MAX_BODY_BYTES,
  parseChatEnvelope,
  RECORD_PREFIX,
  rejectDisallowedMessageParts,
  type SanitizedRequestRecord,
  streamChat,
} from './chat';
import { loadServerEnv, type ServerConfig } from './env';

/** Ready signal written to stdout once the server is listening. */
export const LISTENING_PREFIX = 'ORI_AI_001_LISTENING ';

function writeJson(response: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  response.end(payload);
}

async function readBody(
  request: IncomingMessage,
  maxBytes: number,
): Promise<{ body: Buffer | null; oversized: boolean }> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buf: Buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    total += buf.length;
    if (total > maxBytes) {
      return { body: null, oversized: true };
    }
    chunks.push(buf);
  }
  return { body: Buffer.concat(chunks), oversized: false };
}

function parseJsonBody(buffer: Buffer): unknown | undefined {
  if (buffer.length === 0) {
    return undefined;
  }
  try {
    return JSON.parse(buffer.toString('utf8')) as unknown;
  } catch {
    return undefined;
  }
}

// fallow-ignore-next-line complexity
export function createChatServer(config: ServerConfig): ReturnType<typeof createServer> {
  let activeGenerations = 0;

  const emitRecord = (record: SanitizedRequestRecord): void => {
    activeGenerations = Math.max(0, activeGenerations - 1);
    process.stdout.write(`${RECORD_PREFIX}${JSON.stringify({ ...record, activeGenerations })}\n`);
  };

// fallow-ignore-next-line complexity
  return createServer(async (request, response) => {
    if (request.method !== 'POST') {
      writeJson(response, 405, { error: 'method not allowed' });
      return;
    }

    const { body, oversized } = await readBody(request, MAX_BODY_BYTES);
    if (oversized) {
      writeJson(response, 413, { error: 'request body too large' });
      return;
    }

    const rawBody = parseJsonBody(body ?? Buffer.alloc(0));
    if (rawBody === undefined) {
      writeJson(response, 400, { error: 'invalid JSON body' });
      return;
    }

    const parsed = parseChatEnvelope(rawBody);
    if (!parsed.ok) {
      writeJson(response, parsed.status, { error: parsed.reason });
      return;
    }

    let messages: UIMessage[];
    try {
      messages = await validateUIMessages({ messages: parsed.envelope.messages });
    } catch {
      writeJson(response, 400, { error: 'invalid message list' });
      return;
    }

    const disallowed = rejectDisallowedMessageParts(messages);
    if (disallowed !== null) {
      writeJson(response, 400, { error: disallowed });
      return;
    }

    const abortController = new AbortController();

    const abortIfUnfinished = (): void => {
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
    };

    request.on('aborted', abortIfUnfinished);
    response.on('close', () => {
      if (!response.writableEnded) {
        abortIfUnfinished();
      }
    });

    activeGenerations += 1;
    await streamChat({
      requestId: parsed.envelope.id,
      messages,
      response,
      abortSignal: abortController.signal,
      config,
      emitRecord,
    });
  });
}

export function main(): void {
  const loaded = loadServerEnv(process.env);
  if (!loaded.ok) {
    process.stderr.write(`${loaded.diagnostic}\n`);
    process.exitCode = 1;
    return;
  }

  const { config } = loaded;
  const server = createChatServer(config);

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      process.stderr.write(`port ${config.port} on ${config.host} is already in use\n`);
      process.exitCode = 1;
      return;
    }
    process.stderr.write(`server error: ${error.message}\n`);
    process.exitCode = 1;
  });

  const shutdown = (): void => {
    server.close(() => {
      process.exitCode = 0;
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.listen(config.port, config.host, () => {
    process.stdout.write(`${LISTENING_PREFIX}${config.host}:${config.port}\n`);
  });
}

main();
