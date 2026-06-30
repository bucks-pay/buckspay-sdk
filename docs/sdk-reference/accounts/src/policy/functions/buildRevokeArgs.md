[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/policy](../README.md) / buildRevokeArgs

# Function: buildRevokeArgs()

> **buildRevokeArgs**(`input`): `ScVal`[]

Defined in: [packages/accounts/src/policy/install.ts:32](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy/install.ts#L32)

Args for the policy account's `remove_signer(session_key: BytesN<32>)` revoke call: `[BytesN(sessionKey)]`.
 Revocation takes effect immediately — a subsequent session-signed call is rejected on-chain.

## Parameters

### input

#### sessionKey

`string`

## Returns

`ScVal`[]
