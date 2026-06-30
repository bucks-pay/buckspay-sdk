---
title: "Interface: Signature"
---

# Interface: Signature

Defined in: [packages/core/src/types.ts:28](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L28)

## Properties

### publicKey

> **publicKey**: `string`

Defined in: [packages/core/src/types.ts:32](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L32)

echoes the signer public key used to build credentials.

***

### signature

> **signature**: `Uint8Array`

Defined in: [packages/core/src/types.ts:30](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L30)

raw signature bytes; 64 bytes for ed25519, contract-defined for passkey.
