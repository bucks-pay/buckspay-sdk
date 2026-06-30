---
title: "Interface: SocialSignerOptions"
---

# Interface: SocialSignerOptions

Defined in: [packages/signers/src/social/index.ts:23](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/index.ts#L23)

## Properties

### clientId

> **clientId**: `string`

Defined in: [packages/signers/src/social/index.ts:25](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/index.ts#L25)

***

### network

> **network**: [`Network`](/sdk-reference/nextjs/src/type-aliases/Network)

Defined in: [packages/signers/src/social/index.ts:26](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/index.ts#L26)

***

### provider

> **provider**: `"web3auth"`

Defined in: [packages/signers/src/social/index.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/index.ts#L24)

***

### providerImpl?

> `optional` **providerImpl?**: [`SocialProvider`](/sdk-reference/signers/src/social/interfaces/SocialProvider)

Defined in: [packages/signers/src/social/index.ts:30](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/index.ts#L30)

Test/advanced seam: inject the provider transport. Defaults to the web3auth impl.

***

### proxyUrl?

> `optional` **proxyUrl?**: `string`

Defined in: [packages/signers/src/social/index.ts:28](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/index.ts#L28)

Server signer-proxy that completes the SECRET OAuth/verifier callback (see @buckspay/nextjs).
