[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / Receipt

# Interface: Receipt

Defined in: [packages/core/src/types.ts:159](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L159)

EXACT shape of facilitator /relay response (soroban). The relayer adapter maps
 the facilitator's `blockNumber` (string) onto `ledger`.

## Properties

### chain

> **chain**: [`FacilitatorChain`](../type-aliases/FacilitatorChain.md) \| [`SwapChain`](../type-aliases/SwapChain.md)

Defined in: [packages/core/src/types.ts:165](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L165)

***

### ledger?

> `optional` **ledger?**: `number`

Defined in: [packages/core/src/types.ts:167](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L167)

***

### ok

> **ok**: `boolean`

Defined in: [packages/core/src/types.ts:160](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L160)

***

### status

> **status**: `string`

Defined in: [packages/core/src/types.ts:168](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L168)

***

### token

> **token**: `string`

Defined in: [packages/core/src/types.ts:162](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L162)

***

### transferTx

> **transferTx**: `string`

Defined in: [packages/core/src/types.ts:166](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L166)

***

### via

> **via**: `string`

Defined in: [packages/core/src/types.ts:161](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L161)
