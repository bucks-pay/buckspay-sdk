[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / BuckspayClient

# Class: BuckspayClient

Defined in: [packages/core/src/client.ts:40](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L40)

## Constructors

### Constructor

> **new BuckspayClient**(`config`, `sim?`): `BuckspayClient`

Defined in: [packages/core/src/client.ts:46](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L46)

#### Parameters

##### config

[`BuckspayConfig`](../interfaces/BuckspayConfig.md)

##### sim?

[`AccountSimContext`](../interfaces/AccountSimContext.md)

#### Returns

`BuckspayClient`

## Methods

### connect()

> **connect**(): `Promise`\<[`BuckspayWallet`](../interfaces/BuckspayWallet.md)\>

Defined in: [packages/core/src/client.ts:52](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L52)

#### Returns

`Promise`\<[`BuckspayWallet`](../interfaces/BuckspayWallet.md)\>

***

### getAccountState()

> **getAccountState**(`address?`): `Promise`\<[`AccountState`](../interfaces/AccountState.md)\>

Defined in: [packages/core/src/client.ts:64](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L64)

#### Parameters

##### address?

`string`

#### Returns

`Promise`\<[`AccountState`](../interfaces/AccountState.md)\>

***

### pay()

> **pay**(`calls`): `Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

Defined in: [packages/core/src/client.ts:173](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L173)

#### Parameters

##### calls

[`Call`](../interfaces/Call.md)[]

#### Returns

`Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

***

### prepare()

> **prepare**(`calls`): `Promise`\<[`PreparedIntent`](../interfaces/PreparedIntent.md)\>

Defined in: [packages/core/src/client.ts:88](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L88)

#### Parameters

##### calls

[`Call`](../interfaces/Call.md)[]

#### Returns

`Promise`\<[`PreparedIntent`](../interfaces/PreparedIntent.md)\>

***

### send()

> **send**(`signed`): `Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

Defined in: [packages/core/src/client.ts:162](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L162)

#### Parameters

##### signed

[`SignedIntent`](../interfaces/SignedIntent.md)

#### Returns

`Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

***

### sign()

> **sign**(`intent`): `Promise`\<[`SignedIntent`](../interfaces/SignedIntent.md)\>

Defined in: [packages/core/src/client.ts:134](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L134)

#### Parameters

##### intent

[`PreparedIntent`](../interfaces/PreparedIntent.md)

#### Returns

`Promise`\<[`SignedIntent`](../interfaces/SignedIntent.md)\>

***

### transfer()

> **transfer**(`opts`): [`Call`](../interfaces/Call.md)

Defined in: [packages/core/src/client.ts:72](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/client.ts#L72)

#### Parameters

##### opts

###### amount

`string` \| `bigint`

###### to

`string`

###### token

`string`

#### Returns

[`Call`](../interfaces/Call.md)
