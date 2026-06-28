[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/classic](../README.md) / classicAccount

# Function: classicAccount()

> **classicAccount**(): `AccountAdapter`

Defined in: [packages/accounts/src/classic/classic-account.ts:39](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/accounts/src/classic/classic-account.ts#L39)

Classic (`G…`) account adapter — the strangler extraction of the dashboard's
`web3-stellar/{sign,onboard,wallet}.ts` behind the core `AccountAdapter` port.
Holds no key material: both the onboarding tx and the auth-entry are signed
inside the wallet via the injected `BuckspaySigner`.

## Returns

`AccountAdapter`
