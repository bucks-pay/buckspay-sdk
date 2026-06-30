[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react/src](../README.md) / BuckspayProvider

# Function: BuckspayProvider()

> **BuckspayProvider**(`__namedParameters`): `Element`

Defined in: [packages/react/src/provider.tsx:23](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/react/src/provider.tsx#L23)

Builds the core client+store exactly once (lazy state initializer), then shares
them via context. Re-renders of the provider never rebuild the client/store.
React 19: plain function component, children via props, no forwardRef.

## Parameters

### \_\_namedParameters

[`BuckspayProviderProps`](../interfaces/BuckspayProviderProps.md)

## Returns

`Element`
