---
title: "Function: buildUnsignedCallEntry()"
---

# Function: buildUnsignedCallEntry()

> **buildUnsignedCallEntry**(`params`): `SorobanAuthorizationEntry`

Defined in: [packages/core/src/auth-entry-builder.ts:101](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/auth-entry-builder.ts#L101)

Build an unsigned auth entry for an ARBITRARY contract call (generalizes `buildUnsignedEntry`, which
hardcodes `transfer`). Used by gas mode "token" to authorize the FeeForwarder `forward(...)` invocation
together with its `subInvocations` (the merchant + fee transfers the forwarder performs on the signer's
behalf - the entry tree must include them, verified on-chain). Credentials bind to
`from`; `signatureExpirationLedger`/`signature` stay void until the assemble step.

## Parameters

### params

#### args

`ScVal`[]

#### contract

`string`

#### fn

`string`

#### from

`string`

#### nonce

`bigint`

#### subInvocations?

[`SubInvocation`](/sdk-reference/core/src/interfaces/SubInvocation)[]

## Returns

`SorobanAuthorizationEntry`
