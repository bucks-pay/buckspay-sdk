[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / BuckspaySigner

# Interface: BuckspaySigner

Defined in: [packages/core/src/types.ts:33](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L33)

## Properties

### type

> `readonly` **type**: [`SignerType`](../type-aliases/SignerType.md)

Defined in: [packages/core/src/types.ts:34](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L34)

## Methods

### getPublicKey()

> **getPublicKey**(): `Promise`\<[`SignerKey`](SignerKey.md)\>

Defined in: [packages/core/src/types.ts:35](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L35)

#### Returns

`Promise`\<[`SignerKey`](SignerKey.md)\>

***

### signAuthEntry()

> **signAuthEntry**(`payload`): `Promise`\<[`Signature`](Signature.md)\>

Defined in: [packages/core/src/types.ts:36](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L36)

#### Parameters

##### payload

[`AuthEntryPayload`](AuthEntryPayload.md)

#### Returns

`Promise`\<[`Signature`](Signature.md)\>

***

### signTransaction()?

> `optional` **signTransaction**(`txXdr`, `ctx`): `Promise`\<`string`\>

Defined in: [packages/core/src/types.ts:44](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L44)

Sign a full transaction envelope (classic sponsored onboarding signs the
sponsor-sandwich tx, not an auth-entry). Optional: only external-wallet
signers (wallets-kit) implement it; passkey signers omit it. Returns the
signed transaction as base64 XDR. The classic account adapter detects it
structurally and raises ACCOUNT_NOT_READY if a signer can't sign txs.

#### Parameters

##### txXdr

`string`

##### ctx

###### address

`string`

###### network

[`Network`](../type-aliases/Network.md)

#### Returns

`Promise`\<`string`\>
