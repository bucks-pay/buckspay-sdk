[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / BuckspayClient

# Class: BuckspayClient

Defined in: [packages/core/src/client.ts:50](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L50)

## Constructors

### Constructor

> **new BuckspayClient**(`config`, `sim?`, `opts?`): `BuckspayClient`

Defined in: [packages/core/src/client.ts:58](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L58)

#### Parameters

##### config

[`BuckspayConfig`](../interfaces/BuckspayConfig.md)

##### sim?

[`AccountSimContext`](../interfaces/AccountSimContext.md)

##### opts?

###### now?

() => `number`

#### Returns

`BuckspayClient`

## Methods

### connect()

> **connect**(): `Promise`\<[`BuckspayWallet`](../interfaces/BuckspayWallet.md)\>

Defined in: [packages/core/src/client.ts:73](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L73)

#### Returns

`Promise`\<[`BuckspayWallet`](../interfaces/BuckspayWallet.md)\>

***

### getAccountState()

> **getAccountState**(`address?`): `Promise`\<[`AccountState`](../interfaces/AccountState.md)\>

Defined in: [packages/core/src/client.ts:85](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L85)

#### Parameters

##### address?

`string`

#### Returns

`Promise`\<[`AccountState`](../interfaces/AccountState.md)\>

***

### grantSession()

> **grantSession**(`grant`): `Promise`\<\{ `receipt`: [`Receipt`](../interfaces/Receipt.md); `session`: [`Session`](../interfaces/Session.md); \}\>

Defined in: [packages/core/src/client.ts:341](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L341)

Grant a policy-scoped session key (contract account model only; throws INVALID_CONFIG on classic).
 The root signer authorizes the install once; thereafter the session key transacts within its
 on-chain policies (spend limit + allowlist) without per-action root prompts.

#### Parameters

##### grant

[`SessionGrant`](../interfaces/SessionGrant.md)

#### Returns

`Promise`\<\{ `receipt`: [`Receipt`](../interfaces/Receipt.md); `session`: [`Session`](../interfaces/Session.md); \}\>

***

### pay()

> **pay**(`calls`): `Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

Defined in: [packages/core/src/client.ts:262](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L262)

#### Parameters

##### calls

[`Call`](../interfaces/Call.md)[]

#### Returns

`Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

***

### prepare()

> **prepare**(`calls`): `Promise`\<[`PreparedIntent`](../interfaces/PreparedIntent.md)\>

Defined in: [packages/core/src/client.ts:109](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L109)

#### Parameters

##### calls

[`Call`](../interfaces/Call.md)[]

#### Returns

`Promise`\<[`PreparedIntent`](../interfaces/PreparedIntent.md)\>

***

### quoteSwap()

> **quoteSwap**(`opts`): `Promise`\<[`SwapQuote`](../interfaces/SwapQuote.md)\>

Defined in: [packages/core/src/client.ts:269](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L269)

STRETCH: quote a gasless swap via the relayer's /swap/* rail. README §4.9.

#### Parameters

##### opts

###### amount

`string` \| `bigint`

###### tokenIn

`string`

###### tokenOut

`string`

#### Returns

`Promise`\<[`SwapQuote`](../interfaces/SwapQuote.md)\>

***

### revokeSession()

> **revokeSession**(`session`): `Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

Defined in: [packages/core/src/client.ts:347](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L347)

Revoke a granted session by its object or id (contract account model only). Takes effect
 immediately on-chain - the session key no longer authorizes anything.

#### Parameters

##### session

`string` \| [`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

***

### send()

> **send**(`signed`): `Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

Defined in: [packages/core/src/client.ts:251](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L251)

#### Parameters

##### signed

[`SignedIntent`](../interfaces/SignedIntent.md)

#### Returns

`Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

***

### sendCalls()

> **sendCalls**(`calls`): `Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

Defined in: [packages/core/src/client.ts:354](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L354)

EIP-5792-style alias of pay(calls): submit an atomic, all-or-nothing batch. Enforces the
 MAX_BATCH_CALLS ceiling up front so an over-cap batch fails before any simulation or signing.
 A single call behaves exactly like pay([call]).

#### Parameters

##### calls

[`Call`](../interfaces/Call.md)[]

#### Returns

`Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

***

### sign()

> **sign**(`intent`): `Promise`\<[`SignedIntent`](../interfaces/SignedIntent.md)\>

Defined in: [packages/core/src/client.ts:217](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L217)

#### Parameters

##### intent

[`PreparedIntent`](../interfaces/PreparedIntent.md)

#### Returns

`Promise`\<[`SignedIntent`](../interfaces/SignedIntent.md)\>

***

### swap()

> **swap**(`opts`): `Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

Defined in: [packages/core/src/client.ts:287](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L287)

STRETCH: execute a gasless swap. Enforces the minOut floor BEFORE submit. README §4.9.

#### Parameters

##### opts

###### amount

`string` \| `bigint`

###### minOut?

`string`

###### tokenIn

`string`

###### tokenOut

`string`

#### Returns

`Promise`\<[`Receipt`](../interfaces/Receipt.md)\>

***

### transfer()

> **transfer**(`opts`): [`Call`](../interfaces/Call.md)

Defined in: [packages/core/src/client.ts:93](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L93)

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
