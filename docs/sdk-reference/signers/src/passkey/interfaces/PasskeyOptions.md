[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/passkey](../README.md) / PasskeyOptions

# Interface: PasskeyOptions

Defined in: [packages/signers/src/passkey/index.ts:23](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/signers/src/passkey/index.ts#L23)

## Properties

### rpId

> **rpId**: `string`

Defined in: [packages/signers/src/passkey/index.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/signers/src/passkey/index.ts#L24)

***

### rpName?

> `optional` **rpName?**: `string`

Defined in: [packages/signers/src/passkey/index.ts:25](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/signers/src/passkey/index.ts#L25)

***

### webauthn?

> `optional` **webauthn?**: [`WebAuthnLike`](WebAuthnLike.md)

Defined in: [packages/signers/src/passkey/index.ts:27](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/signers/src/passkey/index.ts#L27)

Test seam: inject a deterministic WebAuthn impl. Defaults to navigator.credentials.
