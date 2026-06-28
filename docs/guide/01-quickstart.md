# Quickstart

buckspay makes a gasless Stellar USDC payment a three-call affair. The user signs with a
wallet they already have (Freighter, xBull, LOBSTR); buckspay's facilitator pays the XLM
fee. **No private keys ever touch your app.**

## Install

```
pnpm add @buckspay/core @buckspay/accounts @buckspay/signers @buckspay/relayer
```

## Classic gasless payment

```ts
import { createBuckspayClient, createRpcSimContext } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { walletsKit } from "@buckspay/signers/wallets-kit";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

const buckspay = createBuckspayClient(
  {
    network: "testnet",
    account: classicAccount(),
    signer: walletsKit({ network: "testnet" }),
    relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
    gas: { mode: "sponsored" }
  },
  createRpcSimContext("https://soroban-testnet.stellar.org")
);

await buckspay.connect();                                   // wallet + ensureReady
const call = buckspay.transfer({ token: USDC_SAC, to: MERCHANT, amount: "1.50" });
const receipt = await buckspay.pay([call]);                 // prepare → sign → send
console.log(receipt.transferTx);                            // settled on testnet
```

`receipt` is the facilitator's settlement receipt:
`{ ok, via, token, chain, transferTx, ledger?, status }`. The `createRpcSimContext` arg
gives `prepare()` a recording simulator over the Soroban RPC.

> **No API key in the browser.** `url: "/api/gasless"` points at *your* backend, which
> forwards to the facilitator with the secret key server-side. See
> [Migrating from direct facilitator calls](./07-migrating-from-facilitator.md) for the BFF route.

This exact snippet is compiled in CI as `docs/examples/01-quickstart-classic.ts`.

Next: [Account models](./02-account-models.md) · [Gasless modes](./03-gasless-modes.md) · [API reference](./06-api-reference.md)
