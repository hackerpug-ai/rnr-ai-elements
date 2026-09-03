import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Text } from '@/registry/{engine}/components/ui/text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/{engine}/components/ui/table';
import {
  Snippet,
  SnippetAddon,
  SnippetCopyButton,
  SnippetInput,
  SnippetText,
} from '@/registry/{engine}/components/ai/snippet';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import {
  formatVersionTransition,
  installCommand,
  packageChangeTypeMeta,
  type PackageChangeType,
} from './package-info.logic';

/**
 * PackageInfo — a package metadata card (UC-CODE-01 AC-3: name, version, and an
 * install command that copies to the clipboard).
 *
 * THE PRD VERDICT IS PORT-AT-PARITY: "Card of package name, version, and a copyable
 * install command; all RNR primitives." The upstream part set, from the KB, ported
 * part for part: PackageInfo root (name required / currentVersion / newVersion /
 * changeType), PackageInfoHeader, PackageInfoName, PackageInfoVersion (the KB's
 * "version transition display" — current → next), PackageInfoDescription,
 * PackageInfoContent, PackageInfoDependencies, PackageInfoDependency (name, version),
 * and PackageInfoChangeType (Badge).
 *
 * THE ONE DECLARED ADDITION: upstream ships no install-command part, but AC-3 is the
 * binding acceptance and the verdict's own words ("a copyable install command") demand
 * one — so PackageInfoInstall composes the registry's existing Snippet (the copyable
 * command organism) inside the card. The line comes from package-info.logic's
 * installCommand(): the NEW version pins the install when present, otherwise latest.
 *
 * COLOR COMPRESSION rides package-info.logic's map: the web's five change-type hues
 * compress onto the house status vocabulary, and the badge text ("major", "added")
 * carries the kind — color is never the sole channel.
 *
 * COMPOSITION: the build plan names `table` as the backing primitive for this surface,
 * so PackageInfoDependencies is ONE Table (package/version header, one row per
 * dependency) — the same scaffold environment-variables uses. The name and version
 * ride the house mono family (lib/mono).
 */

type PackageInfoContextValue = {
  name: string;
  /** "1.2.3 → 2.0.0" / "1.2.3" / null — the transition display, precomputed. */
  versionLabel: string | null;
  changeType?: PackageChangeType;
  /** The copyable line the install part renders. */
  installCommandText: string;
};

const PackageInfoContext = React.createContext<PackageInfoContextValue | null>(null);

function usePackageInfo() {
  const ctx = React.useContext(PackageInfoContext);
  if (!ctx) throw new Error('PackageInfo sub-components must be used within <PackageInfo>');
  return ctx;
}

export type PackageInfoProps = Omit<ViewProps, 'children'> & {
  /** Required upstream, and kept required — an unnamed package is not package info. */
  name: string;
  /** What's installed now. */
  currentVersion?: string;
  /** What the card is announcing (the upgrade target). */
  newVersion?: string;
  changeType?: PackageChangeType;
  /** Overrides the default install line (pnpm add …, bun add …). */
  installCommand?: string;
  children?: React.ReactNode;
};

function PackageInfo({
  name,
  currentVersion,
  newVersion,
  changeType,
  installCommand: installCommandOverride,
  className,
  children,
  ...props
}: PackageInfoProps) {
  const contextValue = React.useMemo<PackageInfoContextValue>(
    () => ({
      name,
      versionLabel: formatVersionTransition(currentVersion, newVersion),
      changeType,
      // The NEW version pins the install when present (an upgrade card pins its
      // target); otherwise latest — currentVersion describes, it does not pin.
      installCommandText: installCommandOverride ?? installCommand(name, newVersion),
    }),
    [name, currentVersion, newVersion, changeType, installCommandOverride],
  );

  return (
    <PackageInfoContext.Provider value={contextValue}>
      <View
        className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}
        {...props}
      >
        {children}
      </View>
    </PackageInfoContext.Provider>
  );
}

function PackageInfoHeader({ className, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View
      className={cn('flex-row items-start justify-between gap-3 px-3 py-3', className)}
      {...props}
    />
  );
}

/** The package name — mono, like every house surface that shows a code identifier. */
function PackageInfoName({ children, className }: { children?: string; className?: string }) {
  const { name } = usePackageInfo();
  return (
    <Text
      numberOfLines={1}
      style={monoStyle}
      className={cn('text-sm font-medium text-foreground', className)}
    >
      {children ?? name}
    </Text>
  );
}

/**
 * The transition line, from context. Null context (no versions yet) renders NOTHING —
 * never "undefined → undefined" mid-stream.
 */
function PackageInfoVersion({ children, className }: { children?: string; className?: string }) {
  const { versionLabel } = usePackageInfo();
  if (children === undefined && versionLabel === null) return null;

  return (
    <Text numberOfLines={1} style={monoStyle} className={cn('text-xs text-muted-foreground', className)}>
      {children ?? versionLabel}
    </Text>
  );
}

/**
 * The change badge: the compressed tone plus its WORD. `children` overrides the label,
 * exactly as the web allows. No changeType in the root renders nothing.
 */
function PackageInfoChangeType({ children, className }: { children?: string; className?: string }) {
  const { changeType } = usePackageInfo();
  if (!changeType) return null;

  const meta = packageChangeTypeMeta(changeType);

  return (
    <Badge variant="outline" className={cn('shrink-0', meta.className, className)}>
      <Text>{children ?? meta.label}</Text>
    </Badge>
  );
}

/** The muted one-liner under the header ("ORM with first-class edge support"). */
function PackageInfoDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      numberOfLines={2}
      className={cn('px-3 pb-3 text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

function PackageInfoContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('gap-3 border-t border-border p-3', className)} {...props}>
      {children}
    </View>
  );
}

/**
 * AC-3's copyable install line, composed on the Snippet organism — the `$` prefix,
 * the readOnly field that scrolls a long command, and the flip-and-revert copy button
 * are all Snippet's, and none of them are rebuilt here.
 */
function PackageInfoInstall({ className }: { className?: string }) {
  const { installCommandText } = usePackageInfo();

  return (
    <Snippet code={installCommandText} className={className}>
      <SnippetAddon>
        <SnippetText>$</SnippetText>
      </SnippetAddon>
      <SnippetInput />
      <SnippetCopyButton />
    </Snippet>
  );
}

/**
 * The dependency table: package/version header, one row per PackageInfoDependency.
 * Fixed column sizes + the table's own horizontal scroll handle overflowing names.
 */
function PackageInfoDependencies({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <Table scrollable className={className}>
      <TableHeader>
        <TableHead className="w-40 shrink-0">
          <Text className="text-xs font-medium text-muted-foreground">Package</Text>
        </TableHead>
        <TableHead className="w-24 shrink-0">
          <Text className="text-xs font-medium text-muted-foreground">Version</Text>
        </TableHead>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

export type PackageInfoDependencyProps = {
  /** Required upstream, and kept required. */
  name: string;
  /** Missing version renders an em dash, never an empty cell. */
  version?: string;
  className?: string;
};

function PackageInfoDependency({ name, version, className }: PackageInfoDependencyProps) {
  return (
    <TableRow className={className}>
      <TableCell className="w-40 shrink-0">
        <Text numberOfLines={1} style={monoStyle} className="text-xs text-foreground">
          {name}
        </Text>
      </TableCell>
      <TableCell className="w-24 shrink-0">
        <Text numberOfLines={1} style={monoStyle} className="text-xs text-muted-foreground">
          {version?.trim() || '—'}
        </Text>
      </TableCell>
    </TableRow>
  );
}

export {
  PackageInfo,
  PackageInfoChangeType,
  PackageInfoContent,
  PackageInfoDependencies,
  PackageInfoDependency,
  PackageInfoDescription,
  PackageInfoHeader,
  PackageInfoInstall,
  PackageInfoName,
  PackageInfoVersion,
  usePackageInfo,
};
