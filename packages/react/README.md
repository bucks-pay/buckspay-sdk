# @buckspay/react

React 19 hooks for the **Buckspay SDK** — gasless Stellar (Soroban) USDC payments.

A thin binding over the framework-agnostic store from `createBuckspayConfig`. Hooks subscribe via
`useSyncExternalStore` (tearing-free, concurrent-safe). It contains **no** Stellar/crypto logic and
**never** reads an API key.

## Install

```bash
pnpm add @buckspay/react @buckspay/core
```

`react` (18 or 19) is a peer dependency.

## Usage

```tsx
"use client";
import { BuckspayProvider, useWallet, useStellarPay } from "@buckspay/react";

function App({ config }) {
  return (
    <BuckspayProvider config={config}>
      <Pay />
    </BuckspayProvider>
  );
}

function Pay() {
  const { address, connect, status } = useWallet();
  const { pay, prepare, sign, receipt } = useStellarPay();
  // connect(), then pay(calls) — or prepare()+sign() and relay via your BFF.
}
```

`config` is a `BuckspayConfig` (see `@buckspay/core`).

## License

MIT — part of [buckspay-sdk](https://github.com/bucks-pay/buckspay-sdk).
