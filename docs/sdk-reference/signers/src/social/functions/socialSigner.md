---
title: "Function: socialSigner()"
---

# Function: socialSigner()

> **socialSigner**(`opts`): [`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner)

Defined in: [packages/signers/src/social/index.ts:39](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/social/index.ts#L39)

Build a social-login `BuckspaySigner` (type "social"). The connected Stellar ed25519 key
backs the classic account model (its G-address IS the account). Provider/OAuth/proxy
failures map to `AUTH_PROVIDER_ERROR`; using the signer before `authenticate()` maps to
`ACCOUNT_NOT_READY`; a malformed preimage maps to `INVALID_CONFIG`.

## Parameters

### opts

[`SocialSignerOptions`](/sdk-reference/signers/src/social/interfaces/SocialSignerOptions)

## Returns

[`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner)
