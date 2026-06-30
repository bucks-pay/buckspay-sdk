[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SubInvocation

# Interface: SubInvocation

Defined in: [packages/core/src/auth-entry-builder.ts:76](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/auth-entry-builder.ts#L76)

A nested authorized invocation: `contract.fn(args)`. Used to declare the sub-calls a contract makes
 on the signer's behalf (e.g. the FeeForwarder's two `transfer`s), so the SAC's `require_auth()` is
 covered by the same auth tree.

## Properties

### args

> **args**: `ScVal`[]

Defined in: [packages/core/src/auth-entry-builder.ts:79](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/auth-entry-builder.ts#L79)

***

### contract

> **contract**: `string`

Defined in: [packages/core/src/auth-entry-builder.ts:77](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/auth-entry-builder.ts#L77)

***

### fn

> **fn**: `string`

Defined in: [packages/core/src/auth-entry-builder.ts:78](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/auth-entry-builder.ts#L78)
