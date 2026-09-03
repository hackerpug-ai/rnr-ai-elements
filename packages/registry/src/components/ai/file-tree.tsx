import { Button } from '@/registry/{engine}/components/ui/button';
import { Empty, EmptyIcon, EmptyTitle } from '@/registry/{engine}/components/ui/empty';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Item } from '@/registry/{engine}/components/ui/item';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { isExpanded, toggleExpanded } from './file-tree.logic';

/**
 * FileTree — the agent workspace browser (UC-CODE-01 AC-1: browse the tree and expand
 * and collapse directories on a phone-width screen).
 *
 * THE PRD VERDICT IS PORT-ADAPTED: "The nested rows port, but deep indentation is
 * unusable at phone width; needs horizontal scroll or a drill-in navigation model,
 * which changes the interaction." THE PORT TAKES THE HORIZONTAL-SCROLL BRANCH: the
 * whole tree sits in axis-scrolled ScrollViews (bounded vertical host, horizontal
 * inner), so depth pushes RIGHT instead of crushing the names — the same treatment the
 * verdict prescribes for the breadcrumb and code-block families.
 *
 * THE UPSTREAM PART SET, from the KB, ported part for part: FileTree root (expanded /
 * defaultExpanded / selectedPath / onSelect / onExpandedChange — the caller-supplied
 * tree arrives as COMPOSED JSX, not a data prop), FileTreeFolder (path, name),
 * FileTreeFile (path, name, icon), FileTreeIcon, FileTreeName, FileTreeActions.
 *
 * THE INVENTORY'S COMPOSITION LAW IS BINDING AND TOUCH-SHAPED: "the chevron
 * expands/collapses; the NAME selects. One tap must not do both." The row is therefore
 * TWO targets, never one: the chevron is its own pressable (toggle) and the name is
 * its own pressable (select) — folder rows included. Both targets reach the 44pt
 * platform minimum through hitSlop on the row's 36pt height (py-2 + one text line),
 * which changes no pixel.
 *
 * ROWS COMPOSE THE `item` ATOM (the house list row; the build plan names file-tree as
 * its consumer) and the empty tree falls back to the `empty` atom (same plan). Folder
 * state is the caller's snapshot (file-tree.logic's copy-on-write toggle, Vitest-owned)
 * reported through onExpandedChange exactly as upstream does. The chevron is the house
 * rotating glyph (commit/task precedent, 250ms open / 200ms close, ReduceMotion.System)
 * over ChevronRight — 0° closed, 90° open.
 *
 * FileTreeActions: the web's version wraps clicks in stopPropagation so a row action
 * never selects the file. React Native's responder system hands the press to the
 * deepest touchable and does not bubble it into sibling pressables — the isolation the
 * web needed is native behavior here, so the part is a plain actions slot (declared).
 */

type FileTreeContextValue = {
  expanded: ReadonlySet<string>;
  selectedPath?: string;
  /** Only the chevron calls this — never the name. */
  toggleFolder: (path: string) => void;
  /** Only the name calls this — never the chevron. */
  select: (path: string) => void;
  depth: number;
};

const FileTreeContext = React.createContext<FileTreeContextValue | null>(null);

function useFileTree() {
  const ctx = React.useContext(FileTreeContext);
  if (!ctx) throw new Error('FileTree sub-components must be used within <FileTree>');
  return ctx;
}

export type FileTreeProps = Omit<ViewProps, 'children'> & {
  /** Controlled expansion snapshot. Present → the component never holds state. */
  expanded?: ReadonlySet<string>;
  /** Uncontrolled seed. The web default: an empty set (all collapsed). */
  defaultExpanded?: ReadonlySet<string>;
  /** Reported with the NEW snapshot after every chevron toggle. */
  onExpandedChange?: (expanded: Set<string>) => void;
  selectedPath?: string;
  onSelect?: (path: string) => void;
  children?: React.ReactNode;
};

function FileTree({
  expanded,
  defaultExpanded,
  onExpandedChange,
  selectedPath,
  onSelect,
  className,
  children,
  ...props
}: FileTreeProps) {
  const [internalExpanded, setInternalExpanded] = React.useState<ReadonlySet<string>>(
    () => defaultExpanded ?? new Set<string>(),
  );
  const currentExpanded = expanded ?? internalExpanded;

  const contextValue = React.useMemo<FileTreeContextValue>(
    () => ({
      expanded: currentExpanded,
      selectedPath,
      toggleFolder: (path) => {
        const next = toggleExpanded(currentExpanded, path);
        if (expanded === undefined) setInternalExpanded(next);
        onExpandedChange?.(next);
      },
      select: (path) => onSelect?.(path),
      depth: 0,
    }),
    [currentExpanded, expanded, selectedPath, onSelect, onExpandedChange],
  );

  return (
    <FileTreeContext.Provider value={contextValue}>
      <View
        className={cn('overflow-hidden rounded-md border border-border bg-card', className)}
        {...props}
      >
        <ScrollView className="max-h-80" nestedScrollEnabled>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="min-w-full py-1"
          >
            {/* Row container — the column wrapper keeps tree rows STACKED (review E1). */}
            <View className="flex-col">{children ?? <FileTreeFallbackEmpty />}</View>
          </ScrollView>
        </ScrollView>
      </View>
    </FileTreeContext.Provider>
  );
}

/** The empty atom at tree scale — the `empty` fallback the build plan names. */
function FileTreeFallbackEmpty() {
  return (
    <Empty className="flex-none gap-1 p-4">
      <EmptyIcon as={FolderOpenIcon} />
      <EmptyTitle className="text-sm font-normal text-muted-foreground">No files</EmptyTitle>
    </Empty>
  );
}

/**
 * Per-depth indent, computed from the context depth. Dynamic computed values merged via
 * style are the contract's sanctioned form — static spacing literals are not, and this
 * is dynamic. Inside the horizontal scroll the indent WIDENS the content instead of
 * squeezing the name, which is the verdict's whole point.
 */
function useIndent(): { paddingLeft: number } {
  const { depth } = useFileTree();
  return React.useMemo(() => ({ paddingLeft: 12 + depth * 16 }), [depth]);
}

/** The house rotating chevron: 250ms open, 200ms close, system-reduced. */
function TreeChevron({ open }: { open: boolean }) {
  const rotation = useSharedValue(open ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withTiming(open ? 1 : 0, {
      duration: open ? 250 : 200,
      reduceMotion: ReduceMotion.System,
    });
  }, [open, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 90}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Icon as={ChevronRightIcon} size={14} className="shrink-0 text-muted-foreground" />
    </Animated.View>
  );
}

/** THE CHEVRON TARGET — expands/collapses, and must never select. Stretched to the
 *  full row height so the target is row (36pt) + hitSlop 8 = the 44pt floor, exactly
 *  the house formula's counting. */
function FolderToggle({ path, name }: { path: string; name: string }) {
  const { expanded, toggleFolder } = useFileTree();
  const open = isExpanded(expanded, path);

  return (
    <Button
      variant="ghost"
      onPress={() => toggleFolder(path)}
      accessibilityLabel={open ? `Collapse ${name}` : `Expand ${name}`}
      accessibilityState={{ expanded: open }}
      hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
      // The vendored Button is the contract's named Pressable replacement; ghost +
      // size overrides keep it a stretched row-height target (36pt + hitSlop = 44).
      className="h-auto w-auto shrink-0 gap-0 px-1"
    >
      <TreeChevron open={open} />
    </Button>
  );
}

/** THE NAME TARGET — selects, and must never expand. Icon + name are one target,
 *  stretched to the full row height (36pt) + hitSlop 8 = the 44pt floor. */
function NameTarget({
  path,
  name,
  icon,
  className,
}: {
  path: string;
  name: string;
  icon?: LucideIcon;
  className?: string;
}) {
  const { selectedPath, select } = useFileTree();
  const selected = selectedPath === path;

  return (
    <Button
      variant="ghost"
      onPress={() => select(path)}
      accessibilityLabel={`Select ${name}`}
      accessibilityState={{ selected }}
      hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
      className={cn('h-auto min-w-0 flex-1 justify-start gap-2', className)}
    >
      <FileTreeIcon as={icon ?? FileIcon} />
      <FileTreeName name={name} selected={selected} />
    </Button>
  );
}

/** One row: the item atom, indented by depth. Selection renders through the name's
 *  weight (NameTarget); a louder row fill stays the caller's className decision. */
function TreeRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const indent = useIndent();

  return (
    <Item
      // Padding-left is the DEPTH-computed indent (dynamic style, contract-sanctioned);
      // it rides inside the horizontal scroll, so deep trees push right, not inward.
      // items-stretch lets the two press targets span the full row height — that IS
      // their touch target; the floor is reached with hitSlop, not extra chrome.
      style={[indent]}
      className={cn('items-stretch gap-1 rounded-none px-3 py-2', className)}
    >
      {children}
    </Item>
  );
}

export type FileTreeFolderProps = {
  /** Stable identity for expansion + selection — the upstream path contract. */
  path: string;
  name: string;
  className?: string;
  children?: React.ReactNode;
};

function FileTreeFolder({ path, name, className, children }: FileTreeFolderProps) {
  const ctx = useFileTree();
  const open = isExpanded(ctx.expanded, path);

  // Depth+1 provider wraps ONLY the children — the folder's own row stays at its depth.
  const childValue = React.useMemo<FileTreeContextValue>(
    () => ({ ...ctx, depth: ctx.depth + 1 }),
    [ctx],
  );

  return (
    <React.Fragment>
      <View className={className}>
        <TreeRow>
          <FolderToggle path={path} name={name} />
          <NameTarget path={path} name={name} icon={open ? FolderOpenIcon : FolderIcon} />
        </TreeRow>
      </View>
      {open && children ? (
        <FileTreeContext.Provider value={childValue}>{children}</FileTreeContext.Provider>
      ) : null}
    </React.Fragment>
  );
}

export type FileTreeFileProps = {
  path: string;
  name: string;
  /** Optional file glyph — defaults to the generic file mark, exactly as upstream. */
  icon?: LucideIcon;
  className?: string;
};

function FileTreeFile({ path, name, icon, className }: FileTreeFileProps) {
  return (
    <View className={className}>
      <TreeRow>
        <NameTarget path={path} name={name} icon={icon} />
      </TreeRow>
    </View>
  );
}

/** The icon wrapper — every glyph goes through RNR's Icon, never a raw Lucide element. */
function FileTreeIcon({ as, className }: { as: LucideIcon; className?: string }) {
  return <Icon as={as} size={14} className={cn('shrink-0 text-muted-foreground', className)} />;
}

/**
 * The name text — selected rows gain weight so selection survives a grayscale audit
 * (color is never the sole channel; the accent fill is the loud channel).
 */
function FileTreeName({
  name,
  selected = false,
  className,
}: {
  name: string;
  selected?: boolean;
  className?: string;
}) {
  return (
    <Text
      numberOfLines={1}
      className={cn('text-sm text-foreground', selected && 'font-medium', className)}
    >
      {name}
    </Text>
  );
}

/**
 * Trailing action slot. The web's stopPropagation is native behavior here (see the file
 * header) — presses land on the deepest touchable and never re-select the row.
 */
function FileTreeActions({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <View className={cn('shrink-0 flex-row items-center gap-1', className)}>{children}</View>
  );
}

export {
  FileTree,
  FileTreeActions,
  FileTreeFile,
  FileTreeFolder,
  FileTreeIcon,
  FileTreeName,
  useFileTree,
};
