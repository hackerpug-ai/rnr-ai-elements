import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  EnvironmentVariable,
  EnvironmentVariableCopyButton,
  EnvironmentVariableGroup,
  EnvironmentVariableRevealButton,
  EnvironmentVariableValue,
  EnvironmentVariables,
  EnvironmentVariablesContent,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
  EnvironmentVariablesToggle,
  useEnvVars,
  useVariable,
} from '@/components/ai/environment-variables';
import { formatEnvLine } from '@/components/ai/environment-variables.logic';
import { FileTree, FileTreeFile, FileTreeFolder, useFileTree } from '@/components/ai/file-tree';
import {
  PackageInfo,
  PackageInfoChangeType,
  PackageInfoContent,
  PackageInfoDependencies,
  PackageInfoDependency,
  PackageInfoHeader,
  PackageInfoInstall,
  PackageInfoName,
  PackageInfoVersion,
  usePackageInfo,
} from '@/components/ai/package-info';
import type { PackageChangeType } from '@/components/ai/package-info.logic';
import {
  Terminal,
  TerminalActions,
  TerminalClearButton,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalStatus,
  TerminalTitle,
  useTerminal,
} from '@/components/ai/terminal';
import { Text } from '@/components/ui/text';

/**
 * Wave 12 — the specialist/dev organisms I: terminal, file-tree,
 * environment-variables, package-info (UC-CODE).
 *
 * Every state is visible statically (the fixture stories are what the device sign-off
 * screenshots), and each component gets one sandbox story with controls on its
 * primitive props. The ANSI board's fixture exercises the tokenizer's compression
 * table live: red/green onto the sanctioned status colors, blue onto the accent role,
 * dim/bright as the muted pole and a weight bump. The file-tree board is the
 * composition law on glass: the chevron toggles, the name selects, and the two echoes
 * prove the targets fire different callbacks.
 */
const meta = { title: 'AI Elements/Dev Tools' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Label({ children }: { children: string }) {
  return <Text variant="muted" className="text-xs uppercase">{children}</Text>;
}

/* ------------------------------------------------------------- fixtures ---- */

const TERMINAL_PLAIN = [
  '$ pnpm install',
  'Lockfile is up to date, resolution step skipped',
  'Done in 4.2s',
].join('\n');

const TERMINAL_ANSI = [
  '\x1b[1mrnr-ai-elements\x1b[0m on \x1b[34mgit:main\x1b[0m',
  '\x1b[32m✓\x1b[0m typecheck  \x1b[32m✓\x1b[0m lint  \x1b[32m✓\x1b[0m 326 tests',
  '\x1b[33mwarn\x1b[0m storybook:web cannot render colour (known defect)',
  '\x1b[31m✗\x1b[0m device sign-off pending',
  '\x1b[2mlast run 2 minutes ago\x1b[0m',
].join('\n');

const TERMINAL_LONG = [
  '$ pnpm registry:build',
  'emitting public/r/uniwind/terminal.json … public/r/uniwind/package-info.json … public/r/uniwind/file-tree.json … public/r/uniwind/environment-variables.json (one line, unwrapped — scroll right)',
  'registry built — 51 item(s) x 2 engine(s)',
].join('\n');

const API_KEY = { name: 'API_KEY', value: 'sk-live-4f8a9b2c7d1e3f6a9d2e' };
const DATABASE_URL = { name: 'DATABASE_URL', value: 'postgres://localhost:5432/agent' };

const PACKAGE_DEPS = [
  { name: '@drizzle-team/brocli', version: '0.10.2' },
  { name: 'better-sqlite3', version: undefined },
];

const CHANGE_TYPES: PackageChangeType[] = ['major', 'minor', 'patch', 'added', 'removed'];

/* -------------------------------------------------------------- terminal ---- */

/** Plain, ANSI-compressed, long-line (scroll right), and streaming states. */
export const TerminalBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Plain output — every string the run printed</Label>
        <Terminal output={TERMINAL_PLAIN}>
          <TerminalHeader>
            <TerminalTitle>pnpm install</TerminalTitle>
            <TerminalActions>
              <TerminalClearButton />
              <TerminalCopyButton />
            </TerminalActions>
          </TerminalHeader>
          <TerminalContent />
        </Terminal>
      </View>
      <View className="gap-1">
        <Label>ANSI → theme tokens — 16 hues compressed onto the house palette</Label>
        <Terminal output={TERMINAL_ANSI}>
          <TerminalHeader>
            <TerminalTitle>verify</TerminalTitle>
            <TerminalStatus>
              <Text>exit 1</Text>
            </TerminalStatus>
            <TerminalActions>
              <TerminalCopyButton />
            </TerminalActions>
          </TerminalHeader>
          <TerminalContent />
        </Terminal>
      </View>
      <View className="gap-1">
        <Label>Long lines scroll RIGHT — they never wrap, never truncate</Label>
        <Terminal output={TERMINAL_LONG}>
          <TerminalHeader>
            <TerminalTitle>registry:build</TerminalTitle>
            <TerminalActions>
              <TerminalCopyButton />
            </TerminalActions>
          </TerminalHeader>
          <TerminalContent className="max-h-24" />
        </Terminal>
      </View>
      <View className="gap-1">
        <Label>Streaming — the reduced-motion-gated pulse (clear enabled: onClear wired)</Label>
        <Terminal output={'$ pnpm dev\nbundling…'} isStreaming onClear={() => {}}>
          <TerminalHeader>
            <TerminalTitle>dev server</TerminalTitle>
            <TerminalActions>
              <TerminalClearButton />
              <TerminalCopyButton />
            </TerminalActions>
          </TerminalHeader>
          <TerminalContent />
        </Terminal>
      </View>
      <Text variant="muted">
        Port-adapted verdict: a READ-ONLY log view — no stdin, no prompt, no PTY. Copy
        hands over stripAnsi(output): what the eye saw, never escape codes. Without
        onClear the clear button disables — it never pretends.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props; clear is live caller state, exactly as in an app. */
export const TerminalSandbox = {
  args: {
    output: TERMINAL_PLAIN,
    isStreaming: false,
    autoScroll: true,
  },
  argTypes: {
    output: { control: 'text' },
    isStreaming: { control: 'boolean' },
    autoScroll: { control: 'boolean' },
  },
  render: (args: { output: string; isStreaming: boolean; autoScroll: boolean }) => {
    const [live, setLive] = useState(args.output);
    useEffect(() => setLive(args.output), [args.output]);

    return (
      <View className="gap-3">
        <Terminal output={live} isStreaming={args.isStreaming} autoScroll={args.autoScroll} onClear={() => setLive('')}>
          <TerminalHeader>
            <TerminalTitle>sandbox</TerminalTitle>
            <TerminalActions>
              <TerminalClearButton />
              <TerminalCopyButton />
            </TerminalActions>
          </TerminalHeader>
          <TerminalContent />
        </Terminal>
        <Text variant="muted">
          Clear wipes the CALLER's string (output is caller-owned; editing the control
          refills it). autoScroll sticks to the bottom on content changes while on.
        </Text>
      </View>
    );
  },
};

/* ------------------------------------------------------------- file-tree ---- */

/** The composition law on glass: chevron toggles, name selects — two targets, two echoes. */
export const FileTreeBoard: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>();
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(['packages']));

    return (
      <View className="gap-3">
        <Label>Depth pushes right — the horizontal-scroll branch of the verdict</Label>
        <FileTree expanded={expanded} onExpandedChange={setExpanded} selectedPath={selected} onSelect={setSelected}>
          <FileTreeFolder path="app" name="app">
            <FileTreeFile path="app/_layout.tsx" name="_layout.tsx" />
            <FileTreeFolder path="app/chat" name="chat">
              <FileTreeFile path="app/chat/[id].tsx" name="[id].tsx" />
            </FileTreeFolder>
          </FileTreeFolder>
          <FileTreeFolder path="packages" name="packages">
            <FileTreeFolder path="packages/registry" name="registry">
              <FileTreeFolder path="packages/registry/src" name="src">
                <FileTreeFolder path="packages/registry/src/components" name="components">
                  <FileTreeFile path="packages/registry/src/components/ai/terminal.tsx" name="terminal.tsx" />
                  <FileTreeFile path="packages/registry/src/components/ai/file-tree.tsx" name="file-tree.tsx" />
                </FileTreeFolder>
              </FileTreeFolder>
              <FileTreeFile path="packages/registry/registry.json" name="registry.json" />
            </FileTreeFolder>
          </FileTreeFolder>
          <FileTreeFile path="AGENTS.md" name="AGENTS.md" />
          <FileTreeFile path="package.json" name="package.json" />
        </FileTree>
        <Text variant="muted" numberOfLines={3} selectable>
          {`Selected: ${selected ?? '— (tap a NAME)'}\nExpanded: ${expanded.size ? [...expanded].join(', ') : '— (tap a CHEVRON)'}`}
        </Text>
        <Text variant="muted">
          The inventory's composition law: one tap must not do both. Chevron and name are
          separate targets, both at the 44pt floor via hitSlop; folders show the open
          glyph while expanded.
        </Text>
      </View>
    );
  },
};

/** The empty fallback and the controlled-selection control. */
export const FileTreeSandbox = {
  args: {
    selectedPath: 'src/cli.ts',
  },
  argTypes: {
    selectedPath: { control: 'text' },
  },
  render: (args: { selectedPath: string }) => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Selection from above — the caller's selectedPath props in</Label>
        <FileTree selectedPath={args.selectedPath} onSelect={() => {}}>
          <FileTreeFolder path="src" name="src">
            <FileTreeFile path="src/index.ts" name="index.ts" />
            <FileTreeFile path="src/cli.ts" name="cli.ts" />
          </FileTreeFolder>
          <FileTreeFile path="README.md" name="README.md" />
        </FileTree>
      </View>
      <View className="gap-1">
        <Label>Empty tree — the empty atom, not a blank card</Label>
        <FileTree />
      </View>
      <Text variant="muted">
        No files composed → the empty fallback renders. selectedPath from the control
        highlights the matching name without a single press.
      </Text>
    </View>
  ),
};

/* --------------------------------------------------- environment-variables ---- */

/** Masked by default (AC-4), the global switch, the single-value reveal, the copy format. */
export const EnvironmentVariablesBoard: Story = {
  render: () => {
    const [copied, setCopied] = useState<string>();

    return (
      <View className="gap-3">
        <Label>Masked by default — reveal one value, or all of them</Label>
        <EnvironmentVariables>
          <EnvironmentVariablesHeader>
            <EnvironmentVariablesTitle>Agent environment</EnvironmentVariablesTitle>
            <EnvironmentVariablesToggle />
          </EnvironmentVariablesHeader>
          <EnvironmentVariablesContent>
            <EnvironmentVariable name={API_KEY.name} value={API_KEY.value} required>
              <View className="flex-row items-center gap-1">
                <EnvironmentVariableValue />
                <EnvironmentVariableRevealButton />
                <EnvironmentVariableCopyButton onCopy={() => setCopied(formatEnvLine(API_KEY.name, API_KEY.value))} />
              </View>
            </EnvironmentVariable>
            <EnvironmentVariable name={DATABASE_URL.name} value={DATABASE_URL.value} />
            <EnvironmentVariableGroup label="Build">
              <EnvironmentVariable name="NODE_ENV" value="production" />
              <EnvironmentVariable name="DEBUG" value="rnr:registry:*" />
            </EnvironmentVariableGroup>
          </EnvironmentVariablesContent>
        </EnvironmentVariables>
        <Text variant="muted" numberOfLines={2} selectable>
          {copied ? `Copied: ${copied}` : 'Tap a copy button — the export KEY="value" line echoes here.'}
        </Text>
        <Text variant="muted">
          Every value is masked at rest (8–24 bullets, length-clamped, never zero). The
          eye reveals ONE row; the header Switch reveals all. The clipboard always gets
          the real value — the mask is a display guard.
        </Text>
      </View>
    );
  },
};

/** Controls on the primitive props: the reveal-all state, controlled. */
export const EnvironmentVariablesSandbox = {
  args: {
    showValues: false,
  },
  argTypes: {
    showValues: { control: 'boolean' },
  },
  render: (args: { showValues: boolean }) => (
    <View className="gap-3">
      <EnvironmentVariables showValues={args.showValues}>
        <EnvironmentVariablesHeader>
          <EnvironmentVariablesTitle>Controlled</EnvironmentVariablesTitle>
          <EnvironmentVariablesToggle />
        </EnvironmentVariablesHeader>
        <EnvironmentVariablesContent>
          <EnvironmentVariable name="SECRET" value="hunter2" />
        </EnvironmentVariablesContent>
      </EnvironmentVariables>
      <Text variant="muted">
        showValues is CONTROLLED here — the Switch fires onShowValuesChange and the
        control owns the state. Per-row eyes still work underneath it.
      </Text>
    </View>
  ),
};

/* -------------------------------------------------------------- package-info ---- */

/** The upgrade card: transition line, compressed change badge, install, dependencies. */
export const PackageInfoBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Upgrade card — version transition, install command, dependencies</Label>
        <PackageInfo name="drizzle-orm" currentVersion="0.44.2" newVersion="0.44.7" changeType="patch">
          <PackageInfoHeader>
            <View className="min-w-0 flex-1 gap-0.5">
              <PackageInfoName />
              <PackageInfoVersion />
            </View>
            <PackageInfoChangeType />
          </PackageInfoHeader>
          <PackageInfoContent>
            <PackageInfoInstall />
            <PackageInfoDependencies>
              {PACKAGE_DEPS.map((dep) => (
                <PackageInfoDependency key={dep.name} name={dep.name} version={dep.version} />
              ))}
            </PackageInfoDependencies>
          </PackageInfoContent>
        </PackageInfo>
      </View>
      <View className="gap-1">
        <Label>The five change types, compressed onto the house status colors</Label>
        <View className="gap-3">
          {CHANGE_TYPES.map((changeType) => (
            <PackageInfo
              key={changeType}
              name="drizzle-orm"
              currentVersion="0.44.2"
              newVersion={changeType === 'removed' ? undefined : '0.45.0'}
              changeType={changeType}
            >
              <PackageInfoHeader>
                <View className="min-w-0 flex-1 gap-0.5">
                  <PackageInfoName />
                  <PackageInfoVersion />
                </View>
                <PackageInfoChangeType />
              </PackageInfoHeader>
            </PackageInfo>
          ))}
        </View>
      </View>
      <Text variant="muted">
        AC-3's install command composes the Snippet organism — $ prefix, readOnly field,
        flip-and-revert copy. The badge's WORD carries the kind; its color is the house
        compression of the web's five hues. A removed card shows no transition target.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props — name, versions, change type, install override. */
export const PackageInfoSandbox = {
  args: {
    name: 'drizzle-orm',
    currentVersion: '0.44.2',
    newVersion: '0.44.7',
    changeType: 'patch',
    installCommandOverride: '',
  },
  argTypes: {
    name: { control: 'text' },
    currentVersion: { control: 'text' },
    newVersion: { control: 'text' },
    changeType: { control: 'select', options: CHANGE_TYPES },
    installCommandOverride: { control: 'text' },
  },
  render: (args: {
    name: string;
    currentVersion: string;
    newVersion: string;
    changeType: PackageChangeType;
    installCommandOverride: string;
  }) => (
    <View className="gap-3">
      <PackageInfo
        name={args.name}
        currentVersion={args.currentVersion}
        newVersion={args.newVersion}
        changeType={args.changeType}
        installCommand={args.installCommandOverride || undefined}
      >
        <PackageInfoHeader>
          <View className="min-w-0 flex-1 gap-0.5">
            <PackageInfoName />
            <PackageInfoVersion />
          </View>
          <PackageInfoChangeType />
        </PackageInfoHeader>
        <PackageInfoContent>
          <PackageInfoInstall />
        </PackageInfoContent>
      </PackageInfo>
      <Text variant="muted">
        Clear the newVersion and the card reads "installed at current" — the install line
        drops its pin. An install override (e.g. "pnpm add drizzle-orm") replaces the
        default npm line wholesale.
      </Text>
    </View>
  ),
};

/* --------------------------------------------------------------- guards ---- */

/**
 * Every hook throws outside its root, byte-verbatim (the upstream trap contract). The
 * probes catch synchronously the way the Audio stories' probe does and print the
 * trapped messages.
 */
export const ContractGuards: Story = {
  render: () => {
    const trapped: string[] = [];

    function Probe(): null {
      for (const probe of [
        () => useTerminal(),
        () => useFileTree(),
        () => useEnvVars(),
        () => useVariable(),
        () => usePackageInfo(),
      ]) {
        try {
          probe();
          trapped.push('NOT THROWN — the trap failed');
        } catch (error) {
          trapped.push((error as Error).message);
        }
      }
      return null;
    }

    return (
      <View className="gap-2">
        <Probe />
        <Text variant="muted" selectable>
          {trapped.join('\n')}
        </Text>
      </View>
    );
  },
};
