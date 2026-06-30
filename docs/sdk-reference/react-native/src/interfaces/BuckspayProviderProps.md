---
title: "Interface: BuckspayProviderProps"
---

# Interface: BuckspayProviderProps

Defined in: packages/react/dist/index.d.ts:5

## Properties

### children

> **children**: `ReactNode`

Defined in: packages/react/dist/index.d.ts:13

***

### config

> **config**: `BuckspayConfig`

Defined in: packages/react/dist/index.d.ts:6

***

### sim?

> `optional` **sim?**: `AccountSimContext`

Defined in: packages/react/dist/index.d.ts:12

Recording-simulation context for `prepare()` (a Soroban RPC sim). REQUIRED for
`useStellarPay().pay()` - build it with `createRpcSimContext(sorobanRpcUrl)`.
Omit only if the app never calls `pay()` (connect-only).
