---
title: "Interface: FacilitatorOptions"
---

# Interface: FacilitatorOptions

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:29](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/relayer/src/buckspay-facilitator/facilitator.ts#L29)

## Properties

### apiKey?

> `optional` **apiKey?**: `string`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:31](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/relayer/src/buckspay-facilitator/facilitator.ts#L31)

***

### network

> **network**: [`Network`](/sdk-reference/nextjs/src/type-aliases/Network)

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:32](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/relayer/src/buckspay-facilitator/facilitator.ts#L32)

***

### swapChain?

> `optional` **swapChain?**: `SwapChain`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:35](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/relayer/src/buckspay-facilitator/facilitator.ts#L35)

STRETCH: the EVM chain for the facilitator's /swap/* rail. When set, the relayer exposes
 quoteSwap/swap; when absent both are omitted (BuckspayClient.swap fails closed).

***

### url

> **url**: `string`

Defined in: [packages/relayer/src/buckspay-facilitator/facilitator.ts:30](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/relayer/src/buckspay-facilitator/facilitator.ts#L30)
