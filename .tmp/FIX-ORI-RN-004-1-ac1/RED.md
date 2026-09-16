# FIX-ORI-RN-004-1-AC-1 — RED evidence

Task: land the one-line env fix (AC-1 of FIX-ORI-RN-004-1) on a fresh branch
from `main`, independent of the still-blocked `FIX-ORI-RN-004-1` branch.

Branch: `kb-run-sprint/sprint-05-orient-search/FIX-ORI-RN-004-1-ac1` (base `main` @ `3da1d9c`).

## The defect (pre-fix)

`getLiveChatConfig()` read the value through an intermediate alias:

```ts
export function getLiveChatConfig(): LiveChatConfig {
  const env = process.env;
  return resolveLiveChatConfig({
    EXPO_PUBLIC_API_BASE_URL: env.EXPO_PUBLIC_API_BASE_URL,
  });
}
```

## Mechanism — why the alias is never inlined (from plugin source)

`babel-preset-expo@57.0.10/build/plugins/inline-env-vars.js` (`expoInlineEnvVars`)
registers **only** `OptionalMemberExpression` and `MemberExpression` visitors.
Its `memberExpressionVisitor` calls `isProcessEnv(path)`, which is true **only**
when the visited node's `object` is itself the `process.env` member expression
(`object.object.name === 'process'` && `object.property.name === 'env'`) — i.e.
the plugin matches a DIRECT `process.env.EXPO_PUBLIC_*` access.

The aliased form is two separate nodes:

- `const env = process.env` → the bare `process.env` MemberExpression has
  `object === process` (an Identifier, not a MemberExpression) → `isProcessEnv`
  false → never rewritten.
- `env.EXPO_PUBLIC_API_BASE_URL` → its `object` is `env` (an Identifier), not
  `process` → `isProcessEnv` false → never rewritten.

There is **no** bare-`process.env` rewrite and no `Identifier` visitor. So the
aliased form never reaches `path.replaceWith(t.valueToNode(process.env[key]))`,
and the production bundle carries a runtime `process.env` read instead of the
inlined literal. In the browser (react-native-web polyfills `process.env` to an
empty object) that read is `undefined`, so `resolveLiveChatConfig` returns the
`ok: false` / `'EXPO_PUBLIC_API_BASE_URL is not configured'` branch.

Source file inspected at:
`node_modules/.pnpm/babel-preset-expo@57.0.10_*_expo@57.0.20_*/node_modules/babel-preset-expo/build/plugins/inline-env-vars.js`
(the exact version `expo export` resolves for this app, `expo@57.0.20`).

## RED proof — real static web export (clean Metro cache)

`apps/example/.env` = `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4000` (gitignored).

A temporary scratch route (`apps/example/app/scratch-env.tsx`) imported and
called `getLiveChatConfig()` so the module is reachable in the real bundle
(`getLiveChatConfig` is otherwise dead code on `main` — no route imports
`useLiveChat`). The route was **removed** after capture; it is not part of the
change set.

Command (run with `--clear` to defeat the shared Metro transform cache — see
GREEN.md for the stale-cache gotcha):

```
pnpm --dir apps/example exec expo export --platform web --clear \
  --output-dir .tmp/FIX-ORI-RN-004-1-ac1/red-full/dist
```

Grep of the produced client bundle (`_expo/static/js/web/entry-*.js`, ~5.9MB):

| probe | result |
|---|---|
| `127.0.0.1:4000` (inlined value) | **0 occurrences** — NOT inlined |
| `EXPO_PUBLIC_API_BASE_URL is not configured` | 1 — the "not configured" path is in the bundle |
| `NOT_CONFIGURED` (scratch route literal) | 1 — the route's error branch renders |
| `getLiveChatConfig` body form | `EXPO_PUBLIC_API_BASE_URL:process.env.EXPO_PUBLIC_API_BASE_URL}` — a runtime read, not a literal |

(Exact output in `.tmp/FIX-ORI-RN-004-1-ac1/red-grep.txt`.)

## RED proof — targeted transform of the real module

`transform.mjs` (committed under `.tmp/FIX-ORI-RN-004-1-ac1/`) runs the exact
`expoInlineEnvVars` plugin from `babel-preset-expo@57.0.10` in production mode
(`caller: { name: 'metro', platform: 'web', isDev: false }`) against the real
`apps/example/lib/live-chat-config.ts`, with `process.env` loaded from
`apps/example/.env`. Output: `.tmp/FIX-ORI-RN-004-1-ac1/red/live-chat-config.transformed.js`.

Pre-fix output keeps the alias and inlines nothing:

```js
export function getLiveChatConfig() {
  const env = process.env;
  return resolveLiveChatConfig({
    EXPO_PUBLIC_API_BASE_URL: env.EXPO_PUBLIC_API_BASE_URL
  });
}
```

No `http://127.0.0.1:4000` literal appears anywhere in the transformed output;
`resolveLiveChatConfig` is byte-identical between RED and GREEN.
