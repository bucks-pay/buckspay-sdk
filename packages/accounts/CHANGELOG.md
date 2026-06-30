# @buckspay/accounts

## 0.2.4

### Patch Changes

- Updated dependencies [6c133be]
  - @buckspay/core@0.2.4

## 0.2.3

### Patch Changes

- @buckspay/core@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [a00a9ed]
  - @buckspay/core@0.2.2

## 0.2.1

### Patch Changes

- ccc52f1: **Policy session accounts.** `@buckspay/accounts` adds the `@buckspay/accounts/policy-account` adapter:
  an ed25519-root contract account whose on-chain `__check_auth` enforces session-key spend-limit,
  allow-list and expiry policies. It derives a deterministic, counterfactual C-address (offline, from the
  sponsor + root key), assembles auth entries as an ed25519 `SigData`, and pairs with `grantSession` /
  `revokeSession` and the policy compiler. `@buckspay/core` adds the optional `Relayer.deploySessionAccount`
  hook and the adapter's `ensureReady` deploys the account (sponsored) on first connect; `@buckspay/relayer`
  implements it against the facilitator. A granted session key then transacts within its policies - and an
  over-limit, off-allow-list, expired or revoked attempt is rejected with `SESSION_POLICY_VIOLATION`.
- 3a8497c: **Session manager.** `@buckspay/core` adds `BuckspayClient.grantSession` / `revokeSession` (contract
  account model only - `INVALID_CONFIG` on the classic model) plus `sessionId` / `serializeSession` /
  `deserializeSession` (clock-injected; a past session throws `SESSION_EXPIRED`) and `createSessionManager`.
  The root signer authorizes the session install once; thereafter the scoped session key transacts within
  its spend-limit + allowlist policies without per-action prompts, and a revoke takes effect immediately
  on-chain. The contract account builds the `add_signer` / `remove_signer` entries, and the relayer
  surfaces host policy rejections as `SESSION_POLICY_VIOLATION` / `SESSION_EXPIRED`.
- cc115e8: **Session policies.** `@buckspay/accounts/policy` now ships the session-policy surface: the `spendLimit`
  and `allowlist` factories, `compilePolicies` (the on-chain policy struct), and `buildInstallArgs` /
  `buildRevokeArgs` for installing and revoking a policy-scoped session signer on a contract account. A
  session must carry both a spend limit and a non-empty allowlist - an unbounded delegation is refused -
  and the rules are enforced on-chain in the account's `__check_auth`. The install payload is pinned
  byte-for-byte against a real on-chain-accepted transaction.
- Updated dependencies [ccc52f1]
- Updated dependencies [3a8497c]
  - @buckspay/core@0.2.1

## 0.2.0

### Minor Changes

- 3c577dc: **Atomic batch.** `client.sendCalls(calls)` (EIP-5792-style) and `client.prepare(calls)` settle
  N USDC transfers **all-or-nothing in ONE tx** via the pinned Multicall router's
  `batch_transfer(payer, token, Vec<(to, amount)>)` - one nonce, one signature for the whole batch, the
  same shape for classic (`G...`) and contract (`C...`) accounts. Adds the **required**
  `AccountAdapter.buildUnsignedBatchEntry` (both first-party account models implement it; a batch of 1 is
  byte-identical to the single-call entry - the sponsored path is unchanged) plus `BuildBatchEntryInput`.
  `MAX_BATCH_CALLS` (16) is enforced fail-closed at `batch().build()`, `prepare`, and `sendCalls`
  (`BATCH_TOO_LARGE`). Verified on testnet with real USDC.

  Adding a required member to the public `AccountAdapter` interface is a breaking interface change ->
  **minor** (pre-1.0). Batch is a universal account capability (every account that authorizes a single
  transfer authorizes a batch), so it belongs in the contract as required, not optional.

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

  Gasless USDC payments - both the classic (G-account + Wallets Kit) and the
  contract/passkey (C-account, OpenZeppelin Smart Account) flows - run on pubnet
  when the caller explicitly opts in (`allowMainnet: true` in the browser config /
  `BUCKSPAY_ALLOW_MAINNET=1` in Node). Mainnet is OFF by default: without the opt-in,
  `resolveNetwork("pubnet", ...)` throws `INVALID_CONFIG`, so no default or forgotten
  configuration can move real funds. The real pubnet path is proven by a guarded e2e
  smoke (tiny 0.0001 USDC transfers) and gated behind the mainnet cutover runbook.

  No breaking changes: testnet behavior and the public API surface (README §4) are
  unchanged. Pre-1.0 -> patch per VERSIONING.md §4.1.

- Updated dependencies [77d7b43]
- Updated dependencies [7ae6cfa]
  - @buckspay/core@0.1.4

## 0.1.3

### Patch Changes

- Hero hardening, all backward-compatible:

  - **`@buckspay/accounts`** - browser-safe **isomorphic SHA-256** for the C-address salt
    (was `node:crypto`, which broke the browser build of `oz-contract`); same hash, so the
    derivation stays byte-identical. Plus an OZ Smart Account **Wasm-hash pin guard**
    (`assertPinnedWasmHash`) - `ozContractAccount` refuses any Wasm hash but the pinned one.
  - **`@buckspay/core`** - `boundExpirationLedger` caps `signatureExpirationLedger` to
    `MAX_EXPIRATION_LEDGERS` (no widened replay window), and a **mainnet gate**: `pubnet` is
    refused unless `BUCKSPAY_ALLOW_MAINNET=1`.
  - **`@buckspay/react`** - `BuckspayProvider` accepts an optional `sim` prop, enabling
    `useStellarPay().pay()` (the recording simulator for `prepare()`).

  Pre-1.0 fix + backward-compatible feature -> `patch` per VERSIONING.md (0.1.2 -> 0.1.3, lockstep).

- Updated dependencies
  - @buckspay/core@0.1.3

## 0.1.2

### Patch Changes

- Passkey / contract-account model, fully backward-compatible:

  - **`@buckspay/signers/passkey`** - new WebAuthn secp256r1 `BuckspaySigner`. Derives the
    passkey public key (COSE EC2 parse) and produces the OZ `__check_auth` `WebAuthnSigData`
    signature (DER->raw, low-S) over the auth-entry preimage. Private key never leaves the authenticator.
  - **`@buckspay/accounts/oz-contract`** - new `AccountAdapter` (model `contract`) that derives the
    deterministic C-address, deploys the OZ smart account via the relayer, and builds + assembles
    the `__check_auth` auth entry.
  - **`@buckspay/relayer`** - real `deployContract` (`POST /stellar/contract/deploy`); `getAccountState`
    routes `C...` addresses to `/stellar/contract/:address`.
  - **typesVersions** added to `signers`/`accounts`/`relayer` so classic-moduleResolution consumers
    (e.g. NestJS) resolve the subpath types without a tsconfig `paths` shim.

  Pre-1.0 additive change -> `patch` per VERSIONING.md (0.1.1 -> 0.1.2, lockstep across all @buckspay/\*).
  - @buckspay/core@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies
  - @buckspay/core@0.1.1

## 0.1.0

### Minor Changes

- Initial public release of the Buckspay SDK - the classic Stellar (Soroban) gasless USDC path: the core `prepare -> sign -> send` client + gas-abstraction engine, the Stellar Wallets Kit signer, the classic `G...` account adapter with sponsored onboarding, the facilitator relayer, and the React 19 binding (`BuckspayProvider` / `useWallet` / `useStellarPay`).

### Patch Changes

- Updated dependencies
  - @buckspay/core@0.1.0
