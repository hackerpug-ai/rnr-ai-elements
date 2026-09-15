# ORI-RN-003 cycle-1 RED

- `nativewind-bundle-red.txt` — AC-1 RED: the nativewind legs fail at the Metro bundle
  (`react-native-css-interop/jsx-runtime` unresolvable). A source defect, not a harness
  defect; it is the pre-implementation failure the harness must OBSERVE and fail closed.
- AC-4 RED is the negative-control mutation itself: disconnecting the submission callback
  must fail the real new-message assertion before exact restoration passes. Its RED/GREEN
  pair is captured under tests/sprint-05-orient-search/evidence/ORI-RN-003/submission-negative-control/
  (disconnected_marker_visible=false → restored_marker_visible=true).
