# ORI-RN-003 cycle-3 RED

No NEW pre-fix failure is captureable this cycle: FIX-ORI-RN-003-2 (60872e39 / 91bffa8c) and
FIX-ORI-DEP-001-1 (6fd19559 / 9de4a41a / cafa6056) have landed and the live registry
(`https://rnraielements.com/r/nativewind/input-group.json`) now serves the FIXED input-group
(verified: className token `'border-ring ring-2 ring-ring/50'` ABSENT; `focusedStyle` + `borderWidth: 2`
PRESENT). A fresh consumer installing via the literal recipe receives the fix, so the prior runtime
crash cannot be reproduced pre-fix from the deployed registry.

The RED this cycle closes is therefore the OBSERVED pre-fix failure recorded in cycle-2
(`.tmp/ORI-RN-003/cycle-2/green/final-run-summary.txt`): nativewind ios/android FAIL at RUNTIME with
`Couldn't find a navigation context` thrown at input-group.tsx (`<View>`) on composer focus, send button
vanishes. The trigger (`ring-2` on the conditional className) was isolated by FIX-ORI-RN-003-2's probe
bisection (branch FIX-ORI-RN-003-2-impl, commit 2ce0997, probes probe-{a,b,c,d,e}).

Cycle-3 GREEN must show all six legs pass against the deployed registry.
