---
title: "Interface: Receipt"
---

# Interface: Receipt

Defined in: [packages/core/src/types.ts:159](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L159)

EXACT shape of facilitator /relay response (soroban). The relayer adapter maps
 the facilitator's `blockNumber` (string) onto `ledger`.

## Properties

### chain

> **chain**: [`FacilitatorChain`](/sdk-reference/core/src/type-aliases/FacilitatorChain) \| [`SwapChain`](/sdk-reference/core/src/type-aliases/SwapChain)

Defined in: [packages/core/src/types.ts:165](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L165)

***

### ledger?

> `optional` **ledger?**: `number`

Defined in: [packages/core/src/types.ts:167](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L167)

***

### ok

> **ok**: `boolean`

Defined in: [packages/core/src/types.ts:160](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L160)

***

### status

> **status**: `string`

Defined in: [packages/core/src/types.ts:168](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L168)

***

### token

> **token**: `string`

Defined in: [packages/core/src/types.ts:162](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L162)

***

### transferTx

> **transferTx**: `string`

Defined in: [packages/core/src/types.ts:166](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L166)

***

### via

> **via**: `string`

Defined in: [packages/core/src/types.ts:161](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L161)
