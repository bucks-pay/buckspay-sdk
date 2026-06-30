[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / createBuckspayConfig

# Function: createBuckspayConfig()

> **createBuckspayConfig**(`config`, `sim?`): `object`

Defined in: [packages/core/src/config.ts:32](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/config.ts#L32)

Wrap a client so each method drives a vanilla store status machine. The
wrapper re-throws after recording the error, so callers still `try/catch`.

## Parameters

### config

[`BuckspayConfig`](../interfaces/BuckspayConfig.md)

### sim?

[`AccountSimContext`](../interfaces/AccountSimContext.md)

## Returns

`object`

### client

> **client**: [`BuckspayClient`](../classes/BuckspayClient.md)

### store

> **store**: `StoreApi`\<[`BuckspayState`](../interfaces/BuckspayState.md)\>
