[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react/src](../README.md) / useWallet

# Function: useWallet()

> **useWallet**(): [`UseWalletResult`](../interfaces/UseWalletResult.md)

Defined in: [packages/react/src/use-wallet.ts:22](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/react/src/use-wallet.ts#L22)

Wallet connection surface (README §4.6). `connect()` delegates to the core
client, which resolves the address + runs `ensureReady` and drives the store
status. `wallet` is derived from the store address: a minimal view backed by the
live client (model is `classic` in SP-1; `getState` proxies the client).

## Returns

[`UseWalletResult`](../interfaces/UseWalletResult.md)
