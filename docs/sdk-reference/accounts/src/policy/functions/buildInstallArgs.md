[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/policy](../README.md) / buildInstallArgs

# Function: buildInstallArgs()

> **buildInstallArgs**(`input`): `ScVal`[]

Defined in: [packages/accounts/src/policy/install.ts:22](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy/install.ts#L22)

Args for the policy account's `add_signer(session_key: BytesN<32>, policy: Policy)` install call:
`[BytesN(sessionKey), <compiled Policy struct>]`. `sessionKey` is the session signer's ed25519
G-address; `expiresAt` is the session's on-chain expiry (ledger timestamp, seconds). Refuses an
unbounded session (no spend limit / empty allowlist) via `compilePolicies`.

## Parameters

### input

#### expiresAt

`number` \| `bigint`

#### policies

[`SessionPolicy`](../type-aliases/SessionPolicy.md)[]

#### sessionKey

`string`

## Returns

`ScVal`[]
