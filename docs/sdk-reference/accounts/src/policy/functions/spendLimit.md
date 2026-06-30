---
title: "Function: spendLimit()"
---

# Function: spendLimit()

> **spendLimit**(`opts`): [`SessionPolicy`](/sdk-reference/accounts/src/policy/type-aliases/SessionPolicy)

Defined in: [packages/accounts/src/policy/compile.ts:12](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/policy/compile.ts#L12)

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

[`SessionPolicy`](/sdk-reference/accounts/src/policy/type-aliases/SessionPolicy)
