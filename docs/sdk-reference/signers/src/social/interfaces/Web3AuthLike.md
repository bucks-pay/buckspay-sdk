---
title: "Interface: Web3AuthLike"
---

# Interface: Web3AuthLike

Defined in: [packages/signers/src/social/web3auth.ts:12](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/web3auth.ts#L12)

Structural surface the default provider needs from the web3auth SDK. The real
`@web3auth/single-factor-auth` surface is mapped onto this by the loader. The PRIVATE
key stays inside web3auth's secure context - `signEd25519` is the only signing
capability that crosses this boundary.

## Methods

### login()

> **login**(`opts`): `Promise`\<\{ `ed25519PublicKeyHex`: `string`; `idToken`: `string`; \}\>

Defined in: [packages/signers/src/social/web3auth.ts:14](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/web3auth.ts#L14)

Run OAuth (the popup) and resolve the OIDC idToken + the derived ed25519 public key (hex).

#### Parameters

##### opts

###### clientId

`string`

###### loginParams?

`Record`\<`string`, `unknown`\>

###### network

[`Network`](/sdk-reference/nextjs/src/type-aliases/Network)

#### Returns

`Promise`\<\{ `ed25519PublicKeyHex`: `string`; `idToken`: `string`; \}\>

***

### signEd25519()

> **signEd25519**(`digest`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [packages/signers/src/social/web3auth.ts:20](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/web3auth.ts#L20)

ed25519-sign a 32-byte digest with the logged-in key, returning the raw 64-byte signature.

#### Parameters

##### digest

`Uint8Array`

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>
