[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [relayer/src/buckspay-facilitator](../README.md) / buckspayFacilitator

# Function: buckspayFacilitator()

> **buckspayFacilitator**(`opts`, `deps?`): `Relayer`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:36](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/relayer/src/buckspay-facilitator/facilitator.ts#L36)

Build a `Relayer` that talks to the buckspay facilitator. A thin, stateless,
injectable HTTP client: every response is zod-validated against the README §4.3
shapes before return, and HTTP/facilitator errors map to typed `BuckspayError`s.

## Parameters

### opts

[`FacilitatorOptions`](../interfaces/FacilitatorOptions.md)

### deps?

`Deps` = `{}`

## Returns

`Relayer`
