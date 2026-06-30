[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/oz-contract](../README.md) / contractSalt

# Function: contractSalt()

> **contractSalt**(`passkeyPublicKey`): `Buffer`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:26](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/oz-contract/resolveAddress.ts#L26)

MUST match facilitator `contractSalt`: sha256(pubkeyBytes). Uses the
stellar-sdk's isomorphic `hash` (NOT node:crypto) so the SDK runs in the browser —
same SHA-256 as the facilitator, so the derivation stays byte-identical.

## Parameters

### passkeyPublicKey

`string`

## Returns

`Buffer`
