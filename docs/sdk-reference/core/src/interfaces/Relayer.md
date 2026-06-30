[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / Relayer

# Interface: Relayer

Defined in: [packages/core/src/types.ts:171](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L171)

## Methods

### buildOnboard()

> **buildOnboard**(`input`): `Promise`\<\{ `xdr`: `string`; \}\>

Defined in: [packages/core/src/types.ts:178](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L178)

#### Parameters

##### input

###### publicKey

`string`

#### Returns

`Promise`\<\{ `xdr`: `string`; \}\>

***

### deployContract()

> **deployContract**(`input`): `Promise`\<\{ `address`: `string`; \}\>

Defined in: [packages/core/src/types.ts:180](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L180)

#### Parameters

##### input

###### passkeyPublicKey

`string`

#### Returns

`Promise`\<\{ `address`: `string`; \}\>

***

### deploySessionAccount()?

> `optional` **deploySessionAccount**(`input`): `Promise`\<\{ `address`: `string`; \}\>

Defined in: [packages/core/src/types.ts:184](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L184)

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

> `optional` **feeQuote**(`input`): `Promise`\<[`FeeQuote`](FeeQuote.md)\>

Defined in: [packages/core/src/types.ts:176](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L176)

Quote the fee-token amount + forwarder/collector for paying Soroban gas in `token` (gas mode "token").
 OPTIONAL: a relayer that does not support gas-in-token omits it; `prepare()` then refuses token mode
 with INVALID_CONFIG. Keeping it optional makes adding token gas additive (non-breaking). POST /fee/quote

#### Parameters

##### input

###### calls

[`Call`](Call.md)[]

###### from

`string`

###### token

`string`

#### Returns

`Promise`\<[`FeeQuote`](FeeQuote.md)\>

***

### getAccountState()

> **getAccountState**(`address`): `Promise`\<[`AccountState`](AccountState.md)\>

Defined in: [packages/core/src/types.ts:177](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L177)

#### Parameters

##### address

`string`

#### Returns

`Promise`\<[`AccountState`](AccountState.md)\>

***

### quoteSwap()?

> `optional` **quoteSwap**(`req`): `Promise`\<[`SwapQuote`](SwapQuote.md)\>

Defined in: [packages/core/src/types.ts:188](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L188)

STRETCH: gasless swap via the facilitator's EXISTING /swap/* rail. OPTIONAL — a relayer
 without swap support (no swapChain) omits these; `BuckspayClient.swap` then fails closed with
 SWAP_FAILED.

#### Parameters

##### req

[`SwapQuoteRequest`](SwapQuoteRequest.md)

#### Returns

`Promise`\<[`SwapQuote`](SwapQuote.md)\>

***

### relay()

> **relay**(`payload`): `Promise`\<[`Receipt`](Receipt.md)\>

Defined in: [packages/core/src/types.ts:172](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L172)

#### Parameters

##### payload

[`RelayPayload`](RelayPayload.md)

#### Returns

`Promise`\<[`Receipt`](Receipt.md)\>

***

### submitOnboard()

> **submitOnboard**(`input`): `Promise`\<\{ `ok`: `boolean`; \}\>

Defined in: [packages/core/src/types.ts:179](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L179)

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

> `optional` **swap**(`req`): `Promise`\<[`Receipt`](Receipt.md)\>

Defined in: [packages/core/src/types.ts:189](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L189)

#### Parameters

##### req

[`SwapRequest`](SwapRequest.md)

#### Returns

`Promise`\<[`Receipt`](Receipt.md)\>
