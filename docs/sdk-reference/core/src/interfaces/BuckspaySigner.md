[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / BuckspaySigner

# Interface: BuckspaySigner

Defined in: [packages/core/src/types.ts:35](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L35)

## Properties

### type

> `readonly` **type**: [`SignerType`](../type-aliases/SignerType.md)

Defined in: [packages/core/src/types.ts:36](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L36)

## Methods

### authenticate()?

> `optional` **authenticate**(`params?`): `Promise`\<[`AuthDetails`](AuthDetails.md)\>

Defined in: [packages/core/src/types.ts:52](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L52)

Social/email signers only: run the provider's auth flow and
resolve the Stellar key. wallets-kit / passkey signers omit it. After it
resolves, getPublicKey()/signAuthEntry() operate on the provider-issued key.

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<[`AuthDetails`](AuthDetails.md)\>

***

### getPublicKey()

> **getPublicKey**(): `Promise`\<[`SignerKey`](SignerKey.md)\>

Defined in: [packages/core/src/types.ts:37](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L37)

#### Returns

`Promise`\<[`SignerKey`](SignerKey.md)\>

***

### signAuthEntry()

> **signAuthEntry**(`payload`): `Promise`\<[`Signature`](Signature.md)\>

Defined in: [packages/core/src/types.ts:38](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L38)

#### Parameters

##### payload

[`AuthEntryPayload`](AuthEntryPayload.md)

#### Returns

`Promise`\<[`Signature`](Signature.md)\>

***

### signTransaction()?

> `optional` **signTransaction**(`txXdr`, `ctx`): `Promise`\<`string`\>

Defined in: [packages/core/src/types.ts:46](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L46)

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
