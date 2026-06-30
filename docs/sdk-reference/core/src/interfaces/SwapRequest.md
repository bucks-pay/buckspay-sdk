---
title: "Interface: SwapRequest"
---

# Interface: SwapRequest

Defined in: [packages/core/src/types.ts:264](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L264)

Normalized swap request the client hands the relayer adapter (the connected wallet is the payer).

## Extends

- [`SwapQuoteRequest`](/sdk-reference/core/src/interfaces/SwapQuoteRequest)

## Properties

### amount

> **amount**: `string`

Defined in: [packages/core/src/types.ts:262](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L262)

#### Inherited from

[`SwapQuoteRequest`](/sdk-reference/core/src/interfaces/SwapQuoteRequest).[`amount`](/sdk-reference/core/src/interfaces/SwapQuoteRequest#amount)

***

### minOut?

> `optional` **minOut?**: `string`

Defined in: [packages/core/src/types.ts:265](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L265)

***

### payer

> **payer**: `string`

Defined in: [packages/core/src/types.ts:259](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L259)

#### Inherited from

[`SwapQuoteRequest`](/sdk-reference/core/src/interfaces/SwapQuoteRequest).[`payer`](/sdk-reference/core/src/interfaces/SwapQuoteRequest#payer)

***

### tokenIn

> **tokenIn**: `string`

Defined in: [packages/core/src/types.ts:260](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L260)

#### Inherited from

[`SwapQuoteRequest`](/sdk-reference/core/src/interfaces/SwapQuoteRequest).[`tokenIn`](/sdk-reference/core/src/interfaces/SwapQuoteRequest#tokenin)

***

### tokenOut

> **tokenOut**: `string`

Defined in: [packages/core/src/types.ts:261](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L261)

#### Inherited from

[`SwapQuoteRequest`](/sdk-reference/core/src/interfaces/SwapQuoteRequest).[`tokenOut`](/sdk-reference/core/src/interfaces/SwapQuoteRequest#tokenout)
