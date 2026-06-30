---
title: "Function: resolvePolicyAccountAddress()"
---

# Function: resolvePolicyAccountAddress()

> **resolvePolicyAccountAddress**(`signer`, `opts`): `Promise`\<`string`\>

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:21](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/policy-account/resolveAddress.ts#L21)

Resolve the policy account's deterministic C-address. The account is deployed by the sponsor with a
salt over the ed25519 root public key - the contract id depends only on (deployer, salt, network), so
this reuses the same derivation as the contract/passkey model, keyed by the root raw public key.

## Parameters

### signer

[`BuckspaySigner`](/sdk-reference/signers/src/social/interfaces/BuckspaySigner)

### opts

[`PolicyAccountOptions`](/sdk-reference/accounts/src/policy-account/interfaces/PolicyAccountOptions)

## Returns

`Promise`\<`string`\>
