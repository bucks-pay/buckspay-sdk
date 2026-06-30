[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / mainnetSimContext

# Function: mainnetSimContext()

> **mainnetSimContext**(`rpcUrl`, `deps`): [`AccountSimContext`](../interfaces/AccountSimContext.md)

Defined in: [packages/core/src/soroban-rpc.ts:152](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/soroban-rpc.ts#L152)

Mainnet (pubnet) sim-context preset. The **contract/passkey** account model's
recording sim must be framed by a funded, existing G-address - the facilitator
sponsor's PUBLIC key - because a C-address can't frame a transaction and a
throwaway source resolves the SAC balance footprint to zero (see
`createSorobanSimulator`). This convenience forces that `simSource` so a pubnet
caller can never omit it; it is otherwise `createRpcSimContext` unchanged.

`sponsorAddress` is PUBLIC (a `G...`); the SDK never holds the sponsor secret.
The classic model also works through this (its `from` is already a real G, so
the simSource is simply unused).

## Parameters

### rpcUrl

`string`

### deps

#### fetchImpl?

[`RpcFetch`](../type-aliases/RpcFetch.md)

#### randomNonce?

() => `bigint`

#### sponsorAddress

`string`

## Returns

[`AccountSimContext`](../interfaces/AccountSimContext.md)
