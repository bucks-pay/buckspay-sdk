# Onboarding

`connect()` calls `account.ensureReady(...)` to make an account payment-ready — sponsored,
so the user needs no XLM.

## Read state first

```ts
const state = await buckspay.getAccountState(address);
// { exists, hasUsdcTrustline, xlmBalance?, usdcBalance? }
if (!state.exists || !state.hasUsdcTrustline) {
  await buckspay.connect(); // materializes the account
}
```

Compiled example: `docs/examples/04-onboarding-state.ts`.

## Classic onboarding (`G…`)

If the `G…` account is missing or has no USDC trustline, buckspay fetches an unsigned
sponsor-sandwich tx (`relayer.buildOnboard`), the wallet signs it, and
`relayer.submitOnboard` co-signs + submits. The sponsor covers the XLM reserves
(sponsored reserves, CAP-0033).

## Contract deploy (`C…`)

`ensureReady` deploys the OZ Smart Account via `relayer.deployContract({ passkeyPublicKey })`,
sponsored by the facilitator, returning the `C…` address. **Idempotent** — re-calling
`connect()` on a deployed account is a no-op.

Prev: [Gasless modes](./03-gasless-modes.md) · Next: [React hooks](./05-react.md)
