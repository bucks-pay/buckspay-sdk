// @buckspay/react-native — scaffold. nativePasskey() + the RN-wired provider/hooks are planned.
// The hooks are re-exported from @buckspay/react (same core + vanilla zustand store); a future release swaps in
// native passkey (iOS/Android WebAuthn) + secure storage WITHOUT forking the core logic.
export { BuckspayProvider, useWallet, useStellarPay } from "@buckspay/react";
