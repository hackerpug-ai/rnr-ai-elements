# Build plan — rnr-ai-elements

Written before any code. `design/manifest.json` stays the durable record.

## The scope rule this plan is built on

> Build components that map directly to AI Elements. Nothing that duplicates RNR.
> Nothing a consumer cannot install.

Applied literally, that rule removes work rather than adding it, in three places:

1. **No RNR re-exports.** RNR already ships Button, Card, Badge, Text, Icon, Dialog and 26
   more. Consumers install those from RNR. We neither rebuild nor re-story them. The
   scaffold's RNR-Button story and design-token stories were deleted once they had proved
   the pipeline — their evidence is in the manifest.
2. **No tokens.** RNR owns the token set; the library declares none. This is already a
   hard-fail check in the styling contract.
3. **No unrequired primitives.** Of the 26-item gap, only those a shipped in-scope
   component actually needs get built. Four are cut on that test alone (below).

## Level plan

| Level | Delta | What |
|---|---|---|
| Tokens | **SKIP** | The library declares zero. Consuming RNR's is the whole promise. |
| Atoms | **ACTIVE — 12** | Base primitives RNR does not ship, each justified by a consumer |
| Molecules | **ACTIVE — 9** | Single-purpose AI Elements |
| Organisms | **ACTIVE — 34** | Stateful / multi-part AI Elements |
| Screens | **ACTIVE — 1** | `example-chat`, not distributed |

Total shipped: **55 registry items**, each installable by
`npx @react-native-reusables/cli add <url>`, emitted for both engines.

## Atoms — every one names its consumer

RNR ships none of these. A primitive with no in-scope consumer is not built.

| Primitive | Strategy | Required by |
|---|---|---|
| `item` | compose | `attachments`, `file-tree`, `model-selector`, `plan`, `queue` |
| `button-group` | compose | `audio-player`, `context`, `controls`, `message`, `toolbar` |
| `empty` | compose | `attachments`, `conversation`, `file-tree`, `sources`, `test-results` |
| `command` | compose | `mic-selector`, `model-selector`, `prompt-input`, `voice-selector` |
| `input-group` | compose | `attachments`, `environment-variables`, `prompt-input`, `snippet` |
| `slider` | create | `audio-player`, `controls`, `transcription`, `voice-selector` |
| `table` | create | `environment-variables`, `package-info`, `schema-display`, `test-results` |
| `sheet` | create | `model-selector`, `open-in-chat`, `panel` |
| `breadcrumb` | compose | `file-tree`, `web-preview` |
| `kbd` | compose | `prompt-input` |
| `sidebar` | compose | `context` |
| `toaster` | create | `queue` |

### Cut on the consumer test (4)

`field`, `navigation-menu`, `spinner`, `toast` — in the 26-gap, but no in-scope AI Element needs them. The
architecture lens said as much for `navigation-menu` ("no component in the 49 requires it
on a phone"); the same test now removes the other three. Not built.

### Never built — resolved without new code

- **Substituted with a React Native affordance (7):** `calendar`, `carousel`, `drawer`, `pagination`, `resizable`, `scroll-area`, `sonner`. `scroll-area` is the
  biggest win: React Native has no scrollbar chrome to replace, so `ScrollView` *is* the
  scroll area, and 10 components stop needing a primitive.
- **Unnecessary on mobile (3):** `chart`, `form`, `input-otp`.

## Molecules (9)

`checkpoint`, `controls`, `image`, `panel`, `persona`, `shimmer`, `speech-input`, `suggestion`, `toolbar`

## Organisms (34)

`agent`, `artifact`, `attachments`, `audio-player`, `chain-of-thought`, `code-block`, `commit`, `confirmation`, `context`, `conversation`, `environment-variables`, `file-tree`, `inline-citation`, `message`, `mic-selector`, `model-selector`, `open-in-chat`, `package-info`, `plan`, `prompt-input`, `question`, `queue`, `reasoning`, `schema-display`, `snippet`, `sources`, `stack-trace`, `task`, `terminal`, `test-results`, `tool`, `transcription`, `voice-selector`, `web-preview`

## Out of scope (6)

`canvas`, `connection`, `edge`, `jsx-preview`, `node`, `sandbox` — a react-flow graph editor, runtime JSX
evaluation, and a hosted execution service. Each carries a published verdict and a named
alternative; that table is itself a deliverable (UC-REG-03).

## Build order

Dependency, not alphabet:

1. **Wave 1 — registry pipeline.** One end-to-end component proving `add` from URL into a
   clean Expo app, rendering, theming, both engines, CI green. Nothing else is trustworthy first.
2. **Wave 2 — atoms.** `input-group`, `item`, `empty`, `sheet` first: the chat shell is
   built on them and `sheet` alone backs three others.
3. **Wave 3 — the minimum chat.** `conversation`, `message`, `prompt-input`, `code-block`.
   The four the web-original lens named as the set you cannot ship a chat without, and
   where the real risk lives (stick-to-bottom scroll, keyboard, streamed markdown).
4. **Wave 4+ — agent surface, then content, then specialist.**

## Verification

Device Storybook is the gate; web Storybook currently cannot render colour and is limited
to geometry and prop matrices until that defect is fixed.
