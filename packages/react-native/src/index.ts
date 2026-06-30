// @buckspay/react-native — mobile binding. The core (auth-entry build, fee-bump,
// prepare/sign/send) lives in @buckspay/core and is platform-agnostic: this package only swaps
// the passkey signer (native enclave), the storage adapter, and the Hermes polyfills, and
// re-wires the provider. The provider/hooks below are the SAME @buckspay/react exports — never a
// fork (pinned by test/wiring.test.tsx).
import "./polyfills"; // SIDE EFFECT: install Hermes globals before stellar-sdk is used.

export { BuckspayProvider, type BuckspayProviderProps } from "@buckspay/react";
export { useWallet, type UseWalletResult } from "@buckspay/react";
export { useStellarPay, type UseStellarPayResult } from "@buckspay/react";

export { nativePasskey, type NativePasskeyOptions } from "./native-passkey";
export { memorySecureStore, expoSecureStore, keychainSecureStore, type SecureStore } from "./secure-storage";
