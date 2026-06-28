# `@buckspay/example-passkey-hero`

The M2 hero demo: **create a passkey wallet → deploy a sponsored `C…` smart account →
pay 0.01 USDC gas-free** on testnet, consuming the SDK through `@buckspay/react`.

```bash
pnpm --filter @buckspay/example-passkey-hero dev
```

## Prerequisites

- A **testnet facilitator** running (this repo's `facilitator/`) with the OZ passkey
  Wasm installed and a funded sponsor (`STELLAR_SPONSOR_SECRET_TESTNET`).
- The facilitator `API_KEY` available to the Vite dev server (NOT the browser).

## Env

Set these for the dev server (the first two are server-side only — they never reach the bundle):

| Var | Used by | Purpose |
|---|---|---|
| `FACILITATOR_URL` | vite proxy | where to forward `/facilitator/*` |
| `FACILITATOR_API_KEY` | vite proxy | injected as `x-api-key` server-side |
| `VITE_SPONSOR_G` | browser | public sponsor/deployer G-address (to derive the C-address) |
| `VITE_USDC_SAC` | browser | testnet USDC SAC contract id (`C…`) |
| `VITE_MERCHANT_G` | browser | recipient G-address |
| `VITE_SOROBAN_RPC` | browser | Soroban RPC (defaults to `https://soroban-testnet.stellar.org`) |

## Security boundary

The browser build holds **no** facilitator API key. Authenticated calls hit the
same-origin `/facilitator` path; the Vite dev proxy injects `x-api-key` server-side —
the same BFF boundary the production dashboard enforces. The build is asserted clean of
the key string in CI (grep gate).
