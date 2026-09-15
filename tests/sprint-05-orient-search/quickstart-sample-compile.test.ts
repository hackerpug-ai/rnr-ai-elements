/**
 * ORI-RN-002 — the single source-backed seed-data chat screen compiles in both real
 * clean consumers, and its source shape seeds the runtime proof ORI-RN-003 owns.
 *
 * Tiering (task file, REQUIREMENT-CONTRACT v1):
 *  - AC-1 is the INTEGRATION proof: both committed setup templates plus the shared
 *    tutorial source are copied into fresh OS-derived directories OUTSIDE the monorepo,
 *    the committed command scripts run verbatim (the literal public
 *    `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/…`
 *    recipe), and the real consumer TypeScript compiler compiles the installed import
 *    graph plus the shared screen. SHA-256 of `quickstart-screen.tsx` and
 *    `quickstart-messages.ts` must match between the committed single source and the
 *    compiled consumer bytes.
 *  - AC-2..AC-4 assert the SOURCE SHAPE that enables the runtime behavior (scrolling,
 *    keyboard placement, light/dark text). Native appearance, keyboard bounds, portal
 *    layering and appearance chrome execution are owned by ORI-RN-003 and are NOT
 *    claimed from Vitest.
 *
 * This file reuses the ORI-RN-001 support primitives (`run`, `sha256`,
 * `compileConsumer`, `readResolvedVersions`, `cleanupConsumer`) but prepares its own
 * consumers so it never writes into ORI-RN-001's evidence directory.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SEED_MESSAGES } from '../../packages/docs-snippets/shared/quickstart-messages';
import {
  cleanupConsumer,
  compileConsumer,
  type Engine,
  REPO_ROOT,
  type RunResult,
  readResolvedVersions,
  run,
  sha256,
} from './support/quickstart-consumer';

const ENGINES: Engine[] = ['nativewind', 'uniwind'];

const SHARED_DIR = join(REPO_ROOT, 'packages/docs-snippets/shared');
const EVIDENCE_DIR = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-002');

const TEMPLATE_DIR: Record<Engine, string> = {
  nativewind: join(REPO_ROOT, 'packages/docs-snippets/nativewind'),
  uniwind: join(REPO_ROOT, 'packages/docs-snippets/uniwind'),
};
const COMMAND_SCRIPT: Record<Engine, string> = {
  nativewind: join(REPO_ROOT, 'packages/docs-snippets/commands/nativewind.sh'),
  uniwind: join(REPO_ROOT, 'packages/docs-snippets/commands/uniwind.sh'),
};

/** Committed setup template copied into each consumer (ORI-RN-001's list, no entrypoint). */
const TEMPLATE_FILES: Record<Engine, string[]> = {
  nativewind: [
    'package.json',
    'app.json',
    'components.json',
    'tsconfig.json',
    'metro.config.js',
    'babel.config.js',
    'tailwind.config.js',
    'global.css',
    'nativewind-env.d.ts',
    'app/_layout.tsx',
    'lib/theme.ts',
    'lib/utils.ts',
  ],
  uniwind: [
    'package.json',
    'app.json',
    'components.json',
    'tsconfig.json',
    'metro.config.js',
    'global.css',
    'uniwind-types.d.ts',
    'app/_layout.tsx',
    'lib/theme.ts',
    'lib/utils.ts',
  ],
};

/** Shared tutorial source, committed once, compiled into both consumers at these paths. */
const SHARED_TARGETS: Record<string, string> = {
  'quickstart-screen.tsx': 'shared/quickstart-screen.tsx',
  'quickstart-messages.ts': 'shared/quickstart-messages.ts',
};

const RESOLUTION_FAILURE = /TS2307|TS2304/;

type TutorialConsumer = {
  engine: Engine;
  runId: string;
  root: string;
  scriptExit: number;
  installLog: string;
  resolvedVersions: Record<string, string>;
  compiledHashes: Record<string, string>;
  compile: RunResult;
};

function gitHead(): string {
  const res = run('git rev-parse HEAD', REPO_ROOT, 30_000);
  return res.exit === 0 ? res.output.trim() : `unknown (${res.output.trim()})`;
}

/**
 * Prepares one clean consumer: copy the setup template, run the literal install script,
 * overlay the shared tutorial source + entrypoint, then compile. No ORI-RN-001 evidence
 * is written; the shared source hashes are computed from the consumer's own bytes.
 */
function prepareTutorialConsumer(engine: Engine): TutorialConsumer {
  const root = mkdtempSync(join(tmpdir(), `ori-rn-002-${engine}-`));
  const runId = `${engine}-${new Date().toISOString()}`;

  for (const rel of TEMPLATE_FILES[engine]) {
    const src = join(TEMPLATE_DIR[engine], rel);
    if (!existsSync(src)) {
      rmSync(root, { recursive: true, force: true });
      throw new Error(`template file missing: ${src}`);
    }
    const dst = join(root, rel);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  // Execute the committed script verbatim (pnpm install, expo install, the five literal
  // public CLI adds, doctor, tsc, expo-doctor).
  const script = run(`bash "${COMMAND_SCRIPT[engine]}"`, root, 30 * 60_000);

  // Overlay the tutorial source AFTER the install — the learner's order: install the
  // conversation family, then write the screen + entrypoint.
  const entrypoint = join(TEMPLATE_DIR[engine], 'app/index.tsx');
  if (!existsSync(entrypoint)) {
    rmSync(root, { recursive: true, force: true });
    throw new Error(`entrypoint missing: ${entrypoint}`);
  }
  copyFileSync(entrypoint, join(root, 'app/index.tsx'));
  for (const [srcName, target] of Object.entries(SHARED_TARGETS)) {
    const src = join(SHARED_DIR, srcName);
    if (!existsSync(src)) {
      rmSync(root, { recursive: true, force: true });
      throw new Error(`shared tutorial source missing: ${src}`);
    }
    const dst = join(root, target);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  const compile = compileConsumer(root);

  const compiledHashes: Record<string, string> = {};
  for (const [srcName, target] of Object.entries(SHARED_TARGETS)) {
    compiledHashes[srcName] = sha256(readFileSync(join(root, target), 'utf8'));
  }

  return {
    engine,
    runId,
    root,
    scriptExit: script.exit,
    installLog: script.output,
    resolvedVersions: readResolvedVersions(root),
    compiledHashes,
    compile,
  };
}

/** Canonical hash of one committed shared source file (the single source of truth). */
function canonicalHash(srcName: string): string {
  return sha256(readFileSync(join(SHARED_DIR, srcName), 'utf8'));
}

/** The committed shared screen, read as text for source-shape assertions. */
function sharedScreenSource(): string {
  return readFileSync(join(SHARED_DIR, 'quickstart-screen.tsx'), 'utf8');
}

function entrypointSource(engine: Engine): string {
  return readFileSync(join(TEMPLATE_DIR[engine], 'app/index.tsx'), 'utf8');
}

describe('AC-1 real compiler + source identity', () => {
  let receipts: Record<Engine, TutorialConsumer>;

  beforeAll(() => {
    // Fast-fail before spending a real install: the committed single source must exist.
    for (const srcName of Object.keys(SHARED_TARGETS)) {
      if (!existsSync(join(SHARED_DIR, srcName))) {
        throw new Error(`shared tutorial source missing: ${join(SHARED_DIR, srcName)}`);
      }
    }
    for (const engine of ENGINES) {
      if (!existsSync(join(TEMPLATE_DIR[engine], 'app/index.tsx'))) {
        throw new Error(`entrypoint missing: ${join(TEMPLATE_DIR[engine], 'app/index.tsx')}`);
      }
    }
    receipts = {
      nativewind: prepareTutorialConsumer('nativewind'),
      uniwind: prepareTutorialConsumer('uniwind'),
    };
  }, 40 * 60_000);

  afterAll(() => {
    for (const engine of ENGINES) {
      const receipt = receipts?.[engine];
      if (receipt) cleanupConsumer(receipt.root);
    }
  }, 120_000);

  it('ORI-RN-002-AC-1-source-compile', {
    timeout: 5 * 60_000,
  }, () => {
    for (const engine of ENGINES) {
      const receipt = receipts[engine];
      expect(
        receipt.scriptExit,
        `${engine} install script must exit 0:\n${receipt.installLog.slice(-2000)}`,
      ).toBe(0);

      // The shared source compiled through the consumer's own TypeScript.
      expect(
        receipt.compile.output,
        `${engine} compiled graph must resolve:\n${receipt.compile.output}`,
      ).not.toMatch(RESOLUTION_FAILURE);
      expect(
        receipt.compile.exit,
        `${engine} clean compile must pass:\n${receipt.compile.output}`,
      ).toBe(0);

      // Source identity: the consumer's compiled bytes are byte-identical to the
      // committed single source for both tutorial files.
      for (const srcName of Object.keys(SHARED_TARGETS)) {
        expect(
          receipt.compiledHashes[srcName],
          `${engine} ${srcName} consumer copy hash must equal the committed source`,
        ).toBe(canonicalHash(srcName));
      }

      // The entrypoint is engine-thin: it only renders the shared screen, and imports
      // the same `@/shared/quickstart-screen` module in both engines.
      expect(
        entrypointSource(engine),
        `${engine} entrypoint must render the shared screen`,
      ).toMatch(/QuickstartScreen/);
      expect(
        entrypointSource(engine),
        `${engine} entrypoint must import the shared module`,
      ).toMatch(/@\/shared\/quickstart-screen/);
    }
  });

  it('ORI-RN-002-evidence', {
    timeout: 5 * 60_000,
  }, () => {
    mkdirSync(EVIDENCE_DIR, { recursive: true });

    const canonical: Record<string, string> = {};
    for (const srcName of Object.keys(SHARED_TARGETS)) canonical[srcName] = canonicalHash(srcName);

    const manifest: Record<string, unknown> = {
      task: 'ORI-RN-002',
      candidate_head_sha: gitHead(),
      generated_at: new Date().toISOString(),
      single_source: 'packages/docs-snippets/shared/{quickstart-screen.tsx,quickstart-messages.ts}',
      canonical_shared_hashes: canonical,
      engines: {} as Record<string, unknown>,
    };
    const engines = manifest.engines as Record<string, unknown>;
    for (const engine of ENGINES) {
      const r = receipts[engine];
      engines[engine] = {
        run_id: r.runId,
        consumer_root: r.root,
        script_exit: r.scriptExit,
        resolved_versions: r.resolvedVersions,
        compiled_hashes: r.compiledHashes,
        hash_equality: Object.fromEntries(
          Object.keys(SHARED_TARGETS).map((n) => [n, r.compiledHashes[n] === canonical[n]]),
        ),
        tsc: { exit: r.compile.exit, command: r.compile.command },
      };
    }
    writeFileSync(
      join(EVIDENCE_DIR, 'source-manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );

    const lines: string[] = [
      'ORI-RN-002 consumer typecheck proof',
      `candidate HEAD: ${gitHead()}`,
      `generated at: ${new Date().toISOString()}`,
      'compiler command: pnpm exec tsc --noEmit (run in each clean consumer root)',
      '',
    ];
    for (const engine of ENGINES) {
      const r = receipts[engine];
      lines.push(`=== ${engine} ===`);
      lines.push(`run id: ${r.runId}`);
      lines.push(`consumer root: ${r.root}`);
      lines.push(`resolved versions: ${JSON.stringify(r.resolvedVersions)}`);
      lines.push(`install script exit: ${r.scriptExit}`);
      lines.push(`compiler exit: ${r.compile.exit}`);
      lines.push('--- compiler output ---');
      lines.push(r.compile.output.trim() || '(empty)');
      lines.push('--- end ---');
      lines.push('');
    }
    writeFileSync(join(EVIDENCE_DIR, 'consumer-typechecks.txt'), `${lines.join('\n')}\n`);
  });
});

// ---- Source-shape assertions (seed the runtime proof ORI-RN-003 owns) ----

it('ORI-RN-002-AC-2-seed-interaction', () => {
  // The finite transcript: 24 chronological turns, stable IDs, alternating 12/12.
  expect(SEED_MESSAGES.length, 'seed transcript must hold 24 turns').toBe(24);
  expect(
    SEED_MESSAGES.map((m) => m.id),
    'seed IDs must be seed-01..seed-24 in order',
  ).toEqual(Array.from({ length: 24 }, (_, i) => `seed-${String(i + 1).padStart(2, '0')}`));
  const users = SEED_MESSAGES.filter((m) => m.from === 'user');
  const assistants = SEED_MESSAGES.filter((m) => m.from === 'assistant');
  expect(users.length, '12 user seed turns').toBe(12);
  expect(assistants.length, '12 assistant seed turns').toBe(12);
  SEED_MESSAGES.forEach((m, i) => {
    expect(m.from, `turn ${i + 1} must alternate user/assistant`).toBe(
      i % 2 === 0 ? 'user' : 'assistant',
    );
  });
  expect(SEED_MESSAGES[0].text, 'oldest turn text').toBe('Seed turn 01: Plan a weekend walk.');
  expect(SEED_MESSAGES[23].text, 'latest turn text').toBe('Seed turn 24: Ready for your message.');
  for (const m of SEED_MESSAGES) {
    expect(m.text, `turn ${m.id} must carry the Seed turn NN: prefix`).toMatch(
      /^Seed turn \d{2}: /,
    );
  }

  // The screen appends exactly one local user turn and fabricates nothing.
  const screen = sharedScreenSource();
  expect(screen, 'no AI SDK import in the seed tutorial').not.toMatch(
    /from ['"]ai['"]|@ai-sdk\/react/,
  );
  expect(screen, 'no model call in the seed tutorial').not.toMatch(
    /useChat|generateText|streamText/,
  );
  expect(screen, 'handler must append a user turn').toMatch(/from: 'user'/);
  expect(screen, 'handler must not fabricate an assistant reply').not.toMatch(/from: 'assistant'/);
  expect(screen, 'transcript must never be re-reversed in the consumer').not.toMatch(
    /\.reverse\(\)/,
  );
});

it('ORI-RN-002-AC-3-keyboard-composition', () => {
  const screen = sharedScreenSource();
  // The composer is a child of Conversation (inside its keyboard-avoiding subtree).
  expect(screen, 'PromptInput must compose inside Conversation').toMatch(
    /<PromptInput[\s\S]*onSubmit=\{handleSubmit\}/,
  );
  // No added KeyboardAvoidingView — Conversation already owns the one that matters.
  expect(screen, 'the seed screen must not add a KeyboardAvoidingView').not.toMatch(
    /KeyboardAvoidingView/,
  );
  // The scroll button stays inside Conversation's context and is lifted above the
  // measured composer (onLayout measurement feeding a bottom offset).
  expect(screen, 'ConversationScrollButton must render inside Conversation').toMatch(
    /<ConversationScrollButton/,
  );
  expect(screen, 'composer height must be measured via onLayout').toMatch(/onLayout=\{/);
  expect(screen, 'scroll button must be offset above the measured composer').toMatch(
    /bottom: composerHeight/,
  );
  // Explicit composer parts.
  for (const part of [
    'PromptInputBody',
    'PromptInputTextarea',
    'PromptInputFooter',
    'PromptInputSubmit',
  ]) {
    expect(screen, `explicit ${part} must be composed`).toContain(part);
  }
});

it('ORI-RN-002-AC-4-text-appearance', () => {
  const screen = sharedScreenSource();
  // Every message uses from, MessageContent and the default MessageResponse.
  expect(screen, 'Message must take from=').toMatch(/<Message from=\{item\.from\}>/);
  expect(screen, 'MessageContent must wrap the body').toContain('<MessageContent>');
  expect(screen, 'MessageResponse must render the turn text').toMatch(
    /<MessageResponse>\{item\.text\}<\/MessageResponse>/,
  );
  // The default renderer — no injected markdown, so no native markdown dependency.
  expect(screen, 'seed tutorial must not inject a markdown renderer').not.toMatch(/renderMarkdown/);
});
