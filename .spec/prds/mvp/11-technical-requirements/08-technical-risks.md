---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Technical Risks

33 risks from the architecture and design lenses, merged and ranked.
11 high, 19 medium, 3 low.

The three that gate everything downstream: **Vitest cannot render React Native components**
(and even if it could, it cannot assert a Uniwind style, because classes compile in the
Metro transform); the **uniwind x worklets shim cycle** that stops the app booting; and
**markdown forcing a dev client** if `message` hard-binds to the native renderer.

## HIGH (11)

### H1. Vitest cannot render React Native components, and even if it could it cannot assert a single style. Uniwind resolves classes in the METRO transform; under Vitest a className is an inert string. So the failure is not one problem (Flow-typed RN source) but two stacked, and the second has no fix within Vitest.

*Lens: architecture*

**Mitigation:** Scope Vitest to what it can actually prove and put a device tier under everything else. Cost to prove the render path, concretely: vitest-react-native is at 0.1.5 (0.1.x, thin ecosystem) or hand-roll a Flow-strip transform + react-native exports-condition resolution + transformMode.ssr + mocks for reanimated/svg/gesture-handler/uniwind. Optimistically a day; realistically several, with a permanently fragile config on RN 0.86/0.87 — and at the end of it, style assertions still do not work. Run this as its OWN first task with a hard timebox and a written go/no-go before any component work depends on it. Vitest's real and substantial scope: the AI SDK type-conformance test, the markdown part-serializer, the stack-trace parser, getMediaCategory, tool-status to badge mapping, the throttle scheduler, and the registry build/freshness/token scripts. Fallback if render tests are genuinely needed: add jest-expo@57.0.5 + @testing-library/react-native@14 as a SECOND runner for rendering only. Absolute floor: do NOT substitute a mock renderer and report the component as tested.

### H2. Markdown rendering forces a dev client, and if message-response hard-binds to react-native-enriched-markdown the entire chat shell becomes non-Expo-Go, breaking constraint 7 for the library's most important component.

*Lens: architecture*

**Mitigation:** Injected renderMarkdown?: (md: string) => ReactNode prop with a plain RNR Text default (~3 lines). Ship message-response-markdown as a separate registry item whose description states the dev-client requirement. Core stays Expo Go-clean. Verified basis: the npm manifest declares codegenConfig with Fabric components and the package is absent from Expo 57's bundledNativeModules.

### H3. uniwind x react-native-worklets mutual react-native shim cycle causes a startup stack overflow — the app does not boot.

*Lens: architecture*

**Mitigation:** Prior art hit this on device and needed an outermost Metro arbitrator. Budget it as an explicit task in the example-app scaffold, not as a debugging surprise. It blocks everything downstream, so it belongs in the first wave.

### H4. react-native-streamdown's documented workletizableModules Metro option was renamed upstream to importForwarding.moduleNames. The stale key is silently ignored and crashes ALL markdown streaming on device.

*Lens: architecture*

**Mitigation:** Already-paid discovery from prior art. Write the correct key, add a comment naming the rename, and verify streaming on a real device before claiming the item works. A config typo here produces no build error and no lint error.

### H5. Repeating prior art's non-virtualized Conversation — FlatList-shaped props over a ScrollView + .map(). It renders every message, passes every code review, and only degrades with real usage.

*Lens: architecture*

**Mitigation:** Build on core FlatList with inverted and maintainVisibleContentPosition from the first commit. Add a review check and a device test at 500+ messages. FlashList 2.0.2 documented as an optional swap, not the default, so the item stays dependency-free.

### H6. Pin discrepancy between AGENTS.md and Expo's own resolver. AGENTS.md declares RN 0.87.1 under Expo 57.0.19, but Expo SDK 57's bundledNativeModules pins react-native: 0.86.3 and the Expo docs table says SDK 57 -> RN 0.86. Several npm latest versions are also majors ahead of Expo's pins (gesture-handler 3.2.1 vs ~2.32.0; webview 14.0.1 vs 13.16.1).

*Lens: architecture*

**Mitigation:** Reconcile before scaffolding — one coherent set, resolved by npx expo install, never npm latest. Record the resolved pins in AGENTS.md and add a CI step running npx expo-doctor so drift fails the build rather than surfacing as a native crash. Second-order risk: @rn-primitives 1.5.2 is verified against RN 0.85.3 in the RNR KB, so its behavior on 0.86.x is untested by anyone and needs a device smoke pass across all portal components early.

### H7. Shimmer has no native equivalent. The web implementation is `background-clip: text` with a moving gradient driven by motion/react; React Native supports neither. Whatever we build is invented, and it is the single most visible streaming affordance in the library — it is on screen during the first seconds of every response.

*Lens: design*

**Mitigation:** Reuse RNR Skeleton's exact motion signature — opacity 1→0.5, 1000ms, `withRepeat(..., -1, true)` — on text colored `text-muted-foreground` (which is also the web's resting color). An invented treatment that borrows the house pulse reads as house style; a 2000ms gradient sweep reads as a foreign component. Gate on `useReducedMotion()`. Ship the masked-gradient variant, if ever, as opt-in with its own dependency.

### H8. RNR's Collapsible is a BARE primitive re-export — zero styling, no trigger layout, no chevron, no animation. At least six elements (reasoning, tool, chain-of-thought, sources, task, plan) are built on it and will each invent their own disclosure look.

*Lens: design*

**Mitigation:** Extract ONE `<AiDisclosure>` whose trigger styling is lifted verbatim from RNR's Accordion (`flex-row items-start justify-between gap-4 rounded-md py-4 disabled:opacity-50`, TextClassContext publishing `text-left text-sm font-medium`, chevron rotating 180deg over 250ms open / 200ms close, `LinearTransition.duration(200)` on the item). Six independent implementations is six chances to drift, and drift here is directly visible: two disclosures on one screen animating at different tempos.

### H9. Foreign-surface theming. Markdown and any syntax highlighter consume STYLE OBJECTS, not classes, so Tailwind cannot reach them. expo-ai-elements' precedent is a hardcoded hex `DARK_MARKDOWN_STYLE` with no light-mode counterpart — meaning the largest area of every assistant message is the one area the consumer's theme does not control.

*Lens: design*

**Mitigation:** Build one runtime theme bridge that reads the consumer's resolved token values and derives BOTH a light and a dark markdown style object from them. Every key (paragraph, h1–h6, strong, em, link, code, codeBlock, blockquote, list bullet/marker, math, thematicBreak, table header/stripe) maps to a role — body to foreground, links to primary, code to muted + border, table stripes to muted/50. Zero hex. Acceptance: swap the consumer's theme and the markdown recolors.

### H10. The 44pt touch-target rule gets applied naively as `h-11`, making every AI Elements control visibly taller than every RNR control on the same screen.

*Lens: design*

**Mitigation:** Write the hitSlop rule into the component template and the reviewer's checklist as a hard constraint, with the reasoning attached so it survives a long session. Add a CI grep rejecting `h-11`/`h-12`/`min-h-[44px]` on any Pressable outside RNR's own `size="lg"`. This is a rule that will be re-litigated by a well-meaning agent every few sessions; it needs a mechanical gate, not a comment.

### H11. canvas / node / edge / connection have no RNR precedent whatsoever — no pan-zoom surface, no SVG usage, no graph vocabulary. Grid background, node handles, edge stroke, and selection states would all be invented at once, and edge colors must be read as JS values (another foreign-surface bridge).

*Lens: design*

**Mitigation:** Descope from MVP. These four are the least chat-critical of the 49 and the most parity-expensive. If required later, ship them as a separately installed registry group with an explicit note that they introduce visual vocabulary outside the RNR system — an honest boundary beats a silent one. Their gesture handling also conflicts with the parent Conversation ScrollView, which is its own multi-day problem.


## MEDIUM (19)

### M1. Overlays opened inside our own sheet or command portal to the ROOT PortalHost and render BEHIND the sheet. Invisible on web, reproduces only on device.

*Lens: architecture*

**Mitigation:** Design decision, not an implementation detail: sheet mounts a NAMED PortalHost and passes its name down via context; every RNR overlay rendered inside receives portalHost. Must be specified in the sheet task, because an implementer cannot infer it from the component file.

### M2. A hardcoded color or a locally-invented token silently breaks the theming-passthrough contract. Both fail without any error — an unknown Tailwind utility is dropped, and a hex literal simply never re-themes.

*Lens: architecture*

**Mitigation:** scripts/check-tokens.ts as a blocking CI job (color-literal grep + token-allowlist check against RNR's published set), plus the six-screenshot token-flip proof on device in light and dark on both platforms. The grep catches the common case; only the device pass catches a color hidden inside a markdown or highlight style object.

### M3. A short-name registryDependencies entry resolves against the shadcn WEB registry and installs a DOM component into a React Native app.

*Lens: architecture*

**Mitigation:** CI assertion that every registryDependencies entry starts with https://, plus a dependency denylist rejecting any DOM-only package name in a registry item's dependencies. Both are five-line scripts and they eliminate the entire class.

### M4. Upstream RNR drift. We reference RNR by live URL, so a future RNR change silently alters what a consumer's add pulls, and our components may stop composing with it.

*Lens: architecture*

**Mitigation:** Scheduled CI job that scaffolds the example app fresh from the live RNR registry and typechecks. Document the RNR CLI version we verify against. Vendoring RNR components would pin them but forks the design system and violates constraint 1 — so we accept the drift and detect it instead.

### M5. lucide-react-native crossed a major boundary (RNR KB pins ^0.577; npm latest is 1.39.0). Icon export names changed across 0.x->1.x.

*Lens: architecture*

**Mitigation:** Pick one version, pin it, and add a typecheck-time barrel that imports every icon the registry uses so a rename fails CI rather than rendering nothing at runtime.

### M6. TypeScript 7.0.2 is the new Go-native compiler. Type-testing utilities (expectTypeOf, tsd) and Vitest's typecheck mode may not be fully compatible — which matters because the AI SDK type-conformance test is the primary guard on the one external contract.

*Lens: architecture*

**Mitigation:** Prove the conformance test on tsgo in the same task that decides the test runner. Keep typescript@5.9 as a dev-only fallback for that single check if tsgo trips. Do not let a tooling gap become a reason to drop the check.

### M7. Android vs iOS keyboard and inset divergence in prompt-input — the single most-used component. Android soft-keyboard behavior differs enough that an iOS-verified implementation regularly ships broken.

*Lens: architecture*

**Mitigation:** Core KeyboardAvoidingView with Platform.select behavior in the shipped item (zero dependencies), react-native-keyboard-controller documented as the upgrade. Emulator verification is a required AC for the item, not an optional extra.

### M8. Web parity for gesture-driven surfaces — sheet pan-to-dismiss and slider thumb drag have no touch equivalent in a desktop browser.

*Lens: architecture*

**Mitigation:** Platform.select the gesture branch off on web and rely on the overlay click-to-dismiss and keyboard arrow handling that @rn-primitives already provides. Constraint: a component that only works on native is not done per AGENTS.md, so web behavior is an AC on both items.

### M9. Scope. 49 components + 16 new base primitives + a build system + an example app + a docs site + a test strategy, with prior art whose own maintainer abandoned the RNR-layered approach in his rewrite.

*Lens: architecture*

**Mitigation:** Sequence by dependency, not by the alphabet. Wave 1: repo + registry build + one end-to-end component proving the whole pipeline (add from URL into a clean Expo app, renders, themes, passes CI). Wave 2: the shared base primitives everything else composes from (input-group, item, empty, sheet, spinner). Wave 3: the chat shell. Wave 4+: agent, content, and code surfaces. Cut navigation-menu, kbd, and breadcrumb first if a wave slips — nothing in the chat shell depends on them.

### M10. `font-mono` may silently not resolve to a real family under Uniwind on native. Six elements depend on it, and RNR's own `Text variant="code"` uses it — so if it is broken, it is broken in the host app too and 'matching' means matching a bug.

*Lens: design*

**Mitigation:** Verify on device as a day-one task, before any mono element is built. If it resolves, use it and add no file. If it does not, one shared `lib/mono.ts` with `Platform.select({ ios: 'Menlo', android: 'monospace' })` consumed by all six. Either way, one decision in one place.

### M11. Tool status green and orange answer to no theme. A consumer whose brand primary is green gets a success badge indistinguishable from their primary action color.

*Lens: design*

**Mitigation:** Confine all three literals to one exported `statusColor` map, default to the web original's values (so our deviation matches theirs exactly), and expose the map as an overridable prop. Status is also carried by icon and label, so the color is reinforcement rather than the sole channel — the failure degrades to 'less obvious', not 'unreadable'.

### M12. Conversation is a ScrollView wearing FlatList's prop signature (`data`/`renderItem`/`keyExtractor`) and mounts every message. It passes review, passes the demo, and degrades only once real users accumulate history.

*Lens: design*

**Mitigation:** Not a styling issue but a VISIBLE one — dropped frames read as 'the chat library is janky', which is a visible difference of exactly the kind the promise forbids. Ship FlashList or a windowed FlatList from the start, or the API is a trap for every consumer. Verify with a 500-message transcript and the keyboard open, on device.

### M13. The web source is full of raw `<XIcon className="size-4" />`. Ported literally, icons silently ignore className and render at default size and color — in every file, on every platform, with no error.

*Lens: design*

**Mitigation:** CI grep: any `lucide-react-native` import used directly as a JSX element rather than passed to `<Icon as={} />` fails the build. Mechanical, because this one is a pure copy-paste reflex and prose will not stop it.

### M14. Web-only `hover:`-only press feedback ported without an `active:` twin. Renders identically at rest, so a screenshot review passes; the control is simply dead under a thumb.

*Lens: design*

**Mitigation:** Lint rule: any `Platform.select({ web: '…hover:…' })` requires a sibling `active:` in the base string. Add 'pressed every interactive element on device' to the review gate — this one cannot be caught by reading code.

### M15. Missing PortalHost or missing `contentInsets` on anchored content. Overlays render NOTHING with no error, or sit under the notch or the Android gesture bar. Works on web, works in a default simulator pose, fails on hardware.

*Lens: design*

**Mitigation:** Document `<PortalHost />` as an install prerequisite in every registry item that portals. Ship `contentInsets` (with the registry's Android `bottom + 24`) inside our components rather than making consumers supply it. Require device screenshots with a notch and gesture bar in both schemes for any overlay change.

### M16. Multi-pane elements (panel, sandbox, canvas inspector) collapsing to a hand-built bottom sheet, since RNR ships no sheet, drawer, resizable, or sidebar. Every value in that sheet — radius, drag handle, backdrop opacity, spring, shadow — would be invented with no RNR reference to match.

*Lens: design*

**Mitigation:** Prefer RNR Tabs, which costs a structural change but zero visual invention. If a sheet becomes unavoidable, build exactly one, derive every value from the visual parity contract above (`rounded-xl`, `bg-card`, `border-border`, `shadow-sm shadow-black/5`, 200ms), and treat it as a new RNR-shaped primitive rather than an AI Elements detail — which is also the honest signal that it belongs upstream in RNR, not here.

### M17. Someone reads the RNR KB's theming.md and applies the Nativewind path — `tailwind.config.js`, `hsl(var(--token))`, `.dark:root`, `inlineRem: 16`, `hairlineWidth()`, `tailwindcss-animate`. Symptoms are silent: tokens ignored, dark mode never applies, borderless cards.

*Lens: design*

**Mitigation:** theming.md documents the Nativewind path and is superseded for this repo by MIGRATION.md v1.1.0. State the engine at the top of every component file's review checklist. AGENTS.md already carries the rule; the gap is that theming.md is the more inviting document to read.

### M18. Streaming text announced continuously by VoiceOver/TalkBack, making assistant responses unusable with a screen reader. Invisible in every screenshot and in every code review.

*Lens: design*

**Mitigation:** The stable-wrapper contract in accessibility.screen_reader_streaming, verified on device with VoiceOver and TalkBack against a REAL provider stream — the simulated setTimeout demo chunks too politely to reproduce the failure.

### M19. Shared patterns implemented independently across the 49 elements — chevron rotation (6+ occurrences), the code-block shell (6), tree rendering (2), status colors (3), mono font (6), copy-to-clipboard (4+). Each duplication is a future drift point, and drift is precisely what the parity promise forbids.

*Lens: design*

**Mitigation:** Extract each on its SECOND occurrence, per the Rule of 2 — every one of these is already past the threshold at planning time, so they are day-one shared modules, not refactors. Build them before the elements that consume them.


## LOW (3)

### L1. Markdown and link rendering is a user-content path: a model-generated javascript: or custom-scheme link, or an oversized/pathological markdown payload.

*Lens: architecture*

**Mitigation:** Scheme allowlist (https/http/mailto) before any Linking.openURL, and a length guard on markdown input. Cheap, and it is the kind of thing that is embarrassing to add after shipping.

### L2. Haptics or 'improved' native focus indicators added with good intent, giving the library a felt or seen identity the host app lacks.

*Lens: design*

**Mitigation:** Default off, opt-in via prop. The promise is that a developer cannot point at a screen and identify the chat library — that includes what it feels like under the thumb, not only what a screenshot shows.

### L3. The `context` element's circular usage ring substituted with RNR's linear Progress, and `panel` substituted with Tabs, are deliberate departures from the web's appearance.

*Lens: design*

**Mitigation:** Correct by construction, and worth stating plainly so it is not later 'fixed': when RNR and web AI Elements disagree, RNR wins. The promise is parity with the host design system, not fidelity to the web screenshot.

