[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react-native/src](../README.md) / useStellarPay

# Function: useStellarPay()

> **useStellarPay**(): [`UseStellarPayResult`](../interfaces/UseStellarPayResult.md)

Defined in: packages/react/dist/index.d.ts:52

The split prepare/sign/(pay) surface from the core client, made reactive
(README §4.6). `prepare`/`sign` are exposed separately so the dashboard can sign
in the browser and relay through its own BFF instead of calling `send`. `reset`
returns the store to `idle`.

## Returns

[`UseStellarPayResult`](../interfaces/UseStellarPayResult.md)
