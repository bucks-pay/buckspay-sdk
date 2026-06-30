[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / deserializeSession

# Function: deserializeSession()

> **deserializeSession**(`blob`, `now?`): [`Session`](../interfaces/Session.md)

Defined in: [packages/core/src/session.ts:49](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session.ts#L49)

Parse + validate a serialized session and enforce expiry. `now` (epoch ms) is injected so the
expiry check stays deterministic; when omitted it falls back to the host clock at this single
boundary. Throws `SESSION_EXPIRED` if the session is past its `expiresAt`, `INVALID_CONFIG` if the
blob is not a valid serialized session.

## Parameters

### blob

`string`

### now?

`number`

## Returns

[`Session`](../interfaces/Session.md)
