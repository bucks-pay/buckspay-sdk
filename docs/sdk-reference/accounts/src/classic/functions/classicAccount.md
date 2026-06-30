[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/classic](../README.md) / classicAccount

# Function: classicAccount()

> **classicAccount**(`opts?`): `AccountAdapter`

Defined in: [packages/accounts/src/classic/classic-account.ts:48](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/classic/classic-account.ts#L48)

Classic (`G…`) account adapter — the strangler extraction of the dashboard's
`web3-stellar/{sign,onboard,wallet}.ts` behind the core `AccountAdapter` port.
Holds no key material: both the onboarding tx and the auth-entry are signed
inside the wallet via the injected `BuckspaySigner`.

## Parameters

### opts?

[`ClassicAccountOptions`](../interfaces/ClassicAccountOptions.md) = `{}`

## Returns

`AccountAdapter`
