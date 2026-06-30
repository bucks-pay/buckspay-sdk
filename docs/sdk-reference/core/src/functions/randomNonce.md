---
title: "Function: randomNonce()"
---

# Function: randomNonce()

> **randomNonce**(): `bigint`

Defined in: [packages/core/src/auth-entry-builder.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/auth-entry-builder.ts#L24)

Crypto-random nonce capped to 52 bits. Ported from dashboard sign.ts.
The facilitator does `Number(nonce)`; values > 2^53 lose precision, so we
mask to 52 bits to stay inside the IEEE-754 safe-integer range.

## Returns

`bigint`
