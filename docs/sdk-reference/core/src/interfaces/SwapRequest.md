[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SwapRequest

# Interface: SwapRequest

Defined in: [packages/core/src/types.ts:264](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L264)

Normalized swap request the client hands the relayer adapter (the connected wallet is the payer).

## Extends

- [`SwapQuoteRequest`](SwapQuoteRequest.md)

## Properties

### amount

> **amount**: `string`

Defined in: [packages/core/src/types.ts:262](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L262)

#### Inherited from

[`SwapQuoteRequest`](SwapQuoteRequest.md).[`amount`](SwapQuoteRequest.md#amount)

***

### minOut?

> `optional` **minOut?**: `string`

Defined in: [packages/core/src/types.ts:265](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L265)

***

### payer

> **payer**: `string`

Defined in: [packages/core/src/types.ts:259](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L259)

#### Inherited from

[`SwapQuoteRequest`](SwapQuoteRequest.md).[`payer`](SwapQuoteRequest.md#payer)

***

### tokenIn

> **tokenIn**: `string`

Defined in: [packages/core/src/types.ts:260](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L260)

#### Inherited from

[`SwapQuoteRequest`](SwapQuoteRequest.md).[`tokenIn`](SwapQuoteRequest.md#tokenin)

***

### tokenOut

> **tokenOut**: `string`

Defined in: [packages/core/src/types.ts:261](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L261)

#### Inherited from

[`SwapQuoteRequest`](SwapQuoteRequest.md).[`tokenOut`](SwapQuoteRequest.md#tokenout)
