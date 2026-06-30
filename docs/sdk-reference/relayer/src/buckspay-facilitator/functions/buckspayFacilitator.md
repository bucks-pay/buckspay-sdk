[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [relayer/src/buckspay-facilitator](../README.md) / buckspayFacilitator

# Function: buckspayFacilitator()

> **buckspayFacilitator**(`opts`, `deps?`): `Relayer`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:47](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/relayer/src/buckspay-facilitator/facilitator.ts#L47)

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
