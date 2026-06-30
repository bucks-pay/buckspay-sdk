---
title: "Function: BuckspayProvider()"
---

# Function: BuckspayProvider()

> **BuckspayProvider**(`__namedParameters`): `Element`

Defined in: [packages/react/src/provider.tsx:23](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/provider.tsx#L23)

Builds the core client+store exactly once (lazy state initializer), then shares
them via context. Re-renders of the provider never rebuild the client/store.
React 19: plain function component, children via props, no forwardRef.

## Parameters

### \_\_namedParameters

[`BuckspayProviderProps`](/sdk-reference/react/src/interfaces/BuckspayProviderProps)

## Returns

`Element`
