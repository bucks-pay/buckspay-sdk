---
title: "Interface: SessionManagerDeps"
---

# Interface: SessionManagerDeps

Defined in: [packages/core/src/session-manager.ts:21](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L21)

## Properties

### account

> **account**: [`AccountAdapter`](/sdk-reference/core/src/interfaces/AccountAdapter)

Defined in: [packages/core/src/session-manager.ts:22](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L22)

***

### address

> **address**: `string`

Defined in: [packages/core/src/session-manager.ts:27](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L27)

***

### network

> **network**: [`Network`](/sdk-reference/core/src/type-aliases/Network)

Defined in: [packages/core/src/session-manager.ts:25](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L25)

***

### now

> **now**: () => `number`

Defined in: [packages/core/src/session-manager.ts:28](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L28)

#### Returns

`number`

***

### randomNonce?

> `optional` **randomNonce?**: () => `bigint`

Defined in: [packages/core/src/session-manager.ts:29](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L29)

#### Returns

`bigint`

***

### relayer

> **relayer**: [`Relayer`](/sdk-reference/core/src/interfaces/Relayer)

Defined in: [packages/core/src/session-manager.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L24)

***

### signer

> **signer**: [`BuckspaySigner`](/sdk-reference/core/src/interfaces/BuckspaySigner)

Defined in: [packages/core/src/session-manager.ts:23](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L23)

***

### sim

> **sim**: [`AccountSimContext`](/sdk-reference/core/src/interfaces/AccountSimContext)

Defined in: [packages/core/src/session-manager.ts:26](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/session-manager.ts#L26)
