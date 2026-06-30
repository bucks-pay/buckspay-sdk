---
title: "Interface: PolicyAccountOptions"
---

# Interface: PolicyAccountOptions

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:6](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/policy-account/resolveAddress.ts#L6)

## Properties

### multicallContract?

> `optional` **multicallContract?**: `string`

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:13](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/policy-account/resolveAddress.ts#L13)

Multicall router C-address for atomic batches; defaults to the network's pinned router.

***

### network?

> `optional` **network?**: [`Network`](/sdk-reference/nextjs/src/type-aliases/Network)

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:11](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/policy-account/resolveAddress.ts#L11)

Network whose passphrase folds into the derivation. Defaults to testnet.

***

### sponsorAddress?

> `optional` **sponsorAddress?**: `string`

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:9](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/policy-account/resolveAddress.ts#L9)

Sponsor (deployer) address - the facilitator's public sponsor account. Required to derive the
 C-address offline (the SDK never holds the sponsor secret).
