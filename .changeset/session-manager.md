---
"@buckspay/core": patch
"@buckspay/accounts": patch
"@buckspay/relayer": patch
---

**Session manager.** `@buckspay/core` adds `BuckspayClient.grantSession` / `revokeSession` (contract
account model only — `INVALID_CONFIG` on the classic model) plus `sessionId` / `serializeSession` /
`deserializeSession` (clock-injected; a past session throws `SESSION_EXPIRED`) and `createSessionManager`.
The root signer authorizes the session install once; thereafter the scoped session key transacts within
its spend-limit + allowlist policies without per-action prompts, and a revoke takes effect immediately
on-chain. The contract account builds the `add_signer` / `remove_signer` entries, and the relayer
surfaces host policy rejections as `SESSION_POLICY_VIOLATION` / `SESSION_EXPIRED`.
