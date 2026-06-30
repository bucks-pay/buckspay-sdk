# @buckspay/signers

Signers for the **Buckspay SDK** - they produce the signature, never hold a key.

## `@buckspay/signers/wallets-kit`

Wraps [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) (Freighter / xBull /
LOBSTR) behind the core `BuckspaySigner`. Signing happens inside the wallet via SEP-43; the SDK only
ever sees public keys and 64-byte signatures. Also exports `normalizeSignature` (the Freighter
double-encode fix).

## Install

```bash
pnpm add @buckspay/signers @buckspay/core
```

## Usage

```ts
import { walletsKit } from "@buckspay/signers/wallets-kit";

const signer = walletsKit({ network: "testnet" });
const { publicKey } = await signer.getPublicKey();
```

Pass the signer to `createBuckspayConfig` (see `@buckspay/core`).

## License

MIT - part of [buckspay-sdk](https://github.com/bucks-pay/buckspay-sdk).
