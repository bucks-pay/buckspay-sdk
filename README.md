<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/logo/buckspay.png">
    <img alt="Buckspay" src="docs/logo/buckspay-light.png" width="230">
  </picture>
</p>

<p align="center">
  Gasless USDC payments on Stellar. A few lines of code, web or mobile, and your users never need XLM.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@buckspay/core"><img src="https://img.shields.io/npm/v/@buckspay/core.svg?color=1884FF&label=npm" alt="npm version"></a>
  <a href="https://github.com/bucks-pay/buckspay-sdk/actions/workflows/ci.yml"><img src="https://github.com/bucks-pay/buckspay-sdk/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1884FF.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Stellar-Soroban-21CBF3.svg" alt="Stellar Soroban">
</p>

---

Your users hold USDC, not XLM. Buckspay lets them pay anyway.

They sign a transfer with a wallet or a passkey they already have, and the facilitator covers the
Stellar fee. No native gas token to acquire, no seed phrase to manage, no private key anywhere near
your app. You write the payment; the SDK builds the authorization entry, fee-bumps it, simulates,
and relays.

## Install

```bash
pnpm add @buckspay/core @buckspay/accounts @buckspay/signers @buckspay/relayer
```

`@stellar/stellar-sdk` is a peer dependency. Node 20 or newer.

## Quickstart

A classic gasless USDC transfer, start to finish:

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
    // Point this at your own backend route; the facilitator key stays server-side.
    relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
    gas: { mode: "sponsored" }
  },
  createRpcSimContext("https://soroban-testnet.stellar.org")
);

await buckspay.connect();
const call = buckspay.transfer({ token: USDC_SAC, to: MERCHANT, amount: "1.50" });
const receipt = await buckspay.pay([call]); // prepare, sign, send
console.log(receipt.transferTx);
```

Drop `receipt.transferTx` into Stellar Expert and watch it settle. The
[Quickstart guide](https://docs.buckspay.xyz/get-started/quickstart) walks through the same flow
step by step.

## Packages

The SDK is a set of small, focused packages. Install the ones you use.

| Package | What it does |
|---|---|
| [`@buckspay/core`](packages/core) | The client and the gas-abstraction engine. prepare, sign, send. |
| [`@buckspay/accounts`](packages/accounts) | Account models: a classic `G...` address, or a passkey-backed `C...` smart account. |
| [`@buckspay/signers`](packages/signers) | Signers: Stellar Wallets Kit, passkey, social login, email OTP. |
| [`@buckspay/relayer`](packages/relayer) | Speaks to the facilitator that sponsors and submits the transaction. |
| [`@buckspay/react`](packages/react) | `BuckspayProvider` plus the `useWallet` and `useStellarPay` hooks. |
| [`@buckspay/nextjs`](packages/nextjs) | Server-side relay and signer-proxy routes, so your keys stay off the client. |
| [`@buckspay/react-native`](packages/react-native) | The same React hooks on iOS and Android, with a native passkey. |

## What it covers

- **Gasless by default.** A sponsor pays the fee, or the user pays it in USDC instead of XLM.
- **Two account models.** A classic Stellar address for existing wallets, or a passkey smart account with no seed phrase.
- **More than a transfer.** Atomic batches, sessions with on-chain spend limits, social and email login.
- **One flow, every platform.** Web and React Native share the same code. Only the signer changes.

Every feature maps to a native Stellar mechanism (sponsored fee-bump, `__check_auth`, secp256r1
passkeys), not to middleware we invented. The [feature coverage table](https://docs.buckspay.xyz/features)
spells out which mechanism backs each one.

## Documentation

Guides, the full API reference, and runnable examples live at
**[docs.buckspay.xyz](https://docs.buckspay.xyz)**. Good places to start:

- [Quickstart](https://docs.buckspay.xyz/get-started/quickstart)
- [Account models](https://docs.buckspay.xyz/concepts/account-models)
- [Signers](https://docs.buckspay.xyz/signers/overview)
- [React Native](https://docs.buckspay.xyz/platforms/react-native)

## License

MIT. See [LICENSE](LICENSE).
