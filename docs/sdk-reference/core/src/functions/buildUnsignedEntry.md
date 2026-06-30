---
title: "Function: buildUnsignedEntry()"
---

# Function: buildUnsignedEntry()

> **buildUnsignedEntry**(`params`): `SorobanAuthorizationEntry`

Defined in: [packages/core/src/auth-entry-builder.ts:38](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/auth-entry-builder.ts#L38)

Build the unsigned USDC SAC `transfer` authorization entry. Ported verbatim
from dashboard sign.ts so the produced XDR is byte-identical to today's path.
Credentials bind to `from` (G... classic); `signatureExpirationLedger` and
`signature` stay zero/void until `authorizeEntry` (assemble step) fills them.

## Parameters

### params

#### from

`string`

#### nonce

`bigint`

#### sac

`string`

#### stroops

`bigint`

#### to

`string`

## Returns

`SorobanAuthorizationEntry`
