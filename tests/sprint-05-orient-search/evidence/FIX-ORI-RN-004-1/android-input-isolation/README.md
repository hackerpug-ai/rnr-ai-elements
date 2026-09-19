# Android text-input isolation evidence (F-1)

Captured on the real `Pixel_7_API_34` emulator (`emulator-5554`), real `apps/example`
app in Expo Go, against the real live-chat route. No mocks, no stubs.

The load-bearing claim: the Android composer is functional, and the Android leg's RED
is a Maestro/emulator text-input artifact, NOT a code bug. These three artifacts
prove it — the IME is not shown, `adb shell input text` types and ENABLES the send
button, while Maestro's IME-based `inputText` silently fails to type.

## 1. `dumpsys-input-method.txt` — the emulator soft keyboard is NOT shown

`adb -s emulator-5554 shell dumpsys input_method` and `dumpsys window` while the
Expo Go app is focused. Key lines (grep-able in the file):

```
mInputShown=false
mIsInputViewShown=false
mCurrentFocus=Window{… host.exp.exponent/…ExperienceActivity}
mIsImeShowing=false
mImeHeight=0
```

The LatinIME is the selected method (`mCurMethodId=…LatinIME`) but the input view is
not shown — so Maestro's IME-based `inputText` (which types through the soft
keyboard) has nothing to type into, while `adb shell input text` (which injects key
events directly to the focused `EditText`) still works.

## 2. `adb-input-text-hierarchy.json` — `adb shell input text` ENABLES the button

Sequence: minimize the LogBox dev overlay → tap `Message` → `adb -s emulator-5554
shell input text "hello%stest"` → `maestro hierarchy`. The dump (grep-able) shows:

```
accessibilityText: "Message"  text: "hello test"  enabled: true  focused: true
accessibilityText: "Send message"  enabled: true
```

The typed text is retained in the `EditText` and the `Send message` button flips to
`enabled: true`. The app is NOT broken on Android.

## 3. `maestro-inputtext-red.txt` + `maestro-inputtext-hierarchy.json` — Maestro `inputText` fails

Sequence: relaunch → minimize the LogBox → run
`investigate/type-check-enabled.maestro.yaml` (tap `Message` → Maestro `inputText
"hello test"` → `assertVisible { text: "Send message", enabled: true }`). The flow
reports `Input text hello test... COMPLETED` but the assertion FAILS, and the
hierarchy dump shows the field reverted to the placeholder and the button disabled:

```
accessibilityText: "Message"  text: "What would you like to know?"  focused: true
accessibilityText: "Send message"  enabled: false
```

Maestro reported the input as COMPLETED but no text was retained — the field reverted
to empty (the controlled `TextInput`'s `onChangeText` never fired because the IME
never delivered keystrokes), so `Send message` stayed `enabled: false`.

## 4. `bisect-reactcompiler-off-manifest.json` + `bisect-reactcompiler-off-metro.log` — the OFF run (F-3)

`experiments.reactCompiler` OFF re-run of `--platforms android`. The metro log's OFF
section (`Starting project at …FIX-ORI-RN-004-1-impl/apps/example` with NO
`React Compiler enabled` line) has ZERO `Can't perform a React state update` errors,
yet the manifest still shows the android light + dark legs FAILED
(`hierarchy_has_marker: false`, `latest_backend_record: null`, `maestro_exit: 1`) —
the button is still disabled. React Compiler is therefore NOT the cause.

The full OFF-run metro log in this dir is the `tests/…/evidence/ORI-RN-004/metro.log`
appended across runs; the OFF run is the final section (the `Starting project at
…FIX-ORI-RN-004-1-impl` block), which contains no `state update` error.
