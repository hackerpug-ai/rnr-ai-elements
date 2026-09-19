# FIX-ORI-DEP-001-1 RED evidence (pre-change, live capture)

Captured before any source edit, from the live canonical host.

- prompt-input.json sha256: f1bae49c2f3125d21aa0711e563f8be60f3388fdf09c24811c03a413ee8f4d73
- input-group.json sha256: 1dfba913fa369737865d5428ec6f24db1e63ad0cb46a74af6cf3c3045a243364

Observed (RED):
- prompt-input.json registryDependencies pins input-group to
  https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/input-group.json
- input-group.json files[].content: pre-fix className token
  `focused && 'border-ring ring-2 ring-ring/50'` present = True; focusedStyle present = False
- ring-2 token count (diagnostic only): 1
