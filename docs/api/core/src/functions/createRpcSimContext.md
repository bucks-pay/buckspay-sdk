[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / createRpcSimContext

# Function: createRpcSimContext()

> **createRpcSimContext**(`rpcUrl`, `deps?`): [`AccountSimContext`](../interfaces/AccountSimContext.md)

Defined in: [packages/core/src/soroban-rpc.ts:102](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/soroban-rpc.ts#L102)

Build the `AccountSimContext` the `BuckspayClient` needs to `prepare`: an
RPC-backed recording simulator + a current-ledger source, both pointed at the
same Soroban RPC. Pass it as the second argument to `createBuckspayClient` /
`createBuckspayConfig`.

## Parameters

### rpcUrl

`string`

### deps?

#### fetchImpl?

[`RpcFetch`](../type-aliases/RpcFetch.md)

#### randomNonce?

() => `bigint`

## Returns

[`AccountSimContext`](../interfaces/AccountSimContext.md)
