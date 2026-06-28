# buckspay SDK — Usage Guide

> **The Alchemy of Stellar** — smart wallets and gasless transactions, across web (and,
> on the roadmap, mobile and games). buckspay wraps Stellar's native account-abstraction
> primitives (fee-bump, Soroban `__check_auth`, secp256r1 passkeys, sponsored reserves)
> in a unified, **provider-agnostic** API that is **gasless by default**.

Every code snippet in this guide is compiled in CI against the real `@buckspay/*` types
(`docs/examples/`), so the docs cannot drift from the API.

## Contents

1. [Quickstart](./01-quickstart.md) — a classic gasless USDC transfer in a handful of lines.
2. [Account models](./02-account-models.md) — classic wallet (`G…`) vs passkey smart account (`C…`).
3. [Gasless modes](./03-gasless-modes.md) — `{ mode: "sponsored" }`, and what's roadmap.
4. [Onboarding](./04-onboarding.md) — sponsored account/trustline and sponsored contract deploy.
5. [React hooks](./05-react.md) — `BuckspayProvider`, `useWallet`, `useStellarPay`.
6. [API reference](./06-api-reference.md) — typedoc-generated, from the contract.
7. [Migrating from direct facilitator calls](./07-migrating-from-facilitator.md) — before/after + the BFF boundary.

## Run the hero demo

A runnable testnet demo (create passkey → deploy sponsored `C…` account → gasless pay)
lives in `examples/passkey-hero/`:

```
pnpm --filter @buckspay/example-passkey-hero dev
```
