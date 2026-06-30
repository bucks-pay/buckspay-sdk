# @buckspay/signers

## 0.2.4

### Patch Changes

- Updated dependencies [6c133be]
  - @buckspay/core@0.2.4

## 0.2.3

### Patch Changes

- 505b942: **React Native binding.** `@buckspay/react-native` ships `nativePasskey` — a device-enclave WebAuthn
  signer over the existing `@buckspay/signers/passkey` pipeline, so the on-chain `__check_auth` is the
  same one the web passkey produces (only the authenticator transport differs) — a `SecureStore` adapter
  (expo-secure-store / react-native-keychain) for the scoped session key at rest, the Hermes polyfills
  `@stellar/stellar-sdk` needs, and the `BuckspayProvider` / `useWallet` / `useStellarPay` hooks
  re-exported unchanged from `@buckspay/react`. `@buckspay/signers/passkey` additionally re-exports
  `extractCoseKey` / `coseToUncompressed`. No existing runtime path changes; the web binding is
  byte-for-byte identical.
  - @buckspay/core@0.2.3

## 0.2.2

### Patch Changes

- c70012d: **Email / OTP login.** `@buckspay/signers/email` ships `emailSigner({ proxyUrl, network })` with
  `requestOtp(email)` (issue) + `authenticate({ email, otp })` (verify) resolving a server-custodied
  Stellar ed25519 key, and `signAuthEntry` signing through the signer-proxy. The OTP-derived private key
  is custodied server-side by the facilitator and never reaches the browser — the signer holds only the
  public key, an opaque session token, and the returned 64-byte signatures. No OTP credentials or private
  key ship client-side. Passes the shared `BuckspaySigner` conformance suite (type `"email"`).
- a00a9ed: **Social login.** `@buckspay/signers/social` ships `socialSigner({ provider: "web3auth", clientId, network, proxyUrl })`,
  a `BuckspaySigner` whose `authenticate()` runs the provider's OAuth flow — the public part client-side,
  the secret-bearing verifier callback through your server-side signer-proxy — and resolves a Stellar
  ed25519 key that backs the classic account model. After that, `getPublicKey()` / `signAuthEntry()` operate
  on that key; the ed25519 signing stays inside the provider's secure context, so the SDK holds only the
  public key and the 64-byte signature — no provider secret or private key ships client-side. The factory is
  provider-agnostic behind a structural transport (v1 ships web3auth). `SignerType` gains the additive
  `"social"` / `"email"` members.
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

- Updated dependencies
  - @buckspay/core@0.1.3

## 0.1.2

### Patch Changes

- Passkey / contract-account model, fully backward-compatible:

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
