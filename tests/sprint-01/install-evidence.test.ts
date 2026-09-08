/**
 * TASK-F3 install evidence — executable proof that the walking-skeleton item set
 * was installed into apps/example through the REAL RNR CLI from the pinned v0.1.0
 * tag URLs, and that the negative controls (network block, declined overwrite)
 * actually failed the way reality requires.
 *
 * Evidence logs are committed under .tmp/TASK-F3/cycle-1/ (raw runs in $TMPDIR per
 * the task file; committed copies referenced here). THE FAKEABILITY FLOOR: a file
 * that exists NOWHERE in packages/registry/src cannot be the product of a `cp`.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const ROOT = join(__dirname, '..', '..');
const GREEN = join(ROOT, '.tmp', 'TASK-F3', 'cycle-1', 'green');
const RED = join(ROOT, '.tmp', 'TASK-F3', 'cycle-1', 'red');

const read = (...p: string[]) => readFileSync(join(...p), 'utf8');

const FIVE_ITEMS = [
  'components/ai/conversation.tsx',
  'components/ai/message.tsx',
  'components/ai/prompt-input.tsx',
  'components/ai/tool.tsx',
  'components/ai/context.tsx',
  'components/ui/text.tsx',
  'components/ui/avatar.tsx',
  'components/ui/button.tsx',
  'components/ui/icon.tsx',
  'components/ui/popover.tsx',
];

describe('TASK-F3 install evidence (cycle-1)', () => {
  test('row 1/2: one CLI run Created all ten files; pinned-tag + RNR hosts hit; zero 404s', () => {
    const log = read(GREEN, 'f3-install.log');
    for (const file of FIVE_ITEMS) {
      expect(log).toContain(`- ${file}`);
    }
    // ours resolve from the pinned tag (5 CLI args + transitive ours)
    expect(
      log.split('raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0').length - 1,
    ).toBeGreaterThanOrEqual(1);
    // RNR primitives resolve from reactnativereusables.com — recorded by the
    // NETWORK OBSERVER section (local CONNECT-logging proxy), because the CLI
    // never echoes dependency-resolved URLs at any log level.
    expect(log).toContain('NETWORK OBSERVER LOG');
    expect(log.split('reactnativereusables.com').length - 1).toBeGreaterThanOrEqual(1);
    expect((log.match(/404|Cannot find module/g) ?? []).length).toBe(0);
    expect(log).toContain('✔ Created 22 files');
  });

  test('row 3: fakeability floor — popover.tsx exists in the consumer, NOWHERE in the registry tree', () => {
    // consumer file exists on disk, created by the CLI run (committed under apps/example)
    expect(readFileSync(join(ROOT, 'apps/example/components/ui/popover.tsx'), 'utf8')).toContain(
      'PopoverTrigger',
    );
    // and the repo-side registry has no such file — no cp could have produced it
    const hits = execSync('git ls-files packages/registry/src', { cwd: ROOT })
      .toString()
      .split('\n')
      .filter((f) => f.endsWith('ui/popover.tsx'));
    expect(hits).toHaveLength(0);
  });

  test('row 4: network discriminator — blocked network, zero files; same app, open network, 17 files', () => {
    const blocked = read(RED, 'row4-netblock-negative-control.log');
    expect(blocked).toContain('ECONNREFUSED 127.0.0.1:9');
    expect(blocked).toContain(
      'raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/conversation.json',
    );
    // the summary records the resolver subprocess exit and the 0-file post-count
    const summary = read(GREEN, 'row4-network-discriminator.txt');
    expect(summary).toContain('inner resolver (shadcn) exit: 1');
    expect(summary).toContain('post-count components/{ai,ui}/**/*.tsx : 0');
    expect(summary).toContain('exit 0, post-count 17 tsx files');
  });

  test('row 5: dirty app — prompt before write, declined file untouched, accept overwrites', () => {
    const declined = read(GREEN, 'row5a-declined-overwrite.log');
    expect(declined).toContain('The file button.tsx already exists. Would you like to overwrite?');
    expect(declined).toContain('Skipped 1 file');
    expect(declined).toContain('- components/ui/button.tsx');
    expect(declined).not.toContain('overwrite?… yes');
    const accepted = read(GREEN, 'row5c-accepted-overwrite.log');
    expect(accepted).toContain('Would you like to overwrite?');
    // answered line renders as `… <ANSI-reset> yes` — the reset proves the y answer, not the prompt echo
    expect(accepted).toContain('\u001B[39m yes');
    const doctor = read(GREEN, 'row5b-expo-doctor.log');
    expect(doctor).toContain('react-native-gesture-handler');
    expect(doctor).toContain('~2.32.0');
    expect(doctor).toContain('3.2.1');
  });

  test('row 6: iOS cold boot — bundle built from this app, zero module-resolution failures', () => {
    const boot = read(GREEN, 'f3-ios-boot.log');
    expect(boot).toContain('Build Succeeded');
    expect((boot.match(/Cannot find module/g) ?? []).length).toBe(0);
    const metro = read(GREEN, 'f3-metro-final.log');
    expect(metro).toContain('Starting project at');
    expect(metro).toContain('apps/example');
    expect(metro).toMatch(/iOS Bundled \d+ms/);
    expect((metro.match(/Unable to resolve|Cannot find module/g) ?? []).length).toBe(0);
  });
});
