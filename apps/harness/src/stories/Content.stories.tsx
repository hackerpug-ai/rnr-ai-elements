import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import { Artifact, ArtifactAction, ArtifactActions, ArtifactClose, ArtifactContent, ArtifactDescription, ArtifactHeader, ArtifactTitle } from '@/components/ai/artifact';
import {
  Commit,
  CommitActions,
  CommitAuthorAvatar,
  CommitContent,
  CommitCopyButton,
  CommitFile,
  CommitFileAdditions,
  CommitFileChanges,
  CommitFileDeletions,
  CommitFileIcon,
  CommitFileInfo,
  CommitFilePath,
  CommitFileStatus,
  CommitFiles,
  CommitHash,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitSeparator,
  CommitTimestamp,
} from '@/components/ai/commit';
import type { CommitFileStatus as CommitFileStatusValue } from '@/components/ai/commit.logic';
import { shortSha } from '@/components/ai/commit.logic';
import { InlineCitation, InlineCitationChip, InlineCitationText } from '@/components/ai/inline-citation';
import { citationBadgeLabel } from '@/components/ai/inline-citation.logic';
import { Sources, Source, SourcesContent, SourcesTrigger } from '@/components/ai/sources';
import type { SourceData } from '@/components/ai/sources.logic';
import { Snippet, SnippetAddon, SnippetCopyButton, SnippetInput, SnippetText } from '@/components/ai/snippet';
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockFilename, CodeBlockHeader } from '@/components/ui/code-block';
import { Text } from '@/components/ui/text';
import { DownloadIcon, ExternalLinkIcon } from 'lucide-react-native';

/**
 * Wave 8 — the content organisms I: sources, inline-citation, artifact, snippet,
 * commit.
 *
 * Every state is visible statically (the fixture stories are what the device sign-off
 * screenshots), and each component gets one sandbox story with controls on its
 * primitive props. Fixtures are citation/source/commit-shaped: a URL list with
 * hostnames for the two citation surfaces, a long un-wrappable command for the
 * snippet, and a four-status file list for the commit.
 *
 * Two behaviors are live on device by design: tapping a source row asks the OS to open
 * the URL (UC-CHAT-05 AC-3 — the platform link handler IS the behavior), and tapping a
 * citation chip fires the callback whose echo renders under the paragraph (the
 * popover/sheet it opens is the consumer's composition).
 */
const meta = { title: 'AI Elements/Content' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sandbox stories keep their primitive props as plain CSF object literals — the
 * on-device controls addon reads args/argTypes at runtime, and annotating them with
 * StoryObj fights Storybook 10's meta inference for cross-component files.
 */

function Label({ children }: { children: string }) {
  return <Text variant="muted" className="text-xs uppercase">{children}</Text>;
}

/* --------------------------------------------------------------- fixtures ---- */

const SOURCES: SourceData[] = [
  {
    id: 'rnr',
    title: 'React Native Reusables — Installation',
    url: 'https://reactnativereusables.com/docs/installation',
  },
  { id: 'uniwind', title: 'Uniwind — Quickstart', url: 'https://docs.uniwind.dev/quickstart' },
  { id: 'expo', title: 'Expo — SDK 57 changelog', url: 'https://expo.dev/changelog/sdk-57' },
];

const SNIPPET_SHORT = 'pnpm dlx @react-native-reusables/cli@latest add button';
const SNIPPET_LONG =
  'npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context';

const COMMIT_FILES: { path: string; status: CommitFileStatusValue; additions?: number; deletions?: number }[] = [
  { path: 'packages/registry/src/components/ai/sources.tsx', status: 'added', additions: 184, deletions: 0 },
  { path: 'packages/registry/src/lib/url.ts', status: 'added', additions: 47, deletions: 0 },
  { path: 'packages/registry/scripts/build-registry.ts', status: 'modified', additions: 6, deletions: 2 },
  { path: 'docs/decisions/0001-registry-only.md', status: 'deleted', additions: 0, deletions: 33 },
  { path: 'README.md', status: 'renamed', additions: 4, deletions: 4 },
];

/* ---------------------------------------------------------------- sources ---- */

/** Collapsed (the arriving state), expanded (title + domain per AC-1), and the favicon variant. */
export const SourcesBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Collapsed — as the answer arrives</Label>
        <Sources>
          <SourcesTrigger count={SOURCES.length} />
          <SourcesContent>
            {SOURCES.map((s) => (
              <Source key={s.id} href={s.url} title={s.title} />
            ))}
          </SourcesContent>
        </Sources>
      </View>
      <View className="gap-1">
        <Label>Expanded — title and domain glanceable</Label>
        <Sources defaultOpen>
          <SourcesTrigger count={SOURCES.length} />
          <SourcesContent>
            {SOURCES.map((s) => (
              <Source key={s.id} href={s.url} title={s.title} />
            ))}
          </SourcesContent>
        </Sources>
      </View>
      <View className="gap-1">
        <Label>With caller-supplied favicons</Label>
        <Sources defaultOpen>
          <SourcesTrigger count={2} />
          <SourcesContent>
            <Source
              href="https://reactnativereusables.com/docs/installation"
              title="React Native Reusables"
              faviconUri="https://reactnativereusables.com/favicon.ico"
            />
            <Source href="https://docs.uniwind.dev/quickstart" title="Uniwind" faviconUri="https://docs.uniwind.dev/favicon.ico" />
          </SourcesContent>
        </Sources>
      </View>
      <Text variant="muted">
        Rows open the OS link handler behind the http/https allowlist — the web anchor's
        target=_blank. The favicon is opt-in data (SourceData.faviconUri), never a fetch:
        RN has no favicon service without a new dependency.
      </Text>
    </View>
  ),
};

/** The allowlist guard, made visible: a javascript: URL refuses to open and reports why. */
export const SourceGuard: Story = {
  render: () => {
    const [error, setError] = useState<string>();
    return (
      <View className="gap-2">
        <Label>Allowlist guard</Label>
        <Sources defaultOpen>
          <SourcesTrigger count={2} />
          <SourcesContent>
            <Source href="https://reactnativereusables.com/docs" title="A safe https row" />
            <Source
              href="javascript:alert(1)"
              title="A row a stream should never have produced"
              onOpenError={(e) => setError(e.message)}
            />
          </SourcesContent>
        </Sources>
        <Text variant="muted">{error ? `Refused: ${error}` : 'Tap the second row — the allowlist refuses it and the error surfaces.'}</Text>
      </View>
    );
  },
};

/** Controls on the primitive props. */
export const SourcesSandbox = {
  args: {
    count: 3,
    defaultOpen: true,
  },
  argTypes: {
    count: { control: 'number', min: 0, max: 5 },
    defaultOpen: { control: 'boolean' },
  },
  render: (args: { count: number; defaultOpen: boolean }) => (
    <View className="gap-3">
      <Sources defaultOpen={args.defaultOpen}>
        <SourcesTrigger count={args.count} />
        <SourcesContent>
          {SOURCES.slice(0, args.count).map((s) => (
            <Source key={s.id} href={s.url} title={s.title} />
          ))}
        </SourcesContent>
      </Sources>
      <Text variant="muted">
        Zero sources renders the trigger at "Used 0 sources" over an empty list — the
        caller's cue to unmount, not the component's guess.
      </Text>
    </View>
  ),
};

/* --------------------------------------------------------- inline-citation ---- */

/**
 * The inline composition: chips nested inside a text run, exactly as the web nests
 * spans. Pressing a chip fires onSelect — the echo below is what the consumer's
 * popover/sheet would open.
 */
export const CitationInline: Story = {
  render: () => {
    const [cited, setCited] = useState<string>();
    return (
      <View className="gap-3">
        <Label>A paragraph with citations</Label>
        <Text className="text-sm leading-7 text-foreground">
          The registry fans one engine-agnostic source into both styling engines
          <InlineCitation>
            <InlineCitationText> </InlineCitationText>
            <InlineCitationChip
              sources={['https://reactnativereusables.com/docs', 'https://docs.uniwind.dev/quickstart', 'https://expo.dev/changelog/sdk-57']}
              onSelect={setCited}
            />
          </InlineCitation>
          , verified by the 32/32 parity measurement
          <InlineCitation>
            <InlineCitationText> </InlineCitationText>
            <InlineCitationChip sources={['https://github.com/founded-labs/react-native-reusables']} onSelect={setCited} />
          </InlineCitation>
          . An empty citation list degrades to "unknown"
          <InlineCitation>
            <InlineCitationText> </InlineCitationText>
            <InlineCitationChip sources={[]} onSelect={setCited} />
          </InlineCitation>
          .
        </Text>
        <Text variant="muted">
          {cited ? `Chip pressed — onSelect received: ${cited}` : 'Tap a chip: the callback fires; the detail surface is the caller’s to open.'}
        </Text>
        <Text variant="muted">{`Chip labels: "${citationBadgeLabel(['https://expo.dev/changelog/sdk-57'])}", "${citationBadgeLabel([
          'https://expo.dev/changelog/sdk-57',
          'https://expo.dev/changelog/sdk-56',
        ])}", "${citationBadgeLabel([])}"`}</Text>
      </View>
    );
  },
};

/** Controls on the primitive props — flip the source list and watch the chip label. */
export const CitationSandbox = {
  args: {
    primary: 'https://reactnativereusables.com/docs',
    extra: 2,
  },
  argTypes: {
    primary: { control: 'text' },
    extra: { control: 'number', min: 0, max: 9 },
  },
  render: (args: { primary: string; extra: number }) => {
    const [cited, setCited] = useState<string>();
    const sources = [args.primary, ...Array.from({ length: args.extra }, (_, i) => `https://example.com/source-${i + 1}`)];
    return (
      <View className="gap-3">
        <Text className="text-sm leading-7 text-foreground">
          Dual-engine at parity
          <InlineCitation>
            <InlineCitationText> </InlineCitationText>
            <InlineCitationChip sources={sources} onSelect={setCited} />
          </InlineCitation>
        </Text>
        <Text variant="muted">{cited ? `onSelect: ${cited}` : 'Chip label = first hostname, plus N when more sources back the claim.'}</Text>
      </View>
    );
  },
};

/* --------------------------------------------------------------- artifact ---- */

/** The container with full header chrome and a CodeBlock payload — the sheet's contents. */
export const ArtifactBoard: Story = {
  render: () => (
    <View className="gap-3">
      <Label>Generated artifact, header chrome complete</Label>
      {/* The real host is a Sheet — a BOUNDED surface. ArtifactContent is flex-1 by
          design (it fills its host); in an unbounded story column that collapses to
          zero, so this demonstrates the container at a realistic bounded height. */}
      <View style={{ height: 360 }}>
        <Artifact className="h-full">
        <ArtifactHeader>
          <View className="min-w-0 flex-1 gap-0.5">
            <ArtifactTitle>registry-fanout.ts</ArtifactTitle>
            <ArtifactDescription>Generated 12s ago · 84 lines</ArtifactDescription>
          </View>
          <ArtifactActions>
            <ArtifactAction icon={DownloadIcon} label="Download" onPress={() => {}} />
            <ArtifactAction icon={ExternalLinkIcon} label="Open externally" onPress={() => {}} disabled />
            <ArtifactClose onPress={() => {}} />
          </ArtifactActions>
        </ArtifactHeader>
        <ArtifactContent>
          <CodeBlock language="ts" code={'export function resolveEngine(value: string, engine: string) {\n  return value.split(ENGINE_TOKEN).join(engine);\n}'}>
            <CodeBlockHeader>
              <CodeBlockFilename>registry-fanout.ts</CodeBlockFilename>
              <CodeBlockActions>
                <CodeBlockCopyButton />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent />
          </CodeBlock>
        </ArtifactContent>
      </Artifact>
      </View>
      <Text variant="muted">
        The PRD's full-screen sheet is the HOST's presentation: mount this container in a
        Sheet and wire Close to the dismissal. No trigger and no versioning exist
        upstream — the container is the whole web component.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props. */
export const ArtifactSandbox = {
  args: {
    title: 'migration-plan.md',
    description: 'Generated 3 minutes ago',
    showActions: true,
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    showActions: { control: 'boolean' },
  },
  render: (args: { title: string; description: string; showActions: boolean }) => (
    <View className="gap-3">
      <Artifact>
        <ArtifactHeader>
          <View className="min-w-0 flex-1 gap-0.5">
            <ArtifactTitle>{args.title}</ArtifactTitle>
            {args.description ? <ArtifactDescription>{args.description}</ArtifactDescription> : null}
          </View>
          {args.showActions ? (
            <ArtifactActions>
              <ArtifactAction icon={DownloadIcon} label="Download" onPress={() => {}} />
              <ArtifactClose onPress={() => {}} />
            </ArtifactActions>
          ) : null}
        </ArtifactHeader>
        <ArtifactContent>
          <Text variant="muted">
            The content slot scrolls (the web's overflow-auto). Anything composes here —
            CodeBlock, markdown, the consumer's own renderer.
          </Text>
        </ArtifactContent>
      </Artifact>
      <Text variant="muted">Empty description collapses to a title-only header; actions off removes the cluster entirely.</Text>
    </View>
  ),
};

/* ---------------------------------------------------------------- snippet ---- */

/** Short command with a $ prefix addon, and a long command that must not wrap or grow. */
export const SnippetBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Install command</Label>
        <Snippet code={SNIPPET_SHORT}>
          <SnippetAddon>
            <SnippetText>$</SnippetText>
          </SnippetAddon>
          <SnippetInput />
          <SnippetCopyButton />
        </Snippet>
      </View>
      <View className="gap-1">
        <Label>Long command — scrolls its field, never wraps</Label>
        <Snippet code={SNIPPET_LONG}>
          <SnippetAddon>
            <SnippetText>$</SnippetText>
          </SnippetAddon>
          <SnippetInput />
          <SnippetCopyButton />
        </Snippet>
      </View>
      <Text variant="muted">
        Copy flips to a check for 2s and calls onError instead of failing silently. The
        field is readOnly: the command is display text in a selectable input.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props. */
export const SnippetSandbox = {
  args: {
    code: SNIPPET_SHORT,
    prefix: '$',
  },
  argTypes: {
    code: { control: 'text' },
    prefix: { control: 'text' },
  },
  render: (args: { code: string; prefix: string }) => (
    <View className="gap-3">
      <Snippet code={args.code}>
        {args.prefix ? (
          <SnippetAddon>
            <SnippetText>{args.prefix}</SnippetText>
          </SnippetAddon>
        ) : null}
        <SnippetInput />
        <SnippetCopyButton />
      </Snippet>
      <Text variant="muted">Empty prefix drops the addon row — the composition is the caller's.</Text>
    </View>
  ),
};

/* ----------------------------------------------------------------- commit ---- */

/** The full card: hash chip, message, author, timestamp, and the four file statuses. */
export const CommitBoard: Story = {
  render: () => {
    const commit = {
      hash: '9f2c4ab77e0d31c5a8b6f0d2e1c4a9b8c7d6e5f4',
      message: 'feat: add wave 8 content organisms (sources, citations, artifact, snippet, commit)',
      author: 'Ada Lovelace',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    };
    return (
      <View className="gap-6">
        <View className="gap-1">
          <Label>Expanded — files with the four statuses</Label>
          <Commit defaultOpen>
            <CommitHeader>
              <CommitAuthorAvatar initials="AL" />
              <CommitInfo>
                <CommitMessage>{commit.message}</CommitMessage>
                <CommitMetadata>
                  <CommitHash>{shortSha(commit.hash)}</CommitHash>
                  <CommitSeparator />
                  <Text className="text-xs text-muted-foreground">{commit.author}</Text>
                  <CommitSeparator />
                  <CommitTimestamp date={commit.timestamp} />
                </CommitMetadata>
              </CommitInfo>
              <CommitActions className="shrink-0">
                <CommitCopyButton hash={commit.hash} />
              </CommitActions>
            </CommitHeader>
            <CommitContent>
              <CommitFiles>
                {COMMIT_FILES.map((f) => (
                  <CommitFile key={f.path}>
                    <CommitFileInfo>
                      <CommitFileIcon />
                      <CommitFilePath>{f.path}</CommitFilePath>
                      <CommitFileStatus status={f.status} />
                    </CommitFileInfo>
                    <CommitFileChanges>
                      <CommitFileAdditions count={f.additions ?? 0} />
                      <CommitFileDeletions count={f.deletions ?? 0} />
                    </CommitFileChanges>
                  </CommitFile>
                ))}
              </CommitFiles>
            </CommitContent>
          </Commit>
        </View>
        <View className="gap-1">
          <Label>Collapsed — the arriving state</Label>
          <Commit>
            <CommitHeader>
              <CommitAuthorAvatar initials="JH" />
              <CommitInfo>
                <CommitMessage>fix: guard the fan-out against short-name registry deps</CommitMessage>
                <CommitMetadata>
                  <CommitHash>{shortSha('b7e3d90c1a2f4e5d6c7b8a9f0e1d2c3b4a5f6e7d')}</CommitHash>
                  <CommitSeparator />
                  <CommitTimestamp date={new Date()} />
                </CommitMetadata>
              </CommitInfo>
              <CommitActions className="shrink-0">
                <CommitCopyButton hash="b7e3d90c1a2f4e5d6c7b8a9f0e1d2c3b4a5f6e7d" />
              </CommitActions>
            </CommitHeader>
          </Commit>
        </View>
        <Text variant="muted">
          Status letters (A/M/D/R) carry the kind — the web's four-hue palette compresses
          onto the three permitted status colors, and color is never the sole channel.
          Additions/deletions hide at zero, as the web renders them.
        </Text>
      </View>
    );
  },
};

/** Controls on the primitive props. */
export const CommitSandbox = {
  args: {
    hash: '9f2c4ab77e0d31c5a8b6f0d2e1c4a9b8c7d6e5f4',
    message: 'feat: add wave 8 content organisms',
    author: 'Ada Lovelace',
  },
  argTypes: {
    hash: { control: 'text' },
    message: { control: 'text' },
    author: { control: 'text' },
  },
  render: (args: { hash: string; message: string; author: string }) => (
    <View className="gap-3">
      <Commit defaultOpen>
        <CommitHeader>
          <CommitAuthorAvatar initials={args.author.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()} />
          <CommitInfo>
            <CommitMessage>{args.message}</CommitMessage>
            <CommitMetadata>
              <CommitHash>{shortSha(args.hash)}</CommitHash>
              <CommitSeparator />
              <Text className="text-xs text-muted-foreground">{args.author}</Text>
            </CommitMetadata>
          </CommitInfo>
          <CommitActions className="shrink-0">
            <CommitCopyButton hash={args.hash} />
          </CommitActions>
        </CommitHeader>
        <CommitContent>
          <CommitFiles>
            <CommitFile>
              <CommitFileInfo>
                <CommitFileIcon />
                <CommitFilePath>packages/registry/registry.json</CommitFilePath>
                <CommitFileStatus status="modified" />
              </CommitFileInfo>
              <CommitFileChanges>
                <CommitFileAdditions count={39} />
                <CommitFileDeletions count={0} />
              </CommitFileChanges>
            </CommitFile>
          </CommitFiles>
        </CommitContent>
      </Commit>
      <Text variant="muted">
        The hash chip shows shortSha(hash) — 7 characters, git's abbreviated default.
      </Text>
    </View>
  ),
};
