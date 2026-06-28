# Gasless modes

The `GasConfig` is `{ mode: "sponsored" }` in v1. The `GasAbstractionEngine` turns a
`SignedIntent` into the exact `RelayPayload` the facilitator expects.

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

## Roadmap (not in v1)

> `token` (pay gas in USDC via the FeeForwarder) and `self` (payer pays their own fee)
> modes are **SP-2**, not available in v1. The `GasConfig` type only admits
> `{ mode: "sponsored" }`, so an unimplemented mode fails to type-check — you can't
> accidentally configure something unsupported.

Prev: [Account models](./02-account-models.md) · Next: [Onboarding](./04-onboarding.md)
