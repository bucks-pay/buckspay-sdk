# @buckspay/core

## 0.2.0

### Minor Changes

- 3c577dc: SP-2 sprint-2 atomic batch: `client.sendCalls(calls)` (EIP-5792-style) and `client.prepare(calls)` settle
  N USDC transfers **all-or-nothing in ONE tx** via the pinned Multicall router's
  `batch_transfer(payer, token, Vec<(to, amount)>)` — one nonce, one signature for the whole batch, the
  same shape for classic (`G…`) and contract (`C…`) accounts. Adds the **required**
  `AccountAdapter.buildUnsignedBatchEntry` (both first-party account models implement it; a batch of 1 is
  byte-identical to the SP-1 single-call entry — the sponsored path is unchanged) plus `BuildBatchEntryInput`.
  `MAX_BATCH_CALLS` (16) is enforced fail-closed at `batch().build()`, `prepare`, and `sendCalls`
  (`BATCH_TOO_LARGE`). Proven on testnet with real Circle USDC (the Multicall router is the sprint-0/03
  spike deploy, wasm-hash-pinned).

  Adding a required member to the public `AccountAdapter` interface is a breaking interface change →
  **minor** (pre-1.0). Batch is a universal account capability (every account that authorizes a single
  transfer authorizes a batch), so it belongs in the contract as required, not optional.

### Patch Changes

- 9b6cabd: SP-2 gas-in-token (core): `gas: { mode: "token", token }` pays Soroban gas in a stablecoin. The SDK
  quotes the fee via the **optional** `Relayer.feeQuote` (`POST /fee/quote`) and relays a single FeeForwarder
  `forward(payer, token, merchant, payment, collector, fee)` invocation (one auth entry) instead of the direct
  transfer, enforcing a `gas.maxFee` ceiling (`TOKEN_GAS_REJECTED`). Adds `FeeQuote.collector` and the generic
  `buildUnsignedCallEntry`. `feeQuote` is optional on `Relayer` (additive — a relayer without it refuses token
  mode with `INVALID_CONFIG`); sponsored mode is byte-identical to before.
- 282d74b: SP-2 scaffolding: additive type surface (the `sponsored | token` gas union, `FeeQuote` /
  `AuthDetails` / session / `SwapQuote` types, six new `BuckspayError` codes, the optional
  `BuckspaySigner.authenticate`, optional fee fields on the intents/relay payload), the pure
  `batch()` builder + `MAX_BATCH_CALLS`, and buildable skeletons for the new `@buckspay/nextjs`
  and `@buckspay/react-native` packages plus the `signers/social`, `signers/email`, and
  `accounts/policy` subpaths. No behavior change to existing paths — `gas: { mode: "token" }`
  fails closed with `TOKEN_GAS_REJECTED` until SP-2 sprint-1 wires the FeeForwarder.

## 0.1.4

### Patch Changes

- 77d7b43: Enable mainnet from the browser. `BuckspayConfig` gains an optional `allowMainnet`
  flag — a deliberate, reviewable opt-in for environments with no `process.env`
  (browsers) that is ORed with the existing Node `BUCKSPAY_ALLOW_MAINNET=1` env.
  Pubnet stays refused unless one of the two signals is present; `resolveNetwork`
  remains the single gate.

  Adds the `mainnetSimContext(rpcUrl, { sponsorAddress })` preset: a thin wrapper over
  `createRpcSimContext` that forces the funded sponsor G-address as the recording sim's
  `simSource`, so the contract/passkey account model on pubnet can never omit it (a
  missing source otherwise resolves the SAC balance footprint to zero). `sponsorAddress`
  is the sponsor's PUBLIC key only — no secret enters the SDK.

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
