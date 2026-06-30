---
title: "Interface: AccountSimContext"
---

# Interface: AccountSimContext

Defined in: [packages/core/src/client.ts:36](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L36)

Capabilities the client needs to `prepare` an intent: a recording simulator
and a current-ledger source. The account adapter wiring supplies the real
RPC-backed pair; tests inject a deterministic context.

## Properties

### getLatestLedger

> **getLatestLedger**: () => `Promise`\<`number`\>

Defined in: [packages/core/src/client.ts:38](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L38)

#### Returns

`Promise`\<`number`\>

***

### randomNonce?

> `optional` **randomNonce?**: () => `bigint`

Defined in: [packages/core/src/client.ts:39](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L39)

#### Returns

`bigint`

***

### simulator

> **simulator**: [`SorobanSimulator`](/sdk-reference/core/src/interfaces/SorobanSimulator)

Defined in: [packages/core/src/client.ts:37](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L37)
