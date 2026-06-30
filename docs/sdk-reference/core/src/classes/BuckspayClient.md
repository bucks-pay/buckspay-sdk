---
title: "Class: BuckspayClient"
---

# Class: BuckspayClient

Defined in: [packages/core/src/client.ts:50](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L50)

## Constructors

### Constructor

> **new BuckspayClient**(`config`, `sim?`, `opts?`): `BuckspayClient`

Defined in: [packages/core/src/client.ts:58](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L58)

#### Parameters

##### config

[`BuckspayConfig`](/sdk-reference/core/src/interfaces/BuckspayConfig)

##### sim?

[`AccountSimContext`](/sdk-reference/core/src/interfaces/AccountSimContext)

##### opts?

###### now?

() => `number`

#### Returns

`BuckspayClient`

## Methods

### connect()

> **connect**(): `Promise`\<[`BuckspayWallet`](/sdk-reference/core/src/interfaces/BuckspayWallet)\>

Defined in: [packages/core/src/client.ts:73](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L73)

#### Returns

`Promise`\<[`BuckspayWallet`](/sdk-reference/core/src/interfaces/BuckspayWallet)\>

***

### getAccountState()

> **getAccountState**(`address?`): `Promise`\<[`AccountState`](/sdk-reference/core/src/interfaces/AccountState)\>

Defined in: [packages/core/src/client.ts:85](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L85)

#### Parameters

##### address?

`string`

#### Returns

`Promise`\<[`AccountState`](/sdk-reference/core/src/interfaces/AccountState)\>

***

### grantSession()

> **grantSession**(`grant`): `Promise`\<\{ `receipt`: [`Receipt`](/sdk-reference/core/src/interfaces/Receipt); `session`: [`Session`](/sdk-reference/core/src/interfaces/Session); \}\>

Defined in: [packages/core/src/client.ts:341](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L341)

Grant a policy-scoped session key (contract account model only; throws INVALID_CONFIG on classic).
 The root signer authorizes the install once; thereafter the session key transacts within its
 on-chain policies (spend limit + allowlist) without per-action root prompts.

#### Parameters

##### grant

[`SessionGrant`](/sdk-reference/core/src/interfaces/SessionGrant)

#### Returns

`Promise`\<\{ `receipt`: [`Receipt`](/sdk-reference/core/src/interfaces/Receipt); `session`: [`Session`](/sdk-reference/core/src/interfaces/Session); \}\>

***

### pay()

> **pay**(`calls`): `Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

Defined in: [packages/core/src/client.ts:262](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L262)

#### Parameters

##### calls

[`Call`](/sdk-reference/core/src/interfaces/Call)[]

#### Returns

`Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

***

### prepare()

> **prepare**(`calls`): `Promise`\<[`PreparedIntent`](/sdk-reference/core/src/interfaces/PreparedIntent)\>

Defined in: [packages/core/src/client.ts:109](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L109)

#### Parameters

##### calls

[`Call`](/sdk-reference/core/src/interfaces/Call)[]

#### Returns

`Promise`\<[`PreparedIntent`](/sdk-reference/core/src/interfaces/PreparedIntent)\>

***

### quoteSwap()

> **quoteSwap**(`opts`): `Promise`\<[`SwapQuote`](/sdk-reference/core/src/interfaces/SwapQuote)\>

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

`Promise`\<[`SwapQuote`](/sdk-reference/core/src/interfaces/SwapQuote)\>

***

### revokeSession()

> **revokeSession**(`session`): `Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

Defined in: [packages/core/src/client.ts:347](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L347)

Revoke a granted session by its object or id (contract account model only). Takes effect
 immediately on-chain - the session key no longer authorizes anything.

#### Parameters

##### session

`string` \| [`Session`](/sdk-reference/core/src/interfaces/Session)

#### Returns

`Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

***

### send()

> **send**(`signed`): `Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

Defined in: [packages/core/src/client.ts:251](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L251)

#### Parameters

##### signed

[`SignedIntent`](/sdk-reference/core/src/interfaces/SignedIntent)

#### Returns

`Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

***

### sendCalls()

> **sendCalls**(`calls`): `Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

Defined in: [packages/core/src/client.ts:354](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L354)

EIP-5792-style alias of pay(calls): submit an atomic, all-or-nothing batch. Enforces the
 MAX_BATCH_CALLS ceiling up front so an over-cap batch fails before any simulation or signing.
 A single call behaves exactly like pay([call]).

#### Parameters

##### calls

[`Call`](/sdk-reference/core/src/interfaces/Call)[]

#### Returns

`Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

***

### sign()

> **sign**(`intent`): `Promise`\<[`SignedIntent`](/sdk-reference/core/src/interfaces/SignedIntent)\>

Defined in: [packages/core/src/client.ts:217](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/client.ts#L217)

#### Parameters

##### intent

[`PreparedIntent`](/sdk-reference/core/src/interfaces/PreparedIntent)

#### Returns

`Promise`\<[`SignedIntent`](/sdk-reference/core/src/interfaces/SignedIntent)\>

***

### swap()

> **swap**(`opts`): `Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

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

`Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

***

### transfer()

> **transfer**(`opts`): [`Call`](/sdk-reference/core/src/interfaces/Call)

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

[`Call`](/sdk-reference/core/src/interfaces/Call)
