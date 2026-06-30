[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react/src](../README.md) / useStellarPay

# Function: useStellarPay()

> **useStellarPay**(): [`UseStellarPayResult`](../interfaces/UseStellarPayResult.md)

Defined in: [packages/react/src/use-stellar-pay.ts:31](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/react/src/use-stellar-pay.ts#L31)

The split prepare/sign/(pay) surface from the core client, made reactive
(README §4.6). `prepare`/`sign` are exposed separately so the dashboard can sign
in the browser and relay through its own BFF instead of calling `send`. `reset`
returns the store to `idle`.

## Returns

[`UseStellarPayResult`](../interfaces/UseStellarPayResult.md)
