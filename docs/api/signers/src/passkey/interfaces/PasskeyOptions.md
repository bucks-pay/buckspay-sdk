[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/passkey](../README.md) / PasskeyOptions

# Interface: PasskeyOptions

Defined in: [packages/signers/src/passkey/index.ts:20](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/signers/src/passkey/index.ts#L20)

## Properties

### rpId

> **rpId**: `string`

Defined in: [packages/signers/src/passkey/index.ts:21](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/signers/src/passkey/index.ts#L21)

***

### rpName?

> `optional` **rpName?**: `string`

Defined in: [packages/signers/src/passkey/index.ts:22](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/signers/src/passkey/index.ts#L22)

***

### webauthn?

> `optional` **webauthn?**: [`WebAuthnLike`](WebAuthnLike.md)

Defined in: [packages/signers/src/passkey/index.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/signers/src/passkey/index.ts#L24)

Test seam: inject a deterministic WebAuthn impl. Defaults to navigator.credentials.
