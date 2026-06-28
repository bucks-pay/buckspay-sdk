[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react/src](../README.md) / BuckspayProviderProps

# Interface: BuckspayProviderProps

Defined in: [packages/react/src/provider.tsx:7](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/react/src/provider.tsx#L7)

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/react/src/provider.tsx:15](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/react/src/provider.tsx#L15)

***

### config

> **config**: `BuckspayConfig`

Defined in: [packages/react/src/provider.tsx:8](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/react/src/provider.tsx#L8)

***

### sim?

> `optional` **sim?**: `AccountSimContext`

Defined in: [packages/react/src/provider.tsx:14](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/react/src/provider.tsx#L14)

Recording-simulation context for `prepare()` (a Soroban RPC sim). REQUIRED for
`useStellarPay().pay()` — build it with `createRpcSimContext(sorobanRpcUrl)`.
Omit only if the app never calls `pay()` (connect-only).
