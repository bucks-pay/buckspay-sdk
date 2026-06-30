---
title: "Interface: SessionInstallInput"
---

# Interface: SessionInstallInput

Defined in: [packages/core/src/types.ts:97](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L97)

Input to build the unsigned session-install entry (contract account model). The session's
 on-chain expiry is derived from `grant.expiresAt`.

## Properties

### from

> **from**: `string`

Defined in: [packages/core/src/types.ts:98](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L98)

***

### grant

> **grant**: [`SessionGrant`](/sdk-reference/core/src/interfaces/SessionGrant)

Defined in: [packages/core/src/types.ts:99](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L99)

***

### nonce

> **nonce**: `bigint`

Defined in: [packages/core/src/types.ts:100](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L100)
