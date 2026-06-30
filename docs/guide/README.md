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
8. [Gas in stablecoin](./08-gas-in-token.md) — `{ mode: "token", token }`; pay the fee in USDC via the FeeForwarder.
9. [Atomic batch](./09-atomic-batch.md) — `sendCalls([...])` / `batch()`; N transfers, all-or-nothing, one signature.
10. [Sessions](./10-sessions.md) — `grantSession` / `revokeSession` with on-chain spend-limit + allowlist policies.
11. [Social & email login](./11-social-email-login.md) — `socialSigner` / `emailSigner` behind a server-side proxy.
12. [React Native](./12-react-native.md) — `@buckspay/react-native`: native passkey + secure storage, same hooks.
13. [Feature coverage](./13-feature-coverage.md) — the index: each feature → native Stellar mechanism → surface → example.

> **Features** (gas-in-token, atomic batch, sessions, social/email login, React Native, server
> bindings) are catalogued in [Feature coverage](./13-feature-coverage.md) — start there to map a
> capability to its native Stellar mechanism and its runnable example.

## Run the hero demo

A runnable testnet demo (create passkey → deploy sponsored `C…` account → gasless pay)
lives in `examples/passkey-hero/`:

```
pnpm --filter @buckspay/example-passkey-hero dev
```

## Mainnet (pubnet) — supported via explicit opt-in

Mainnet is **supported**, and **OFF by default**. Both flows (classic `G…` and
contract/passkey `C…`) run gasless on pubnet once you deliberately opt in:

- **Browser:** `allowMainnet: true` in the `BuckspayConfig`.
- **Node:** `BUCKSPAY_ALLOW_MAINNET=1`.

Without the opt-in, constructing a client on `"pubnet"` throws `BuckspayError("INVALID_CONFIG")`
— a default or forgotten config can never move real funds. Mainnet specifics:

- **USDC = 7 decimals**, and **you pass Circle's pubnet USDC SAC** (`C…`) — the SDK is
  asset-agnostic and never hardcodes it.
- The contract model needs a **funded sponsor `G…` as `simSource`** (the same public key the
  facilitator submits with) — use `createRpcSimContext(pubnetRpcUrl, { simSource })` or the
  `mainnetSimContext` preset.
- Use a **dedicated, consistent Soroban RPC** (the shared public load balancer is
  eventually-consistent). See the runnable `docs/examples/08-mainnet.ts`.

Going live is a deliberate, audited step: follow the **[mainnet cutover runbook](../ops/mainnet-cutover.md)**
(pre-flight checklist → GO/NO-GO gate → rollback / kill-switch). The real pubnet path is proven by
a guarded e2e smoke (`BUCKSPAY_E2E_MAINNET=1`, tiny 0.0001 USDC transfers).
