# @buckspay/accounts

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

- Updated dependencies
  - @buckspay/core@0.1.3

## 0.1.2

### Patch Changes

- Passkey / contract-account model (M2), fully backward-compatible:

  - **`@buckspay/signers/passkey`** — new WebAuthn secp256r1 `BuckspaySigner`. Derives the
    passkey public key (COSE EC2 parse) and produces the OZ `__check_auth` `WebAuthnSigData`
    signature (DER→raw, low-S) over the auth-entry preimage. Private key never leaves the authenticator.
  - **`@buckspay/accounts/oz-contract`** — new `AccountAdapter` (model `contract`) that derives the
    deterministic C-address, deploys the OZ smart account via the relayer, and builds + assembles
    the `__check_auth` auth entry.
  - **`@buckspay/relayer`** — real `deployContract` (`POST /stellar/contract/deploy`); `getAccountState`
    routes `C…` addresses to `/stellar/contract/:address`.
  - **typesVersions** added to `signers`/`accounts`/`relayer` so classic-moduleResolution consumers
    (e.g. NestJS) resolve the subpath types without a tsconfig `paths` shim.

  Pre-1.0 additive change → `patch` per VERSIONING.md (0.1.1 → 0.1.2, lockstep across all @buckspay/\*).
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
