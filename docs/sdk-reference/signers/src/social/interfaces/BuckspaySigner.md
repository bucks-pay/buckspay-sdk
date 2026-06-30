---
title: "Interface: BuckspaySigner"
---

# Interface: BuckspaySigner

Defined in: packages/core/dist/index.d.ts:43

## Extended by

- [`EmailSigner`](/sdk-reference/signers/src/email/interfaces/EmailSigner)

## Properties

### type

> `readonly` **type**: `SignerType`

Defined in: packages/core/dist/index.d.ts:44

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

***

### getPublicKey()

> **getPublicKey**(): `Promise`\<`SignerKey`\>

Defined in: packages/core/dist/index.d.ts:45

#### Returns

`Promise`\<`SignerKey`\>

***

### signAuthEntry()

> **signAuthEntry**(`payload`): `Promise`\<`Signature`\>

Defined in: packages/core/dist/index.d.ts:46

#### Parameters

##### payload

`AuthEntryPayload`

#### Returns

`Promise`\<`Signature`\>

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
