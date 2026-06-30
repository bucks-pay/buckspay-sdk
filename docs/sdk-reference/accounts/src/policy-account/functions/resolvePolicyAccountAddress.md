[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/policy-account](../README.md) / resolvePolicyAccountAddress

# Function: resolvePolicyAccountAddress()

> **resolvePolicyAccountAddress**(`signer`, `opts`): `Promise`\<`string`\>

Defined in: [packages/accounts/src/policy-account/resolveAddress.ts:21](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy-account/resolveAddress.ts#L21)

Resolve the policy account's deterministic C-address. The account is deployed by the sponsor with a
salt over the ed25519 root public key — the contract id depends only on (deployer, salt, network), so
this reuses the same derivation as the contract/passkey model, keyed by the root raw public key.

## Parameters

### signer

[`BuckspaySigner`](../../../../signers/src/social/interfaces/BuckspaySigner.md)

### opts

[`PolicyAccountOptions`](../interfaces/PolicyAccountOptions.md)

## Returns

`Promise`\<`string`\>
