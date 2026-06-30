---
title: "Function: deserializeSession()"
---

# Function: deserializeSession()

> **deserializeSession**(`blob`, `now?`): [`Session`](/sdk-reference/core/src/interfaces/Session)

Defined in: [packages/core/src/session.ts:49](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session.ts#L49)

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

[`Session`](/sdk-reference/core/src/interfaces/Session)
