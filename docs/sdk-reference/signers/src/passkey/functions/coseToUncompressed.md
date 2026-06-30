[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/passkey](../README.md) / coseToUncompressed

# Function: coseToUncompressed()

> **coseToUncompressed**(`cose`): `Uint8Array`

Defined in: [packages/signers/src/passkey/cose.ts:124](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/signers/src/passkey/cose.ts#L124)

Rebuild the 65-byte uncompressed point `0x04 ‖ X(32) ‖ Y(32)` from COSE x/y.

## Parameters

### cose

#### x

`Uint8Array`

#### y

`Uint8Array`

## Returns

`Uint8Array`
