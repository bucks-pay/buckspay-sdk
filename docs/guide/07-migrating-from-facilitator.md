# Migrating from direct facilitator calls

For teams (like the buckspay dashboard) that today `fetch` the facilitator directly. The
SDK replaces the HTTP/crypto plumbing while your **business validation stays in the
backend**, and the same-origin BFF hides the API key.

## Before

The browser builds the `SorobanRelayBody` by hand (`signTransferAuth` + `normalizeSignature`)
and `fetch`es `/api/gasless/relay`; the backend `fetch`es the facilitator `/relay` with the key.

## After — front

`useStellarPay().prepare(...)` + `.sign(...)` produce a `SignedIntent`; POST it to your BFF.
The double-encode quirk of Freighter is absorbed by `walletsKit`'s `normalizeSignature` —
**delete it from your app**.

## After — back (the BFF boundary)

Keep business validation (intent exists / not expired / amount tolerance / sponsorship
budget). Replace the raw `fetch` with `@buckspay/core` + `buckspayFacilitator({ url, apiKey, network })`
**server-side**, then `client.send(signed)`. The `RelayPayload` is byte-identical to today's
body (parity test, README §5) — so the on-wire shape doesn't change.

```ts
// SERVER-ONLY — the key never reaches the browser.
const receipt = await server.send(signed); // server = createBuckspayClient({ relayer: buckspayFacilitator({ apiKey }) ... })
```

Compiled example: `docs/examples/07-bff-relay.ts` (the only example that passes `apiKey`).

## Migration checklist

- Delete `web3-stellar/sign.ts` (the hand-rolled signing).
- Swap the hand-built body for the `useStellarPay` hook.
- Keep the rail schema and the BFF route (`/api/gasless/relay`).
- Run the payload parity + e2e regression.

Prev: [API reference](./06-api-reference.md) · Next: [Gas in stablecoin](./08-gas-in-token.md)
