[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / Signature

# Interface: Signature

Defined in: [packages/core/src/types.ts:28](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L28)

## Properties

### publicKey

> **publicKey**: `string`

Defined in: [packages/core/src/types.ts:32](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L32)

echoes the signer public key used to build credentials.

***

### signature

> **signature**: `Uint8Array`

Defined in: [packages/core/src/types.ts:30](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L30)

raw signature bytes; 64 bytes for ed25519, contract-defined for passkey.
