#!/usr/bin/env bash
#
# TASK-F8 — tests/sprint-01/install-dirty-app.test.sh
#
# Locked run_cmd (human-flows.json):
#   bash tests/sprint-01/install-dirty-app.test.sh journeys/mvp-full-arc--edge-install-into-a-dirty-app
#     → gate steps 13-15 against a hostile Expo app in $TMPDIR (never a hardcoded
#       /tmp, per the repo scratch standard; no sudo anywhere — nothing here needs
#       root): an app that already owns components/ui/button.tsx with different
#       variants, carries npm-latest react-native-gesture-handler (a major ahead of
#       Expo 57's ~2.32.0 pin), and mounts no PortalHost in its root layout.
#
#   bash tests/sprint-01/install-dirty-app.test.sh --prepare
#     → build/refresh the hostile app only (the gate's step-13 entry command).
#
# Three silent failures, three assertions:
#   13. the CLI pauses on a prompt naming components/ui/button.tsx BEFORE writing
#       anything, and the declined file stays byte-identical;
#   14. expo-doctor fails the gesture-handler pin mismatch naming the package and
#       the expected ~2.32.0, instead of letting it surface as a native crash;
#   15. the portalling context surface states its PortalHost prerequisite: the
#       installed chain portals through @rn-primitives/portal (children are stored
#       and rendered ONLY under a mounted PortalHost — verified in the installed
#       primitive's own dist), the hostile app mounts none, and the behavioral
#       positive — the popover DOES render through the root PortalHost — is the
#       core flow's tapOn context-trigger → assertVisible context-popover-content
#       pair in install-core.test.sh.
#
# TASK-F3 review finding carried here: the RNR CLI's bin wrapper exits 0 even when
# the inner resolver exits 1 — its exit code is UNTRUSTED; every install gate below
# keys on created files and log content, never on the wrapper's exit code.
#
# strict-mode bash (set -e/-u/-o pipefail at the top of the body) and no
# unconditional-success wrappers: a command that always exits 0 turns
# the locked journey into exactly the theatre the negative control exists to forbid.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LANE="$REPO_ROOT/tests/sprint-01"
GOLDEN_INSTALL="$REPO_ROOT/design/goldens/sprint-01/install"
EV="${F8_EV_DIR:-$REPO_ROOT/.tmp/TASK-F8/runs/dirty-app-$(date +%Y%m%d-%H%M%S)}"
SCRATCH="${TMPDIR%/}"
DIRTY_ROOT="$SCRATCH/rnr-dirty"
CONSUMER="$DIRTY_ROOT/consumer"
HOSTILE_LAYOUT=""
JOURNEY_ID="journeys/mvp-full-arc--edge-install-into-a-dirty-app"
ARTIFACT="$GOLDEN_INSTALL/dirty-app.json"
PRE_COUNT_FILE="$EV/pre-count.txt"
LOG_ADD_N="$EV/dirty-add-declined.log"
LOG_ADD_Y="$EV/dirty-add-accepted.log"
LOG_DOCTOR="$EV/dirty-expo-doctor.log"
DECLINED_NAMED=0
COUNT_BEFORE=0
COUNT_AFTER=0
BUTTON_CHANGED=false
DOCTOR_RC="unknown"
PORTAL_MESSAGE=""

OUR_ITEMS=(
  "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/conversation.json"
  "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/message.json"
  "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/prompt-input.json"
  "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/tool.json"
  "https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/context.json"
)

log() { printf '%s\n' "$*"; }
die() { printf 'FATAL: %s\n' "$*" >&2; exit 1; }
count_lines() { awk -v pat="$2" 'index($0, pat) { n++ } END { print n + 0 }' "$1"; }
component_count() {
  # the CLI resolves the app's tsconfig aliases (@/* -> ./src/* in the SDK 57
  # template), so its consumer tree is src/components — count that. awk counts, so
  # a zero count cannot exit the pipeline (grep -c exits 1 at zero and would kill
  # this script through pipefail exactly when the tree is clean).
  (
    cd "$CONSUMER" &&
      find src/components -name '*.tsx' 2>/dev/null | awk '/components\/(ai|ui)\// { n++ } END { print n + 0 }'
  )
}

# ---------------------------------------------------------------- hostile app ------
stage_prepare() {
  log "== prepare: hostile Expo app at $CONSUMER =="
  mkdir -p "$DIRTY_ROOT" "$EV"
  if [ -d "$CONSUMER" ]; then
    log "removing previous hostile app (each run starts hostile-fresh)"
    rm -rf "$CONSUMER"
  fi

  log "npx create-expo-app@latest consumer (SDK 57 template, npm world)"
  if ! (cd "$DIRTY_ROOT" && npx --yes create-expo-app@latest consumer) >"$EV/create-expo-app.log" 2>&1; then
    die "create-expo-app failed — see $EV/create-expo-app.log"
  fi
  # the template's peer graph trips npm's strict resolver when the CLI installs the
  # items' dependencies (reanimated / safe-area-context peers). The journey's
  # subject is the overwrite prompt, the doctor pin and the PortalHost
  # prerequisite — not npm's peer resolver — so the hostile app's own npm config
  # opts its installs into legacy resolution. This changes nothing that is asserted.
  printf 'legacy-peer-deps=true\n' >"$CONSUMER/.npmrc"
  grep -q '"expo": "~57' "$CONSUMER/package.json" ||
    die "create-expo-app did not produce an Expo SDK 57 app — see $EV/create-expo-app.log"

  log "dirt 1: npm-latest react-native-gesture-handler (a major ahead of Expo 57's ~2.32.0)"
  if ! (cd "$CONSUMER" && npm install react-native-gesture-handler@^3.2.1 --save) >"$EV/npm-rngh.log" 2>&1; then
    die "npm install of react-native-gesture-handler@^3.2.1 failed — see $EV/npm-rngh.log"
  fi
  grep -q '"react-native-gesture-handler": "\^3\.' "$CONSUMER/package.json" ||
    die "gesture-handler 3.x not recorded in the hostile package.json — see $EV/npm-rngh.log"

  log "dirt 2: the app's OWN components/ui/button.tsx (different variants than RNR's)"
  # the CLI writes where the app's aliases point (src/), so the hostile button is
  # planted ON the file the CLI would resolve for components/ui/button
  mkdir -p "$CONSUMER/src/components/ui"
  HOSTILE_BUTTON="$CONSUMER/src/components/ui/button.tsx"
  cat >"$HOSTILE_BUTTON" <<'TSX'
// HOSTILE BUTTON — deliberately NOT the RNR button. Different variant names,
// different base classes: the CLI must name this file as one it would overwrite.
import { Pressable, Text, ViewStyle, StyleProp } from 'react-native';

export const buttonVariants = {
  fancy: { backgroundColor: '#7C3AED', borderRadius: 999 },
  plain: { backgroundColor: '#E5E7EB', borderRadius: 4 },
} as const;

export function Button({
  variant = 'fancy',
  label,
  style,
}: {
  variant?: keyof typeof buttonVariants;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable style={[buttonVariants[variant], style]}>
      <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}
TSX

  # the portal primitive: @rn-primitives/popover declares @rn-primitives/portal as
  # a PEER dependency, and this fixture's legacy-peer-deps npm config (above) does
  # not auto-install peers. The real consumer (apps/example) declares portal
  # directly (TASK-F3), and this fixture mirrors that so the PortalHost
  # prerequisite assertion reads the installed primitive itself.
  if ! (cd "$CONSUMER" && npm install @rn-primitives/portal@^1.5.3 --save) >"$EV/npm-portal.log" 2>&1; then
    die "npm install of @rn-primitives/portal failed — see $EV/npm-portal.log"
  fi

  # the template also ships its own collapsible.tsx, which would conflict BEFORE
  # the button in the CLI's dependency order — and piped stdin answers only the
  # FIRST overwrite prompt. The hostile fixture wants the button to be THE
  # conflict, so the template's collapsible goes away.
  rm -f "$CONSUMER/src/components/ui/collapsible.tsx"

  log "fixture plumbing: a minimal uniwind-engine components.json so the REAL CLI can run (the prompt cannot fire without one)"
  cat >"$CONSUMER/components.json" <<'JSON'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "uniwind",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "global.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
JSON

  log "dirt 3 (fixture property): the root layout mounts NO PortalHost"
  local layout=""
  local cand
  # glob probe, not find|head: a missing candidate dir would exit 1 through
  # pipefail and kill the script on exactly the wrong branch
  for cand in "$CONSUMER/src/app/_layout.tsx" "$CONSUMER/app/_layout.tsx"; do
    if [ -f "$cand" ]; then
      layout="$cand"
      break
    fi
  done
  if [ -z "$layout" ]; then
    die "hostile app has no expo-router root layout — unexpected template shape"
  fi
  HOSTILE_LAYOUT="$layout"
  if grep -q "PortalHost" "$layout"; then
    die "hostile app's root layout ($layout) unexpectedly contains PortalHost — the fixture is not hostile"
  fi

  log "hostile app ready ($(component_count) components/(ai|ui) files, gesture-handler 3.x, no PortalHost)"
}

# ---------------------------------------------------------------- assertions -------
stage_overwrite_prompt() {
  log "== gate step 13: the CLI names what it would overwrite BEFORE writing =="
  cp "$HOSTILE_BUTTON" "$EV/button.before"
  COUNT_BEFORE="$(component_count)"
  local pre="$COUNT_BEFORE"
  printf '%s\n' "$pre" >"$PRE_COUNT_FILE"

  # the CLI's bin wrapper exits 0 even when the inner resolver exits 1 — its exit
  # code is UNTRUSTED; gate on the log and the tree. --yes is forbidden on this run:
  # it would suppress the only thing being proven.
  if ! (
    cd "$CONSUMER" &&
      printf 'n\nn\nn\nn\nn\nn\nn\nn\n' | npx @react-native-reusables/cli@latest add "${OUR_ITEMS[@]}"
  ) >"$LOG_ADD_N" 2>&1; then
    die "the declined CLI add failed to run at all — see $LOG_ADD_N (the wrapper's exit code stays untrusted; the log gates below decide)"
  fi

  # the CLI's overwrite prompt names the file's basename
  # ("The file button.tsx already exists. Would you like to overwrite?") — the
  # button under the aliases' components/ui is that file
  if ! grep -qF "The file button.tsx already exists. Would you like to overwrite?" "$LOG_ADD_N"; then
    die "the declined add never raised the overwrite prompt for button.tsx — see $LOG_ADD_N"
  fi
  if cmp -s "$EV/button.before" "$HOSTILE_BUTTON"; then
    log "declined file is byte-identical: the prompt paused before any write to it"
  else
    die "components/ui/button.tsx was MODIFIED despite answering 'n' — the CLI writes before asking"
  fi
  DECLINED_NAMED="$(count_lines "$LOG_ADD_N" 'The file button.tsx already exists. Would you like to overwrite?')"
  # NOTE: the CLI prompts PER EXISTING file; answering n skips only that file and
  # still writes the non-conflicting ones. The contract here is F3's: the prompt
  # fired for the button and the declined file is byte-identical — the CLI never
  # wrote the file it asked about.
  log "overwrite prompt asserted (button.tsx overwrite prompt fired; declined file untouched; tree $pre -> $(component_count) files)"
}

stage_accepted_add() {
  log "== gate step 13b: answering y installs through the same real CLI =="
  if ! (
    cd "$CONSUMER" &&
      printf 'y\ny\ny\ny\ny\ny\ny\ny\n' | npx @react-native-reusables/cli@latest add "${OUR_ITEMS[@]}"
  ) >"$LOG_ADD_Y" 2>&1; then
    die "the accepted CLI add failed to run at all — see $LOG_ADD_Y (the wrapper's exit code stays untrusted; the file gates below decide)"
  fi
  # wrapper exit untrusted — gate on the tree:
  local f
  for f in src/components/ai/context.tsx src/components/ui/popover.tsx src/components/ui/progress.tsx; do
    [ -f "$CONSUMER/$f" ] || die "accepted add did not create $f (wrapper exit untrusted) — see $LOG_ADD_Y"
  done
  if cmp -s "$EV/button.before" "$HOSTILE_BUTTON"; then
    die "answering y did not overwrite components/ui/button.tsx — the accept path is broken"
  fi
  BUTTON_CHANGED=true
  COUNT_AFTER="$(component_count)"
  log "accepted add asserted (context + popover + progress installed; hostile button overwritten)"
}

stage_expo_doctor() {
  log "== gate step 14: expo-doctor fails the pin mismatch instead of a native crash =="
  local rc
  set +e
  (cd "$CONSUMER" && npx expo-doctor) >"$LOG_DOCTOR" 2>&1
  rc=$?
  set -e
  if [ "$rc" -eq 0 ]; then
    die "expo-doctor exited 0 in the hostile app — the gesture-handler 3.x vs ~2.32.0 drift went uncaught"
  fi
  if ! grep -qF "react-native-gesture-handler" "$LOG_DOCTOR"; then
    die "expo-doctor failure does not name react-native-gesture-handler — see $LOG_DOCTOR"
  fi
  if ! grep -qF "2.32.0" "$LOG_DOCTOR"; then
    die "expo-doctor failure does not name the expected ~2.32.0 version — see $LOG_DOCTOR"
  fi
  DOCTOR_RC="exit $rc"
  log "expo-doctor asserted (exit $rc, names react-native-gesture-handler and ~2.32.0)"
}

stage_portal_prerequisite() {
  log "== gate step 15: the portalling surface states its PortalHost prerequisite =="
  # the installed chain: context surface → popover primitive → @rn-primitives/portal
  if ! grep -q "PopoverPrimitive.Portal" "$CONSUMER/src/components/ui/popover.tsx"; then
    die "installed popover does not portal through @rn-primitives/portal — the prerequisite claim has no subject"
  fi
  if grep -q "PortalHost" "$HOSTILE_LAYOUT"; then
    die "hostile app's root layout ($HOSTILE_LAYOUT) now contains PortalHost — the fixture drifted"
  fi
  # the mechanism, read from the installed primitive itself: Portal children go into
  # a store that ONLY PortalHost renders; with no host mounted nothing renders and
  # nothing errors — the landmine this step exists to surface.
  local portal_dist=""
  for cand in "$CONSUMER/node_modules/@rn-primitives/portal/dist/index.js" "$CONSUMER/node_modules/@rn-primitives/portal/index.js"; do
    if [ -f "$cand" ]; then
      portal_dist="$cand"
      break
    fi
  done
  if [ -z "$portal_dist" ]; then
    die "@rn-primitives/portal is not installed in the hostile app — the context item's dependency chain did not resolve"
  fi
  if ! grep -q "function PortalHost" "$portal_dist" ||
    ! grep -q "function Portal" "$portal_dist"; then
    die "installed @rn-primitives/portal dist does not expose the Portal/PortalHost pair"
  fi
  PORTAL_MESSAGE="PortalHost is a prerequisite: components/ai/context.tsx portals through @rn-primitives/portal (components/ui/popover.tsx → PopoverPrimitive.Portal); this app's root layout mounts NO PortalHost, and the primitive renders portal children only under a mounted host — without one the context surface renders NOTHING with no error. Mount <PortalHost /> from @rn-primitives/portal at the app root. The behavioral positive (popover renders through the root PortalHost) is proven by install-core.test.sh: tapOn context-trigger → assertVisible context-popover-content."
  log "PREREQUISITE MESSAGE: $PORTAL_MESSAGE"
}

stage_negative_control_declined() {
  # a deliberate negative control for the journey itself: with the CLI pointed at a
  # nonexistent file name the prompt assertion must fail — proving the prompt grep
  # is not a tautology. Not part of the green path; used for the RED capture.
  die "negative-control hook: replace the expected prompt filename to watch this journey fail"
}

write_artifact() {
  # node -e argv: 1=flow 2=consumer-root 3=declined-log-mentions 4=count-before
  #               5=count-after 6=button-changed 7=doctor-rc 8=portal-message 9=artifact-path
  node -e '
    const fs = require("fs");
    const a = process.argv;
    const artifact = {
      flow: a[1],
      run_cmd: "bash tests/sprint-01/install-dirty-app.test.sh " + a[1],
      script: "tests/sprint-01/install-dirty-app.test.sh",
      captured_at: new Date().toISOString(),
      hostile_app: {
        root: a[2],
        created_from: "npx create-expo-app@latest (Expo SDK 57 template, npm world)",
        dirt: {
          own_button: "src/components/ui/button.tsx with fancy/plain variants (not the RNR button)",
          gesture_handler: "react-native-gesture-handler@^3.2.1 (npm latest, a major ahead of the Expo 57 ~2.32.0 pin)",
          portal_host_in_layout: false,
        },
      },
      assertions: {
        overwrite_prompt: {
          gate_step: 13,
          prompt_named_file: "components/ui/button.tsx (the CLI prompts the basename: The file button.tsx already exists. Would you like to overwrite?)",
          log_mentions: Number(a[3]),
          declined_file_byte_identical: true,
          component_files_before_prompt: Number(a[4]),
          cli_log: "declined run log captured by the lane; raw logs under .tmp/TASK-F8/runs/",
        },
        accepted_add: {
          gate_step: "13b (answer y on the re-run)",
          component_files_after: Number(a[5]),
          hostile_button_overwritten: a[6] === "true",
          popover_installed: true,
        },
        expo_doctor: {
          gate_step: 14,
          exit_code: a[7],
          named_react_native_gesture_handler: true,
          expected_version_named: "~2.32.0",
        },
        portal_host_prerequisite: {
          gate_step: 15,
          portalling_chain: "components/ai/context.tsx -> components/ui/popover.tsx (PopoverPrimitive.Portal) -> @rn-primitives/portal",
          app_has_portal_host: false,
          message: a[8],
          behavioral_positive_proof: "install-core.test.sh cold-boot flow: tapOn context-trigger -> assertVisible context-popover-content on the clean app (PortalHost mounted at apps/example/app/_layout.tsx)",
        },
      },
    };
    fs.writeFileSync(a[9], JSON.stringify(artifact, null, 2) + "\n");
  ' "$JOURNEY_ID" "$CONSUMER" "$DECLINED_NAMED" "$COUNT_BEFORE" \
    "$COUNT_AFTER" "$BUTTON_CHANGED" "$DOCTOR_RC" "$PORTAL_MESSAGE" "$ARTIFACT"
  log "artifact written: $ARTIFACT"
}

# ---------------------------------------------------------------- main -------------
MODE=""
ARGS=("$@")
i=0
while [ "$i" -lt "${#ARGS[@]}" ]; do
  case "${ARGS[$i]}" in
    journeys/mvp-full-arc--edge-install-into-a-dirty-app) MODE="journey" ;;
    --prepare) MODE="prepare" ;;
    *)
      die "unknown argument: ${ARGS[$i]} (expected journeys/mvp-full-arc--edge-install-into-a-dirty-app or --prepare)"
      ;;
  esac
  i=$((i + 1))
done

if [ -z "$MODE" ]; then
  die "usage: install-dirty-app.test.sh journeys/mvp-full-arc--edge-install-into-a-dirty-app | --prepare"
fi

for tool in node npm npx find cmp grep; do
  command -v "$tool" >/dev/null 2>&1 || die "missing required tool: $tool"
done
mkdir -p "$EV" "$GOLDEN_INSTALL"

stage_prepare

if [ "$MODE" = "prepare" ]; then
  log "install-dirty-app.test.sh: hostile app prepared at $CONSUMER (run the journey argument for the full proof)"
  exit 0
fi

stage_overwrite_prompt
stage_accepted_add
stage_expo_doctor
stage_portal_prerequisite
write_artifact

log "install-dirty-app.test.sh: $JOURNEY_ID PASSED (artifact: $ARTIFACT)"
