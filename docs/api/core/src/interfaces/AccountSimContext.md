[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / AccountSimContext

# Interface: AccountSimContext

Defined in: [packages/core/src/client.ts:26](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L26)

Capabilities the client needs to `prepare` an intent: a recording simulator
and a current-ledger source. The adapter supplies the real RPC-backed pair on
the account adapter wiring; tests inject a deterministic context.

## Properties

### getLatestLedger

> **getLatestLedger**: () => `Promise`\<`number`\>

Defined in: [packages/core/src/client.ts:28](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L28)

#### Returns

`Promise`\<`number`\>

***

### randomNonce?

> `optional` **randomNonce?**: () => `bigint`

Defined in: [packages/core/src/client.ts:29](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L29)

#### Returns

`bigint`

***

### simulator

> **simulator**: [`SorobanSimulator`](SorobanSimulator.md)

Defined in: [packages/core/src/client.ts:27](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L27)
