# FIX-ORI-RN-003-2 — BLOCKED: the opacity-shorthand diagnosis is wrong; the trigger is `ring-2`

## Verdict

`status: blocked`. The charter's fix — remove only `dark:bg-input/30` and `ring-ring/50`,
keeping `border-ring ring-2` byte-identical — does **not** stop the nativewind native crash.
The send button still vanishes on focus and the Metro log still throws
`Couldn't find a navigation context`. The real trigger is the **`ring-2` utility class**
(a `ring-*` **width** utility, not an opacity shorthand), and removing it is explicitly
forbidden by the charter's CRITICAL CONSTRAINT ("`ring-2` stays byte-identical").

## Real device probe matrix (nativewind, iOS 26.3, Expo Go, Maestro 2.5.1)

Each leg: prepare the committed nativewind consumer, overwrite `components/ui/input-group.tsx`
with the listed variant, open Expo Go on the reserved iPhone 17 simulator, focus the composer,
assert "Send message" still visible. "PASS" = composer stays, send button tappable, zero nav
errors; "FAIL" = send button vanishes + `Couldn't find a navigation context` in Metro.

| Leg | wrapper `className` (focused branch + dark bg) | Result | nav error count |
|-----|------------------------------------------------|--------|-----------------|
| RED (pre-fix)        | `'dark:bg-input/30'` + `focused && 'border-ring ring-2 ring-ring/50'` | **FAIL** (line 31) | 1 |
| GREEN as-chartered   | `focused && 'border-ring ring-2'` (opacity shorthands removed) | **FAIL** (line 46) | 1 |
| probe A (no conditional) | ring fully in `style` (borderWidth 2 + borderColor ring/50), no ring in className | PASS | 0 |
| probe B (`border-ring` only) | `focused && 'border-ring'` | PASS | 0 |
| probe C (`ring-2` only)     | `focused && 'ring-2'` | **FAIL** | 1 |
| probe D (`bg-primary`)      | `focused && 'bg-primary'` | PASS | 0 |
| probe E (`dark:bg-input/30`, dark) | `'dark:bg-input/30'` + `focused && 'border-ring'` (dark mode) | PASS | 0 |

### Conclusion from the matrix

- `ring-2` **alone** reproduces the crash (probe C), so it is a sufficient trigger.
- `border-ring` alone does not (probe B).
- A non-ring conditional class does not (probe D) — the conditional change itself is not the cause.
- `dark:bg-input/30` does not, even in dark mode (probe E).
- Therefore the trigger is the **`ring-*` utility family** — both the width (`ring-2`) and, by
  family, the color (`ring-ring/50`) — and the charter mis-scoped it to "opacity shorthand".

## The correct fix (needs a charter amendment)

Move **all** `ring-*` utilities off the conditional `className` and into the plain RN `style`
prop. Concretely, the wrapper becomes:

```tsx
// className keeps layout/geometry only; the focus ring is entirely style-driven.
'flex-row items-center gap-2 rounded-md border border-input bg-background px-3'

const focusedStyle = focused
  ? { borderColor: scheme === 'dark' ? 'hsla(300, 0%, 45%, 0.5)' : 'hsla(0, 0%, 63%, 0.5)', borderWidth: 2 }
  : undefined;
```

`borderWidth: 2` replaces `ring-2`; `borderColor: …/0.5` replaces `ring-ring/50`. `border-ring`
is redundant with the style's borderColor (the style wins) and may be dropped or kept — probe B
shows keeping it is harmless. This is the probe-A shape, which passed on device.

## Why this is out of scope

The charter's CRITICAL CONSTRAINT ("Never tier") requires `ring-2` to "stay byte-identical".
Removing `ring-2` (or any `ring-*` utility) from the conditional className is therefore a
semantic change this task is forbidden to make. The planner must amend the charter to allow the
`ring-*` family to move into `style` before this FIX can land.

## Evidence files (this directory + `.tmp/FIX-ORI-RN-003-2/`)

- `red-ios-light-metro.log` — pre-fix crash, `input-group.tsx:31`, `dark:bg-input/30` frame.
- `green-as-chartered-ios-light-metro.log` — post charter-fix crash, `input-group.tsx:46`, the
  `focused && 'border-ring ring-2'` frame (proves the opacity-shorthand removal was insufficient).
- `probe-c-ring2-only-metro.log` — `ring-2` alone reproduces the crash.
- `probe-b-borderring-only-metro.log`, `probe-d-bg-primary-metro.log`,
  `probe-e-dark-bg-input-metro.log` — negative controls (all clean).
- Full probe variants + session JSONs under `.tmp/FIX-ORI-RN-003-2/`.

## Scope of work performed

The registry source was edited exactly as the charter prescribed (opacity shorthands → hoisted
`style`, comma-form `hsla(...)`), the three harness/example copies were synced byte-identical,
and `pnpm registry:build && pnpm check:registry`, `pnpm typecheck`, `pnpm lint`,
`pnpm check:tokens`, `pnpm check:contract` all pass. But because that change does NOT fix the
runtime crash (the diagnosis is wrong), the source edits were reverted and are NOT committed —
per the task rule "return blocked … rather than shipping a speculative change."
