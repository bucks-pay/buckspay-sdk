[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/policy](../README.md) / compilePolicies

# Function: compilePolicies()

> **compilePolicies**(`policies`, `expiresAt`): `ScVal`

Defined in: [packages/accounts/src/policy/compile.ts:49](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy/compile.ts#L49)

Compile the session policies into the on-chain `Policy` struct the contract account expects — ONE
struct combining the allowlist, spend cap, and expiry. A session MUST carry BOTH a `spendLimit` and a
non-empty `allowlist`: an unbounded delegation (no cap, or no target restriction) is refused, matching
the contract's own `EmptyPolicy` rejection. `expiresAt` is the session's on-chain expiry as a ledger
timestamp in seconds (compared against the ledger clock in `__check_auth`).

The struct's map keys are emitted in canonical sorted order
(`allowlist`, `expiration`, `spend_max`, `spend_period`, `spend_token`); enforcement is on-chain, so
the SDK's only job is to encode these rules exactly — pinned byte-for-byte by a golden test.

## Parameters

### policies

[`SessionPolicy`](../type-aliases/SessionPolicy.md)[]

### expiresAt

`number` \| `bigint`

## Returns

`ScVal`
