import { Badge } from '@/registry/{engine}/components/ui/badge';
import { CodeBlock, CodeBlockContent } from '@/registry/{engine}/components/ui/code-block';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import { ChevronRightIcon } from 'lucide-react-native';
import * as React from 'react';
import { Platform, ScrollView, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  httpMethodMeta,
  parsePathSegments,
  propertyIndent,
  type HttpMethod,
  type SchemaParameter,
  type SchemaProperty,
} from './schema-display.logic';

/**
 * SchemaDisplay — a REST endpoint's schema card (UC-AGENT-05 AC-5: a tool's parameter
 * schema in a nested view that remains LEGIBLE AT PHONE WIDTH).
 *
 * THE PRD VERDICT IS PORT-ADAPTED: "The nested schema tree ports, but nesting depth
 * and key widths need collapsing and horizontal scroll to stay legible at phone
 * width." Both halves of that sentence are binding, and the upstream source already
 * ships the collapsing half — Parameters/Request/Response default open, property
 * nodes open while depth < 2, deeper nodes start closed — so the port keeps that
 * collapse structure exactly and adds the other half: every section body sits in a
 * horizontal ScrollView (column wrapper inside per the wave-12 flattening law), so a
 * deep property chain or a wide type name pushes RIGHT instead of crushing the name
 * column. Depth indentation renders as the web's computed `40 + depth*16` padding,
 * from schema-display.logic (Vitest-owned arithmetic; dynamic computed styles are
 * contract-legal).
 *
 * THE UPSTREAM PART SET, ported part for part from the verified source: root (method /
 * path / description / parameters / requestBody / responseBody + the default
 * composition when children are omitted), Header, Method (badge), Path (with {param}
 * runs highlighted), Description, Content, Parameters (collapsible, count badge),
 * Parameter, Request, Response, Property (recursive), Body, Example.
 *
 * DECLARED COMPRESSIONS (both carried by words, never color alone):
 *  - the web's five method washes compress onto the house status vocabulary — the
 *    mono uppercase verb is the badge text (schema-display.logic's table);
 *  - path parameter highlighting — the web builds an HTML string for
 *    dangerouslySetInnerHTML — becomes parsePathSegments() data painted with the
 *    accent role (the house compression of the web's blue).
 *
 * DOM-ONLY MOVES DROPPED, on the record: `divide-y` has no React Native equivalent —
 * section and row dividers render as explicit border-b classes instead (the last-row
 * hairline sits above the section's own border, visually a single rule); the web's
 * `group-data-[state=open]:rotate-90` chevron becomes the house shared-value rotation
 * (ReduceMotion.System), oriented right like upstream.
 */

type SchemaDisplayContextValue = {
  method: HttpMethod;
  path: string;
  description?: string;
  parameters?: SchemaParameter[];
  requestBody?: SchemaProperty[];
  responseBody?: SchemaProperty[];
};

const SchemaDisplayContext = React.createContext<SchemaDisplayContextValue | null>(null);

function useSchemaDisplay() {
  const ctx = React.useContext(SchemaDisplayContext);
  if (!ctx) throw new Error('SchemaDisplay components must be used within SchemaDisplay');
  return ctx;
}

export type SchemaDisplayProps = Omit<ViewProps, 'children'> & {
  method: HttpMethod;
  path: string;
  description?: string;
  parameters?: SchemaParameter[];
  requestBody?: SchemaProperty[];
  responseBody?: SchemaProperty[];
  children?: React.ReactNode;
};

function SchemaDisplay({
  method,
  path,
  description,
  parameters,
  requestBody,
  responseBody,
  className,
  children,
  ...props
}: SchemaDisplayProps) {
  const contextValue = React.useMemo<SchemaDisplayContextValue>(
    () => ({ method, path, description, parameters, requestBody, responseBody }),
    [method, path, description, parameters, requestBody, responseBody],
  );

  return (
    <SchemaDisplayContext.Provider value={contextValue}>
      <View
        className={cn('overflow-hidden rounded-lg border border-border bg-background', className)}
        {...props}
      >
        {children ?? (
          <>
            <SchemaDisplayHeader>
              <View className="min-w-0 flex-row items-center gap-3">
                <SchemaDisplayMethod />
                <SchemaDisplayPath />
              </View>
            </SchemaDisplayHeader>
            {description ? <SchemaDisplayDescription /> : null}
            <SchemaDisplayContent>
              {parameters && parameters.length > 0 ? <SchemaDisplayParameters /> : null}
              {requestBody && requestBody.length > 0 ? <SchemaDisplayRequest /> : null}
              {responseBody && responseBody.length > 0 ? <SchemaDisplayResponse /> : null}
            </SchemaDisplayContent>
          </>
        )}
      </View>
    </SchemaDisplayContext.Provider>
  );
}

/** House right-facing chevron (upstream rotates 90° when open; system-reduced). */
function SectionChevron({ open }: { open: boolean }) {
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
      <Icon as={ChevronRightIcon} size={16} className="shrink-0 text-muted-foreground" />
    </Animated.View>
  );
}

function SchemaDisplayHeader({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('border-b border-border px-4 py-3', className)} {...props}>
      {children}
    </View>
  );
}

/**
 * The method badge: RNR's secondary chip, the mono VERB as its text, the compressed
 * tone as its color (task.tsx's explicit-Text pattern — a class on the Badge root
 * would style the View, not the Text). `children` overrides the verb.
 */
function SchemaDisplayMethod({ children, className }: { children?: string; className?: string }) {
  const { method } = useSchemaDisplay();
  const meta = httpMethodMeta(method);

  return (
    <Badge variant="secondary" className={cn('shrink-0', className)}>
      <Text style={monoStyle} className={cn('text-xs', meta.className)}>
        {children ?? method}
      </Text>
    </Badge>
  );
}

/**
 * The endpoint path with `{param}` runs accented (parsePathSegments — the injection-
 * free replacement for the web's dangerouslySetInnerHTML). Mono, like every surface
 * that shows a code identifier. `children` overrides with a plain string.
 */
function SchemaDisplayPath({ children, className }: { children?: string; className?: string }) {
  const { path } = useSchemaDisplay();
  const segments = React.useMemo(
    () => (children !== undefined ? [{ text: children, param: false }] : parsePathSegments(path)),
    [children, path],
  );

  return (
    <Text numberOfLines={1} style={monoStyle} className={cn('min-w-0 flex-1 text-sm text-foreground', className)}>
      {segments.map((segment, i) => (
        <Text key={`${segment.text}-${i}`} style={monoStyle} className={segment.param ? 'text-primary' : 'text-muted-foreground'}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

function SchemaDisplayDescription({ className, children, ...props }: React.ComponentProps<typeof Text>) {
  const { description } = useSchemaDisplay();
  const label = children ?? description;
  if (label === undefined || label === null) return null;

  return (
    <Text
      className={cn('border-b border-border px-4 py-3 text-sm text-muted-foreground', className)}
      {...props}
    >
      {label}
    </Text>
  );
}

/**
 * The section stack. The web's `divide-y` becomes border-b on each section (dropped
 * on web's last child), the same declared substitution the sections use.
 */
function SchemaDisplayContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}

/**
 * The one collapsible section shape (Parameters / Request / Response share it):
 * right chevron + label + trailing slot, body default OPEN — the collapsing half of
 * the verdict, already the upstream default.
 */
function SchemaSection({
  label,
  defaultOpen = true,
  onOpenChange,
  trailing,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger
        className={cn(
          'flex-row items-center gap-2 px-4 py-3 text-left active:bg-muted/50',
          Platform.select({ web: 'transition-colors hover:bg-muted/50' }),
        )}
      >
        <SectionChevron open={open} />
        <Text className="flex-1 text-left text-sm font-medium text-foreground">{label}</Text>
        {trailing}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

/**
 * The verdict's horizontal-scroll branch, one helper for every section body: long
 * type names and deep indents push RIGHT; the column wrapper is the wave-12
 * flattening law (a horizontal ScrollView is a ROW container); min-w-full keeps short
 * content spanning the card.
 */
function HorizontalBody({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="min-w-full">
      <View className="flex-col">{children}</View>
    </ScrollView>
  );
}

function SchemaDisplayParameters({
  className,
  children,
  defaultOpen,
  onOpenChange,
}: {
  className?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { parameters } = useSchemaDisplay();
  const count = parameters?.length ?? 0;

  return (
    <View className={cn('border-b border-border', Platform.select({ web: 'last:border-b-0' }), className)}>
      <SchemaSection
        label="Parameters"
        defaultOpen={defaultOpen ?? true}
        onOpenChange={onOpenChange}
        trailing={
          <Badge variant="secondary">
            <Text className="text-xs">{count}</Text>
          </Badge>
        }
      >
        <View className="border-t border-border">
          {children ?? (
            <HorizontalBody>
              {(parameters ?? []).map((param) => (
                <SchemaDisplayParameter key={param.name} {...param} />
              ))}
            </HorizontalBody>
          )}
        </View>
      </SchemaSection>
    </View>
  );
}

/**
 * One parameter row: the web's `pl-10` indent, mono name, type chip, optional
 * location chip, the destructive required chip (red → text-destructive, the word
 * carries it), description beneath.
 */
function SchemaDisplayParameter({
  name,
  type,
  required,
  description,
  location,
  className,
  ...props
}: SchemaParameter & { className?: string }) {
  return (
    <View className={cn('border-b border-border px-4 py-3 pl-10', className)} {...props}>
      <View className="flex-row flex-wrap items-center gap-2">
        <Text style={monoStyle} className="text-sm text-foreground">
          {name}
        </Text>
        <Badge variant="outline">
          <Text className="text-xs">{type}</Text>
        </Badge>
        {location ? (
          <Badge variant="secondary">
            <Text className="text-xs">{location}</Text>
          </Badge>
        ) : null}
        {required ? (
          <Badge variant="secondary">
            <Text className="text-xs text-destructive">required</Text>
          </Badge>
        ) : null}
      </View>
      {description ? (
        <Text className="mt-1 text-sm text-muted-foreground">{description}</Text>
      ) : null}
    </View>
  );
}

export type SchemaDisplayPropertyProps = SchemaProperty & {
  /** Recursion depth — drives the computed indent (the web's 40 + depth*16). */
  depth?: number;
  className?: string;
};

/**
 * The recursive property node. Nodes with children (properties, or an items element)
 * are collapsible and default OPEN while depth < 2 — the upstream phone-legibility
 * default, kept byte-for-byte; deeper nodes start closed. Leaf rows align with the
 * chevron column through a spacer, exactly as the web lays them out.
 */
function SchemaDisplayProperty({
  name,
  type,
  required,
  description,
  properties,
  items,
  depth = 0,
  className,
  ...props
}: SchemaDisplayPropertyProps) {
  const hasChildren = Boolean(properties?.length) || Boolean(items);
  const [open, setOpen] = React.useState(depth < 2);
  const indent = propertyIndent(depth);

  if (!hasChildren) {
    return (
      <View
        className={cn('border-b border-border py-3 pr-4', className)}
        style={[{ paddingLeft: indent }]}
        {...props}
      >
        <View className="flex-row flex-wrap items-center gap-2">
          {/* Spacer for chevron-column alignment — upstream renders the same span. */}
          <View className="size-4" />
          <Text style={monoStyle} className="text-sm text-foreground">
            {name}
          </Text>
          <Badge variant="outline">
            <Text className="text-xs">{type}</Text>
          </Badge>
          {required ? (
            <Badge variant="secondary">
              <Text className="text-xs text-destructive">required</Text>
            </Badge>
          ) : null}
        </View>
        {description ? (
          <Text className="mt-1 pl-6 text-sm text-muted-foreground">{description}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      className={cn(
        'border-b border-border',
        depth === 0 && Platform.select({ web: 'last:border-b-0' }),
        className,
      )}
      style={[{ paddingLeft: indent }]}
      {...props}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          className={cn(
            'flex-row items-center gap-2 py-3 text-left active:bg-muted/50',
            Platform.select({ web: 'transition-colors hover:bg-muted/50' }),
          )}
        >
          <SectionChevron open={open} />
          <Text style={monoStyle} className="text-sm text-foreground">
            {name}
          </Text>
          <Badge variant="outline">
            <Text className="text-xs">{type}</Text>
          </Badge>
          {required ? (
            <Badge variant="secondary">
              <Text className="text-xs text-destructive">required</Text>
            </Badge>
          ) : null}
        </CollapsibleTrigger>
        {description ? (
          <Text
            className="pb-2 text-sm text-muted-foreground"
            // The outer View already carries the indent (the old indent+24 here
            // double-applied it, pushing descriptions to 2*indent+24; leaf pins 24).
            style={[{ paddingLeft: 24 }]}
          >
            {description}
          </Text>
        ) : null}
        <CollapsibleContent>
          <View className="border-t border-border">
            {properties?.map((prop) => (
              <SchemaDisplayProperty key={prop.name} {...prop} depth={depth + 1} />
            ))}
            {items ? (
              // Array element schemas render as `name[]` — the upstream naming rule.
              <SchemaDisplayProperty {...items} depth={depth + 1} name={`${name}[]`} />
            ) : null}
          </View>
        </CollapsibleContent>
      </Collapsible>
    </View>
  );
}

function SchemaDisplayRequest({
  className,
  children,
  defaultOpen,
  onOpenChange,
}: {
  className?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { requestBody } = useSchemaDisplay();

  return (
    <View className={cn('border-b border-border', Platform.select({ web: 'last:border-b-0' }), className)}>
      <SchemaSection label="Request Body" defaultOpen={defaultOpen ?? true} onOpenChange={onOpenChange}>
        <View className="border-t border-border">
          {children ?? (
            <HorizontalBody>
              {(requestBody ?? []).map((prop) => (
                <SchemaDisplayProperty key={prop.name} {...prop} depth={0} />
              ))}
            </HorizontalBody>
          )}
        </View>
      </SchemaSection>
    </View>
  );
}

function SchemaDisplayResponse({
  className,
  children,
  defaultOpen,
  onOpenChange,
}: {
  className?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { responseBody } = useSchemaDisplay();

  return (
    <View className={cn('border-b border-border', Platform.select({ web: 'last:border-b-0' }), className)}>
      <SchemaSection label="Response" defaultOpen={defaultOpen ?? true} onOpenChange={onOpenChange}>
        <View className="border-t border-border">
          {children ?? (
            <HorizontalBody>
              {(responseBody ?? []).map((prop) => (
                <SchemaDisplayProperty key={prop.name} {...prop} depth={0} />
              ))}
            </HorizontalBody>
          )}
        </View>
      </SchemaSection>
    </View>
  );
}

/**
 * Custom-section container, upstream part set parity. The web's `divide-y` is a
 * caller concern here — compose border-b classes on your rows (RN has no divide).
 */
function SchemaDisplayBody({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}

/**
 * The example block, composed on the CodeBlock organism — its rounded bg-muted chrome,
 * its horizontal scroll for long lines, and its copy button are CodeBlock's, and the
 * upstream <pre> becomes the house mono surface instead of a second one.
 */
function SchemaDisplayExample({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  return (
    <CodeBlock code={code} language={language} className={cn('mx-4 mb-4', className)}>
      <CodeBlockContent />
    </CodeBlock>
  );
}

export {
  SchemaDisplay,
  SchemaDisplayBody,
  SchemaDisplayContent,
  SchemaDisplayDescription,
  SchemaDisplayExample,
  SchemaDisplayHeader,
  SchemaDisplayMethod,
  SchemaDisplayParameter,
  SchemaDisplayParameters,
  SchemaDisplayPath,
  SchemaDisplayProperty,
  SchemaDisplayRequest,
  SchemaDisplayResponse,
  useSchemaDisplay,
};
