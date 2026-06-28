[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SorobanSimulator

# Interface: SorobanSimulator

Defined in: [packages/core/src/auth-entry-builder.ts:121](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/auth-entry-builder.ts#L121)

Narrow port over `rpc.Server.simulateTransaction`. Supplied by the account adapter.

## Methods

### simulate()

> **simulate**(`input`): `Promise`\<[`SorobanSimulateRaw`](SorobanSimulateRaw.md)\>

Defined in: [packages/core/src/auth-entry-builder.ts:122](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/auth-entry-builder.ts#L122)

#### Parameters

##### input

###### call

[`Call`](Call.md)

###### from

`string`

###### network

[`Network`](../type-aliases/Network.md)

#### Returns

`Promise`\<[`SorobanSimulateRaw`](SorobanSimulateRaw.md)\>
