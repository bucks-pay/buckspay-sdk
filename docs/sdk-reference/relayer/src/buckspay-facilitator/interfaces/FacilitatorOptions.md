[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [relayer/src/buckspay-facilitator](../README.md) / FacilitatorOptions

# Interface: FacilitatorOptions

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:29](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/relayer/src/buckspay-facilitator/facilitator.ts#L29)

## Properties

### apiKey?

> `optional` **apiKey?**: `string`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:31](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/relayer/src/buckspay-facilitator/facilitator.ts#L31)

***

### network

> **network**: [`Network`](../../../../nextjs/src/type-aliases/Network.md)

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:32](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/relayer/src/buckspay-facilitator/facilitator.ts#L32)

***

### swapChain?

> `optional` **swapChain?**: `SwapChain`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:35](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/relayer/src/buckspay-facilitator/facilitator.ts#L35)

STRETCH: the EVM chain for the facilitator's /swap/* rail. When set, the relayer exposes
 quoteSwap/swap; when absent both are omitted (BuckspayClient.swap fails closed).

***

### url

> **url**: `string`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:30](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/relayer/src/buckspay-facilitator/facilitator.ts#L30)
