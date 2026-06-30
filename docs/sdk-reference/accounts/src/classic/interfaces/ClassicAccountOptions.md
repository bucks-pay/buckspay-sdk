---
title: "Interface: ClassicAccountOptions"
---

# Interface: ClassicAccountOptions

Defined in: [packages/accounts/src/classic/classic-account.ts:16](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/classic/classic-account.ts#L16)

## Properties

### multicallContract?

> `optional` **multicallContract?**: `string`

Defined in: [packages/accounts/src/classic/classic-account.ts:19](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/classic/classic-account.ts#L19)

Multicall router C-address for atomic batches. Defaults to the network's pinned
 MULTICALL_CONTRACT_ID. Only consulted for calls.length > 1.
