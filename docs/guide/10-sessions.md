# Sessions

A **session** is a scoped, expiring key the app mints so the user can pay within fixed limits
**without a root prompt per action**. The session key is never the account's root key — it carries
on-chain policies (a spend limit, an allowlist) and is revocable at any time.

> Sessions are a **contract (`C…`) account** feature. On the classic model `grantSession` throws
> `BuckspayError("INVALID_CONFIG")` — a classic `G…` key has no on-chain policy surface to scope.

```ts
import { serializeSession } from "@buckspay/core";
import { spendLimit, allowlist } from "@buckspay/accounts/policy";

const { session, receipt } = await client.grantSession({
  sessionKey: { type: "ed25519", publicKey: sessionKp.publicKey() },
  policies: [
    spendLimit({ token: USDC_SAC, max: "100", period: "day" }),
    allowlist([APP_CONTRACT])
  ],
  expiresAt: Date.now() + 86_400_000 // 24h
});

const blob = serializeSession(session); // persist to secure storage; deserializeSession to rehydrate
// …the session key now pays within its policies…
await client.revokeSession(session);    // root-signed; the key authorizes nothing afterward
```

## The native mechanism

The policies compile to **policy signers evaluated on-chain in `__check_auth`**. `spendLimit`
caps cumulative spend of a token over a rolling `period` (`day` / `week` / `month` / `total`);
`allowlist` restricts which contracts the session may call. The contract — not the SDK — enforces
them, so a stolen session blob still cannot exceed its limits or call outside its allowlist.

## Failure codes

- `SESSION_EXPIRED` — the session is past `expiresAt` (the SDK rejects it; the contract would too).
- `SESSION_POLICY_VIOLATION` — a payment breaches a policy (over the spend limit, or a contract
  outside the allowlist). The facilitator maps the on-chain rejection to this code.

## Install & revoke ride the gated relay

`grantSession` / `revokeSession` are ordinary root-signed payments over the **same** gated `/relay`
path — they inherit its nonce + expiration replay protection. There is no separate, weaker channel
for session management.

Compiled example: `docs/examples/11-sessions.ts`.

Prev: [Atomic batch](./09-atomic-batch.md) · Next: [Social & email login](./11-social-email-login.md)
