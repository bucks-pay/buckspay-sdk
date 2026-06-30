[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/social](../README.md) / SocialProvider

# Interface: SocialProvider

Defined in: [packages/signers/src/social/provider.ts:8](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/provider.ts#L8)

Structural transport for a social-login provider. Keeps `socialSigner` provider-agnostic
and fully unit-testable (inject a double) while the default impl wraps web3auth. The
ed25519 PRIVATE key never crosses this boundary - only the public key + signatures do.

## Methods

### connect()

> **connect**(`params?`): `Promise`\<\{ `expiresAt?`: `number`; `publicKey`: `string`; \}\>

Defined in: [packages/signers/src/social/provider.ts:14](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/provider.ts#L14)

Run the provider OAuth flow (public part client-side; the secret verifier callback is
completed server-side via the signer-proxy). Resolves the connected Stellar ed25519
public key (a `G...` StrKey) and an optional provider-session expiry (epoch ms).

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<\{ `expiresAt?`: `number`; `publicKey`: `string`; \}\>

***

### signDigest()

> **signDigest**(`digest`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [packages/signers/src/social/provider.ts:19](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/provider.ts#L19)

ed25519-sign a 32-byte digest with the connected key (inside the provider's secure
context). Returns the raw 64-byte signature. Used by `signAuthEntry`.

#### Parameters

##### digest

`Uint8Array`

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

***

### signTransaction()?

> `optional` **signTransaction**(`txXdr`, `ctx`): `Promise`\<`string`\>

Defined in: [packages/signers/src/social/provider.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/provider.ts#L24)

Optional: sign a full transaction envelope (classic sponsored onboarding signs the
sponsor-sandwich tx, not an auth entry). Returns the signed envelope as base64 XDR.

#### Parameters

##### txXdr

`string`

##### ctx

###### address

`string`

###### network

[`Network`](../../../../nextjs/src/type-aliases/Network.md)

#### Returns

`Promise`\<`string`\>
