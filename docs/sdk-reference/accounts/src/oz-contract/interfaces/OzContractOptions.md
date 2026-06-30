---
title: "Interface: OzContractOptions"
---

# Interface: OzContractOptions

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:5](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/oz-contract/resolveAddress.ts#L5)

## Properties

### multicallContract?

> `optional` **multicallContract?**: `string`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:18](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/oz-contract/resolveAddress.ts#L18)

Multicall router C-address for atomic contract batches. Defaults to the network's
 pinned MULTICALL_CONTRACT_ID. Only consulted for calls.length > 1.

***

### network?

> `optional` **network?**: [`Network`](/sdk-reference/nextjs/src/type-aliases/Network)

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:15](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/oz-contract/resolveAddress.ts#L15)

Network whose passphrase folds into the derivation. Defaults to testnet.

***

### sponsorAddress?

> `optional` **sponsorAddress?**: `string`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:13](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/oz-contract/resolveAddress.ts#L13)

Sponsor (deployer) address - the facilitator's public sponsor account. Required to
derive the C-address offline (the SDK never holds the sponsor secret). The contract
model needs this for `BuckspayClient.connect()` (which calls resolveAddress first).

***

### wasmHash?

> `optional` **wasmHash?**: `string`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:7](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/oz-contract/resolveAddress.ts#L7)

Advisory: pinned OZ Wasm hash (the facilitator enforces the real pin).
