[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/oz-contract](../README.md) / OzContractOptions

# Interface: OzContractOptions

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:5](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/accounts/src/oz-contract/resolveAddress.ts#L5)

## Properties

### network?

> `optional` **network?**: `Network`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:15](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/accounts/src/oz-contract/resolveAddress.ts#L15)

Network whose passphrase folds into the derivation. Defaults to testnet.

***

### sponsorAddress?

> `optional` **sponsorAddress?**: `string`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:13](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/accounts/src/oz-contract/resolveAddress.ts#L13)

Sponsor (deployer) address — the facilitator's public sponsor account. Required to
derive the C-address offline (the SDK never holds the sponsor secret). The contract
model needs this for `BuckspayClient.connect()` (which calls resolveAddress first).

***

### wasmHash?

> `optional` **wasmHash?**: `string`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:7](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/accounts/src/oz-contract/resolveAddress.ts#L7)

Advisory: pinned OZ Wasm hash (the facilitator enforces the real pin).
