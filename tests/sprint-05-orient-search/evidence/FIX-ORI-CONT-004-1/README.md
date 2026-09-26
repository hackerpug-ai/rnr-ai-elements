# FIX-ORI-CONT-004-1 — the react-native-web 0.21.2 pin record

## Root cause

react-native-web@0.21.3 (published 2026-09-25T15:00Z) resolves from the consumer
templates' committed `~0.21.0` range and adds an `InputAccessoryView` export that
uniwind 1.11.0's incomplete `package.json` exports map cannot resolve: the
`./components/*` wildcard maps to `dist/module/components/web/*.js`, and the uniwind
1.11.0 tarball ships 28 web components there with `InputAccessoryView` absent. Every
fresh uniwind consumer therefore fails `npx expo export --platform web` under
`withUniwindConfig` Metro with the literal `Unable to resolve module
./exports/InputAccessoryView`. This broke ORI-CONT-004's sixth Quickstart seed leg
(uniwind/web) after ORI-RN-003's committed green, because the publish postdated it.

## The fix

`packages/docs-snippets/nativewind/package.json` and
`packages/docs-snippets/uniwind/package.json` each change exactly one dependency entry:
`"react-native-web": "~0.21.0"` → `"react-native-web": "0.21.2"`. The pin is the bare
version, not a range: every operator form (`~0.21.2`, `^0.21.2`, `>=0.21.2 <0.22.0`)
still spans 0.21.3 and re-drifts on the next fresh install. Exact pins are already
these manifests' convention for sensitive entries (`react`, `react-native`,
`react-native-worklets`, `uniwind`).

## Proof (task-owned harness, `.tmp/FIX-ORI-CONT-004-1/`)

Selector: `pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts`
(default GREEN; `--mode red` captures the pre-pin state). All lanes are real: the real
`npm view react-native-web@<committed-spec> version --json` registry query, the reused
ORI-RN-001 `prepareConsumer` (committed recipe verbatim — `pnpm install`, `npx expo
install`, the literal public RNR CLI adds from rnraielements.com, `tsc --noEmit`,
`expo-doctor`), the resolved version read from the consumer's own
`node_modules/react-native-web/package.json`, and the reused ORI-RN-003 `exportWeb`
(real `npx expo export --platform web`).

| Observation | RED (pre-pin, `~0.21.0`) | GREEN (pinned `0.21.2`) |
| --- | --- | --- |
| Registry candidates for the committed spec | `0.21.0, 0.21.1, 0.21.2, 0.21.3` | exactly `0.21.2` |
| Fresh consumer resolved react-native-web (uniwind) | `0.21.3` | `0.21.2` |
| `expo export --platform web` (uniwind) | exit 1, literal `Unable to resolve module ./exports/InputAccessoryView` in the log | exit 0 |
| Fresh consumer resolved react-native-web (nativewind) | — (leg not run at RED) | `0.21.2` |
| `expo export --platform web` (nativewind) | — | exit 0 |
| Range operators across both pinned entries | 4 (`~` x2 pre-pin) | 0 |
| Whole GREEN run | — | 158,124 ms (budget 90 min), 1 fresh install per engine, 0 skipped legs |

Both runs bind candidate SHA `fd39f5605559a679582738fe6232f12724595b65`, the literal
selector command and mode, the consumer roots, the resolved-version read paths, the
export exits and logs, and the harness sha256 (identical bytes for both modes), in
`.tmp/FIX-ORI-CONT-004-1/red.json`, `green.json`, and `run.json`. Static gates recorded
in `run.json`: the vitest guard selector, `pnpm typecheck`, and the scoped
`pnpm exec biome ci` over the harness — all exit 0. The vitest-visible guard suite is
network-free and CLI-gates the heavyweight lanes (`directInvocationCheck`); it failed
pre-pin (honest aggregate RED) and passes post-pin. The reused helper's refreshes of
`tests/sprint-05-orient-search/evidence/ORI-RN-001/{uniwind,nativewind}-install.txt`
are side effects of these same runs and are committed with them.

## Prior standalone verification (cited)

The ORI-CONT-004 cycle-1 blocked report (commit `78f88b07`, saved at
`.kb-run-sprint/sprint-05-orient-search/ORI-CONT-004/cycle-1.blocked.json`)
reproduced the failure standalone twice and verified twice that pinning
react-native-web@0.21.2 in the same consumer makes the uniwind export exit 0. This
harness re-proves that end to end on the committed tree.

## Report-only finding (outside this task's boundary)

The workspace manifests `apps/harness`, `apps/harness-nativewind`, and `apps/example`
carry the same `~0.21.0` range. They resolve through `pnpm-lock.yaml`, not fresh
public installs, so they are unaffected by fresh-install drift; any lockfile-bound pin
there is a separate ask for the orchestrator.
