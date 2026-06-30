# @buckspay/accounts

Account adapters for the **Buckspay SDK**.

## `@buckspay/accounts/classic`

The classic `G...` Stellar account model: resolves the address from the signer, runs **sponsored
onboarding** when the account is missing or has no USDC trustline, builds the unsigned Soroban
`transfer` auth-entry, and assembles the signed entry via `authorizeEntry`. It holds no key
material - the wallet signs.

> `@buckspay/accounts/oz-contract` (passkey smart accounts via `__check_auth`) ships in a later
> release.

## Install

```bash
pnpm add @buckspay/accounts @buckspay/core
```

## Usage

```ts
import { classicAccount } from "@buckspay/accounts/classic";

const account = classicAccount(); // model: "classic"
```

Pass the adapter to `createBuckspayConfig` (see `@buckspay/core`).

## License

MIT - part of [buckspay-sdk](https://github.com/bucks-pay/buckspay-sdk).
