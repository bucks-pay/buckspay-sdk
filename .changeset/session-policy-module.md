---
"@buckspay/accounts": patch
---

**Session policies.** `@buckspay/accounts/policy` now ships the session-policy surface: the `spendLimit`
and `allowlist` factories, `compilePolicies` (the on-chain policy struct), and `buildInstallArgs` /
`buildRevokeArgs` for installing and revoking a policy-scoped session signer on a contract account. A
session must carry both a spend limit and a non-empty allowlist — an unbounded delegation is refused —
and the rules are enforced on-chain in the account's `__check_auth`. The install payload is pinned
byte-for-byte against a real on-chain-accepted transaction.
