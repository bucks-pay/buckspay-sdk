---
title: "Interface: PasskeyOptions"
---

# Interface: PasskeyOptions

Defined in: [packages/signers/src/passkey/index.ts:23](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/passkey/index.ts#L23)

## Properties

### rpId

> **rpId**: `string`

Defined in: [packages/signers/src/passkey/index.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/passkey/index.ts#L24)

***

### rpName?

> `optional` **rpName?**: `string`

Defined in: [packages/signers/src/passkey/index.ts:25](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/passkey/index.ts#L25)

***

### webauthn?

> `optional` **webauthn?**: [`WebAuthnLike`](/sdk-reference/signers/src/passkey/interfaces/WebAuthnLike)

Defined in: [packages/signers/src/passkey/index.ts:27](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/passkey/index.ts#L27)

Test seam: inject a deterministic WebAuthn impl. Defaults to navigator.credentials.
