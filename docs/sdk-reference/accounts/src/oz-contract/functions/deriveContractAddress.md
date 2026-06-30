[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/oz-contract](../README.md) / deriveContractAddress

# Function: deriveContractAddress()

> **deriveContractAddress**(`passkeyPublicKey`, `sponsorAddress`, `networkPassphrase?`): `string`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:36](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/oz-contract/resolveAddress.ts#L36)

Deterministic C-address from (deployer=sponsor, salt=sha256(pubkey), networkId).
BYTE-IDENTICAL to the facilitator's `derivedContractAddress` (validated
on-chain): same `ContractIdPreimage::Address` preimage. The contract id depends only
on deployer + salt + network — NOT on the Wasm hash or constructor args.

## Parameters

### passkeyPublicKey

`string`

### sponsorAddress

`string`

### networkPassphrase?

`string` = `Networks.TESTNET`

## Returns

`string`
