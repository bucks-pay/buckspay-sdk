[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/passkey](../README.md) / formatCheckAuthSignature

# Function: formatCheckAuthSignature()

> **formatCheckAuthSignature**(`parts`): `ScVal`

Defined in: [packages/signers/src/passkey/signAuthEntry.ts:68](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/signers/src/passkey/signAuthEntry.ts#L68)

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
