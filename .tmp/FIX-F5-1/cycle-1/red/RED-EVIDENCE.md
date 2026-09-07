# FIX-F5-1 RED evidence (pre-fix, cycle 1)

- `core-red.log`: locked flow `.maestro/cold-boot.yaml` (copy in this dir) FAILED, maestro exit 1,
  literal `Assertion is false: id: transcript-message-0 is visible` — the seed canary does not resolve.
- `red-fail-screenshot.png` (Maestro failure shot) + `red-state-sim.png` (simctl): app-header + composer
  crowd the top, transcript region collapsed — matches TASK-F8's measured defect.
- `maestro hierarchy` was attempted twice for a raw dump but streams unbounded on this driver session
  (328MB+ in 75s, no terminating frame); dumps deleted. The flow's own assertVisible is the id-resolution
  probe. `index.tsx.pre-fix` is the exact unfixed source served by this worktree's Metro.
