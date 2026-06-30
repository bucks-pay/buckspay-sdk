[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / sessionId

# Function: sessionId()

> **sessionId**(`input`): `string`

Defined in: [packages/core/src/session.ts:10](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session.ts#L10)

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
