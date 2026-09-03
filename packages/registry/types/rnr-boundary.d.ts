/**
 * The RNR boundary.
 *
 * Registry sources import `@/registry/{engine}/…` — aliases that do not resolve until the
 * RNR CLI rewrites them into a consumer's tree at install time. This file declares that
 * boundary so OUR logic typechecks in isolation.
 *
 * NO TOP-LEVEL IMPORTS. A .d.ts with a top-level import is a module, and `declare module`
 * inside a module is an AUGMENTATION of something that must already exist — which these do
 * not. Each block imports what it needs internally so these stay ambient declarations.
 *
 * These are real interfaces, not `any`: a wrong prop still fails here. They deliberately do
 * not restate RNR's full API — RNR owns that, and duplicating it would rot.
 */

declare module '@/registry/{engine}/lib/utils' {
  export function cn(...inputs: unknown[]): string;
}

declare module '@/registry/{engine}/components/ui/text' {
  import type * as React from 'react';
  import type { TextProps } from 'react-native';
  export const Text: React.ComponentType<
    TextProps & {
      className?: string;
      variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'code' | 'lead' | 'large' | 'small' | 'muted';
    }
  >;
  export const TextClassContext: React.Context<string | undefined>;
}

declare module '@/registry/{engine}/components/ui/button' {
  import type * as React from 'react';
  import type { PressableProps } from 'react-native';
  export const Button: React.ComponentType<
    PressableProps & {
      className?: string;
      variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
      size?: 'default' | 'sm' | 'lg' | 'icon';
      children?: React.ReactNode;
    }
  >;
  export function buttonVariants(opts?: Record<string, unknown>): string;
}

declare module '@/registry/{engine}/components/ui/icon' {
  import type * as React from 'react';
  import type { LucideIcon } from 'lucide-react-native';
  export const Icon: React.ComponentType<{
    as: LucideIcon;
    size?: number;
    color?: string;
    className?: string;
  }>;
}

declare module '@/registry/{engine}/components/ui/avatar' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  export const Avatar: React.ComponentType<ViewProps & { alt: string; className?: string; children?: React.ReactNode }>;
  export const AvatarImage: React.ComponentType<{ source: { uri: string }; className?: string }>;
  export const AvatarFallback: React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
}

declare module '@/registry/{engine}/components/ui/separator' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  export const Separator: React.ComponentType<ViewProps & { className?: string; orientation?: 'horizontal' | 'vertical' }>;
}

declare module '@/registry/{engine}/components/ui/badge' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  export const Badge: React.ComponentType<
    ViewProps & {
      className?: string;
      variant?: 'default' | 'secondary' | 'destructive' | 'outline';
      children?: React.ReactNode;
    }
  >;
  export function badgeVariants(opts?: Record<string, unknown>): string;
}

declare module '@/registry/{engine}/components/ui/collapsible' {
  import type * as React from 'react';
  import type { PressableProps, ViewProps } from 'react-native';
  export const Collapsible: React.ComponentType<
    ViewProps & {
      className?: string;
      open?: boolean;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean) => void;
      disabled?: boolean;
      children?: React.ReactNode;
    }
  >;
  export const CollapsibleTrigger: React.ComponentType<
    PressableProps & { className?: string; asChild?: boolean; children?: React.ReactNode }
  >;
  export const CollapsibleContent: React.ComponentType<
    ViewProps & { className?: string; forceMount?: boolean; children?: React.ReactNode }
  >;
}

declare module '@/registry/{engine}/components/ui/card' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  type Slot = React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
  export const Card: Slot;
  export const CardHeader: Slot;
  export const CardContent: Slot;
  export const CardFooter: Slot;
  export const CardTitle: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
  export const CardDescription: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
}

declare module '@/registry/{engine}/components/ui/native-only-animated-view' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  // `entering`/`exiting` carry Reanimated FadeIn/FadeOut objects. Typed as unknown so
  // the boundary stays decoupled from Reanimated's animation-class surface; the real
  // component (RNR's, at consumer compile time) owns the precise type.
  export const NativeOnlyAnimatedView: React.ComponentType<
    ViewProps & {
      className?: string;
      entering?: unknown;
      exiting?: unknown;
      children?: React.ReactNode;
    }
  >;
}

// ---- OUR base primitives. Declared for the same reason: at install time they are files
// in the CONSUMER's components/ui/, not modules in this package.
declare module '@/registry/{engine}/components/ui/input-group' {
  import type * as React from 'react';
  import type { StyleProp, TextStyle, TextInputProps, ViewProps } from 'react-native';
  type Slot = React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
  export const InputGroup: Slot;
  export const InputGroupAddon: Slot;
  export const InputGroupActions: Slot;
  export const InputGroupInput: React.ComponentType<TextInputProps & { className?: string }>;
  // Real InputGroupText is React.ComponentProps<typeof Text>, so style flows through to
  // the vendored Text (snippet's mono family rides it). Declared here because the
  // simplified type above hid a prop the runtime accepts.
  export const InputGroupText: React.ComponentType<{
    className?: string;
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
  }>;
}

declare module '@/registry/{engine}/components/ui/empty' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  import type { LucideIcon } from 'lucide-react-native';
  type Slot = React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
  export const Empty: Slot;
  export const EmptyActions: Slot;
  export const EmptyTitle: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
  export const EmptyDescription: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
  export const EmptyIcon: React.ComponentType<{ as: LucideIcon; className?: string }>;
}

declare module '@/registry/{engine}/components/ui/item' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  type Slot = React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
  export const Item: React.ComponentType<
    ViewProps & {
      className?: string;
      children?: React.ReactNode;
      variant?: 'default' | 'outline' | 'muted';
      onPress?: () => void;
    }
  >;
  export const ItemMedia: Slot;
  export const ItemContent: Slot;
  export const ItemActions: Slot;
  export const ItemTitle: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
  export const ItemDescription: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
}

declare module '@/registry/{engine}/components/ui/sheet' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  export const Sheet: React.ComponentType<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }>;
  export const SheetTrigger: React.ComponentType<{ asChild?: boolean; children?: React.ReactNode }>;
  export const SheetClose: React.ComponentType<{ asChild?: boolean; children?: React.ReactNode }>;
  export const SheetContent: React.ComponentType<
    ViewProps & {
      className?: string;
      children?: React.ReactNode;
      side?: 'bottom' | 'top' | 'left' | 'right';
      portalHostName?: string;
    }
  >;
  export const SheetHeader: React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
  export const SheetFooter: React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
  export const SheetTitle: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
  export const SheetDescription: React.ComponentType<{ children?: React.ReactNode }>;
  export function useSheetPortalHost(): string | undefined;
}

declare module '@/registry/{engine}/components/ui/command' {
  import type * as React from 'react';
  export type CommandItem = {
    value: string;
    label: string;
    description?: string;
    keywords?: string;
    group?: string;
  };
  export const Command: React.ComponentType<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: readonly CommandItem[];
    value?: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    title?: string;
    className?: string;
    renderItem?: (info: { item: CommandItem; selected: boolean }) => React.ReactNode;
    extraData?: unknown;
    children?: React.ReactNode;
  }>;
  export const CommandFooter: React.ComponentType<{
    className?: string;
    children?: React.ReactNode;
  }>;
  export function useCommandPortalHost(): string | undefined;
}

declare module '@/registry/{engine}/components/ui/popover' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  export type ContentInsets = { top: number; bottom: number; left: number; right: number };
  export const Popover: React.ComponentType<{
    children?: React.ReactNode;
  }>;
  export const PopoverTrigger: React.ComponentType<{
    asChild?: boolean;
    children?: React.ReactNode;
  }>;
  export const PopoverContent: React.ComponentType<
    ViewProps & {
      className?: string;
      children?: React.ReactNode;
      align?: 'start' | 'center' | 'end';
      side?: 'top' | 'bottom' | 'left' | 'right';
      sideOffset?: number;
      portalHost?: string;
      insets?: ContentInsets;
    }
  >;
}

declare module '@/registry/{engine}/components/ui/progress' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  export const Progress: React.ComponentType<
    ViewProps & {
      className?: string;
      indicatorClassName?: string;
      value?: number;
      children?: React.ReactNode;
    }
  >;
}

declare module '@/registry/{engine}/components/ui/slider' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  // onValueChange is the @rn-primitives/slider Root shape (number[] in the
  // primitive's min..max scale); the union keeps callers of both shapes honest —
  // consumers convert to their own scale (audio-player divides by 100).
  export const Slider: React.ComponentType<
    ViewProps & {
      className?: string;
      /** Normalized 0..1 — the wave-4 value contract; mapped onto 0..100 internally. */
      value?: number;
      onValueChange?: (value: number[]) => void;
      disabled?: boolean;
      children?: React.ReactNode;
    }
  >;
}

declare module '@/registry/{engine}/components/ui/button-group' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  type Slot = React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
  export const ButtonGroup: Slot;
  export const ButtonGroupItem: Slot;
  export function useButtonGroupPosition(): { position: 'first' | 'middle' | 'last' | 'only'; className: string };
}

declare module '@/registry/{engine}/components/ui/switch' {
  import type * as React from 'react';
  import type { PressableProps } from 'react-native';
  // RNR's Switch Root is a Pressable (checked/onCheckedChange), so press-level props
  // (hitSlop, accessibility*) flow through its spread — declared for the same reason
  // everything here is declared: the module only exists after the CLI rewrite.
  export const Switch: React.ComponentType<
    PressableProps & {
      className?: string;
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
      disabled?: boolean;
    }
  >;
}

declare module '@/registry/{engine}/components/ui/table' {
  import type * as React from 'react';
  import type { StyleProp, TextStyle, ViewProps } from 'react-native';
  type Slot = React.ComponentType<ViewProps & { className?: string; children?: React.ReactNode }>;
  export const Table: React.ComponentType<
    ViewProps & {
      className?: string;
      /** Wrap in a horizontal ScrollView (the default — phone-width tables scroll). */
      scrollable?: boolean;
      children?: React.ReactNode;
    }
  >;
  export const TableHeader: Slot;
  export const TableBody: Slot;
  export const TableRow: Slot;
  export const TableHead: Slot;
  export const TableCell: Slot;
  // Real TableCellText is React.ComponentProps<typeof Text>, so style flows through to
  // the vendored Text (the env-var/package rows ride the house mono family).
  export const TableCellText: React.ComponentType<{
    className?: string;
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
    children?: React.ReactNode;
  }>;
}

declare module '@/registry/{engine}/components/ui/dropdown-menu' {
  import type * as React from 'react';
  import type { ViewProps } from 'react-native';
  export type ContentInsets = { top: number; bottom: number; left: number; right: number };
  export const DropdownMenu: React.ComponentType<{
    children?: React.ReactNode;
  }>;
  export const DropdownMenuTrigger: React.ComponentType<{
    asChild?: boolean;
    children?: React.ReactNode;
  }>;
  export const DropdownMenuContent: React.ComponentType<
    ViewProps & {
      className?: string;
      children?: React.ReactNode;
      align?: 'start' | 'center' | 'end';
      side?: 'top' | 'bottom' | 'left' | 'right';
      sideOffset?: number;
      alignOffset?: number;
      portalHost?: string;
      insets?: ContentInsets;
    }
  >;
  export const DropdownMenuItem: React.ComponentType<
    ViewProps & {
      className?: string;
      children?: React.ReactNode;
      onPress?: () => void;
      disabled?: boolean;
      closeOnPress?: boolean;
    }
  >;
  export const DropdownMenuLabel: React.ComponentType<
    ViewProps & { className?: string; children?: React.ReactNode }
  >;
  export const DropdownMenuSeparator: React.ComponentType<
    ViewProps & { className?: string }
  >;
}
