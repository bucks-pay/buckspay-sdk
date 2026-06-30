[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [relayer/src/buckspay-facilitator](../README.md) / buckspayFacilitator

# Function: buckspayFacilitator()

> **buckspayFacilitator**(`opts`, `deps?`): `Relayer`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:47](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/relayer/src/buckspay-facilitator/facilitator.ts#L47)

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
