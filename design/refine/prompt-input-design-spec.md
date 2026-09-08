# PromptInput — Design Spec (RN composer)

frontend-designer, 2026-09-05. `design engine: frontend-designer`. Target: elements.ai-sdk.dev demo field, translated to RNR tokens. Rounded-xl bordered field floating on page background; textarea on top; one tools row below: muted icon cluster left, prominent filled submit right.

## Reuse decisions

- `InputGroup` + `InputGroupInput` + `InputGroupActions` — shell with the only field-focus ring on mobile (state-driven; RN has no `:focus-within`). Reuse as the field, overridden from row→column.
- `Button` (vendored) — `default` variant already bg-primary + text-primary-foreground; `disabled` already opacity-50. Reuse for every interactive target.
- `ButtonGroup` — NOT used: its purpose is joined corners; the demo row is separated controls.
- `Suggestions` — supplies the house law (horizontal scroll, never wrap, `keyboardShouldPersistTaps="handled"`); its chip anatomy does not fit attachment chips — reuse the LAW, not the component.
- `Sheet` — house portal/sheet pattern, already backs model-selector and command.

Flag-don't-fix: `input-group.tsx` internals (`dark:bg-input/30`, `ring-ring/50`) and Button's `bg-primary/90`/`active:bg-accent/50` predate the wave-13 /NN ban — vendored internals, out of scope.

## 1. Root container

```
dock (outer):  gap-2 px-4 pt-2 bg-background  + paddingBottom: insets.bottom (unchanged)
field:         <InputGroup className="flex-col items-stretch gap-2 rounded-xl px-2 py-2">
```

- Field keeps InputGroup's border/bg and focus machinery; overrides are layout only: column, stretch, radius one step up (`rounded-md`→`rounded-xl`, the demo's field radius), padding `px-2 py-2` (8px inset).
- Rhythm: `gap-2` between textarea row and tools row.
- Every interactive element 44pt; the field itself is a View, no press target.
- Conflict flag: today's `border-t` docked bar vs the demo's floating rounded field. House answer: floating field inside the safe-area dock — dock stays for keyboard/safe-area rhythm, field carries the border.

## 2. Textarea

```
<InputGroupInput className="max-h-40 px-2 py-2" (existing placeholder + style-height mechanism unchanged)>
```

- `text-base` (16px) prevents iOS focus zoom. Placeholder `text-muted-foreground` (already wired via placeholderClassName).
- Auto-grow: existing `onContentSizeChange` + inline min/max height — instant, no animation (web doesn't animate either). Inline style neutralizes the default `h-10`.
- `px-2` puts text 16px from the border — the demo's inset. No `flex-1` in column; height is style-driven.

## 3. Attachment chip row (above textarea, inside the field)

Row: `<ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerClassName="flex-row gap-2 py-1">` — scroll-not-wrap CONFIRMED (house law; wrap would stretch field height under the keyboard).

Shared chip container: `flex-row items-center gap-2 rounded-md border border-border bg-muted p-1` (40px tall, quiet surface against `bg-background`).

- Image chip: thumbnail `size-8 rounded-md bg-muted` (image fills; muted during load) + vendored Text `text-sm text-foreground` `truncate` `max-w-24` + remove.
- File chip: icon box `size-8 rounded-md bg-muted items-center justify-center` with `<Icon as={FileIcon} size={16} className="text-muted-foreground" />` + same name Text — one anatomy, thumb box swaps for icon box.
- Remove affordance: trailing, vendored `Button variant="ghost" className="size-8"` (32px visual) `hitSlop={{ top:6, bottom:6, left:6, right:6 }}` → 44pt effective, `<Icon as={XIcon} size={16} className="text-muted-foreground" />`. Slop (not a bigger button) preserves the 40px chip height; slop is arithmetic, not an arbitrary dimension.
- Chips are plain Views; the X is the only pressable — vendored Button, never raw Pressable.

## 4. Icon buttons (attach · globe · mic)

```
cluster:  <InputGroupActions className="gap-1">
each:     <Button variant="ghost" size="icon" className="size-11">
icon:     <Icon as={PaperclipIcon | GlobeIcon | MicIcon} size={20} className="text-muted-foreground">
```

- `size-11` (44px) overrides Button's 40px icon size — the 44pt floor is a house dimension with an exact scale step; slop-only would fail the visible-target expectation for primary toggles. `gap-1` between 44px targets — no slop needed.
- Muted rest: icon `text-muted-foreground` over ghost transparent. Ghost's `active:bg-accent` pressed feedback remains.
- Globe ACTIVE (on): button gains `bg-accent`, icon flips `text-foreground`, `accessibilityState={{ selected: true }}`. Reads identically to pressed (token-clean); accent==secondary values so scheme-stable.
- Disabled: `disabled` prop only → built-in opacity-50. Mic disabled when speech unavailable; attach never disabled.

## 5. Tools row

```
row:      <View className="flex-row items-center">
left:     cluster (§4)
right:    submit with ml-auto
```

- Order: attach · globe · mic · (tools trigger joins cluster as a 4th `size-11 ghost` when composed) — submit far right via `ml-auto`. Shared single row (screenshot): yes.
- Tools menu → bottom sheet, NOT dropdown. Sheet is the house load-bearing overlay (backs command, model-selector, panel); a dropdown anchored above the composer fights the open soft keyboard and portal z-order. Compose the existing model-selector organism inside `SheetContent side="bottom" rounded-t-xl`; honor the sheet's named-portal-host rule for anything nested. Trigger = `size-11 ghost` in the left cluster.

## 6. Submit button

```
send:  <Button variant="default" size="icon" className="size-11 rounded-xl" disabled={!canSend}>
         <Icon as={ArrowUpIcon} size={20} />
stop:  same button, <Icon as={SquareIcon} size={16} />, onPress={onStop}, no disabled
```

- Shape: rounded-square — `rounded-xl` (12px) on 44px; echoes the field radius (demo's visual rhyme).
- Color: `bg-primary` + `text-primary-foreground` from the vendored default variant. The demo's blue is that app's theme, NOT a token decision. House answer: `bg-primary` — near-black in light, near-white in dark; strong contrast in both schemes from one class list.
- Size: `size-11` vs demo's ~40px — conflict; house answer wins: 44pt floor.
- Disabled (empty): `disabled` → built-in opacity-50. No conditional classes.
- Streaming: icon swap only, stays `variant="default"` — stop is still the primary action of that moment. No secondary/danger restyle.

## 7. States inventory

| State | Field | Chips | Submit | Notes |
|---|---|---|---|---|
| idle-empty | placeholder muted; focus ring on focus only | row absent (zero-height) | disabled, opacity-50 | globe off |
| typing | text-foreground, auto-grow | — | enabled bg-primary | |
| attachments-populated | unchanged | scroll row above textarea; X removes | sends text + attachments | |
| streaming | text entry stays open | — | icon → Square, enabled | canSend gate unchanged |
| submit-failure | NO visual change — confirmed. Rejected onSubmit leaves text intact; error reporting belongs to the caller. No destructive flash. | | | |

Reduced motion: every state change instant. Nothing animates.

## 8. Motion

- Pressed feedback = vendored Button `active:bg-*` color swap only — inherently reduced-motion safe.
- No scale/size/height transitions: auto-grow and chip insertion/removal are instant layout (matching web; removes the reduced-motion branch entirely).
- The only motion is the tools sheet's own house presentation (ReduceMotion handled inside Sheet). Do not add composer-level transitions.

→ skipped: focus-visible/keyboard tab rings (soft-keyboard platform has no tab order; InputGroup's focus ring covers the field). Add when a hardware-keyboard web target becomes real.
