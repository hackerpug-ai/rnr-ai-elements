---
title: 'Customize rendering'
description: 'Take over how message and reasoning bodies render through the renderMarkdown prop, and restyle nested text through the TextClassContext provider.'
section: 'guides'
order: 4
---

This guide shows you how to take control of text rendering: inject a markdown renderer through `renderMarkdown`, and restyle nested text through `TextClassContext`. Both seams live in the item files you already own — a prop that hands rendering to your function, and a provider that carries class strings to nested text.

## Prerequisites

Before you start:

- The message or reasoning item installed ([Installation](/docs/installation)).
- A screen that renders the item's body. The [message](/components/message) and [reasoning](/components/reasoning) reference pages carry the usage each item ships.

## renderMarkdown

The items that render model output ship no markdown renderer. There are exactly two call sites: the body of a message (`MessageResponse` in the message item) and the body of a reasoning block (`ReasoningContent` in the reasoning item). Both take the same optional prop, and both default to plain text.

The message item declares the seam:

```tsx
export type RenderMarkdown = (markdown: string) => React.ReactNode;

type MessageResponseProps = {
  children: string;
  /**
   * Inject a markdown renderer. Omit it and the body renders as plain Text, which is why
   * the core has no native-module dependency.
   */
  renderMarkdown?: RenderMarkdown;
```

Omit the prop and the body renders as plain `Text` — which is why the core carries no native markdown module. The reasoning item carries the same seam, with the same default:

```tsx
  renderMarkdown?: RenderMarkdown;
  /** Repair a half-streamed token mid-stream. On by default, as in message. */
  parseIncompleteMarkdown?: boolean;
  className?: string;
};

function ReasoningContent({
  children,
  renderMarkdown,
  parseIncompleteMarkdown = true,
  className,
}: ReasoningContentProps) {
  const text = React.useMemo(
    () => (parseIncompleteMarkdown ? repairIncompleteMarkdown(children) : children),
    [children, parseIncompleteMarkdown],
  );

  return (
    <CollapsibleContent className={cn('pb-1', className)}>
      {renderMarkdown ? (
        renderMarkdown(text)
      ) : (
        <Text className="text-sm leading-5 text-muted-foreground">{text}</Text>
```

### Inject your own renderer

The prop takes any function from a markdown string to a React node. The repo's harness exercises the seam with a pure JavaScript bold parser — no native module, so it runs in Expo Go:

```tsx
            renderMarkdown={(md) => (
              <Text className="text-base">
                {md.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                  part.startsWith('**') ? (
                    <Text key={i} className="font-semibold">
                      {part.slice(2, -2)}
                    </Text>
                  ) : (
                    part
                  ),
                )}
              </Text>
            )}
          >
            {'Injected: **bold** is rendered by the supplied renderer.'}
```

1. Open the file where your screen renders `MessageResponse`.
2. Define a renderer that maps the markdown string to nodes — start from the bold parser above.
3. Pass your renderer as `renderMarkdown={…}` on `MessageResponse`, and on `ReasoningContent` where you render reasoning bodies.
4. Reload your app. `**bold**` in model output renders bold instead of literal asterisks; remove the prop and the same output falls back to plain text.

### The native renderer is a dev-client item

The reference renderer `react-native-enriched-markdown` is a Fabric native module absent from Expo 57's bundled list, so an Expo Go preview cannot load it. [Preview on a device](/guides/preview-on-device) lists it among the dev-client items; a JavaScript renderer like the one above keeps the surface in Expo Go.

## TextClassContext

React Native has no style cascade: wrapping a child in a parent view does not restyle the text inside it. Items that nest text publish their class strings through the `TextClassContext` provider from the text module — the message item sets `text-foreground` around message bodies and `text-xs text-muted-foreground` around message actions. Those strings are ordinary utility classes: they resolve against your theme tokens exactly like classes you write yourself, so restyling them is a token edit, not an item edit ([Re-theme your app](/guides/re-theme), [Theming](/docs/theming)).

1. Open the item file that wraps the text you want to change — for example `components/ai/message.tsx`.
2. Change the provider's value class string — for example `text-foreground` to your own foreground class.
3. Reload your app. The nested text inside that provider renders with the new class; text outside the provider is unchanged.

## Next steps

- The token reference behind every class: [Theming](/docs/theming)
- The dev-client split for the native renderer: [Preview on a device](/guides/preview-on-device)
