[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SorobanSimulator

# Interface: SorobanSimulator

Defined in: [packages/core/src/auth-entry-builder.ts:180](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/auth-entry-builder.ts#L180)

Narrow port over `rpc.Server.simulateTransaction`. Supplied by the account adapter.

## Methods

### simulate()

> **simulate**(`input`): `Promise`\<[`SorobanSimulateRaw`](SorobanSimulateRaw.md)\>

Defined in: [packages/core/src/auth-entry-builder.ts:181](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/auth-entry-builder.ts#L181)

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
