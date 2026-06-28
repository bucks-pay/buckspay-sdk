[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / createSorobanSimulator

# Function: createSorobanSimulator()

> **createSorobanSimulator**(`rpcUrl`, `fetchImpl?`): [`SorobanSimulator`](../interfaces/SorobanSimulator.md)

Defined in: [packages/core/src/soroban-rpc.ts:45](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/soroban-rpc.ts#L45)

Concrete `SorobanSimulator` backed by a Soroban RPC `simulateTransaction` call.

Builds the contract invocation, runs a **recording** simulation, and returns the
recorded auth entries (base64) + the min resource fee. Raw `fetch` + zod (no
`rpc.Server`/axios) keeps the browser bundle light and mirrors `getLatestLedger`.
A reverting simulation maps to `SIMULATION_FAILED`; transport failure to
`RELAYER_UNREACHABLE`. `fetchImpl` is injectable for tests.

## Parameters

### rpcUrl

`string`

### fetchImpl?

[`RpcFetch`](../type-aliases/RpcFetch.md) = `fetch`

## Returns

[`SorobanSimulator`](../interfaces/SorobanSimulator.md)
