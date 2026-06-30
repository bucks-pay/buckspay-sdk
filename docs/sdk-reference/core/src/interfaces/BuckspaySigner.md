---
title: "Interface: BuckspaySigner"
---

# Interface: BuckspaySigner

Defined in: [packages/core/src/types.ts:35](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L35)

## Properties

### type

> `readonly` **type**: [`SignerType`](/sdk-reference/core/src/type-aliases/SignerType)

Defined in: [packages/core/src/types.ts:36](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L36)

## Methods

### authenticate()?

> `optional` **authenticate**(`params?`): `Promise`\<[`AuthDetails`](/sdk-reference/core/src/interfaces/AuthDetails)\>

Defined in: [packages/core/src/types.ts:52](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L52)

Social/email signers only: run the provider's auth flow and
resolve the Stellar key. wallets-kit / passkey signers omit it. After it
resolves, getPublicKey()/signAuthEntry() operate on the provider-issued key.

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<[`AuthDetails`](/sdk-reference/core/src/interfaces/AuthDetails)\>

***

### getPublicKey()

> **getPublicKey**(): `Promise`\<[`SignerKey`](/sdk-reference/core/src/interfaces/SignerKey)\>

Defined in: [packages/core/src/types.ts:37](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L37)

#### Returns

`Promise`\<[`SignerKey`](/sdk-reference/core/src/interfaces/SignerKey)\>

***

### signAuthEntry()

> **signAuthEntry**(`payload`): `Promise`\<[`Signature`](/sdk-reference/core/src/interfaces/Signature)\>

Defined in: [packages/core/src/types.ts:38](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L38)

#### Parameters

##### payload

[`AuthEntryPayload`](/sdk-reference/core/src/interfaces/AuthEntryPayload)

#### Returns

`Promise`\<[`Signature`](/sdk-reference/core/src/interfaces/Signature)\>

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

[`Network`](/sdk-reference/core/src/type-aliases/Network)

#### Returns

`Promise`\<`string`\>
