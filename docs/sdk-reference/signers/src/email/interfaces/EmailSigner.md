---
title: "Interface: EmailSigner"
---

# Interface: EmailSigner

Defined in: [packages/signers/src/email/index.ts:28](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/email/index.ts#L28)

## Extends

- [`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner)

## Properties

### type

> `readonly` **type**: `SignerType`

Defined in: packages/core/dist/index.d.ts:44

#### Inherited from

[`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner).[`type`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner#type)

## Methods

### authenticate()?

> `optional` **authenticate**(`params?`): `Promise`\<[`AuthDetails`](/sdk-reference/signers/src/social/interfaces/AuthDetails)\>

Defined in: packages/core/dist/index.d.ts:63

Social/email signers only: run the provider's auth flow and
resolve the Stellar key. wallets-kit / passkey signers omit it. After it
resolves, getPublicKey()/signAuthEntry() operate on the provider-issued key.

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<[`AuthDetails`](/sdk-reference/signers/src/social/interfaces/AuthDetails)\>

#### Inherited from

[`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner).[`authenticate`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner#authenticate)

***

### getPublicKey()

> **getPublicKey**(): `Promise`\<`SignerKey`\>

Defined in: packages/core/dist/index.d.ts:45

#### Returns

`Promise`\<`SignerKey`\>

#### Inherited from

[`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner).[`getPublicKey`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner#getpublickey)

***

### requestOtp()

> **requestOtp**(`email`): `Promise`\<`void`\>

Defined in: [packages/signers/src/email/index.ts:30](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/email/index.ts#L30)

Trigger the OTP issue step (sends the code to `email`).

#### Parameters

##### email

`string`

#### Returns

`Promise`\<`void`\>

***

### signAuthEntry()

> **signAuthEntry**(`payload`): `Promise`\<`Signature`\>

Defined in: packages/core/dist/index.d.ts:46

#### Parameters

##### payload

`AuthEntryPayload`

#### Returns

`Promise`\<`Signature`\>

#### Inherited from

[`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner).[`signAuthEntry`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner#signauthentry)

***

### signTransaction()?

> `optional` **signTransaction**(`txXdr`, `ctx`): `Promise`\<`string`\>

Defined in: packages/core/dist/index.d.ts:54

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

[`Network`](/sdk-reference/nextjs/src/type-aliases/Network)

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner).[`signTransaction`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner#signtransaction)
