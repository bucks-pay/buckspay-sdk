// @buckspay/react-native — scaffold. nativePasskey() + the RN-wired provider/hooks land in SP-2 sprint-5.
// The hooks are re-exported from @buckspay/react (same core + vanilla zustand store); sprint-5 swaps in
// native passkey (iOS/Android WebAuthn) + secure storage WITHOUT forking the core logic.
export { BuckspayProvider, useWallet, useStellarPay } from "@buckspay/react";
