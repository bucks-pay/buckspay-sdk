# React Native

`@buckspay/react-native` brings the SDK to iOS/Android. The core (auth-entry build, fee-bump,
`prepare → sign → send`) is platform-agnostic, so this package only swaps the **passkey signer**
(native secure enclave), adds **secure storage**, and installs the **Hermes polyfills** — then
re-exports the React layer **unchanged**.

```tsx
import {
  BuckspayProvider, useWallet, useStellarPay, // the SAME @buckspay/react exports, RN-wired
  nativePasskey                                // iOS/Android WebAuthn signer
} from "@buckspay/react-native";

const config = {
  network: "testnet",
  account: ozContractAccount({ network: "testnet", sponsorAddress: SPONSOR_G }),
  signer: nativePasskey({ rpId: "app.buckspay.dev", rpName: "buckspay" }),
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  gas: { mode: "sponsored" as const }
};
```

## No fork — the same hooks

`BuckspayProvider`, `useWallet`, and `useStellarPay` are re-exported **by reference** from
`@buckspay/react` — same store, same status machine ([React hooks](./05-react.md)). Your screen
logic is identical to web; only the host components (`<View>` / `<Text>`) and the signer differ.

## `nativePasskey({ rpId, rpName? })`

This is **not** a second WebAuthn implementation. `@buckspay/signers/passkey` owns the entire
crypto pipeline; `nativePasskey` supplies a native `WebAuthnLike` backed by `react-native-passkey`
and delegates to it, so the signer the contract account binds is byte-for-byte the web one — only
the authenticator transport differs. The private key never leaves the device secure enclave. iOS vs
Android divergence is absorbed by the native module, not by JS branching.

## Secure storage

Session blobs and credential ids persist via a `SecureStore` port:
`memorySecureStore` (tests), `expoSecureStore`, or `keychainSecureStore` — each lazily imports its
optional native peer, so apps that don't use one never pull it.

The native peers (`react-native`, `react-native-passkey`, `react-native-get-random-values`) are
**peer dependencies** you install in the app, with a simulator-gated smoke test proving the
on-device path.

Compiled example: `docs/examples/13-react-native.tsx`.

Prev: [Social & email login](./11-social-email-login.md) · Next: [Feature coverage](./13-feature-coverage.md)
