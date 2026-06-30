[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/policy](../README.md) / spendLimit

# Function: spendLimit()

> **spendLimit**(`opts`): [`SessionPolicy`](../type-aliases/SessionPolicy.md)

Defined in: [packages/accounts/src/policy/compile.ts:12](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy/compile.ts#L12)

Build a `spendLimit` session policy. `max` is coerced to a decimal string of token base units
(USDC = 7 decimals); `period` defaults to "day". This is the shape `SessionManager` consumes and the
one the on-chain policy account enforces in `__check_auth`.

## Parameters

### opts

#### max

`string` \| `bigint`

#### period?

`"day"` \| `"week"` \| `"month"` \| `"total"`

#### token

`string`

## Returns

[`SessionPolicy`](../type-aliases/SessionPolicy.md)
