[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/passkey](../README.md) / extractCoseKey

# Function: extractCoseKey()

> **extractCoseKey**(`authData`): `object`

Defined in: [packages/signers/src/passkey/cose.ts:106](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/signers/src/passkey/cose.ts#L106)

Extract the secp256r1 (P-256) x/y from a WebAuthn attestation's authenticatorData:
  rpIdHash(32) | flags(1) | signCount(4) | aaguid(16) | credIdLen(2) | credId | COSE_Key(CBOR)
Requires the AT (attested-credential-data) flag set.

## Parameters

### authData

`Uint8Array`

## Returns

`object`

### x

> **x**: `Uint8Array`

### y

> **y**: `Uint8Array`
