[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / MAX\_BATCH\_CALLS

# Variable: MAX\_BATCH\_CALLS

> `const` **MAX\_BATCH\_CALLS**: `16` = `16`

Defined in: [packages/core/src/batch.ts:8](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/batch.ts#L8)

Atomic-batch ceiling, set by the multicall constraints (classic op-limit /
contract Multicall resource budget). `build()` refuses to exceed it — fail closed.
