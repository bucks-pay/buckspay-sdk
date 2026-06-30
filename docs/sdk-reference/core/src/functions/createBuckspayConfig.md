---
title: "Function: createBuckspayConfig()"
---

# Function: createBuckspayConfig()

> **createBuckspayConfig**(`config`, `sim?`): `object`

Defined in: [packages/core/src/config.ts:32](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/config.ts#L32)

Wrap a client so each method drives a vanilla store status machine. The
wrapper re-throws after recording the error, so callers still `try/catch`.

## Parameters

### config

[`BuckspayConfig`](/sdk-reference/core/src/interfaces/BuckspayConfig)

### sim?

[`AccountSimContext`](/sdk-reference/core/src/interfaces/AccountSimContext)

## Returns

`object`

### client

> **client**: [`BuckspayClient`](/sdk-reference/core/src/classes/BuckspayClient)

### store

> **store**: `StoreApi`\<[`BuckspayState`](/sdk-reference/core/src/interfaces/BuckspayState)\>
