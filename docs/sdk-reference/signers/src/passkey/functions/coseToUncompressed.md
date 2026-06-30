---
title: "Function: coseToUncompressed()"
---

# Function: coseToUncompressed()

> **coseToUncompressed**(`cose`): `Uint8Array`

Defined in: [packages/signers/src/passkey/cose.ts:124](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/passkey/cose.ts#L124)

Rebuild the 65-byte uncompressed point `0x04 ‖ X(32) ‖ Y(32)` from COSE x/y.

## Parameters

### cose

#### x

`Uint8Array`

#### y

`Uint8Array`

## Returns

`Uint8Array`
