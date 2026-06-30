[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SorobanSimulator

# Interface: SorobanSimulator

Defined in: [packages/core/src/auth-entry-builder.ts:180](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/auth-entry-builder.ts#L180)

Narrow port over `rpc.Server.simulateTransaction`. Supplied by the account adapter.

## Methods

### simulate()

> **simulate**(`input`): `Promise`\<[`SorobanSimulateRaw`](SorobanSimulateRaw.md)\>

Defined in: [packages/core/src/auth-entry-builder.ts:181](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/auth-entry-builder.ts#L181)

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
