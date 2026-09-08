/**
 * Seeded matrix cells — code and devtool surfaces. Real paths, real ANSI,
 * real package data from this project's own world.
 */
import * as React from 'react';
import { Text } from 'react-native';

import {
  Commit,
  CommitAuthor,
  CommitAuthorAvatar,
  CommitContent,
  CommitCopyButton,
  CommitDescription,
  CommitFile,
  CommitFileChanges,
  CommitHeader,
  CommitMessage,
  CommitTitle,
} from '@/components/ai/commit';
import {
  EnvironmentVariable,
  EnvironmentVariableCopyButton,
  EnvironmentVariableName,
  EnvironmentVariableRequired,
  EnvironmentVariables,
} from '@/components/ai/environment-variables';
import { FileTree, FileTreeFile, FileTreeFolder } from '@/components/ai/file-tree';
import {
  PackageInfo,
  PackageInfoContent,
  PackageInfoDescription,
  PackageInfoHeader,
  PackageInfoInstall,
  PackageInfoName,
  PackageInfoTitle,
} from '@/components/ai/package-info';
import {
  SchemaDisplay,
  SchemaDisplayContent,
  SchemaDisplayHeader,
  SchemaDisplayMethod,
  SchemaDisplayPath,
} from '@/components/ai/schema-display';
import { Snippet, SnippetCopyButton, SnippetText } from '@/components/ai/snippet';
import {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceError,
  StackTraceErrorMessage,
  StackTraceErrorType,
  StackTraceExpandButton,
} from '@/components/ai/stack-trace';
import {
  Terminal,
  TerminalActions,
  TerminalClearButton,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalStatus,
  TerminalTitle,
} from '@/components/ai/terminal';
import {
  Test,
  TestDuration,
  TestName,
  TestResults,
  TestResultsContent,
  TestResultsHeader,
  TestSuite,
  TestSuiteContent,
  TestSuiteName,
} from '@/components/ai/test-results';
import { Transcription, TranscriptionSegment } from '@/components/ai/transcription';
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewUrl,
} from '@/components/ai/web-preview';
import { Shimmer } from '@/components/ai/shimmer';
import type { ItemCells } from '../cells';

const REAL_TRACE = `TypeError: Cannot read properties of undefined (reading 'items')
    at main (packages/registry/scripts/build-registry.ts:130:19)
    at node:internal/modules/run_main:123:5`;

const ANSI_LOG =
  '[32m✓[0m registry fresh — 56 item(s) x 2 engine(s)\n' +
  '[90mstar[0m resolved 74 files, skipped 19 identical\n' +
  '[31m✗[0m engine parity: chain-of-thought.json differs beyond the token\n' +
  '[33m![0m re-run pnpm registry:build to regenerate';

export const AI_CODE_CELLS: Record<string, ItemCells> = {
  commit: {
    populated: () => (
      <Commit defaultOpen>
        <CommitHeader>
          <CommitAuthor>
            <CommitAuthorAvatar initials="JR" />
            <Text className="text-sm text-foreground">Justin Rich</Text>
          </CommitAuthor>
          <CommitTitle>swap mvp planning binder for one-page plan</CommitTitle>
          <CommitDescription>59 files deleted, one README left standing</CommitDescription>
        </CommitHeader>
        <CommitContent>
          <CommitFile path="packages/registry/registry.json">
            <CommitFileChanges additions={6} deletions={2} />
          </CommitFile>
          <CommitFile path="scripts/check-tokens.ts">
            <CommitFileChanges additions={190} deletions={0} />
          </CommitFile>
        </CommitContent>
        <CommitActions>
          <CommitCopyButton hash="ad2267d" />
        </CommitActions>
      </Commit>
    ),
    empty: () => (
      <Commit>
        <CommitHeader>
          <CommitTitle>(no commit selected)</CommitTitle>
        </CommitHeader>
      </Commit>
    ),
    loading: () => (
      <Commit>
        <CommitHeader>
          <Shimmer active>
            <Text className="text-sm">fetching commit…</Text>
          </Shimmer>
        </CommitHeader>
      </Commit>
    ),
    error: () => (
      <Commit defaultOpen>
        <CommitHeader>
          <CommitTitle>bad-object</CommitTitle>
          <CommitDescription>no such commit at this ref</CommitDescription>
        </CommitHeader>
      </Commit>
    ),
  },
  'environment-variables': {
    populated: () => (
      <EnvironmentVariables showValues={false}>
        <EnvironmentVariable name="GITHUB_TOKEN" value="ghp_7f3a…9c2e" required>
          <EnvironmentVariableName>
            <EnvironmentVariableRequired />
          </EnvironmentVariableName>
        </EnvironmentVariable>
        <EnvironmentVariable name="EXPO_PUBLIC_REGISTRY_TAG" value="v0.2.0" />
      </EnvironmentVariables>
    ),
    empty: () => (
      <EnvironmentVariables>
        <Text className="text-sm text-muted-foreground">(no variables configured)</Text>
      </EnvironmentVariables>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">reading process.env…</Text>
      </Shimmer>
    ),
    error: () => (
      <EnvironmentVariables showValues>
        <EnvironmentVariable name="MISSING_REQUIRED" value="" required />
      </EnvironmentVariables>
    ),
  },
  'file-tree': {
    populated: () => (
      <FileTree
        expanded={new Set(['apps/example/components', 'apps/example/components/ai'])}
        selectedPath="apps/example/components/ai/conversation.tsx"
      >
        <FileTreeFolder path="apps" name="apps">
          <FileTreeFolder path="apps/example" name="example">
            <FileTreeFolder path="apps/example/components" name="components">
              <FileTreeFolder path="apps/example/components/ai" name="ai">
                <FileTreeFile path="apps/example/components/ai/conversation.tsx" name="conversation.tsx" />
                <FileTreeFile path="apps/example/components/ai/prompt-input.tsx" name="prompt-input.tsx" />
              </FileTreeFolder>
              <FileTreeFolder path="apps/example/components/ui" name="ui">
                <FileTreeFile path="apps/example/components/ui/button.tsx" name="button.tsx" />
              </FileTreeFolder>
            </FileTreeFolder>
          </FileTreeFolder>
        </FileTreeFolder>
      </FileTree>
    ),
    empty: () => (
      <FileTree>
        <Text className="text-sm text-muted-foreground">(empty workspace)</Text>
      </FileTree>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">walking the tree…</Text>
      </Shimmer>
    ),
    error: () => (
      <FileTree>
        <Text className="text-sm text-destructive">workspace unavailable — the remote went away</Text>
      </FileTree>
    ),
  },
  'package-info': {
    populated: () => (
      <PackageInfo name="@rnr-ai-elements/registry" currentVersion="0.1.0" newVersion="0.2.0" changeType="patch">
        <PackageInfoHeader>
          <PackageInfoTitle>Registry</PackageInfoTitle>
          <PackageInfoName />
        </PackageInfoHeader>
        <PackageInfoDescription>The copy-paste registry both engines fan out from</PackageInfoDescription>
        <PackageInfoInstall />
      </PackageInfo>
    ),
    empty: () => (
      <PackageInfo name="(no package)">
        <PackageInfoHeader>
          <PackageInfoTitle>(no package)</PackageInfoTitle>
        </PackageInfoHeader>
      </PackageInfo>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">resolving npm metadata…</Text>
      </Shimmer>
    ),
    error: () => (
      <PackageInfo name="@rnr-ai-elements/registry" currentVersion="0.1.0">
        <PackageInfoHeader>
          <PackageInfoTitle>Registry</PackageInfoTitle>
        </PackageInfoHeader>
        <PackageInfoContent>
          <Text className="text-sm text-destructive">E404 — the new version was never published</Text>
        </PackageInfoContent>
      </PackageInfo>
    ),
  },
  'schema-display': {
    populated: () => (
      <SchemaDisplay
        method="GET"
        path="/r/{engine}/{item}.json"
        description="Fetch one registry item for a given engine"
        parameters={[
          { name: 'engine', type: 'string', required: true, location: 'path', description: 'nativewind | uniwind' },
          { name: 'item', type: 'string', required: true, location: 'path', description: 'the item name' },
        ]}
        responseBody={[{ name: 'item', type: 'RegistryItem', required: true }]}
      >
        <SchemaDisplayHeader>
          <SchemaDisplayMethod />
          <SchemaDisplayPath />
        </SchemaDisplayHeader>
      </SchemaDisplay>
    ),
    empty: () => (
      <SchemaDisplay method="GET" path="/">
        <SchemaDisplayHeader>
          <SchemaDisplayMethod />
          <SchemaDisplayPath />
        </SchemaDisplayHeader>
      </SchemaDisplay>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">parsing OpenAPI schema…</Text>
      </Shimmer>
    ),
    error: () => (
      <SchemaDisplay method="POST" path="/r/item.json" description="Method not allowed">
        <SchemaDisplayHeader>
          <SchemaDisplayMethod />
          <SchemaDisplayPath />
        </SchemaDisplayHeader>
      </SchemaDisplay>
    ),
  },
  snippet: {
    populated: () => (
      <Snippet code="pnpm dlx @react-native-reusables/cli add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.0/public/r/uniwind/conversation.json">
        <SnippetText />
        <SnippetCopyButton />
      </Snippet>
    ),
    empty: () => (
      <Snippet code="">
        <SnippetText />
      </Snippet>
    ),
    loading: () => (
      <Snippet code="pnpm install…">
        <Shimmer active>
          <Text className="text-sm">composing the command…</Text>
        </Shimmer>
      </Snippet>
    ),
    error: () => (
      <Snippet code="npx bad-cli add item.json">
        <SnippetText />
        <SnippetCopyButton />
      </Snippet>
    ),
  },
  'stack-trace': {
    populated: () => (
      <StackTrace trace={REAL_TRACE}>
        <StackTraceError>
          <StackTraceErrorType />
          <StackTraceErrorMessage />
        </StackTraceError>
        <StackTraceActions>
          <StackTraceCopyButton />
          <StackTraceExpandButton />
        </StackTraceActions>
        <StackTraceContent />
      </StackTrace>
    ),
    empty: () => (
      <StackTrace trace="">
        <StackTraceError>
          <StackTraceErrorMessage />
        </StackTraceError>
      </StackTrace>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">parsing frames…</Text>
      </Shimmer>
    ),
    error: () => (
      <StackTrace trace={'not a trace at all\nsecond line without a frame'}>
        <StackTraceError>
          <StackTraceErrorMessage />
        </StackTraceError>
        <StackTraceContent />
      </StackTrace>
    ),
  },
  terminal: {
    populated: () => (
      <Terminal output={ANSI_LOG} isStreaming={false} autoScroll onClear={() => {}}>
        <TerminalHeader>
          <TerminalTitle>registry — pnpm check:registry</TerminalTitle>
          <TerminalStatus />
          <TerminalActions>
            <TerminalCopyButton />
            <TerminalClearButton />
          </TerminalActions>
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
    ),
    empty: () => (
      <Terminal output="">
        <TerminalHeader>
          <TerminalTitle>registry</TerminalTitle>
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
    ),
    loading: () => (
      <Terminal output={ANSI_LOG} isStreaming autoScroll>
        <TerminalHeader>
          <TerminalTitle>registry — building</TerminalTitle>
          <TerminalStatus />
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
    ),
    error: () => (
      <Terminal output={'[31mELIFECYCLE[0m  Command failed with exit code 1'}>
        <TerminalHeader>
          <TerminalTitle>registry</TerminalTitle>
          <TerminalStatus />
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
    ),
  },
  'test-results': {
    populated: () => (
      <TestResults summary={{ passed: 565, failed: 0, skipped: 0, total: 565, duration: 602 }}>
        <TestResultsHeader />
        <TestResultsContent>
          <TestSuite name="tests/build-registry.test.ts">
            <TestSuiteContent>
              <Test name="pins every self-referencing URL to the release tag">
                <TestName />
                <TestDuration />
              </Test>
            </TestSuiteContent>
          </TestSuite>
        </TestResultsContent>
      </TestResults>
    ),
    empty: () => (
      <TestResults>
        <TestResultsHeader />
        <TestResultsContent />
      </TestResults>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">collecting junit…</Text>
      </Shimmer>
    ),
    error: () => (
      <TestResults summary={{ passed: 563, failed: 2, skipped: 0, total: 565, duration: 834 }}>
        <TestResultsHeader />
        <TestResultsContent>
          <TestSuite name="tests/sprint-01/alias-resolution.test.ts">
            <TestSuiteContent>
              <Test name="zero @/registry/ literals in the consumer tree">
                <TestName />
              </Test>
            </TestSuiteContent>
          </TestSuite>
        </TestResultsContent>
      </TestResults>
    ),
  },
  transcription: {
    populated: () => (
      <Transcription
        segments={[
          { text: 'Install the full 56-item set through the real CLI.', startSecond: 0, endSecond: 3.2 },
          { text: 'Then prove it cold-boots on both platforms.', startSecond: 3.4, endSecond: 6.1 },
        ]}
        currentTime={3.8}
      >
        <TranscriptionSegment segment={{ text: 'Install the full 56-item set through the real CLI.', startSecond: 0, endSecond: 3.2 }} />
        <TranscriptionSegment segment={{ text: 'Then prove it cold-boots on both platforms.', startSecond: 3.4, endSecond: 6.1 }} />
      </Transcription>
    ),
    empty: () => <Transcription segments={[]} currentTime={0}>{null}</Transcription>,
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">transcribing live audio…</Text>
      </Shimmer>
    ),
    error: () => (
      <Transcription segments={[]} currentTime={0}>
        <Text className="text-sm text-destructive">transcriber disconnected — final segments only</Text>
      </Transcription>
    ),
  },
  'web-preview': {
    populated: () => (
      <WebPreview defaultUrl="https://reactnativereusables.com">
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        <WebPreviewBody />
      </WebPreview>
    ),
    empty: () => (
      <WebPreview defaultUrl="">
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
      </WebPreview>
    ),
    loading: () => (
      <WebPreview defaultUrl="https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.0/public/r/uniwind/registry.json">
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        <Shimmer active>
          <Text className="text-sm">loading page…</Text>
        </Shimmer>
      </WebPreview>
    ),
    error: () => (
      <WebPreview defaultUrl="https://unreachable.invalid/registry">
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
      </WebPreview>
    ),
  },
};
