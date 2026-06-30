[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / getLatestLedger

# Function: getLatestLedger()

> **getLatestLedger**(`rpcUrl`, `fetchImpl?`): `Promise`\<`number`\>

Defined in: [packages/core/src/auth-entry-builder.ts:146](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/auth-entry-builder.ts#L146)

Fetch the current Soroban ledger sequence via JSON-RPC. The RPC response is
zod-validated before use; transport and protocol errors are mapped onto
BuckspayError codes (never thrown raw). `fetchImpl` is injectable for tests.

## Parameters

### rpcUrl

`string`

### fetchImpl?

[`RpcFetch`](../type-aliases/RpcFetch.md) = `fetch`

## Returns

`Promise`\<`number`\>
