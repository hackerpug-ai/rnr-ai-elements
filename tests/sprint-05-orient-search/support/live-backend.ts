/**
 * ORI-AI-001 owned-backend lifecycle.
 *
 * Launches the real worked-example server (`apps/example/server/index.ts`) as an
 * owned Node child, records its identity (origin, PID, launch identity) and its
 * actual outcomes (exit code/signal, stdout/stderr, sanitized request records),
 * and exposes stop/restart/model-selection operations that act only on recorded
 * owned PIDs.
 *
 * Credentials enter only the server child: `OPENAI_API_KEY` is inherited from
 * the parent environment and is never read, echoed, or recorded by this module.
 */
import { type ChildProcess, spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const TSX_CLI = join(REPO_ROOT, 'node_modules/tsx/dist/cli.mjs');
const SERVER_INDEX = join(REPO_ROOT, 'apps/example/server/index.ts');

const RECORD_PREFIX = 'ORI_AI_001_RECORD ';
const LISTENING_PREFIX = 'ORI_AI_001_LISTENING ';

export const DEFAULT_MODEL = 'gpt-4.1-mini-2025-04-14';
export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 4000;

export interface BackendRecord {
  readonly requestId: string;
  readonly provider: string;
  readonly providerModel: string;
  readonly responseId: string | null;
  readonly callId: string | null;
  readonly outcome: 'completed' | 'error' | 'aborted';
  readonly deltaCount: number;
  readonly inputTokens: number | undefined;
  readonly outputTokens: number | undefined;
  readonly totalTokens: number | undefined;
  readonly textHash: string;
  readonly durationMs: number;
  readonly errorText: string | null;
  readonly activeGenerations: number;
}

export interface BackendLaunchOptions {
  readonly host?: string;
  readonly port?: number;
  readonly model?: string;
  readonly webOrigin?: string;
  readonly maxOutputTokens?: number;
  readonly requestDeadlineMs?: number;
  /** Extra server-only env (credentials flow through the child only). */
  readonly extraEnv?: Record<string, string>;
}

export interface OwnedBackendHandle {
  readonly launchIdentity: string;
  readonly origin: string;
  readonly host: string;
  readonly port: number;
  readonly model: string;
  readonly pid: number | null;
  readonly started: boolean;
  readonly exitCode: number | null;
  readonly exitSignal: string | null;
  readonly stderrText: () => string;
  readonly stdoutText: () => string;
  readonly records: () => BackendRecord[];
  waitForRecord(requestId: string, timeoutMs: number): Promise<BackendRecord | null>;
  stop(): Promise<void>;
  restart(options?: BackendLaunchOptions): Promise<OwnedBackendHandle>;
  selectModel(model: string): Promise<OwnedBackendHandle>;
}

class OwnedBackend implements OwnedBackendHandle {
  readonly launchIdentity: string;
  readonly origin: string;
  readonly host: string;
  readonly port: number;
  readonly model: string;

  private child: ChildProcess | null;
  private stdoutBuffer = '';
  private stderrBuffer = '';
  private parsedRecords: BackendRecord[] = [];
  private startedFlag = false;
  private exitCodeValue: number | null = null;
  private exitSignalValue: string | null = null;
  private readonly launchOptions: BackendLaunchOptions;

  constructor(options: BackendLaunchOptions) {
    this.launchIdentity = `ori-ai-001-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.origin = SERVER_INDEX;
    this.host = options.host ?? DEFAULT_HOST;
    this.port = options.port ?? DEFAULT_PORT;
    this.model = options.model ?? DEFAULT_MODEL;
    this.launchOptions = options;
    this.child = null;
  }

  private onStdout(chunk: Buffer): void {
    this.stdoutBuffer += chunk.toString('utf8');
    let newlineIndex = this.stdoutBuffer.indexOf('\n');
    while (newlineIndex !== -1) {
      const line = this.stdoutBuffer.slice(0, newlineIndex);
      this.stdoutBuffer = this.stdoutBuffer.slice(newlineIndex + 1);
      this.consumeLine(line);
      newlineIndex = this.stdoutBuffer.indexOf('\n');
    }
  }

  private consumeLine(line: string): void {
    if (line.startsWith(RECORD_PREFIX)) {
      const payload = line.slice(RECORD_PREFIX.length);
      try {
        this.parsedRecords.push(JSON.parse(payload) as BackendRecord);
      } catch {
        // ignore malformed record line
      }
      return;
    }
    if (line.startsWith(LISTENING_PREFIX)) {
      this.startedFlag = true;
    }
  }

  private onStderr(chunk: Buffer): void {
    this.stderrBuffer += chunk.toString('utf8');
  }

  private onExit(code: number | null, signal: string | null): void {
    this.exitCodeValue = code;
    this.exitSignalValue = signal;
    this.startedFlag = false;
  }

  private start(): void {
    const env: Record<string, string | undefined> = {
      ...process.env,
      EXAMPLE_CHAT_MODEL: this.model,
      EXAMPLE_CHAT_HOST: this.host,
      EXAMPLE_CHAT_PORT: String(this.port),
      EXAMPLE_CHAT_WEB_ORIGIN: this.launchOptions.webOrigin ?? 'http://localhost:8081',
    };
    if (this.launchOptions.maxOutputTokens !== undefined) {
      env.EXAMPLE_CHAT_MAX_OUTPUT_TOKENS = String(this.launchOptions.maxOutputTokens);
    }
    if (this.launchOptions.requestDeadlineMs !== undefined) {
      env.EXAMPLE_CHAT_REQUEST_DEADLINE_MS = String(this.launchOptions.requestDeadlineMs);
    }
    for (const [key, value] of Object.entries(this.launchOptions.extraEnv ?? {})) {
      env[key] = value;
    }

    this.child = spawn(process.execPath, [TSX_CLI, SERVER_INDEX], {
      cwd: REPO_ROOT,
      env: env as NodeJS.ProcessEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.child.stdout?.on('data', (chunk: Buffer) => this.onStdout(chunk));
    this.child.stderr?.on('data', (chunk: Buffer) => this.onStderr(chunk));
    this.child.on('error', (error: NodeJS.ErrnoException) => {
      this.stderrBuffer += `${error.message}\n`;
    });
    this.child.on('exit', (code, signal) => this.onExit(code, signal));
  }

  private waitFor(predicate: () => boolean, timeoutMs: number): Promise<boolean> {
    return new Promise((resolvePromise) => {
      if (predicate()) {
        resolvePromise(true);
        return;
      }
      const timeout = setTimeout(() => {
        cleanup();
        resolvePromise(false);
      }, timeoutMs);
      const poll = setInterval(() => {
        if (predicate()) {
          cleanup();
          resolvePromise(true);
        }
      }, 50);
      const cleanup = (): void => {
        clearTimeout(timeout);
        clearInterval(poll);
      };
    });
  }

  private waitForExit(timeoutMs: number): Promise<boolean> {
    return this.waitFor(
      () => this.exitCodeValue !== null || this.exitSignalValue !== null,
      timeoutMs,
    );
  }

  /** Launches and resolves once listening or failed. */
  async startAndWait(timeoutMs: number): Promise<void> {
    this.start();
    const started = await this.waitFor(
      () => this.startedFlag || this.exitCodeValue !== null || this.exitSignalValue !== null,
      timeoutMs,
    );
    if (!started) {
      // Timed out before either signal — treat as failed start.
      await this.stop();
    }
  }

  get pid(): number | null {
    return this.child?.pid ?? null;
  }

  get started(): boolean {
    return this.startedFlag;
  }

  get exitCode(): number | null {
    return this.exitCodeValue;
  }

  get exitSignal(): string | null {
    return this.exitSignalValue;
  }

  stderrText(): string {
    return this.stderrBuffer;
  }

  stdoutText(): string {
    return this.stdoutBuffer;
  }

  records(): BackendRecord[] {
    return [...this.parsedRecords];
  }

  async waitForRecord(requestId: string, timeoutMs: number): Promise<BackendRecord | null> {
    const found = await this.waitFor(
      () => this.parsedRecords.some((record) => record.requestId === requestId),
      timeoutMs,
    );
    return found
      ? (this.parsedRecords.find((record) => record.requestId === requestId) ?? null)
      : null;
  }

  async stop(): Promise<void> {
    const child = this.child;
    if (child === null || child.pid === undefined) {
      return;
    }
    if (this.exitCodeValue !== null || this.exitSignalValue !== null) {
      return;
    }
    child.kill('SIGTERM');
    const exited = await this.waitForExit(5000);
    if (!exited) {
      child.kill('SIGKILL');
      await this.waitForExit(5000);
    }
  }

  async restart(options: BackendLaunchOptions = {}): Promise<OwnedBackendHandle> {
    await this.stop();
    return launchOwnedBackend({ ...this.launchOptions, ...options });
  }

  async selectModel(model: string): Promise<OwnedBackendHandle> {
    return this.restart({ model });
  }
}

export async function launchOwnedBackend(
  options: BackendLaunchOptions = {},
): Promise<OwnedBackendHandle> {
  const backend = new OwnedBackend(options);
  await backend.startAndWait(10_000);
  return backend;
}
