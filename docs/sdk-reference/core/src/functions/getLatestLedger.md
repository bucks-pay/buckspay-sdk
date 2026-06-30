[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / getLatestLedger

# Function: getLatestLedger()

> **getLatestLedger**(`rpcUrl`, `fetchImpl?`): `Promise`\<`number`\>

Defined in: [packages/core/src/auth-entry-builder.ts:146](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/auth-entry-builder.ts#L146)

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
