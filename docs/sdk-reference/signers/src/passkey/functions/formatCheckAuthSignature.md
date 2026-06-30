---
title: "Function: formatCheckAuthSignature()"
---

# Function: formatCheckAuthSignature()

> **formatCheckAuthSignature**(`parts`): `ScVal`

Defined in: [packages/signers/src/passkey/signAuthEntry.ts:68](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/passkey/signAuthEntry.ts#L68)

OZ Smart Account `WebAuthnSigData` scval - the value `__check_auth` receives as
`Self::Signature`. BYTE-IDENTICAL to the structure the contract validates on-chain:
a Soroban map with canonical sorted keys `authenticator_data` < `client_data` <
`signature`, each value an `scvBytes`. The signature MUST be raw 64-byte r‖s (low-S).

LOCK-STEP: these field names are the single value to keep in sync with the OZ
`__check_auth`. Note `client_data` (NOT `client_data_json`).

## Parameters

### parts

[`CheckAuthParts`](/sdk-reference/signers/src/passkey/interfaces/CheckAuthParts)

## Returns

`ScVal`
