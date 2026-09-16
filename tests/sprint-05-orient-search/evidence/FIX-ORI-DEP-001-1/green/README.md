# FIX-ORI-DEP-001-1 GREEN evidence (post-deploy, live capture)

Captured after the deterministic prepare chain + assets-only `wrangler deploy` of the
already-configured Worker `rnr-ai-elements-docs` (account d5110b1895ee190e145c0c8756f49879),
version bb65ae86-7586-45da-8bdb-27d734ded8b9, deployment 19b366d7-a31b-4f1f-9e39-446d3789a694.

Observed (GREEN):
- prompt-input.json registryDependencies resolves input-group to
  https://rnraielements.com/r/nativewind/input-group.json (no raw.githubusercontent.com, no v0.2.1)
- input-group.json files[].content: pre-fix className token
  `focused && 'border-ring ring-2 ring-ring/50'` present = False; focusedStyle present = True;
  borderWidth: 2 present = True
- ring-2 token count (diagnostic only): 1 (inside a // comment)
