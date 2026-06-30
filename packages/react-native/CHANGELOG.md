# @buckspay/react-native

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
- Updated dependencies [505b942]
  - @buckspay/signers@0.2.3
  - @buckspay/core@0.2.3
  - @buckspay/react@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [a00a9ed]
  - @buckspay/core@0.2.2
  - @buckspay/react@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [ccc52f1]
- Updated dependencies [3a8497c]
  - @buckspay/core@0.2.1
  - @buckspay/react@0.2.1

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
  - @buckspay/react@0.2.0
