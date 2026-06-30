[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / buildUnsignedCallEntry

# Function: buildUnsignedCallEntry()

> **buildUnsignedCallEntry**(`params`): `SorobanAuthorizationEntry`

Defined in: [packages/core/src/auth-entry-builder.ts:101](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/auth-entry-builder.ts#L101)

Build an unsigned auth entry for an ARBITRARY contract call (generalizes `buildUnsignedEntry`, which
hardcodes `transfer`). Used by gas mode "token" to authorize the FeeForwarder `forward(...)` invocation
together with its `subInvocations` (the merchant + fee transfers the forwarder performs on the signer's
behalf — the entry tree must include them, verified on-chain). Credentials bind to
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

[`SubInvocation`](../interfaces/SubInvocation.md)[]

## Returns

`SorobanAuthorizationEntry`
