---
title: "Function: classicAccount()"
---

# Function: classicAccount()

> **classicAccount**(`opts?`): `AccountAdapter`

Defined in: [packages/accounts/src/classic/classic-account.ts:48](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/classic/classic-account.ts#L48)

Classic (`G...`) account adapter - the strangler extraction of the dashboard's
`web3-stellar/{sign,onboard,wallet}.ts` behind the core `AccountAdapter` port.
Holds no key material: both the onboarding tx and the auth-entry are signed
inside the wallet via the injected `BuckspaySigner`.

## Parameters

### opts?

[`ClassicAccountOptions`](/sdk-reference/accounts/src/classic/interfaces/ClassicAccountOptions) = `{}`

## Returns

`AccountAdapter`
