[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / randomNonce

# Function: randomNonce()

> **randomNonce**(): `bigint`

Defined in: [packages/core/src/auth-entry-builder.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/auth-entry-builder.ts#L24)

Crypto-random nonce capped to 52 bits. Ported from dashboard sign.ts.
The facilitator does `Number(nonce)`; values > 2^53 lose precision, so we
mask to 52 bits to stay inside the IEEE-754 safe-integer range.

## Returns

`bigint`
