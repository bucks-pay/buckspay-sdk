[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/classic](../README.md) / ClassicAccountOptions

# Interface: ClassicAccountOptions

Defined in: [packages/accounts/src/classic/classic-account.ts:16](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/classic/classic-account.ts#L16)

## Properties

### multicallContract?

> `optional` **multicallContract?**: `string`

Defined in: [packages/accounts/src/classic/classic-account.ts:19](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/classic/classic-account.ts#L19)

Multicall router C-address for atomic batches. Defaults to the network's pinned
 MULTICALL_CONTRACT_ID. Only consulted for calls.length > 1.
