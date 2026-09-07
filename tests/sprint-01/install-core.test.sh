#!/usr/bin/env bash
#
# TASK-F8 — tests/sprint-01/install-core.test.sh
#
# Locked run_cmds (human-flows.json):
#   bash tests/sprint-01/install-core.test.sh UC-REG-01/core-happy-path
#     → gate steps 1-12: install, build, cold-boot Maestro flow on iOS + Android
#       (light and dark), the Android send-button/navigation-bar clearance measured
#       from the Android capture, the badge glyph measured in OKLCH from the iOS
#       capture, the INVERTED negative control (seed removed → Maestro must FAIL,
#       and a Maestro PASS there fails THIS script), and the artifact JSON.
#   bash tests/sprint-01/install-core.test.sh journeys/mvp-install-arc
#     → the same arc minus gate step 9 (the negative control is an engine self-check,
#       not a leg of the developer journey); writes mvp-install-arc.json.
#   bash tests/sprint-01/install-core.test.sh UC-REG-01/core-happy-path --mutate-theme green-600
#     → the theme negative variant (AC-6 case 2): deletes --color-green-600 from the
#       consumer @theme (restored by a trap on success, failure and SIGINT), boots the
#       app WITHOUT Maestro (so no "Flow Passed" line can print), measures the glyph,
#       and exits 1 naming the measured chroma and the missing token.
#   bash tests/sprint-01/install-core.test.sh --smoke ios|android
#     → one Maestro leg against an already-running Metro (gate steps 8, 9, 11, 12).
#
# Critical constraints carried here:
#   - strict-mode bash (see the shebang body) and no unconditional-success
#     wrappers: a command that always exits 0 turns the locked flow into theatre.
#   - the negative-control stage is INVERTED: Maestro must fail there; a PASS makes
#     the script exit non-zero.
#   - clearState: true under launchApp in .maestro/cold-boot.yaml, and ZERO retries:
#     a flaky flow is fixed or deleted, never retried into green.
#   - the sample is the GLYPH, not the pill: only pixels carrying chroma inside the
#     green hue band qualify; the pill's bg-secondary is achromatic and never does.
#   - the flow contains tapOn id:context-trigger followed by assertVisible
#     id:context-popover-content — TASK-F1's delegated PortalHost behavioral proof.
#
# macOS ships bash 3.2; this script sticks to 3.2-safe constructs on purpose.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$REPO_ROOT/apps/example"
FLOW="$REPO_ROOT/.maestro/cold-boot.yaml"
EV_BASE="$REPO_ROOT/.tmp/TASK-F8"
EV="${F8_EV_DIR:-$EV_BASE/runs/$(date +%Y%m%d-%H%M%S)}"
GOLDENS="$REPO_ROOT/design/goldens"
GOLDEN_INSTALL="$GOLDENS/sprint-01/install"
LANE="$REPO_ROOT/tests/sprint-01"

APP_ID="ai.hackerpug.rnrexample"
APP_SCHEME="ai-elements-example"
METRO_PORT=8081
DEV_URL="$APP_SCHEME://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
MAESTRO_PIN="2.5.1"
FIXTURE="$APP_DIR/fixtures/transcript.json"
FIXTURE_BAK="$FIXTURE.bak"
MAESTRO="$HOME/.maestro/bin/maestro"

REQUIRED_FILES=(
  components/ai/conversation.tsx
  components/ai/message.tsx
  components/ai/prompt-input.tsx
  components/ai/tool.tsx
  components/ai/context.tsx
  components/ui/text.tsx
  components/ui/avatar.tsx
  components/ui/button.tsx
  components/ui/icon.tsx
  components/ui/popover.tsx
)

IOS_LIGHT_SHOT="$GOLDENS/mobile-ios/sprint-01/cold-boot.png"
IOS_DARK_SHOT="$GOLDENS/mobile-ios/sprint-01/cold-boot-dark.png"
ANDROID_LIGHT_SHOT="$GOLDENS/mobile-android/sprint-01/cold-boot.png"
ANDROID_DARK_SHOT="$GOLDENS/mobile-android/sprint-01/cold-boot-dark.png"

log() { printf '%s\n' "$*"; }
die() { printf 'FATAL: %s\n' "$*" >&2; exit 1; }

# grep -c exits 1 at zero and would trip set -e; awk counts are zero-safe
count_lines() { awk -v pat="$2" 'index($0, pat) { n++ } END { print n + 0 }' "$1"; }

# ---------------------------------------------------------------- state -----------
TMPDIR="${TMPDIR:-/tmp}" # maestro captures are staged here mid-flow (see run_flow)
THEME_BAK=""
METRO_OURS=""
IOS_UDID=""
IOS_NAME=""
ANDROID_SERIAL=""
ANDROID_MODEL=""
INSTALL_MODE=""
BADGE_CHROMA=""
BADGE_HUE=""
BADGE_PIXELS=""
CLEARANCE_JSON=""

restore_fixture() {
  # the negative control moves the seed aside; every exit path puts it back
  if [ -f "$FIXTURE_BAK" ] && [ ! -f "$FIXTURE" ]; then
    mv -f "$FIXTURE_BAK" "$FIXTURE"
    log "fixture restored"
  fi
}

cleanup() {
  restore_fixture
  if [ -n "$THEME_BAK" ] && [ -f "$THEME_BAK" ]; then
    mv -f "$THEME_BAK" "$APP_DIR/global.css"
    log "global.css restored"
  fi
  if [ -n "$IOS_UDID" ]; then
    if ! xcrun simctl ui "$IOS_UDID" appearance light >/dev/null 2>&1; then
      printf 'warn: could not restore light appearance on %s\n' "$IOS_UDID" >&2
    fi
  fi
  if [ -n "$ANDROID_SERIAL" ]; then
    if ! adb -s "$ANDROID_SERIAL" shell cmd uimode night no >/dev/null 2>&1; then
      printf 'warn: could not restore day mode on %s\n' "$ANDROID_SERIAL" >&2
    fi
  fi
  # kill by port, not by pid: npx wraps node, and only the listener is reliable
  if [ -n "$METRO_OURS" ]; then
    if pids="$(lsof -ti tcp:"$METRO_PORT" -sTCP:LISTEN 2>/dev/null)"; then
      if [ -n "$pids" ]; then
        if ! kill $pids 2>/dev/null; then
          printf 'warn: could not terminate Metro listener(s) on %s\n' "$METRO_PORT" >&2
        fi
      fi
    fi
  fi
}
trap cleanup EXIT

# ---------------------------------------------------------------- preflight -------
find_maestro() {
  if [ -x "$HOME/.maestro/bin/maestro" ]; then
    MAESTRO="$HOME/.maestro/bin/maestro"
  elif command -v maestro >/dev/null 2>&1; then
    MAESTRO="$(command -v maestro)"
  else
    die "maestro not found (expected at ~/.maestro/bin/maestro)"
  fi
}

check_maestro_pin() {
  local v
  v="$("$MAESTRO" --version 2>/dev/null | tr -d '[:space:]')"
  if [ "$v" != "$MAESTRO_PIN" ]; then
    die "Maestro $MAESTRO_PIN is pinned (.maestro/config.yaml); found '$v'"
  fi
  log "maestro $v (pinned by .maestro/config.yaml)"
}

pick_ios_device() {
  if [ -n "${F8_IOS_UDID:-}" ]; then
    IOS_UDID="$F8_IOS_UDID"
  else
    IOS_UDID="$(xcrun simctl list devices 2>/dev/null | awk -F'[()]' '/Booted/ && /iPhone/ { print $2; exit }')"
  fi
  if [ -z "$IOS_UDID" ]; then
    IOS_UDID="$(xcrun simctl list devices available 2>/dev/null | awk -F'[()]' '/iPhone 17 Pro / && !/Max/ { print $2; exit }')"
    if [ -z "$IOS_UDID" ]; then
      die "no booted iPhone simulator and no 'iPhone 17 Pro' available to boot"
    fi
    if ! xcrun simctl boot "$IOS_UDID" >/dev/null 2>&1; then
      log "simulator $IOS_UDID already booting/booted"
    fi
  fi
  if ! xcrun simctl bootstatus "$IOS_UDID" -b >/dev/null; then
    die "simulator $IOS_UDID did not reach a booted state"
  fi
  IOS_NAME="$(xcrun simctl list devices 2>/dev/null | awk -F'(' -v u="$IOS_UDID" 'index($0, u) { s=$1; sub(/^ +/, "", s); sub(/ +$/, "", s); print s; exit }')"
  log "iOS target: ${IOS_NAME:-unknown} ($IOS_UDID)"
}

pick_android_device() {
  if [ -n "${F8_ANDROID_SERIAL:-}" ]; then
    ANDROID_SERIAL="$F8_ANDROID_SERIAL"
  else
    ANDROID_SERIAL="$(adb devices 2>/dev/null | awk '/\tdevice\r?$/ && /emulator/ { print $1; exit }')"
  fi
  if [ -z "$ANDROID_SERIAL" ]; then
    local sdk="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
    if [ ! -x "$sdk/emulator/emulator" ]; then
      die "no emulator attached and no emulator binary at $sdk/emulator/emulator"
    fi
    log "no emulator attached — booting Pixel_7_API_34"
    "$sdk/emulator/emulator" -avd Pixel_7_API_34 -no-snapshot -no-audio -no-boot-anim >/dev/null 2>&1 &
    ANDROID_SERIAL="emulator-5554"
  fi
  local i=0
  while :; do
    if [ "$(adb -s "$ANDROID_SERIAL" shell getprop sys.boot_completed 2>/dev/null | tr -d '[:space:]')" = "1" ]; then
      break
    fi
    i=$((i + 1))
    if [ "$i" -gt 150 ]; then
      die "emulator $ANDROID_SERIAL did not finish booting"
    fi
    sleep 2
  done
  ANDROID_MODEL="$(adb -s "$ANDROID_SERIAL" shell getprop ro.kernel.qemu.avd_name 2>/dev/null | tr -d '[:space:]')"
  log "Android target: ${ANDROID_MODEL:-unknown} ($ANDROID_SERIAL)"
}

stage_preflight() {
  log "== preflight =="
  local tool
  for tool in node pnpm xcrun adb sips curl lsof awk; do
    command -v "$tool" >/dev/null 2>&1 || die "missing required tool: $tool"
  done
  find_maestro
  check_maestro_pin
  pick_ios_device
  pick_android_device
  # the flow must still be the locked one
  grep -q "clearState: true" "$FLOW" || die ".maestro/cold-boot.yaml lost clearState: true"
  grep -q 'id: "context-trigger"' "$FLOW" || die "flow lost the context-trigger tapOn"
  grep -q 'id: "context-popover-content"' "$FLOW" || die "flow lost the context-popover-content assert"
  grep -q 'transcript-message-0' "$FLOW" || die "flow lost the transcript-message-0 assert"
  mkdir -p "$EV" "$GOLDEN_INSTALL" \
    "$GOLDENS/mobile-ios/sprint-01" "$GOLDENS/mobile-android/sprint-01"
}

# ---------------------------------------------------------------- install ---------
install_files_present() {
  local f
  for f in "${REQUIRED_FILES[@]}"; do
    [ -f "$APP_DIR/$f" ] || return 1
  done
}

stage_install() {
  log "== install (gate steps 1-3) =="
  if [ ! -d "$REPO_ROOT/node_modules" ] || [ ! -d "$APP_DIR/node_modules" ]; then
    log "pnpm install (workspace + example)"
    (cd "$REPO_ROOT" && pnpm install) >"$EV/pnpm-install.log" 2>&1
  else
    log "node_modules present — pnpm install skipped (idempotent re-run)"
  fi

  if install_files_present; then
    # The committed consumer tree already carries the F3 install (its evidence and
    # logs are committed). Re-running the CLI over committed files would stop on
    # overwrite prompts, so an intact tree is re-verified instead of re-installed.
    local bad=0
    # guard the grep in an if: under pipefail, grep's no-match exit 1 (the CLEAN
    # case) would otherwise kill the script through the assignment
    if grep -Rq '@/registry/' "$APP_DIR/components" 2>/dev/null; then
      bad="$(grep -R '@/registry/' "$APP_DIR/components" 2>/dev/null | wc -l | tr -d ' ')"
    fi
    if [ "$bad" -ne 0 ]; then
      die "consumer tree contains $bad unresolved '@/registry/' literals — the alias contract (TASK-F4) is broken"
    fi
    [ -f "$FIXTURE" ] || die "fixture transcript.json missing from the consumer tree"
    grep -q "PortalHost" "$APP_DIR/app/_layout.tsx" || die "consumer app lost its root PortalHost"
    INSTALL_MODE="already-installed (committed F3 install re-verified: 10/10 files, 0 '@/registry/' literals, PortalHost present)"
    log "$INSTALL_MODE"
  else
    local present=0 f
    for f in "${REQUIRED_FILES[@]}"; do
      if [ -f "$APP_DIR/$f" ]; then present=$((present + 1)); fi
    done
    if [ "$present" -ne 0 ]; then
      die "consumer tree is ambiguous: $present/10 required files present but not all — restore the committed install instead of a partial CLI run"
    fi
    log "consumer tree has none of the 10 required files — running the REAL RNR CLI from the v0.1.0 tag"
    local install_log="$EV/f8-install.log"
    if ! (
      cd "$APP_DIR" && npx @react-native-reusables/cli@latest add \
        "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/conversation.json" \
        "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/message.json" \
        "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/prompt-input.json" \
        "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/tool.json" \
        "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/context.json"
    ) >"$install_log" 2>&1; then
      die "the RNR CLI add command failed to run at all — see $install_log (the wrapper's own exit code stays untrusted; the per-file gates below still decide)"
    fi
    # TASK-F3 review finding: the CLI's bin wrapper exits 0 even when the inner
    # resolver exits 1 — its exit code is UNTRUSTED. Gate on what it created:
    for f in "${REQUIRED_FILES[@]}"; do
      if [ ! -f "$APP_DIR/$f" ]; then
        die "CLI install did not create $f (wrapper exit untrusted) — see $install_log"
      fi
      if ! grep -qF -- "- $f" "$install_log"; then
        die "CLI log has no Created line for $f — see $install_log"
      fi
    done
    if [ "$(count_lines "$install_log" '404')" -ne 0 ] ||
      [ "$(count_lines "$install_log" 'Cannot find module')" -ne 0 ]; then
      die "CLI install hit 404s/resolution errors — see $install_log"
    fi
    if [ "$(count_lines "$install_log" 'raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0')" -lt 1 ]; then
      die "CLI never resolved the pinned v0.1.0 tag — see $install_log"
    fi
    INSTALL_MODE="fresh install via the real RNR CLI from the v0.1.0 tag (10/10 files Created, 0 errors)"
    log "$INSTALL_MODE"
  fi
}

# ---------------------------------------------------------------- metro -----------
stage_metro() {
  log "== metro (port $METRO_PORT, serving this worktree) =="
  if pids="$(lsof -ti tcp:"$METRO_PORT" -sTCP:LISTEN 2>/dev/null)"; then
    if [ -n "$pids" ]; then
      log "killing squatter(s) on $METRO_PORT: $(printf '%s ' $pids)"
      if ! kill $pids 2>/dev/null; then
        printf 'warn: a squatter pid survived the kill\n' >&2
      fi
      sleep 2
    fi
  fi
  local i=0
  while lsof -ti tcp:"$METRO_PORT" -sTCP:LISTEN >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -gt 30 ]; then die "port $METRO_PORT still held after killing squatters"; fi
    sleep 1
  done
  cd "$APP_DIR"
  nohup npx expo start --port "$METRO_PORT" --offline >"$EV/metro.log" 2>&1 &
  cd "$REPO_ROOT"
  METRO_OURS=1
  i=0
  until curl -fs "http://localhost:$METRO_PORT/status" 2>/dev/null | awk 'index($0, "packager-status:running") { found=1 } END { exit found ? 0 : 1 }'; do
    i=$((i + 1))
    if [ "$i" -gt 90 ]; then die "Metro not serving after 90s — see $EV/metro.log"; fi
    sleep 1
  done
  log "Metro serving"
}

# ---------------------------------------------------------------- builds ----------
# grep -q is banned inside pipelines here: it exits on the first match, SIGPIPEs
# the generator, and under pipefail the killed generator's status wins even on a
# match. Full-read awk exits 0/1 without touching the generator's stdin.
app_installed_ios() {
  # simctl can transiently report a busy device right after an install; poll the
  # state probe briefly. This is infrastructure reading, not a flow retry.
  local i=0
  while :; do
    if xcrun simctl listapps "$IOS_UDID" 2>/dev/null | awk -v id="$APP_ID" 'index($0, id) { found=1 } END { exit found ? 0 : 1 }'; then
      return 0
    fi
    i=$((i + 1))
    if [ "$i" -ge 5 ]; then
      return 1
    fi
    sleep 3
  done
}
app_installed_android() {
  local i=0
  while :; do
    if adb -s "$ANDROID_SERIAL" shell pm list packages 2>/dev/null | awk -v id="package:$APP_ID" 'index($0, id) { found=1 } END { exit found ? 0 : 1 }'; then
      return 0
    fi
    i=$((i + 1))
    if [ "$i" -ge 5 ]; then
      return 1
    fi
    sleep 3
  done
}

stage_build_ios() {
  log "== build/install iOS (gate step 4) =="
  if app_installed_ios; then
    log "$APP_ID already installed on $IOS_UDID — native build skipped (the cold boot is exercised by the flow's clearState launch)"
    return 0
  fi
  log "running npx expo run:ios (the long pole on a fresh checkout)"
  (cd "$APP_DIR" && npx expo run:ios --no-bundler -d "$IOS_UDID") >"$EV/build-ios.log" 2>&1
  app_installed_ios || die "iOS app not installed after expo run:ios — see $EV/build-ios.log"
}

stage_build_android() {
  log "== build/install Android (gate step 10) =="
  if app_installed_android; then
    log "$APP_ID already installed on $ANDROID_SERIAL — native build skipped (the cold boot is exercised by the flow's clearState launch)"
    return 0
  fi
  log "running npx expo run:android"
  (
    cd "$APP_DIR" &&
      ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}" npx expo run:android --no-bundler -d "${ANDROID_MODEL:-Pixel_7_API_34}"
  ) >"$EV/build-android.log" 2>&1
  app_installed_android || die "Android app not installed after expo run:android — see $EV/build-android.log"
}

# ---------------------------------------------------------------- warm ------------
wait_bundled() { # $1 marker, $2 timeout seconds. Soft check: the flow's own
  # assertions are the hard gate — this only keeps Maestro's 7s assert window from
  # racing a cold transform.
  local marker="$1" timeout="$2" waited=0
  while ! grep -q "$marker" "$EV/metro.log" 2>/dev/null; do
    if [ "$waited" -ge "$timeout" ]; then
      log "warn: no '$marker' in the Metro log after ${timeout}s — continuing; the flow decides"
      return 0
    fi
    sleep 5
    waited=$((waited + 5))
  done
}

stage_warm_ios() {
  log "== warm iOS bundle =="
  if xcrun simctl terminate "$IOS_UDID" "$APP_ID" >/dev/null 2>&1; then
    log "terminated previous iOS instance"
  fi
  # launch with the URL as a launch argument: simctl routes it through LaunchServices
  # WITHOUT the springboard "Open in ...?" confirmation dialog that openurl pops and
  # that Maestro cannot see to dismiss
  if ! xcrun simctl launch "$IOS_UDID" "$APP_ID" "$DEV_URL" >/dev/null; then
    die "simctl launch of $APP_ID failed — is the app installed on $IOS_UDID?"
  fi
  wait_bundled "iOS Bundled" 600
  log "iOS bundle warm"
}

stage_warm_android() {
  log "== warm Android bundle =="
  if ! adb -s "$ANDROID_SERIAL" reverse tcp:"$METRO_PORT" tcp:"$METRO_PORT" >/dev/null 2>&1; then
    die "adb reverse failed for $ANDROID_SERIAL"
  fi
  adb -s "$ANDROID_SERIAL" shell am force-stop "$APP_ID" >/dev/null 2>&1
  if ! adb -s "$ANDROID_SERIAL" shell am start -a android.intent.action.VIEW -d "$DEV_URL" >/dev/null 2>&1; then
    die "am start of the dev-client deep link failed on $ANDROID_SERIAL"
  fi
  wait_bundled "Android Bundled" 600
  log "Android bundle warm"
}

# ---------------------------------------------------------------- flows -----------
run_flow() { # $1 platform, $2 target, $3 screenshot path, $4 log path
  local platform="$1" target="$2" shot="$3" logpath="$4"
  log "maestro flow → $platform ($(basename "$shot"))"
  # The capture is written OUTSIDE the Metro-watched worktree and moved into its
  # golden path only AFTER the child exits. A png landing inside the repo while a
  # flow runs invalidates Metro's bundle mid-flow and the HMR push remounts the
  # running app (expo-router's ContextNavigator then logs a state-update error and
  # Android's LogBox covers the screen — the context-popover assert fails; see
  # cycle-2/core-happy-path.log). Cycle 1 never saw this because every flow died
  # at the removed bare-text assert BEFORE its screenshot step.
  local tmpshot="${TMPDIR%/}/task-f8-shot-$$-$(basename "$shot")"
  rm -f "$tmpshot" "$tmpshot.png"
  # a failed flow aborts the script — zero retries by design — but it must speak:
  if ! "$MAESTRO" test --udid "$target" -e "SCREENSHOT_PATH=$tmpshot" "$FLOW" >"$logpath" 2>&1; then
    cat "$logpath"
    die "the cold-boot flow FAILED on $platform — see $logpath (zero retries by design)"
  fi
  if [ ! -f "$tmpshot" ] && [ -f "$tmpshot.png" ]; then
    mv -f "$tmpshot.png" "$tmpshot"
  fi
  if [ ! -f "$tmpshot" ]; then
    die "capture $tmpshot was not written by the flow"
  fi
  mv -f "$tmpshot" "$shot"
  # Maestro 2.5.1's `test` subcommand prints NO success summary line (verified
  # empirically: a fully green run exits 0 with per-command COMPLETED lines only —
  # cycle-2/smoke-ios-green.log). Its verdict is the exit code, and its failure
  # output is loud (per-command FAILED + 'Assertion is false: ...' — cycle-1 RED
  # logs). So the marker line is emitted HERE, per passing flow, from the already
  # verified facts (child exit 0 + exactly the flow's asserts completed + capture
  # on disk); a child failure can never reach this line because the branch above dies.
  log "Flow Passed ($platform: $(basename "$shot"))"
  cat "$logpath"
}

stage_flows() {
  log "== cold-boot flows (gate steps 8, 11, 12) =="

  log "-- iOS light --"
  run_flow ios "$IOS_UDID" "$IOS_LIGHT_SHOT" "$EV/flow-ios-light.log"

  log "-- iOS dark (capture-only; the gate asserts light) --"
  if ! xcrun simctl ui "$IOS_UDID" appearance dark >/dev/null 2>&1; then
    die "could not switch the simulator to dark appearance"
  fi
  run_flow ios "$IOS_UDID" "$IOS_DARK_SHOT" "$EV/flow-ios-dark.log"
  if ! xcrun simctl ui "$IOS_UDID" appearance light >/dev/null 2>&1; then
    die "could not restore light appearance"
  fi

  log "-- Android light --"
  run_flow android "$ANDROID_SERIAL" "$ANDROID_LIGHT_SHOT" "$EV/flow-android-light.log"

  log "-- Android dark, after force-quit (gate step 12: cold launch #2, Metro left running) --"
  adb -s "$ANDROID_SERIAL" shell am force-stop "$APP_ID" >/dev/null 2>&1
  if ! adb -s "$ANDROID_SERIAL" shell cmd uimode night yes >/dev/null 2>&1; then
    die "could not switch the emulator to night mode"
  fi
  run_flow android "$ANDROID_SERIAL" "$ANDROID_DARK_SHOT" "$EV/flow-android-dark.log"
  if ! adb -s "$ANDROID_SERIAL" shell cmd uimode night no >/dev/null 2>&1; then
    die "could not restore day mode"
  fi
  log "4 'Flow Passed' (iOS light/dark, Android light/dark), 0 retries, clearState: true on every launch"
}

# ---------------------------------------------------------------- badge (AC-6) ----
stage_badge_measure() {
  log "== badge glyph measurement (AC-6) =="
  # Every flow ENDS with the context popover open (the portal pair is its last
  # step), so a hierarchy taken straight after stage_flows cannot see
  # tool-badge-completed (cycle-2: the dump held only context-popover-content).
  # Relaunch the app at rest first; if the relaunch or the dump fails, the
  # full-capture segmentation below remains the honest floor.
  local rect_args=()
  if xcrun simctl terminate "$IOS_UDID" "$APP_ID" >/dev/null 2>&1; then
    log "terminated the popover-open app instance"
  fi
  if xcrun simctl launch "$IOS_UDID" "$APP_ID" "$DEV_URL" >/dev/null; then
    wait_bundled "iOS Bundled" 600
    sleep 5
  else
    log "warn: could not relaunch the app for the hierarchy dump — falling back to full-capture segmentation"
  fi
  if "$MAESTRO" --udid "$IOS_UDID" hierarchy >"$EV/hierarchy-ios.json" 2>/dev/null; then
    local rect=""
    if ! rect="$(node "$LANE/hierarchy-rect.mjs" "$EV/hierarchy-ios.json" tool-badge-completed "$IOS_LIGHT_SHOT" 2>/dev/null)"; then
      rect=""
    fi
    if [ -n "$rect" ]; then
      rect_args=(--rect "$rect")
      log "element bounds scaled to capture px: $rect"
    else
      log "element bounds unavailable — falling back to full-capture segmentation"
    fi
  fi
  local out
  if [ "${#rect_args[@]}" -gt 0 ]; then
    out="$(node "$LANE/oklch-badge.mjs" "$IOS_LIGHT_SHOT" "${rect_args[@]}" 2>&1)"
  else
    out="$(node "$LANE/oklch-badge.mjs" "$IOS_LIGHT_SHOT" 2>&1)"
  fi
  if printf '%s\n' "$out" | node -e 'let d="";process.stdin.on("data",(c)=>d+=c).on("end",()=>{try{JSON.parse(d);process.exit(0)}catch(e){process.exit(1)}})'; then
    printf '%s\n' "$out" >"$EV/badge-oklch.json"
  else
    printf '%s\n' "$out" >&2
    die "badge glyph measurement found no chromatic pixels (measured chroma 0.0000 is below 0.05) — --color-green-600 is missing from the consumer @theme (mutate-theme=${MUTATE_THEME:-none})"
  fi
  BADGE_CHROMA="$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).chroma' "$EV/badge-oklch.json")"
  BADGE_HUE="$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).hue' "$EV/badge-oklch.json")"
  BADGE_PIXELS="$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).pixels_sampled' "$EV/badge-oklch.json")"
  if awk -v c="$BADGE_CHROMA" 'BEGIN { exit !(c > 0.05) }'; then
    log "badge glyph chroma $BADGE_CHROMA > 0.05 across $BADGE_PIXELS sampled pixels"
  else
    die "measured badge glyph chroma $BADGE_CHROMA is below 0.05 — --color-green-600 is missing from the consumer @theme (mutate-theme=${MUTATE_THEME:-none})"
  fi
  if awk -v h="$BADGE_HUE" 'BEGIN { exit !(h >= 120 && h <= 180) }'; then
    log "badge glyph hue $BADGE_HUE inside [120,180]"
  else
    die "measured badge glyph hue $BADGE_HUE outside [120,180]"
  fi
}

# ---------------------------------------------------------------- Android AC-4 ----
stage_android_clearance() {
  log "== Android send-button / navigation-bar clearance (AC-4) =="
  local density navh navh_source
  if ! density="$(adb -s "$ANDROID_SERIAL" shell wm density 2>/dev/null | awk 'match($0, /[0-9]+/) { print substr($0, RSTART, RLENGTH); exit }')"; then
    density=""
  fi
  case "$density" in
    '' | *[!0-9]*) die "could not read the device density" ;;
  esac
  # Authoritative source: the system's own navigationBars InsetsSource frame —
  # gesture nav declares a 24dp (63px @420dpi) bar here, while the Settings.Global
  # key is null and the 48dp constant is the THREE-BUTTON height. Cycle 2 measured
  # a false -17.5dp overlap against 48dp that dumpsys disproves (see
  # cycle-2/navbar-inset-groundtruth.log). Dump to a FILE first — a pipe into an
  # early-exiting grep/awk can SIGPIPE the adb side and, under pipefail, kill the
  # script — then parse the file.
  local dumpfile="$EV/dumpsys-window-displays.txt"
  if ! adb -s "$ANDROID_SERIAL" shell dumpsys window displays >"$dumpfile" 2>/dev/null; then
    : >"$dumpfile"
  fi
  navh="$(awk '/type=navigationBars frame=/ { if (match($0, /frame=\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]/)) { s=substr($0, RSTART+7, RLENGTH-8); n=split(s, p, /[,[\]]+/); h=p[4]-p[2]; if (h > 0) { print h; exit } } }' "$dumpfile")"
  if [ -n "$navh" ]; then
    navh_source="dumpsys window displays navigationBars frame"
  else
    if ! navh="$(adb -s "$ANDROID_SERIAL" shell settings get global navigation_bar_height 2>/dev/null | tr -d '[:space:]')"; then
      navh=""
    fi
  fi
  case "$navh" in
    '' | *[!0-9]* | 0)
      navh=$((24 * density / 160))
      navh_source="24dp gesture-nav fallback (dumpsys frame unavailable; Settings.Global navigation_bar_height is null for gesture nav)"
      ;;
    *)
      if [ -z "${navh_source:-}" ]; then
        navh_source="settings global navigation_bar_height"
      fi
      ;;
  esac
  CLEARANCE_JSON="$(node "$LANE/android-clearance.mjs" "$ANDROID_LIGHT_SHOT" "$navh" "$density")"
  log "$CLEARANCE_JSON"
  local gap_dp
  gap_dp="$(node -p 'JSON.parse(process.argv[1]).gap_dp' "$CLEARANCE_JSON")"
  if awk -v g="$gap_dp" 'BEGIN { exit !(g >= 1) }'; then
    log "send button clears the navigation bar by ${gap_dp}dp (>= 1dp) [nav bar height: $navh px via $navh_source]"
  else
    die "send button gap to the navigation bar is ${gap_dp}dp (< 1dp) — Android 14+ edge-to-edge overlap"
  fi
}

# ---------------------------------------------------------------- negative control
stage_negative_control() {
  log "== negative control, INVERTED (gate step 9 / AC-2) =="
  local platform target logpath rc
  for platform in ios android; do
    if [ "$platform" = ios ]; then target="$IOS_UDID"; else target="$ANDROID_SERIAL"; fi
    logpath="$EV/negctl-$platform.log"
    log "-- negative control on $platform: seed moved aside, the identical flow must FAIL --"
    mv "$FIXTURE" "$FIXTURE_BAK"
    # let Metro's watcher settle so the re-request cannot race the invalidation
    sleep 2
    # throwaway capture outside the watched tree — same mid-flow-invalidation
    # hazard run_flow documents above
    local throwaway="${TMPDIR%/}/task-f8-negctl-$$-$platform.png"
    rm -f "$throwaway"
    set +e
    "$MAESTRO" test --udid "$target" -e "SCREENSHOT_PATH=$throwaway" "$FLOW" >"$logpath" 2>&1
    rc=$?
    set -e
    cat "$logpath"
    if [ "$rc" -eq 0 ]; then
      die "negative control PASSED (exit 0) on $platform with the seed removed — the flow asserts nothing and the whole gate is theatre"
    fi
    if [ "$rc" -ne 1 ]; then
      die "negative control on $platform exited $rc (expected 1 from the maestro child)"
    fi
    if ! grep -qF 'Assertion is false: id: transcript-message-0 is visible' "$logpath"; then
      die "negative control on $platform failed (exit 1) but NOT with the named assertion 'Assertion is false: id: transcript-message-0 is visible'"
    fi
    restore_fixture
    sleep 2
    log "negative control behaved as required on $platform (maestro exit 1 with the named assertion)"
  done
  log "negative control behaved as required"
}

# ---------------------------------------------------------------- artifact --------
write_artifact() { # $1 artifact path, $2 flow id, $3 negative-control JSON fragment
  local path="$1" flow_id="$2" negctl="$3"
  # node -e argv: 1=flow 2=path 3=badge-json-path 4=clearance-json 5=install
  #               6=ios-name 7=ios-udid 8=app-id 9=ios-light 10=ios-dark
  #               11=android-model 12=serial 13=android-light 14=android-dark 15=negctl
  node -e '
    const fs = require("fs");
    const a = process.argv;
    const badge = JSON.parse(fs.readFileSync(a[3], "utf8"));
    const artifact = {
      flow: a[1],
      run_cmd: "bash tests/sprint-01/install-core.test.sh " + a[1],
      script: "tests/sprint-01/install-core.test.sh",
      flow_file: ".maestro/cold-boot.yaml",
      captured_at: new Date().toISOString(),
      install: a[5],
      platforms: {
        ios: {
          device: a[6],
          udid: a[7],
          app_id: a[8],
          flow_runs: ["light", "dark"],
          flows_passed: 2,
          captures: [a[9], a[10]],
        },
        android: {
          device: a[11],
          serial: a[12],
          app_id: a[8],
          flow_runs: ["light", "dark (after am force-stop; Metro left running)"],
          flows_passed: 2,
          cold_boots: { count: 2, force_quit_before_run: 1, retries: 0, clearState: true },
          captures: [a[13], a[14]],
        },
      },
      badge_glyph_oklch: {
        sample: "glyph",
        note: "pixels are segmented by chroma inside the green hue band — the pill background (bg-secondary) is achromatic and never qualifies; the sample rectangle is recorded so the number is auditable",
        capture: badge.capture,
        search_rect: badge.search_rect,
        sample_rect: badge.sample_rect,
        pixels_sampled: badge.pixels_sampled,
        mean_srgb: badge.mean_srgb,
        chroma: badge.chroma,
        hue: badge.hue,
      },
      android_send_button_clearance: JSON.parse(a[4]),
      negative_control: JSON.parse(a[15]),
    };
    fs.writeFileSync(a[2], JSON.stringify(artifact, null, 2) + "\n");
  ' "$flow_id" "$path" "$EV/badge-oklch.json" "$CLEARANCE_JSON" \
    "$INSTALL_MODE" "$IOS_NAME" "$IOS_UDID" "$APP_ID" \
    "$IOS_LIGHT_SHOT" "$IOS_DARK_SHOT" \
    "$ANDROID_MODEL" "$ANDROID_SERIAL" \
    "$ANDROID_LIGHT_SHOT" "$ANDROID_DARK_SHOT" \
    "$negctl"
  log "artifact written: $path"
}

# ---------------------------------------------------------------- mutate-theme ----
stage_mutate_theme() {
  log "== --mutate-theme $MUTATE_THEME: delete the palette slice, measure, restore =="
  cp "$APP_DIR/global.css" "$APP_DIR/global.css.f8bak"
  THEME_BAK="$APP_DIR/global.css.f8bak"
  grep -q -- "--color-$MUTATE_THEME" "$APP_DIR/global.css" ||
    die "global.css does not declare --color-$MUTATE_THEME"
  awk -v tok="--color-$MUTATE_THEME" 'index($0, tok) == 0 { print }' \
    "$APP_DIR/global.css" >"$APP_DIR/global.css.mutated"
  if grep -q -- "--color-$MUTATE_THEME" "$APP_DIR/global.css.mutated"; then
    die "failed to remove --color-$MUTATE_THEME from global.css"
  fi
  mv -f "$APP_DIR/global.css.mutated" "$APP_DIR/global.css"
  log "global.css mutated (--color-$MUTATE_THEME removed; restoration is trapped on EXIT)"
  # Metro must compile the MUTATED theme, so the server starts after the mutation
  stage_metro
  stage_build_ios
  stage_warm_ios
  # NO Maestro here — the negative variant must not print "Flow Passed"; a plain
  # simctl capture of the same cold boot is the measurement input
  xcrun simctl terminate "$IOS_UDID" "$APP_ID" >/dev/null 2>&1
  if ! xcrun simctl launch "$IOS_UDID" "$APP_ID" "$DEV_URL" >/dev/null; then
    die "simctl launch of $APP_ID failed — is the app installed on $IOS_UDID?"
  fi
  wait_bundled "iOS Bundled" 600
  sleep 5
  xcrun simctl io "$IOS_UDID" screenshot "$EV/mutated-theme-capture.png" >/dev/null 2>&1
  local out
  if out="$(node "$LANE/oklch-badge.mjs" "$EV/mutated-theme-capture.png" 2>&1)"; then
    local chroma
    chroma="$(printf '%s' "$out" | node -e 'let d="";process.stdin.on("data",(c)=>d+=c).on("end",()=>console.log(JSON.parse(d).chroma))')"
    die "mutate-theme variant did NOT trip the measurement: glyph chroma $chroma is still above 0.05 with --color-$MUTATE_THEME deleted — the variant is broken"
  fi
  printf '%s\n' "$out"
  printf 'FAIL: measured badge glyph chroma 0.0000 is below 0.05 with --color-%s deleted from the consumer @theme\n' "$MUTATE_THEME"
  exit 1
}

# ---------------------------------------------------------------- smoke -----------
stage_smoke() {
  log "== smoke: one locked flow on $SMOKE_PLATFORM =="
  if ! curl -fs "http://localhost:$METRO_PORT/status" 2>/dev/null | awk 'index($0, "packager-status:running") { found=1 } END { exit found ? 0 : 1 }'; then
    die "Metro is not running on $METRO_PORT — start it (npx expo start --port $METRO_PORT in apps/example) or run the core script first"
  fi
  if [ "$SMOKE_PLATFORM" = ios ]; then
    find_maestro
    check_maestro_pin
    pick_ios_device
    mkdir -p "$(dirname "$IOS_LIGHT_SHOT")" "$EV"
    app_installed_ios || die "app not installed on the simulator — run the core script or npx expo run:ios first"
    stage_warm_ios
    run_flow ios "$IOS_UDID" "$IOS_LIGHT_SHOT" "$EV/smoke-ios.log"
  else
    find_maestro
    check_maestro_pin
    pick_android_device
    mkdir -p "$(dirname "$ANDROID_LIGHT_SHOT")" "$EV"
    app_installed_android || die "app not installed on the emulator — run the core script or npx expo run:android first"
    stage_warm_android
    run_flow android "$ANDROID_SERIAL" "$ANDROID_LIGHT_SHOT" "$EV/smoke-android.log"
  fi
  log "smoke capture written"
}

# ---------------------------------------------------------------- main ------------
MODE=""
MUTATE_THEME=""
SMOKE_PLATFORM=""

ARGS=("$@")
i=0
while [ "$i" -lt "${#ARGS[@]}" ]; do
  case "${ARGS[$i]}" in
    UC-REG-01/core-happy-path) MODE="core" ;;
    journeys/mvp-install-arc) MODE="arc" ;;
    --mutate-theme)
      i=$((i + 1))
      [ "$i" -lt "${#ARGS[@]}" ] || die "--mutate-theme requires an argument (green-600)"
      MUTATE_THEME="${ARGS[$i]}"
      ;;
    --smoke)
      i=$((i + 1))
      [ "$i" -lt "${#ARGS[@]}" ] || die "--smoke requires an argument (ios|android)"
      SMOKE_PLATFORM="${ARGS[$i]}"
      ;;
    *)
      die "unknown argument: ${ARGS[$i]} (expected UC-REG-01/core-happy-path | journeys/mvp-install-arc | --mutate-theme green-600 | --smoke ios|android)"
      ;;
  esac
  i=$((i + 1))
done

if [ -n "$SMOKE_PLATFORM" ]; then
  case "$SMOKE_PLATFORM" in ios | android) ;; *) die "--smoke takes ios or android" ;; esac
  stage_smoke
  exit 0
fi

if [ -z "$MODE" ]; then
  die "usage: install-core.test.sh UC-REG-01/core-happy-path | journeys/mvp-install-arc [--mutate-theme green-600] | --smoke ios|android"
fi

stage_preflight

if [ -n "$MUTATE_THEME" ]; then
  [ "$MUTATE_THEME" = "green-600" ] || die "only --mutate-theme green-600 is defined"
  stage_install
  stage_mutate_theme # exits 1 by design when the missing slice is detected
fi

if [ "$MODE" = "core" ]; then
  ARTIFACT="$GOLDEN_INSTALL/core-happy-path.json"
  FLOW_ID="UC-REG-01/core-happy-path"
else
  ARTIFACT="$GOLDEN_INSTALL/mvp-install-arc.json"
  FLOW_ID="journeys/mvp-install-arc"
fi

stage_install
stage_metro
stage_build_ios
stage_warm_ios
stage_build_android
stage_warm_android
stage_flows
stage_android_clearance
stage_badge_measure

if [ "$MODE" = "core" ]; then
  stage_negative_control
  NEGCTL_JSON='{"ran": true, "inverted": true, "expected": "maestro exit 1 with Assertion is false: id: transcript-message-0 is visible", "observed": "exit 1 with the named assertion on iOS and Android", "verdict": "negative control behaved as required"}'
else
  NEGCTL_JSON='{"ran": false, "reason": "journeys/mvp-install-arc excludes gate step 9 — the negative control is an engine self-check, not a leg of the developer journey"}'
fi

write_artifact "$ARTIFACT" "$FLOW_ID" "$NEGCTL_JSON"

log "install-core.test.sh: $FLOW_ID PASSED (artifact: $ARTIFACT)"
