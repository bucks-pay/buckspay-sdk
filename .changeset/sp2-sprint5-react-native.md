---
"@buckspay/react-native": patch
"@buckspay/signers": patch
---

**React Native binding.** `@buckspay/react-native` ships `nativePasskey` — a device-enclave WebAuthn
signer over the existing `@buckspay/signers/passkey` pipeline, so the on-chain `__check_auth` is the
same one the web passkey produces (only the authenticator transport differs) — a `SecureStore` adapter
(expo-secure-store / react-native-keychain) for the scoped session key at rest, the Hermes polyfills
`@stellar/stellar-sdk` needs, and the `BuckspayProvider` / `useWallet` / `useStellarPay` hooks
re-exported unchanged from `@buckspay/react`. `@buckspay/signers/passkey` additionally re-exports
`extractCoseKey` / `coseToUncompressed`. No existing runtime path changes; the web binding is
byte-for-byte identical.
