[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / BuckspayConfig

# Interface: BuckspayConfig

Defined in: [packages/core/src/types.ts:308](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L308)

## Properties

### account

> **account**: [`AccountAdapter`](AccountAdapter.md)

Defined in: [packages/core/src/types.ts:310](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L310)

***

### allowMainnet?

> `optional` **allowMainnet?**: `boolean`

Defined in: [packages/core/src/types.ts:320](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L320)

Explicit mainnet (pubnet) opt-in for environments with no `process.env`
(browsers). ORed with the Node env `BUCKSPAY_ALLOW_MAINNET=1`. Pubnet stays
refused unless at least one signal is present; testnet ignores this flag.
`resolveNetwork` remains the single gate — this flag only feeds it.

***

### gas

> **gas**: [`GasConfig`](../type-aliases/GasConfig.md)

Defined in: [packages/core/src/types.ts:313](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L313)

***

### network

> **network**: [`Network`](../type-aliases/Network.md)

Defined in: [packages/core/src/types.ts:309](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L309)

***

### relayer

> **relayer**: [`Relayer`](Relayer.md)

Defined in: [packages/core/src/types.ts:312](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L312)

***

### signer

> **signer**: [`BuckspaySigner`](BuckspaySigner.md)

Defined in: [packages/core/src/types.ts:311](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L311)
