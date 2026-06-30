[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / sessionId

# Function: sessionId()

> **sessionId**(`input`): `string`

Defined in: [packages/core/src/session.ts:10](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session.ts#L10)

Deterministic session id over (account, sessionKey, expiresAt). Uses the stellar-sdk's isomorphic
`hash` (sha256) so it is identical in the browser, React Native, and Node. Pure: no clock.

## Parameters

### input

#### account

`string`

#### expiresAt

`number`

#### sessionKey

`string`

## Returns

`string`
