[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / createSorobanSimulator

# Function: createSorobanSimulator()

> **createSorobanSimulator**(`rpcUrl`, `fetchImpl?`, `simSource?`): [`SorobanSimulator`](../interfaces/SorobanSimulator.md)

Defined in: [packages/core/src/soroban-rpc.ts:45](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/soroban-rpc.ts#L45)

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

### simSource?

`string`

## Returns

[`SorobanSimulator`](../interfaces/SorobanSimulator.md)
