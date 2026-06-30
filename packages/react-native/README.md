# @buckspay/react-native

React Native bindings for the **Buckspay SDK** - gasless Stellar (Soroban) USDC payments on iOS and
Android.

The core is platform-agnostic, so this package is thin. It re-exports the `@buckspay/react` hooks
unchanged (same provider, same store, no fork), swaps the browser passkey for one backed by the
device secure enclave, adds a secure-storage adapter for session keys, and installs the Hermes
polyfills `@stellar/stellar-sdk` needs. Your screen code reads the same as it does on the web. Only
the host components and the signer differ.

## Install

```bash
pnpm add @buckspay/react-native @buckspay/core
```

Peer dependencies you install in the app: `react`, `react-native`, `react-native-passkey`, and
`react-native-get-random-values`.

## Usage

```tsx
import {
  BuckspayProvider,
  useWallet,
  useStellarPay,
  nativePasskey
} from "@buckspay/react-native";

const config = {
  network: "testnet",
  account: ozContractAccount({ network: "testnet", sponsorAddress: SPONSOR_G }),
  signer: nativePasskey({ rpId: "app.buckspay.xyz", rpName: "Buckspay" }),
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  gas: { mode: "sponsored" as const }
};

function App() {
  return (
    <BuckspayProvider config={config}>
      <PayScreen />
    </BuckspayProvider>
  );
}
```

`nativePasskey` does not reimplement WebAuthn. It feeds `react-native-passkey` into the same
`@buckspay/signers/passkey` pipeline the web build uses, so the on-chain `__check_auth` the contract
verifies is byte-for-byte identical. Only the authenticator transport changes, and the private key
never leaves the enclave.

Session keys and credential ids persist through a `SecureStore` port: `memorySecureStore` for tests,
`expoSecureStore` or `keychainSecureStore` on device.

## License

MIT - part of [buckspay-sdk](https://github.com/bucks-pay/buckspay-sdk).
