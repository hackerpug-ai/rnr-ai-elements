# Run the live chat example

This guide shows you how to configure, start, and exercise the worked example's live `/live-chat` screen against its real streaming backend. The screen composes the installed registry items around AI SDK v7's `useChat` hook; the backend holds the provider credentials, and the app never sees them.

This guide does not teach the chat-screen composition — the Quickstart tutorial owns that — and it is not provider or SDK reference.

## What you need

- A checkout of this repository with dependencies installed (`pnpm install` at the root).
- An OpenAI API key with access to `gpt-4.1-mini-2025-04-14` — the model the example and its proofs use.
- Expo Go on your phone, or a simulator or emulator on your machine.

## Configure the backend

The backend reads its configuration from the shell that starts it. Set the variables there — never in the app, never in `EXPO_PUBLIC_*`, and never as command arguments:

```bash
export OPENAI_API_KEY=<your key>            # server-only; the client never receives it
export EXAMPLE_CHAT_MODEL=gpt-4.1-mini-2025-04-14
export EXAMPLE_CHAT_WEB_ORIGIN=http://127.0.0.1:8081   # the origin you will serve the app from
```

Optional variables, with their defaults: `EXAMPLE_CHAT_HOST` (`127.0.0.1`), `EXAMPLE_CHAT_PORT` (`4000`), `EXAMPLE_CHAT_MAX_OUTPUT_TOKENS` (`1024`), and `EXAMPLE_CHAT_REQUEST_DEADLINE_MS` (`90000`). The upstream endpoint is fixed to `https://api.openai.com/v1` and cannot be redirected.

## Start the backend

From the repository root:

```bash
pnpm exec tsx apps/example/server/index.ts
```

You should see the listening line `ORI_AI_001_LISTENING 127.0.0.1:4000`. The server exits nonzero with `invalid server configuration: …` naming every missing or invalid variable if the configuration is incomplete — nothing listens until it is complete.

## Point the app at the backend

The app reads one variable, `EXPO_PUBLIC_API_BASE_URL`. Expo inlines `EXPO_PUBLIC_*` values when it builds, so the variable must be set in the shell that starts or exports the app.

- iOS simulator — the simulator shares your machine's loopback:

  ```bash
  cd apps/example
  EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 npx expo run:ios
  ```

- Android emulator — the emulator's loopback is its own, so map the port first:

  ```bash
  adb reverse tcp:4000 tcp:4000
  cd apps/example
  EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 npx expo run:android
  ```

- Web — the backend sends no cross-origin headers, so the page and the API must share an origin: set `EXPO_PUBLIC_API_BASE_URL` to the origin you will serve the export from, and serve the export there with `/api/chat` forwarded to the backend:

  ```bash
  cd apps/example
  EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8082 npx expo export --platform web --output-dir dist-web
  ```

  The sprint's proof harness contains the reference same-origin forwarder (`serveWithChatProxy` in `tests/sprint-05-orient-search/support/live-example-proof.test.ts`) — it serves the export and proxies `POST /api/chat` to the backend unchanged.

## Open the live route

The example has two routes with different jobs: `/` is the offline fixture-driven screen, and `/live-chat` is the live provider-backed screen. Open `/live-chat`, type a message, and select send.

You should see the reply stream in progressively — not arrive whole — and your message appear once with the composer cleared. Ask a follow-up that depends on the earlier turn ("What did I ask you about?") and the answer should use the conversation history. Select stop mid-stream to abort a reply. If the backend is down, the screen shows a connection error with a Retry control and no credential material; start the backend again and select Retry to complete a fresh request with exactly one copy of your retained turn.

## Fix problems

- The screen shows `EXPO_PUBLIC_API_BASE_URL is not configured` instead of the composer. The app started without the variable. Set it in the shell that starts or exports the app and start again.
- The server exits with `invalid server configuration: …`. A required variable is missing or invalid; the message names the field. Set `OPENAI_API_KEY`, `EXAMPLE_CHAT_MODEL`, and `EXAMPLE_CHAT_WEB_ORIGIN` and start again.
- The server exits with `port 4000 on 127.0.0.1 is already in use`. Another process owns the port. Stop it, or set `EXAMPLE_CHAT_PORT` and point the app at the new port.
- A mid-chat connection error appears. The backend stopped. Start it again and select Retry; the failed turn is retained once and retried with a fresh provider request.
- The Android emulator cannot reach the backend. Its loopback is not your machine's. Run `adb reverse tcp:4000 tcp:4000` and send again.
