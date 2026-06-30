# Gasless modes

The `GasConfig` is `{ mode: "sponsored" }` or `{ mode: "token", token }`. The
`GasAbstractionEngine` turns a `SignedIntent` into the exact `RelayPayload` the facilitator expects.

## What "sponsored" means

The payer signs only the `SorobanAuthorizationEntry` off-chain. The facilitator's sponsor
account sources the settlement transaction and pays the XLM fee. **The payer needs zero
XLM** — not to transact, and (see onboarding) not even to exist on-chain.

```ts
import type { GasConfig } from "@buckspay/core";
const gas: GasConfig = { mode: "sponsored" };
```

Compiled example: `docs/examples/03-gasless-sponsored.ts`.

Onboarding is also sponsored — see [Onboarding](./04-onboarding.md).

## Paying the fee in a stablecoin

> **`token` (pay gas in USDC via the FeeForwarder) is supported** — see
> [Gas in stablecoin](./08-gas-in-token.md). Use it when you want the user, not your sponsor, to
> cover the fee, paid in the asset they already hold.

The `GasConfig` type admits **only** `{ mode: "sponsored" }` and `{ mode: "token", token }`, so any
other mode fails to type-check — you can't accidentally configure something unsupported.

Prev: [Account models](./02-account-models.md) · Next: [Onboarding](./04-onboarding.md)
