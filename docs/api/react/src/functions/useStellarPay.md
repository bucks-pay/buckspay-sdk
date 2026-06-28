[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react/src](../README.md) / useStellarPay

# Function: useStellarPay()

> **useStellarPay**(): [`UseStellarPayResult`](../interfaces/UseStellarPayResult.md)

Defined in: [packages/react/src/use-stellar-pay.ts:31](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/react/src/use-stellar-pay.ts#L31)

The split prepare/sign/(pay) surface from the core client, made reactive
(README §4.6). `prepare`/`sign` are exposed separately so the dashboard can sign
in the browser and relay through its own BFF instead of calling `send`. `reset`
returns the store to `idle`.

## Returns

[`UseStellarPayResult`](../interfaces/UseStellarPayResult.md)
