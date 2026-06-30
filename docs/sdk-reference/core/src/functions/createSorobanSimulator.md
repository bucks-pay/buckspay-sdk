[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / createSorobanSimulator

# Function: createSorobanSimulator()

> **createSorobanSimulator**(`rpcUrl`, `fetchImpl?`, `simSource?`): [`SorobanSimulator`](../interfaces/SorobanSimulator.md)

Defined in: [packages/core/src/soroban-rpc.ts:45](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/soroban-rpc.ts#L45)

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
