# @buckspay/core

## 0.1.3

### Patch Changes

- Sprint 5 (hero hardening), all backward-compatible:

  - **`@buckspay/accounts`** — browser-safe **isomorphic SHA-256** for the C-address salt
    (was `node:crypto`, which broke the browser build of `oz-contract`); same hash, so the
    derivation stays byte-identical. Plus an OZ Smart Account **Wasm-hash pin guard**
    (`assertPinnedWasmHash`) — `ozContractAccount` refuses any Wasm hash but the pinned one.
  - **`@buckspay/core`** — `boundExpirationLedger` caps `signatureExpirationLedger` to
    `MAX_EXPIRATION_LEDGERS` (no widened replay window), and a **mainnet gate**: `pubnet` is
    refused unless `BUCKSPAY_ALLOW_MAINNET=1`.
  - **`@buckspay/react`** — `BuckspayProvider` accepts an optional `sim` prop, enabling
    `useStellarPay().pay()` (the recording simulator for `prepare()`).

  Pre-1.0 fix + backward-compatible feature → `patch` per VERSIONING.md (0.1.2 → 0.1.3, lockstep).

## 0.1.2

## 0.1.1

### Patch Changes

- Add a concrete `SorobanSimulator` + `createRpcSimContext(rpcUrl)` (RPC-backed recording simulation via raw `simulateTransaction`). This makes the flagship `BuckspayClient.prepare → sign → send` flow usable in production: pass the sim context as the second argument to `createBuckspayClient` / `createBuckspayConfig`. Backward-compatible (additive); the sim context stays optional.

## 0.1.0

### Minor Changes

- Initial public release of the Buckspay SDK — the classic Stellar (Soroban) gasless USDC path: the core `prepare → sign → send` client + gas-abstraction engine, the Stellar Wallets Kit signer, the classic `G…` account adapter with sponsored onboarding, the facilitator relayer, and the React 19 binding (`BuckspayProvider` / `useWallet` / `useStellarPay`).
