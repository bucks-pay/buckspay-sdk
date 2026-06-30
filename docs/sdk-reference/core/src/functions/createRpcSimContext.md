[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / createRpcSimContext

# Function: createRpcSimContext()

> **createRpcSimContext**(`rpcUrl`, `deps?`): [`AccountSimContext`](../interfaces/AccountSimContext.md)

Defined in: [packages/core/src/soroban-rpc.ts:129](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/soroban-rpc.ts#L129)

Build the `AccountSimContext` the `BuckspayClient` needs to `prepare`: an
RPC-backed recording simulator + a current-ledger source, both pointed at the
same Soroban RPC. Pass it as the second argument to `createBuckspayClient` /
`createBuckspayConfig`.

For the **contract/passkey** account model, pass `deps.simSource` - a funded,
existing G-address (the facilitator sponsor's public key). A C-address can't
frame a transaction, and the recording sim must run against an account that
exists on-chain or the SAC balance footprint resolves to zero. The classic
model needs no `simSource` (its `from` is already a real G-address).

## Parameters

### rpcUrl

`string`

### deps?

#### fetchImpl?

[`RpcFetch`](../type-aliases/RpcFetch.md)

#### randomNonce?

() => `bigint`

#### simSource?

`string`

## Returns

[`AccountSimContext`](../interfaces/AccountSimContext.md)
