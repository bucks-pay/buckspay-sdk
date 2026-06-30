---
"@buckspay/core": patch
"@buckspay/accounts": patch
"@buckspay/relayer": patch
---

**Policy session accounts.** `@buckspay/accounts` adds the `@buckspay/accounts/policy-account` adapter:
an ed25519-root contract account whose on-chain `__check_auth` enforces session-key spend-limit,
allow-list and expiry policies. It derives a deterministic, counterfactual C-address (offline, from the
sponsor + root key), assembles auth entries as an ed25519 `SigData`, and pairs with `grantSession` /
`revokeSession` and the policy compiler. `@buckspay/core` adds the optional `Relayer.deploySessionAccount`
hook and the adapter's `ensureReady` deploys the account (sponsored) on first connect; `@buckspay/relayer`
implements it against the facilitator. A granted session key then transacts within its policies — and an
over-limit, off-allow-list, expired or revoked attempt is rejected with `SESSION_POLICY_VIOLATION`.
