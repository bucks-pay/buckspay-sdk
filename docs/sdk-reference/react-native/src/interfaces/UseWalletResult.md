---
title: "Interface: UseWalletResult"
---

# Interface: UseWalletResult

Defined in: packages/react/dist/index.d.ts:22

## Properties

### address

> **address**: `string` \| `null`

Defined in: packages/react/dist/index.d.ts:24

***

### connect

> **connect**: () => `Promise`\<`void`\>

Defined in: packages/react/dist/index.d.ts:25

#### Returns

`Promise`\<`void`\>

***

### error

> **error**: `BuckspayError` \| `null`

Defined in: packages/react/dist/index.d.ts:27

***

### status

> **status**: `"idle"` \| `"connecting"` \| `"ready"` \| `"signing"` \| `"relaying"` \| `"success"` \| `"error"`

Defined in: packages/react/dist/index.d.ts:26

***

### wallet

> **wallet**: `BuckspayWallet` \| `null`

Defined in: packages/react/dist/index.d.ts:23
