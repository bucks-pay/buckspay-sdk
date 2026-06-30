---
title: "Interface: Relayer"
---

# Interface: Relayer

Defined in: [packages/core/src/types.ts:171](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L171)

## Methods

### buildOnboard()

> **buildOnboard**(`input`): `Promise`\<\{ `xdr`: `string`; \}\>

Defined in: [packages/core/src/types.ts:178](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L178)

#### Parameters

##### input

###### publicKey

`string`

#### Returns

`Promise`\<\{ `xdr`: `string`; \}\>

***

### deployContract()

> **deployContract**(`input`): `Promise`\<\{ `address`: `string`; \}\>

Defined in: [packages/core/src/types.ts:180](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L180)

#### Parameters

##### input

###### passkeyPublicKey

`string`

#### Returns

`Promise`\<\{ `address`: `string`; \}\>

***

### deploySessionAccount()?

> `optional` **deploySessionAccount**(`input`): `Promise`\<\{ `address`: `string`; \}\>

Defined in: [packages/core/src/types.ts:184](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L184)

Deploy a policy-scoped session account bound to an ed25519 root key. OPTIONAL: a relayer that
 does not support session accounts omits it; the policy-account adapter then refuses to deploy
 with INVALID_CONFIG. POST /stellar/session-account/deploy

#### Parameters

##### input

###### rootPublicKey

`string`

#### Returns

`Promise`\<\{ `address`: `string`; \}\>

***

### feeQuote()?

> `optional` **feeQuote**(`input`): `Promise`\<[`FeeQuote`](/sdk-reference/core/src/interfaces/FeeQuote)\>

Defined in: [packages/core/src/types.ts:176](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L176)

Quote the fee-token amount + forwarder/collector for paying Soroban gas in `token` (gas mode "token").
 OPTIONAL: a relayer that does not support gas-in-token omits it; `prepare()` then refuses token mode
 with INVALID_CONFIG. Keeping it optional makes adding token gas additive (non-breaking). POST /fee/quote

#### Parameters

##### input

###### calls

[`Call`](/sdk-reference/core/src/interfaces/Call)[]

###### from

`string`

###### token

`string`

#### Returns

`Promise`\<[`FeeQuote`](/sdk-reference/core/src/interfaces/FeeQuote)\>

***

### getAccountState()

> **getAccountState**(`address`): `Promise`\<[`AccountState`](/sdk-reference/core/src/interfaces/AccountState)\>

Defined in: [packages/core/src/types.ts:177](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L177)

#### Parameters

##### address

`string`

#### Returns

`Promise`\<[`AccountState`](/sdk-reference/core/src/interfaces/AccountState)\>

***

### quoteSwap()?

> `optional` **quoteSwap**(`req`): `Promise`\<[`SwapQuote`](/sdk-reference/core/src/interfaces/SwapQuote)\>

Defined in: [packages/core/src/types.ts:188](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L188)

STRETCH: gasless swap via the facilitator's EXISTING /swap/* rail. OPTIONAL - a relayer
 without swap support (no swapChain) omits these; `BuckspayClient.swap` then fails closed with
 SWAP_FAILED.

#### Parameters

##### req

[`SwapQuoteRequest`](/sdk-reference/core/src/interfaces/SwapQuoteRequest)

#### Returns

`Promise`\<[`SwapQuote`](/sdk-reference/core/src/interfaces/SwapQuote)\>

***

### relay()

> **relay**(`payload`): `Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

Defined in: [packages/core/src/types.ts:172](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L172)

#### Parameters

##### payload

[`RelayPayload`](/sdk-reference/core/src/interfaces/RelayPayload)

#### Returns

`Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

***

### submitOnboard()

> **submitOnboard**(`input`): `Promise`\<\{ `ok`: `boolean`; \}\>

Defined in: [packages/core/src/types.ts:179](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L179)

#### Parameters

##### input

###### publicKey

`string`

###### signedTxXdr

`string`

#### Returns

`Promise`\<\{ `ok`: `boolean`; \}\>

***

### swap()?

> `optional` **swap**(`req`): `Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>

Defined in: [packages/core/src/types.ts:189](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L189)

#### Parameters

##### req

[`SwapRequest`](/sdk-reference/core/src/interfaces/SwapRequest)

#### Returns

`Promise`\<[`Receipt`](/sdk-reference/core/src/interfaces/Receipt)\>
