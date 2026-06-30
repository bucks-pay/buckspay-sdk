[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/passkey](../README.md) / formatCheckAuthSignature

# Function: formatCheckAuthSignature()

> **formatCheckAuthSignature**(`parts`): `ScVal`

Defined in: [packages/signers/src/passkey/signAuthEntry.ts:69](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/signers/src/passkey/signAuthEntry.ts#L69)

OZ Smart Account `WebAuthnSigData` scval — the value `__check_auth` receives as
`Self::Signature`. BYTE-IDENTICAL to the structure the contract validates on-chain:
a Soroban map with canonical sorted keys `authenticator_data` < `client_data` <
`signature`, each value an `scvBytes`. The signature MUST be raw 64-byte r‖s (low-S).

LOCK-STEP: these field names are the single value to keep in sync with the OZ
`__check_auth`. Note `client_data` (NOT `client_data_json`).

## Parameters

### parts

[`CheckAuthParts`](../interfaces/CheckAuthParts.md)

## Returns

`ScVal`
