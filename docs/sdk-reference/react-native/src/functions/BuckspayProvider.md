---
title: "Function: BuckspayProvider()"
---

# Function: BuckspayProvider()

> **BuckspayProvider**(`__namedParameters`): `Element`

Defined in: packages/react/dist/index.d.ts:20

Builds the core client+store exactly once (lazy state initializer), then shares
them via context. Re-renders of the provider never rebuild the client/store.
React 19: plain function component, children via props, no forwardRef.

## Parameters

### \_\_namedParameters

[`BuckspayProviderProps`](/sdk-reference/react-native/src/interfaces/BuckspayProviderProps)

## Returns

`Element`
