# @buckspay/core

Framework-agnostic core of the **Buckspay SDK** — gasless Stellar (Soroban) USDC payments.

It carries the gas-abstraction engine, the `prepare → sign → send` client, the typed
`AccountAdapter` / `BuckspaySigner` / `Relayer` ports, and `BuckspayError`. It holds **no secrets**
and makes **no network calls** of its own — the adapters do that.

## Install

```bash
pnpm add @buckspay/core
```

Pair it with an account adapter (`@buckspay/accounts`), a signer (`@buckspay/signers`), and a
relayer (`@buckspay/relayer`) — or use `@buckspay/react` in a React app.

## Usage

```ts
import { createBuckspayConfig } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { walletsKit } from "@buckspay/signers/wallets-kit";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

const { client, store } = createBuckspayConfig({
  network: "testnet",
  account: classicAccount(),
  signer: walletsKit({ network: "testnet" }),
  // In the browser, point at your own backend (BFF) and omit apiKey.
  relayer: buckspayFacilitator({ url: "/api/gasless/relay", network: "testnet" }),
  gas: { mode: "sponsored" }
});

await client.connect();
const call = client.transfer({ token: USDC_SAC, to, amount: "1.5" });
const receipt = await client.pay([call]); // prepare → sign → send
```

## License

MIT — part of [buckspay-sdk](https://github.com/bucks-pay/buckspay-sdk).
