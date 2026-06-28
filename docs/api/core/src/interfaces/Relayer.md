[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / Relayer

# Interface: Relayer

Defined in: [packages/core/src/types.ts:119](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L119)

## Methods

### buildOnboard()

> **buildOnboard**(`input`): `Promise`\<\{ `xdr`: `string`; \}\>

Defined in: [packages/core/src/types.ts:122](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L122)

#### Parameters

##### input

###### publicKey

`string`

#### Returns

`Promise`\<\{ `xdr`: `string`; \}\>

***

### deployContract()

> **deployContract**(`input`): `Promise`\<\{ `address`: `string`; \}\>

Defined in: [packages/core/src/types.ts:124](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L124)

#### Parameters

##### input

###### passkeyPublicKey

`string`

#### Returns

`Promise`\<\{ `address`: `string`; \}\>

***

### getAccountState()

> **getAccountState**(`address`): `Promise`\<[`AccountState`](AccountState.md)\>

Defined in: [packages/core/src/types.ts:121](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L121)

#### Parameters

##### address

`string`

#### Returns

`Promise`\<[`AccountState`](AccountState.md)\>

***

### relay()

> **relay**(`payload`): `Promise`\<[`Receipt`](Receipt.md)\>

Defined in: [packages/core/src/types.ts:120](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L120)

#### Parameters

##### payload

[`RelayPayload`](RelayPayload.md)

#### Returns

`Promise`\<[`Receipt`](Receipt.md)\>

***

### submitOnboard()

> **submitOnboard**(`input`): `Promise`\<\{ `ok`: `boolean`; \}\>

Defined in: [packages/core/src/types.ts:123](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L123)

#### Parameters

##### input

###### publicKey

`string`

###### signedTxXdr

`string`

#### Returns

`Promise`\<\{ `ok`: `boolean`; \}\>
