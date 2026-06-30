---
title: "Function: deriveContractAddress()"
---

# Function: deriveContractAddress()

> **deriveContractAddress**(`passkeyPublicKey`, `sponsorAddress`, `networkPassphrase?`): `string`

Defined in: [packages/accounts/src/oz-contract/resolveAddress.ts:36](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/oz-contract/resolveAddress.ts#L36)

Deterministic C-address from (deployer=sponsor, salt=sha256(pubkey), networkId).
BYTE-IDENTICAL to the facilitator's `derivedContractAddress` (validated
on-chain): same `ContractIdPreimage::Address` preimage. The contract id depends only
on deployer + salt + network - NOT on the Wasm hash or constructor args.

## Parameters

### passkeyPublicKey

`string`

### sponsorAddress

`string`

### networkPassphrase?

`string` = `Networks.TESTNET`

## Returns

`string`
