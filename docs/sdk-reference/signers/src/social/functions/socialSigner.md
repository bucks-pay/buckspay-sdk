[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/social](../README.md) / socialSigner

# Function: socialSigner()

> **socialSigner**(`opts`): [`BuckspaySigner`](../interfaces/BuckspaySigner.md)

Defined in: [packages/signers/src/social/index.ts:39](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/signers/src/social/index.ts#L39)

Build a social-login `BuckspaySigner` (type "social"). The connected Stellar ed25519 key
backs the classic account model (its G-address IS the account). Provider/OAuth/proxy
failures map to `AUTH_PROVIDER_ERROR`; using the signer before `authenticate()` maps to
`ACCOUNT_NOT_READY`; a malformed preimage maps to `INVALID_CONFIG`.

## Parameters

### opts

[`SocialSignerOptions`](../interfaces/SocialSignerOptions.md)

## Returns

[`BuckspaySigner`](../interfaces/BuckspaySigner.md)
