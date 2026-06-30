---
title: "Function: useStellarPay()"
---

# Function: useStellarPay()

> **useStellarPay**(): [`UseStellarPayResult`](/sdk-reference/react/src/interfaces/UseStellarPayResult)

Defined in: [packages/react/src/use-stellar-pay.ts:31](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L31)

The split prepare/sign/(pay) surface from the core client, made reactive
(README §4.6). `prepare`/`sign` are exposed separately so the dashboard can sign
in the browser and relay through its own BFF instead of calling `send`. `reset`
returns the store to `idle`.

## Returns

[`UseStellarPayResult`](/sdk-reference/react/src/interfaces/UseStellarPayResult)
