[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SessionManagerDeps

# Interface: SessionManagerDeps

Defined in: [packages/core/src/session-manager.ts:21](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L21)

## Properties

### account

> **account**: [`AccountAdapter`](AccountAdapter.md)

Defined in: [packages/core/src/session-manager.ts:22](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L22)

***

### address

> **address**: `string`

Defined in: [packages/core/src/session-manager.ts:27](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L27)

***

### network

> **network**: [`Network`](../type-aliases/Network.md)

Defined in: [packages/core/src/session-manager.ts:25](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L25)

***

### now

> **now**: () => `number`

Defined in: [packages/core/src/session-manager.ts:28](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L28)

#### Returns

`number`

***

### randomNonce?

> `optional` **randomNonce?**: () => `bigint`

Defined in: [packages/core/src/session-manager.ts:29](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L29)

#### Returns

`bigint`

***

### relayer

> **relayer**: [`Relayer`](Relayer.md)

Defined in: [packages/core/src/session-manager.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L24)

***

### signer

> **signer**: [`BuckspaySigner`](BuckspaySigner.md)

Defined in: [packages/core/src/session-manager.ts:23](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L23)

***

### sim

> **sim**: [`AccountSimContext`](AccountSimContext.md)

Defined in: [packages/core/src/session-manager.ts:26](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/session-manager.ts#L26)
