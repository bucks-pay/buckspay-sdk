---
title: "Variable: MAX_BATCH_CALLS"
---

# Variable: MAX\_BATCH\_CALLS

> `const` **MAX\_BATCH\_CALLS**: `16` = `16`

Defined in: [packages/core/src/batch.ts:8](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/batch.ts#L8)

Atomic-batch ceiling, set by the multicall constraints (classic op-limit /
contract Multicall resource budget). `build()` refuses to exceed it - fail closed.
