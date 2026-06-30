---
title: "Type Alias: SessionPolicy"
---

# Type Alias: SessionPolicy

> **SessionPolicy** = \{ `kind`: `"spendLimit"`; `max`: `string`; `period`: `"day"` \| `"week"` \| `"month"` \| `"total"`; `token`: `string`; \} \| \{ `contracts`: `string`[]; `kind`: `"allowlist"`; \}

Defined in: packages/core/dist/index.d.ts:221

Session policy compiled to an on-chain policy signer in `__check_auth`.
