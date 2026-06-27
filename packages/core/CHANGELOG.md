# @buckspay/core

## 0.1.2

## 0.1.1

### Patch Changes

- Add a concrete `SorobanSimulator` + `createRpcSimContext(rpcUrl)` (RPC-backed recording simulation via raw `simulateTransaction`). This makes the flagship `BuckspayClient.prepare → sign → send` flow usable in production: pass the sim context as the second argument to `createBuckspayClient` / `createBuckspayConfig`. Backward-compatible (additive); the sim context stays optional.

## 0.1.0

### Minor Changes

- Initial public release of the Buckspay SDK — the classic Stellar (Soroban) gasless USDC path: the core `prepare → sign → send` client + gas-abstraction engine, the Stellar Wallets Kit signer, the classic `G…` account adapter with sponsored onboarding, the facilitator relayer, and the React 19 binding (`BuckspayProvider` / `useWallet` / `useStellarPay`).
