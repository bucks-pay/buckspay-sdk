# @buckspay/react

## 0.2.2

### Patch Changes

- Updated dependencies [a00a9ed]
  - @buckspay/core@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [ccc52f1]
- Updated dependencies [3a8497c]
  - @buckspay/core@0.2.1

## 0.2.0

### Patch Changes

- 282d74b: Additive type surface (the `sponsored | token` gas union, `FeeQuote` /
  `AuthDetails` / session / `SwapQuote` types, new `BuckspayError` codes, the optional
  `BuckspaySigner.authenticate`, optional fee fields on the intents/relay payload), the pure
  `batch()` builder + `MAX_BATCH_CALLS`, and buildable skeletons for the new `@buckspay/nextjs`
  and `@buckspay/react-native` packages plus the `signers/social`, `signers/email`, and
  `accounts/policy` subpaths. No behavior change to existing paths.
- Updated dependencies [3c577dc]
- Updated dependencies [9b6cabd]
- Updated dependencies [282d74b]
  - @buckspay/core@0.2.0

## 0.1.4

### Patch Changes

- 7ae6cfa: Mainnet (Stellar pubnet) is now supported via explicit opt-in.

  Gasless USDC payments — both the classic (G-account + Wallets Kit) and the
  contract/passkey (C-account, OpenZeppelin Smart Account) flows — run on pubnet
  when the caller explicitly opts in (`allowMainnet: true` in the browser config /
  `BUCKSPAY_ALLOW_MAINNET=1` in Node). Mainnet is OFF by default: without the opt-in,
  `resolveNetwork("pubnet", …)` throws `INVALID_CONFIG`, so no default or forgotten
  configuration can move real funds. The real pubnet path is proven by a guarded e2e
  smoke (tiny 0.0001 USDC transfers) and gated behind the mainnet cutover runbook.

  No breaking changes: testnet behavior and the public API surface (README §4) are
  unchanged. Pre-1.0 → patch per VERSIONING.md §4.1.

- Updated dependencies [77d7b43]
- Updated dependencies [7ae6cfa]
  - @buckspay/core@0.1.4

## 0.1.3

### Patch Changes

- Hero hardening, all backward-compatible:

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

- Updated dependencies
  - @buckspay/core@0.1.3

## 0.1.2

### Patch Changes

- @buckspay/core@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies
  - @buckspay/core@0.1.1

## 0.1.0

### Minor Changes

- Initial public release of the Buckspay SDK — the classic Stellar (Soroban) gasless USDC path: the core `prepare → sign → send` client + gas-abstraction engine, the Stellar Wallets Kit signer, the classic `G…` account adapter with sponsored onboarding, the facilitator relayer, and the React 19 binding (`BuckspayProvider` / `useWallet` / `useStellarPay`).

### Patch Changes

- Updated dependencies
  - @buckspay/core@0.1.0
