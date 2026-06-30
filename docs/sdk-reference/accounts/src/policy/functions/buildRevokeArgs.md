[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/policy](../README.md) / buildRevokeArgs

# Function: buildRevokeArgs()

> **buildRevokeArgs**(`input`): `ScVal`[]

Defined in: [packages/accounts/src/policy/install.ts:32](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/policy/install.ts#L32)

Args for the policy account's `remove_signer(session_key: BytesN<32>)` revoke call: `[BytesN(sessionKey)]`.
 Revocation takes effect immediately - a subsequent session-signed call is rejected on-chain.

## Parameters

### input

#### sessionKey

`string`

## Returns

`ScVal`[]
