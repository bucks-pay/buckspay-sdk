[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SessionManager

# Interface: SessionManager

Defined in: [packages/core/src/types.ts:303](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L303)

Grant / revoke policy-scoped session keys on a contract account.

## Methods

### grantSession()

> **grantSession**(`grant`): `Promise`\<\{ `receipt`: [`Receipt`](Receipt.md); `session`: [`Session`](Session.md); \}\>

Defined in: [packages/core/src/types.ts:304](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L304)

#### Parameters

##### grant

[`SessionGrant`](SessionGrant.md)

#### Returns

`Promise`\<\{ `receipt`: [`Receipt`](Receipt.md); `session`: [`Session`](Session.md); \}\>

***

### revokeSession()

> **revokeSession**(`session`): `Promise`\<[`Receipt`](Receipt.md)\>

Defined in: [packages/core/src/types.ts:305](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L305)

#### Parameters

##### session

`string` \| [`Session`](Session.md)

#### Returns

`Promise`\<[`Receipt`](Receipt.md)\>
