---
title: "Function: useWallet()"
---

# Function: useWallet()

> **useWallet**(): [`UseWalletResult`](/sdk-reference/react-native/src/interfaces/UseWalletResult)

Defined in: packages/react/dist/index.d.ts:35

Wallet connection surface (README §4.6). `connect()` delegates to the core
client, which resolves the address + runs `ensureReady` and drives the store
status. `wallet` is derived from the store address: a minimal view backed by the
live client (model is `classic`; `getState` proxies the client).

## Returns

[`UseWalletResult`](/sdk-reference/react-native/src/interfaces/UseWalletResult)
