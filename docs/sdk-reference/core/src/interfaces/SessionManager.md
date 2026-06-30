---
title: "Interface: SessionManager"
---

# Interface: SessionManager

Defined in: [packages/core/src/types.ts:303](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L303)

Grant / revoke policy-scoped session keys on a contract account.

## Methods

### grantSession()

> **grantSession**(`grant`): `Promise`\<\{ `receipt`: [`Receipt`](/sdk-reference/core/src/interfaces/Receipt); `session`: [`Session`](/sdk-reference/core/src/interfaces/Session); \}\>

Defined in: [packages/core/src/types.ts:304](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L304)

#### Parameters

##### grant

[`SessionGrant`](/sdk-reference/core/src/interfaces/SessionGrant)

#### Returns

`Promise`\<\{ `receipt`: [`Receipt`](/sdk-reference/core/src/interfaces/Receipt); `session`: [`Session`](/sdk-reference/core/src/interfaces/Session); \}\>

***

### revokeSession()

> **revokeSession**(`session`): `Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

Defined in: [packages/core/src/types.ts:305](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L305)

#### Parameters

##### session

`string` \| [`Session`](/sdk-reference/core/src/interfaces/Session)

#### Returns

`Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>
