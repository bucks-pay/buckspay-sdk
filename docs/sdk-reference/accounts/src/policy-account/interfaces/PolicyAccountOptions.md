[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/policy-account](../README.md) / PolicyAccountOptions

# Interface: PolicyAccountOptions

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:6](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy-account/resolveAddress.ts#L6)

## Properties

### multicallContract?

> `optional` **multicallContract?**: `string`

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:13](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy-account/resolveAddress.ts#L13)

Multicall router C-address for atomic batches; defaults to the network's pinned router.

***

### network?

> `optional` **network?**: [`Network`](../../../../nextjs/src/type-aliases/Network.md)

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:11](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy-account/resolveAddress.ts#L11)

Network whose passphrase folds into the derivation. Defaults to testnet.

***

### sponsorAddress?

> `optional` **sponsorAddress?**: `string`

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:9](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy-account/resolveAddress.ts#L9)

Sponsor (deployer) address — the facilitator's public sponsor account. Required to derive the
 C-address offline (the SDK never holds the sponsor secret).
